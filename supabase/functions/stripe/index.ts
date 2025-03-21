
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@12.4.0";

// Initialize Stripe with the secret key
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
});

const STRIPE_PRICE_ID = Deno.env.get('STRIPE_PRICE_ID') || '';

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
    const { action, userId, returnUrl } = await req.json();
    
    console.log(`Processing Stripe ${action} request for user ${userId}`);
    
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
      // Find customer ID from existing subscriptions for this user
      const subscriptions = await stripe.subscriptions.list({
        expand: ['data.customer'],
        limit: 1
      });
      
      let customerId = null;
      for (const subscription of subscriptions.data) {
        const metadata = subscription.metadata;
        if (metadata.userId === userId) {
          customerId = typeof subscription.customer === 'object' ? 
            subscription.customer.id : subscription.customer;
          break;
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
      
      // Search for subscriptions associated with this user in metadata
      const subscriptions = await stripe.subscriptions.list({
        limit: 1,
        expand: ['data.customer']
      });
      
      let userSubscription = null;
      for (const subscription of subscriptions.data) {
        const metadata = subscription.metadata;
        if (metadata.userId === userId) {
          userSubscription = subscription;
          break;
        }
      }
      
      if (!userSubscription) {
        return new Response(
          JSON.stringify({ 
            active: false,
            message: 'No active subscription found' 
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
        JSON.stringify({ 
          active: userSubscription.status === 'active',
          status: userSubscription.status,
          currentPeriodEnd: userSubscription.current_period_end,
          customerId: typeof userSubscription.customer === 'object' ? 
            userSubscription.customer.id : userSubscription.customer,
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
