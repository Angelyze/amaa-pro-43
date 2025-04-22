
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

// This function will handle POST requests for all Stripe-related actions
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  try {
    const { action, userId, returnUrl, email } = await req.json();
    if (action === "create-portal") {
      // Find customer ID from your subscriptions table (not enforced, fallback to Stripe if missing)
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      let customerId: string | null = null;
      if (userId) {
        // Check your subscriptions table for active records
        const { data, error } = await supabase
          .from("subscriptions")
          .select("stripe_customer_id")
          .eq("user_id", userId)
          .eq("status", "active")
          .limit(1)
          .single();
        if (data) customerId = data.stripe_customer_id;
        if (!customerId && email) {
          // Fallback: find customer by email in Stripe
          const stripeCustomers = await stripe.customers.list({ email: email, limit: 1 });
          if (stripeCustomers.data.length > 0) {
            customerId = stripeCustomers.data[0].id;
          }
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
        return_url: returnUrl
      });
      return new Response(JSON.stringify({ url: portalSession.url }), {
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
    return new Response(
      JSON.stringify({ error: typeof e === "object" && e !== null && "message" in e ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
