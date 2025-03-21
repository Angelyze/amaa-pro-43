
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') || '';
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Initialize Supabase admin client for database operations
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  }
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop();

    console.log(`Processing Stripe request: ${req.method} ${path}`);
    
    // Handle Stripe webhook events
    if (path === 'webhook') {
      // This is a webhook event
      const signature = req.headers.get('stripe-signature');
      
      if (!signature) {
        return new Response(
          JSON.stringify({ error: 'Webhook signature missing' }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }
      
      const body = await req.text();
      const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';
      
      let event;
      try {
        event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      } catch (err) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return new Response(
          JSON.stringify({ error: `Webhook Error: ${err.message}` }),
          { 
            status: 400,
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }
      
      console.log(`Webhook event: ${event.type}`);
      
      // Handle specific webhook events
      switch (event.type) {
        case 'customer.subscription.created':
        case 'customer.subscription.updated':
        case 'customer.subscription.deleted':
          const subscription = event.data.object;
          await handleSubscriptionChange(subscription);
          break;
        
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      
      return new Response(
        JSON.stringify({ received: true }),
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    } else {
      // This is a direct API request
      const { action, userId, returnUrl } = await req.json();
      
      console.log(`Processing Stripe ${action} request for user ${userId}`);
      
      // First, lets refresh the subscription data in our database for this user
      if (userId) {
        await syncUserSubscriptions(userId);
      }
      
      if (action === 'create-checkout') {
        const session = await stripe.checkout.sessions.create({
          payment_method_types: ['card'],
          line_items: [
            {
              price: STRIPE_PRICE_ID,
              quantity: 1,
            },
          ],
          mode: 'subscription',
          success_url: `${returnUrl}?success=true&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${returnUrl}?canceled=true`,
          client_reference_id: userId,
          metadata: {
            userId: userId
          }
        });
        
        return new Response(
          JSON.stringify({ 
            sessionId: session.id,
            url: session.url 
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      } else if (action === 'create-portal') {
        // Find customer ID from existing database
        const { data: subscriptions, error: dbError } = await supabase
          .from('subscriptions')
          .select('stripe_customer_id')
          .eq('user_id', userId)
          .eq('status', 'active')
          .limit(1);
        
        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        
        let customerId = subscriptions && subscriptions.length > 0 
          ? subscriptions[0].stripe_customer_id 
          : null;
        
        // If not found in database, check directly with Stripe
        if (!customerId) {
          const stripeSubscriptions = await stripe.subscriptions.list({
            expand: ['data.customer'],
            limit: 100
          });
          
          for (const subscription of stripeSubscriptions.data) {
            const metadata = subscription.metadata;
            if (metadata.userId === userId) {
              customerId = typeof subscription.customer === 'object' ? 
                subscription.customer.id : subscription.customer;
              break;
            }
          }
        }
        
        if (!customerId) {
          return new Response(
            JSON.stringify({ error: 'No subscription found for this user' }),
            { 
              status: 404,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
        
        // Create a billing portal session for the customer
        const portalSession = await stripe.billingPortal.sessions.create({
          customer: customerId,
          return_url: returnUrl,
        });
        
        return new Response(
          JSON.stringify({ 
            url: portalSession.url 
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      } else if (action === 'get-subscription-status') {
        if (!userId) {
          return new Response(
            JSON.stringify({ error: 'User ID is required' }),
            { 
              status: 400,
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        }
        
        // First check our database
        const { data: subscriptions, error: dbError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('current_period_end', { ascending: false })
          .limit(1);
        
        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        
        // If we have a subscription in the database that is active
        if (subscriptions && subscriptions.length > 0) {
          const subscription = subscriptions[0];
          
          if (subscription.status === 'active') {
            return new Response(
              JSON.stringify({ 
                active: true,
                status: subscription.status,
                currentPeriodEnd: subscription.current_period_end ? 
                  Math.floor(new Date(subscription.current_period_end).getTime() / 1000) : null,
                customerId: subscription.stripe_customer_id,
                fromDatabase: true
              }),
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  ...corsHeaders
                } 
              }
            );
          }
        }
        
        // If nothing found in database, sync with Stripe and try again
        await syncUserSubscriptions(userId);
        
        // Check database again after syncing
        const { data: refreshedSubscriptions, error: refreshError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('current_period_end', { ascending: false })
          .limit(1);
        
        if (refreshError) {
          console.error('Database refresh error:', refreshError);
          throw refreshError;
        }
        
        if (refreshedSubscriptions && refreshedSubscriptions.length > 0) {
          const subscription = refreshedSubscriptions[0];
          
          if (subscription.status === 'active') {
            return new Response(
              JSON.stringify({ 
                active: true,
                status: subscription.status,
                currentPeriodEnd: subscription.current_period_end ? 
                  Math.floor(new Date(subscription.current_period_end).getTime() / 1000) : null,
                customerId: subscription.stripe_customer_id,
                fromDatabase: true,
                refreshed: true
              }),
              { 
                headers: { 
                  'Content-Type': 'application/json',
                  ...corsHeaders
                } 
              }
            );
          }
        }
        
        // If we still don't have an active subscription, return inactive status
        return new Response(
          JSON.stringify({ 
            active: false,
            message: 'No active subscription found',
            refreshed: true
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      } else if (action === 'sync-subscriptions') {
        // Manual sync endpoint
        await syncUserSubscriptions(userId);
        
        return new Response(
          JSON.stringify({ 
            success: true,
            message: 'Subscriptions synchronized'
          }),
          { 
            headers: { 
              'Content-Type': 'application/json',
              ...corsHeaders
            } 
          }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Invalid action' }),
        { 
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    }
  } catch (error) {
    console.error('Error processing Stripe request:', error);
    
    return new Response(
      JSON.stringify({ error: 'An error occurred processing your request: ' + error.message }),
      { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        } 
      }
    );
  }
});

// Helper function to handle subscription changes from webhook events
async function handleSubscriptionChange(subscription) {
  console.log(`Processing subscription change for subscription ${subscription.id}`);
  
  try {
    const customerId = typeof subscription.customer === 'object' 
      ? subscription.customer.id 
      : subscription.customer;
    
    // Retrieve customer to get the user ID from metadata
    const customer = await stripe.customers.retrieve(customerId);
    let userId = customer.metadata?.userId;
    
    // If not found in customer metadata, check subscription metadata
    if (!userId) {
      userId = subscription.metadata?.userId;
    }
    
    // If we still don't have a userId, try to find by email
    if (!userId && customer.email) {
      // Look up user by email in Supabase
      const { data: users, error: userError } = await supabase
        .from('auth.users')
        .select('id')
        .eq('email', customer.email)
        .limit(1);
      
      if (userError) {
        console.error('Error finding user by email:', userError);
      } else if (users && users.length > 0) {
        userId = users[0].id;
        console.log(`Found user ${userId} by email ${customer.email}`);
      }
    }
    
    if (!userId) {
      console.error('No userId found for subscription:', subscription.id);
      return;
    }
    
    // Update or insert subscription in database
    const { error } = await supabase.from('subscriptions').upsert({
      user_id: userId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status: subscription.status,
      price_id: subscription.items.data[0]?.price.id,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'stripe_subscription_id'
    });
    
    if (error) {
      console.error('Error updating subscription in database:', error);
      throw error;
    }
    
    console.log(`Successfully updated subscription ${subscription.id} for user ${userId}`);
  } catch (error) {
    console.error('Error in handleSubscriptionChange:', error);
    throw error;
  }
}

// Helper function to manually sync a user's subscriptions from Stripe to our database
async function syncUserSubscriptions(userId) {
  console.log(`Syncing subscriptions for user ${userId}`);
  
  try {
    // Get user email from Supabase
    const { data: userData, error: userError } = await supabase
      .from('auth.users')
      .select('email')
      .eq('id', userId)
      .single();
    
    if (userError) {
      console.error('Error getting user email:', userError);
      // Continue with the rest of the sync process
    }
    
    const userEmail = userData?.email;
    console.log(`User email for ${userId} is ${userEmail}`);
    
    // List all subscriptions in Stripe that have this user ID in metadata
    const stripeSubscriptions = await stripe.subscriptions.list({
      expand: ['data.customer', 'data.items.data.price'],
      status: 'all'
    });
    
    let userSubscriptions = [];
    
    // First, look in subscription metadata
    for (const subscription of stripeSubscriptions.data) {
      if (subscription.metadata?.userId === userId) {
        userSubscriptions.push(subscription);
      }
    }
    
    // If none found by metadata, try looking in customer metadata
    if (userSubscriptions.length === 0) {
      const customers = await stripe.customers.list({
        limit: 100
      });
      
      for (const customer of customers.data) {
        if (customer.metadata?.userId === userId) {
          // Get subscriptions for this customer
          const customerSubscriptions = await stripe.subscriptions.list({
            customer: customer.id
          });
          
          userSubscriptions = customerSubscriptions.data;
          break;
        }
      }
    }
    
    // If we have a user email, try to find subscriptions by email
    if (userSubscriptions.length === 0 && userEmail) {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1
      });
      
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        console.log(`Found Stripe customer for email ${userEmail}: ${customer.id}`);
        
        // Get subscriptions for this customer
        const customerSubscriptions = await stripe.subscriptions.list({
          customer: customer.id
        });
        
        if (customerSubscriptions.data.length > 0) {
          console.log(`Found ${customerSubscriptions.data.length} subscriptions for customer ${customer.id}`);
          userSubscriptions = customerSubscriptions.data;
        }
      }
    }
    
    // Update or insert each subscription
    for (const subscription of userSubscriptions) {
      const customerId = typeof subscription.customer === 'object' 
        ? subscription.customer.id 
        : subscription.customer;
      
      // Update or insert in database
      const { error } = await supabase.from('subscriptions').upsert({
        user_id: userId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscription.id,
        status: subscription.status,
        price_id: subscription.items.data[0]?.price.id,
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'stripe_subscription_id'
      });
      
      if (error) {
        console.error('Error updating subscription in database during sync:', error);
        throw error;
      }
    }
    
    console.log(`Synced ${userSubscriptions.length} subscriptions for user ${userId}`);
  } catch (error) {
    console.error('Error in syncUserSubscriptions:', error);
    throw error;
  }
}

