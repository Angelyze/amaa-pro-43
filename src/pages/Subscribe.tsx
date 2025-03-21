
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft, Loader2, RefreshCw } from 'lucide-react';
import { 
  createCheckoutSession, 
  createBillingPortalSession,
  syncSubscriptions,
  invalidateSubscriptionCache
} from '@/services/subscriptionService';
import { toast } from 'sonner';

const Subscribe = () => {
  const { user, isPremium, refreshSubscriptionStatus, subscriptionStatus } = useAuth();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check for Stripe redirection success
    const success = searchParams.get('success');
    if (success === 'true') {
      toast.success('Subscription successful! You now have premium access.');
      // Invalidate cache and refresh status
      invalidateSubscriptionCache();
      refreshSubscriptionStatus();
    }
    
    const canceled = searchParams.get('canceled');
    if (canceled === 'true') {
      toast.info('Subscription process was canceled.');
    }
    
    // Force a subscription status refresh when component mounts
    if (user) {
      invalidateSubscriptionCache();
      refreshSubscriptionStatus();
    }
  }, [searchParams, refreshSubscriptionStatus, user]);

  const handleSubscribe = async () => {
    if (!user) {
      toast.error('Please log in to subscribe');
      navigate('/auth', { state: { returnTo: '/subscribe' } });
      return;
    }
    
    setLoading(true);
    try {
      const checkoutUrl = await createCheckoutSession(window.location.origin + '/subscribe');
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to start subscription process. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const portalUrl = await createBillingPortalSession(window.location.origin + '/subscribe');
      if (portalUrl) {
        window.location.href = portalUrl;
      } else {
        throw new Error('Failed to create billing portal session');
      }
    } catch (error) {
      console.error('Error creating billing portal session:', error);
      toast.error('Failed to open subscription management. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncSubscription = async () => {
    if (!user) return;
    
    setSyncing(true);
    try {
      // First invalidate the cache
      invalidateSubscriptionCache();
      
      // Then sync with Stripe
      await syncSubscriptions();
      
      // Then refresh the status
      await refreshSubscriptionStatus();
      toast.success('Subscription status synchronized successfully');
    } catch (error) {
      console.error('Error syncing subscription:', error);
      toast.error('Failed to sync subscription status');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="absolute inset-0 -z-10 background-pattern"></div>
      
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="self-start mb-6">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to App</span>
            </Button>
          </Link>
          <Logo />
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8">Upgrade to Premium</h1>
        
        {user && (
          <div className="flex justify-center mb-4">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleSyncSubscription}
              disabled={syncing}
              className="flex items-center gap-1"
            >
              {syncing ? (
                <Loader2 size={14} className="animate-spin mr-1" />
              ) : (
                <RefreshCw size={14} className="mr-1" />
              )}
              Sync Subscription Status
            </Button>
          </div>
        )}
        
        {subscriptionStatus && (
          <div className="text-center mb-6 text-sm text-muted-foreground">
            {isPremium ? (
              <span className="text-teal">You have an active subscription until {
                subscriptionStatus.currentPeriodEnd ? 
                  new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString() : 
                  'unknown date'
              }</span>
            ) : (
              <span>You do not have an active subscription</span>
            )}
          </div>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Basic access to AMAA</CardDescription>
              <div className="text-3xl font-bold mt-2">$0</div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-muted-foreground mt-0.5" />
                  <span>5 AI queries per session</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-muted-foreground mt-0.5" />
                  <span>Basic AI responses</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-muted-foreground mt-0.5" />
                  <span>Standard response time</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Link to="/" className="w-full">
                <Button variant="outline" className="w-full">
                  {isPremium ? "Downgrade to Free" : "Current Plan"}
                </Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="border-teal">
            <CardHeader className="bg-teal/5 rounded-t-lg">
              <CardTitle>Premium Plan</CardTitle>
              <CardDescription>Full access to all AMAA features</CardDescription>
              <div className="text-3xl font-bold mt-2">$9.99<span className="text-sm font-normal">/month</span></div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-teal mt-0.5" />
                  <span>Unlimited AI queries</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-teal mt-0.5" />
                  <span>Priority response processing</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-teal mt-0.5" />
                  <span>Advanced AI models and capabilities</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-teal mt-0.5" />
                  <span>Save and manage conversations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-teal mt-0.5" />
                  <span>Web search integration</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check size={18} className="text-teal mt-0.5" />
                  <span>File upload and analysis</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              {isPremium ? (
                <Button 
                  className="w-full bg-teal hover:bg-teal-light"
                  onClick={handleManageSubscription}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Manage Subscription'
                  )}
                </Button>
              ) : (
                <Button 
                  className="w-full bg-teal hover:bg-teal-light"
                  onClick={handleSubscribe}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="mr-2 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : (
                    'Subscribe Now'
                  )}
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
        
        <div className="mt-12 flex justify-center gap-6 text-sm text-muted-foreground">
          <Link to="/about" className="hover:text-teal transition-colors">About</Link>
          <Link to="/terms" className="hover:text-teal transition-colors">Terms</Link>
          <Link to="/privacy" className="hover:text-teal transition-colors">Privacy</Link>
        </div>
        
        <div className="text-center text-sm text-muted-foreground mt-4">
          By subscribing, you agree to our <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link> and <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>.
        </div>
      </div>
    </div>
  );
};

export default Subscribe;
