
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize Stripe with the secret key from secrets
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Helper function to log steps for debugging
const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[STRIPE-FUNCTION] ${step}${detailsStr}`);
};

// This function will handle POST requests for all Stripe-related actions
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const { action, userId, returnUrl, email } = await req.json();
    logStep("Request received", { action, userId, email });
    
    // Create Supabase client with service role key to bypass RLS
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
    
    // Handle action: create-checkout for initiating a subscription
    if (action === "create-checkout") {
      logStep("Creating checkout session");
      
      // Check if we already have a customer for this user
      let customerId: string | null = null;
      if (email) {
        const customers = await stripe.customers.list({ email, limit: 1 });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
          logStep("Found existing customer", { customerId });
        }
      }
      
      // Create checkout session
      const priceId = Deno.env.get('STRIPE_PRICE_ID');
      if (!priceId) {
        throw new Error("STRIPE_PRICE_ID environment variable not set");
      }
      
      const session = await stripe.checkout.sessions.create({
        customer: customerId,
        customer_email: customerId ? undefined : email,
        line_items: [{ price: priceId, quantity: 1 }],
        mode: 'subscription',
        success_url: `${returnUrl || req.headers.get('origin')}?success=true`,
        cancel_url: `${returnUrl || req.headers.get('origin')}?canceled=true`,
      });
      
      logStep("Checkout session created", { sessionId: session.id, url: session.url });
      return new Response(JSON.stringify({ url: session.url }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Handle action: create-portal for accessing subscription management
    if (action === "create-portal") {
      logStep("Creating billing portal session");
      
      // Find customer ID from your subscriptions table (not enforced, fallback to Stripe if missing)
      let customerId: string | null = null;
      if (userId) {
        // Check your subscriptions table for active records
        const { data, error } = await supabase
          .from("subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", userId)
          .limit(1)
          .single();
        if (data) customerId = data.stripe_customer_id;
        logStep("Found customer in subscriptions table", { found: !!data, customerId });
      }
      
      if (!customerId && email) {
        // Fallback: find customer by email in Stripe
        const stripeCustomers = await stripe.customers.list({ email: email, limit: 1 });
        if (stripeCustomers.data.length > 0) {
          customerId = stripeCustomers.data[0].id;
          logStep("Found customer in Stripe", { customerId });
        }
      }
      
      if (!customerId) {
        return new Response(JSON.stringify({ error: "No subscription/customer found." }), {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // Create portal session
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: customerId,
        return_url: returnUrl || req.headers.get('origin') || ''
      });
      
      logStep("Portal session created", { url: portalSession.url });
      return new Response(JSON.stringify({ url: portalSession.url }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Handle action: get-subscription-status for checking current status
    if (action === "get-subscription-status") {
      logStep("Checking subscription status", { userId, email });
      
      if (!email) {
        throw new Error("Email is required for subscription status check");
      }
      
      // Find customer by email
      const customers = await stripe.customers.list({ email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found");
        return new Response(JSON.stringify({ 
          active: false, 
          status: 'no_customer',
          fromDatabase: false
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      const customerId = customers.data[0].id;
      logStep("Found customer", { customerId });
      
      // Check for active subscription in Stripe
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all', // Get all subscriptions to check both active and canceled
        limit: 10,
        expand: ['data.default_payment_method']
      });
      
      // First look for active subscriptions
      const activeSubscription = subscriptions.data.find(sub => 
        sub.status === 'active' || 
        sub.status === 'trialing' ||
        // Include canceled subscriptions that are still usable (not expired yet)
        (sub.status === 'canceled' && sub.current_period_end * 1000 > Date.now())
      );
      
      logStep("Subscription check result", { 
        found: !!activeSubscription, 
        status: activeSubscription?.status,
        endDate: activeSubscription ? new Date(activeSubscription.current_period_end * 1000).toISOString() : null
      });
      
      // Find subscription data to return
      if (activeSubscription) {
        // Update subscription in database
        if (userId) {
          try {
            await supabase.from("subscriptions").upsert({
              user_id: userId,
              stripe_customer_id: customerId,
              stripe_subscription_id: activeSubscription.id,
              status: activeSubscription.status,
              price_id: activeSubscription.items.data[0]?.price.id,
              current_period_end: new Date(activeSubscription.current_period_end * 1000).toISOString(),
              updated_at: new Date().toISOString()
            }, { onConflict: 'user_id' });
            
            logStep("Updated subscription in database");
          } catch (dbError) {
            logStep("Error updating subscription in database", { error: String(dbError) });
            // Continue execution even if database update fails
          }
        }
        
        return new Response(JSON.stringify({
          active: true,
          status: activeSubscription.status,
          currentPeriodEnd: activeSubscription.current_period_end,
          customerId: customerId,
          fromDatabase: false
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      // No active subscription
      return new Response(JSON.stringify({
        active: false,
        status: subscriptions.data.length > 0 ? 'expired' : 'no_subscription',
        customerId: customerId,
        fromDatabase: false
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Handle action: sync-subscriptions to update local database from Stripe
    if (action === "sync-subscriptions") {
      logStep("Syncing subscriptions", { userId, email });
      
      if (!email) {
        throw new Error("Email is required for subscription sync");
      }
      
      if (!userId) {
        throw new Error("User ID is required for subscription sync");
      }
      
      // Find customer by email
      const customers = await stripe.customers.list({ email, limit: 1 });
      
      if (customers.data.length === 0) {
        logStep("No customer found for sync");
        // Clear any existing subscription data since there's no customer
        try {
          await supabase.from("subscriptions")
            .delete()
            .eq("user_id", userId);
          logStep("Deleted any existing subscription records");
        } catch (dbError) {
          logStep("Error deleting subscriptions", { error: String(dbError) });
        }
        
        return new Response(JSON.stringify({ 
          success: true, 
          message: "No customer found, cleared any existing subscriptions" 
        }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" }
        });
      }
      
      const customerId = customers.data[0].id;
      logStep("Found customer for sync", { customerId });
      
      // Get all subscriptions for this customer
      const subscriptions = await stripe.subscriptions.list({
        customer: customerId,
        status: 'all', // Get all to sync canceled ones too
        limit: 100
      });
      
      logStep("Retrieved subscriptions", { 
        count: subscriptions.data.length,
        statuses: subscriptions.data.map(s => s.status)
      });
      
      // Find the most recent active or canceled-but-not-expired subscription
      const relevantSubscriptions = subscriptions.data
        .filter(sub => 
          sub.status === 'active' || 
          sub.status === 'trialing' ||
          (sub.status === 'canceled' && sub.current_period_end * 1000 > Date.now())
        )
        .sort((a, b) => b.current_period_end - a.current_period_end);
      
      // Delete any existing subscriptions first
      try {
        await supabase.from("subscriptions")
          .delete()
          .eq("user_id", userId);
        logStep("Deleted existing subscription records");
      } catch (dbError) {
        logStep("Error deleting subscriptions", { error: String(dbError) });
        // Continue execution
      }
      
      // If we have an active/valid subscription, add it to database
      if (relevantSubscriptions.length > 0) {
        const subscription = relevantSubscriptions[0];
        try {
          await supabase.from("subscriptions").insert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            status: subscription.status,
            price_id: subscription.items.data[0]?.price.id,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
          
          logStep("Inserted new subscription record", { 
            subscriptionId: subscription.id,
            status: subscription.status 
          });
        } catch (dbError) {
          logStep("Error inserting subscription", { error: String(dbError) });
          return new Response(JSON.stringify({ 
            success: false, 
            error: "Database error while syncing subscription" 
          }), {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" }
          });
        }
      }
      
      return new Response(JSON.stringify({ 
        success: true,
        message: "Subscription synced successfully",
        hasActiveSubscription: relevantSubscriptions.length > 0
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      });
    }
    
    // Fallback for unknown actions
    return new Response(
      JSON.stringify({ error: "Invalid action" }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    const errorMessage = typeof e === "object" && e !== null && "message" in e ? e.message : String(e);
    logStep("ERROR", { message: errorMessage });
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
