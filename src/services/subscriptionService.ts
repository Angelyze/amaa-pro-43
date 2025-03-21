
import { supabase } from '@/integrations/supabase/client';

export type SubscriptionStatus = {
  active: boolean;
  status?: string;
  currentPeriodEnd?: number;
  customerId?: string;
  fromDatabase?: boolean;
};

export const createCheckoutSession = async (returnUrl: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to subscribe');
    }
    
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: { 
        action: 'create-checkout',
        userId: user.id,
        returnUrl
      }
    });
    
    if (error) {
      console.error('Error creating checkout session:', error);
      throw error;
    }
    
    return data.url;
  } catch (error) {
    console.error('Error in createCheckoutSession:', error);
    return null;
  }
};

export const createBillingPortalSession = async (returnUrl: string): Promise<string | null> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be logged in to access billing portal');
    }
    
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: { 
        action: 'create-portal',
        userId: user.id,
        returnUrl
      }
    });
    
    if (error) {
      console.error('Error creating billing portal session:', error);
      throw error;
    }
    
    return data.url;
  } catch (error) {
    console.error('Error in createBillingPortalSession:', error);
    return null;
  }
};

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { active: false };
    }
    
    // First check if we have a subscription in the database
    console.log('Checking for subscription in database for user:', user.id);
    
    // Check with Stripe via our edge function
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: { 
        action: 'get-subscription-status',
        userId: user.id
      }
    });
    
    if (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
    
    console.log('Subscription status response:', data);
    return data;
  } catch (error) {
    console.error('Error in getSubscriptionStatus:', error);
    return { active: false };
  }
};

export const syncSubscriptions = async (): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return false;
    }
    
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: { 
        action: 'sync-subscriptions',
        userId: user.id
      }
    });
    
    if (error) {
      console.error('Error syncing subscriptions:', error);
      throw error;
    }
    
    return data.success || false;
  } catch (error) {
    console.error('Error in syncSubscriptions:', error);
    return false;
  }
};
