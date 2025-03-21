
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

// Cache the subscription status to reduce frequent checks
let cachedStatus: SubscriptionStatus | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export const getSubscriptionStatus = async (): Promise<SubscriptionStatus> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { active: false };
    }
    
    // Use cached data if available and not expired
    const now = Date.now();
    if (cachedStatus && (now - cacheTimestamp < CACHE_DURATION)) {
      console.log('Using cached subscription status');
      return cachedStatus;
    }
    
    // First check if we have a subscription in the database
    console.log('Checking for subscription in database for user:', user.id);
    console.log('User email:', user.email);
    
    // Sync subscriptions every time we check for status
    const syncResult = await syncSubscriptions();
    console.log('Sync subscriptions result:', syncResult);
    
    // Force a direct check with Stripe
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: { 
        action: 'get-subscription-status',
        userId: user.id,
        email: user.email // Pass email explicitly to help with lookup
      }
    });
    
    if (error) {
      console.error('Error getting subscription status:', error);
      throw error;
    }
    
    console.log('Subscription status response:', data);
    
    // Cache the response
    cachedStatus = data;
    cacheTimestamp = now;
    
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
    
    console.log('Syncing subscriptions for user:', user.id, 'with email:', user.email);
    
    const { data, error } = await supabase.functions.invoke('stripe', {
      body: { 
        action: 'sync-subscriptions',
        userId: user.id,
        email: user.email // Pass email explicitly to help with lookup
      }
    });
    
    if (error) {
      console.error('Error syncing subscriptions:', error);
      throw error;
    }
    
    // Invalidate cache after syncing
    cachedStatus = null;
    
    return data.success || false;
  } catch (error) {
    console.error('Error in syncSubscriptions:', error);
    return false;
  }
};

// Manually invalidate the cache if needed (e.g., after a user action)
export const invalidateSubscriptionCache = (): void => {
  cachedStatus = null;
  cacheTimestamp = 0;
};
