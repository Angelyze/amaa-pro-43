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
      const { action, userId, returnUrl, email } = await req.json();
      
      console.log(`Processing Stripe ${action} request for user ${userId}${email ? ` with email ${email}` : ''}`);
      
      // First, lets refresh the subscription data in our database for this user
      if (userId) {
        await syncUserSubscriptions(userId, email);
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
        if (!customerId && email) {
          console.log(`Searching for customer with email: ${email}`);
          const customers = await stripe.customers.list({
            email: email,
            limit: 10
          });
          
          if (customers.data.length > 0) {
            customerId = customers.data[0].id;
            console.log(`Found customer for email ${email}: ${customerId}`);
          } else {
            console.log(`No customer found for email ${email}`);
          }
        }
        
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
        const { data: dbSubscriptions, error: dbError } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', userId)
          .order('current_period_end', { ascending: false })
          .limit(1);
        
        if (dbError) {
          console.error('Database error:', dbError);
          throw dbError;
        }
        
        console.log(`Found ${dbSubscriptions?.length || 0} subscriptions in database for user ${userId}`);
        
        // If we have a subscription in the database that is active
        if (dbSubscriptions && dbSubscriptions.length > 0) {
          const subscription = dbSubscriptions[0];
          
          if (subscription.status === 'active') {
            console.log(`Found active subscription in database for user ${userId}:`, subscription);
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
        
        // If nothing found in database, check directly with Stripe using email
        if (email) {
          console.log(`Checking Stripe directly for email: ${email}`);
          
          // Find customer by email
          const customers = await stripe.customers.list({
            email: email,
            limit: 10
          });
          
          if (customers.data.length > 0) {
            const customerId = customers.data[0].id;
            console.log(`Found Stripe customer for email ${email}: ${customerId}`);
            
            // Check subscriptions for this customer
            const customerSubscriptions = await stripe.subscriptions.list({
              customer: customerId,
              status: 'active',
              limit: 10
            });
            
            if (customerSubscriptions.data.length > 0) {
              const subscription = customerSubscriptions.data[0];
              console.log(`Found active subscription for customer ${customerId}:`, subscription.id);
              
              // Save this subscription to our database
              const { error: upsertError } = await supabase.from('subscriptions').upsert({
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
              
              if (upsertError) {
                console.error('Error updating subscription in database:', upsertError);
              } else {
                console.log(`Saved subscription to database for user ${userId}`);
              }
              
              return new Response(
                JSON.stringify({ 
                  active: true,
                  status: subscription.status,
                  currentPeriodEnd: subscription.current_period_end,
                  customerId: customerId,
                  fromDatabase: false,
                  directStripeCheck: true
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
      }
        
        // If still nothing found, sync with Stripe and try again
        await syncUserSubscriptions(userId, email);
        
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
            console.log(`Found active subscription after sync for user ${userId}:`, subscription);
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
        console.log(`No active subscription found for user ${userId}`);
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
        const result = await syncUserSubscriptions(userId, email);
        
        return new Response(
          JSON.stringify({ 
            success: result,
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
      // Try to find user by email in auth.users table using raw query
      // This is a workaround since the auth.users table isn't accessible through the standard API
      const { data, error } = await supabase.rpc('get_user_id_by_email', {
        p_email: customer.email
      });
      
      if (error) {
        console.error('Error finding user by email with RPC:', error);
      } else if (data) {
        userId = data;
        console.log(`Found user ${userId} by email ${customer.email} using RPC`);
      }
      
      // If RPC fails, try direct query on subscriptions table
      if (!userId) {
        const { data: subs, error: subsErr } = await supabase
          .from('subscriptions')
          .select('user_id')
          .eq('stripe_customer_id', customerId)
          .limit(1);
        
        if (!subsErr && subs && subs.length > 0) {
          userId = subs[0].user_id;
          console.log(`Found user ${userId} for customer ${customerId} from subscriptions table`);
        }
      }
    }
    
    if (!userId) {
      console.error('No userId found for subscription:', subscription.id);
      // We'll still save the subscription but with a placeholder userId that we can update later
      // This ensures we don't lose subscription information
      userId = `stripe_customer_${customerId}`;
      console.log(`Using placeholder userId ${userId} for customer ${customerId}`);
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
    return true;
  } catch (error) {
    console.error('Error in handleSubscriptionChange:', error);
    throw error;
  }
}

// Helper function to manually sync a user's subscriptions from Stripe to our database
async function syncUserSubscriptions(userId, userEmail) {
  console.log(`Syncing subscriptions for user ${userId}${userEmail ? ` with email ${userEmail}` : ''}`);
  
  try {
    // If email wasn't passed, try to get it from the database
    let email = userEmail;
    if (!email) {
      // Try to get email using an RPC function
      const { data, error } = await supabase.rpc('get_user_email_by_id', {
        p_user_id: userId
      });
      
      if (error) {
        console.error('Error getting user email with RPC:', error);
      } else if (data) {
        email = data;
        console.log(`Found email ${email} for user ${userId} using RPC`);
      }
    }
    
    console.log(`User email for ${userId} is ${email}`);
    
    let userSubscriptions = [];
    let foundByEmail = false;
    
    // If we have a user email, check for subscriptions by email first (most reliable method)
    if (email) {
      console.log(`Searching for customer with email: ${email}`);
      const customers = await stripe.customers.list({
        email: email,
        limit: 10
      });
      
      if (customers.data.length > 0) {
        const customer = customers.data[0];
        console.log(`Found Stripe customer for email ${email}: ${customer.id}`);
        
        // Get subscriptions for this customer
        const customerSubscriptions = await stripe.subscriptions.list({
          customer: customer.id,
          limit: 100
        });
        
        if (customerSubscriptions.data.length > 0) {
          console.log(`Found ${customerSubscriptions.data.length} subscriptions for customer ${customer.id}`);
          userSubscriptions = customerSubscriptions.data;
          foundByEmail = true;
          
          // Update customer metadata with userId for future reference
          if (customer.metadata?.userId !== userId) {
            console.log(`Updating customer ${customer.id} metadata with userId ${userId}`);
            try {
              await stripe.customers.update(customer.id, {
                metadata: { userId }
              });
            } catch (err) {
              console.error(`Error updating customer metadata: ${err.message}`);
            }
          }
        }
      }
    }
    
    // If no subscriptions found by email, look for subscriptions with userId in metadata
    if (!foundByEmail) {
      console.log(`Looking for subscriptions with userId ${userId} in metadata`);
      const stripeSubscriptions = await stripe.subscriptions.list({
        expand: ['data.customer', 'data.items.data.price'],
        status: 'all',
        limit: 100
      });
      
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
              customer: customer.id,
              limit: 100
            });
            
            userSubscriptions = customerSubscriptions.data;
            break;
          }
        }
      }
    }
    
    // Update or insert each subscription
    let updatedCount = 0;
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
      
      updatedCount++;
    }
    
    console.log(`Synced ${updatedCount} subscriptions for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in syncUserSubscriptions:', error);
    return false;
  }
}
