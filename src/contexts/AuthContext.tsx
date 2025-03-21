
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { clearGuestMessages } from '@/services/conversationService';
import { 
  getSubscriptionStatus, 
  SubscriptionStatus, 
  syncSubscriptions 
} from '@/services/subscriptionService';

interface AuthContextProps {
  session: Session | null;
  user: User | null;
  loading: boolean;
  isPremium: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const isRefreshingSubscription = useRef(false);
  const navigate = useNavigate();

  const refreshSubscriptionStatus = async () => {
    if (user && !isRefreshingSubscription.current) {
      try {
        isRefreshingSubscription.current = true;
        console.log('Refreshing subscription status for user:', user.id);
        console.log('User email:', user.email);
        
        // First try to sync with Stripe
        await syncSubscriptions();
        
        // Then get the latest status
        const status = await getSubscriptionStatus();
        console.log('Got subscription status:', status);
        
        setSubscriptionStatus(status);
        setIsPremium(status.active);
        
        if (status.active) {
          console.log('User is premium with subscription:', status);
        } else {
          console.log('User is not premium:', status);
        }
      } catch (error) {
        console.error("Failed to refresh subscription status:", error);
      } finally {
        isRefreshingSubscription.current = false;
      }
    } else {
      setSubscriptionStatus(null);
      setIsPremium(false);
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // If user signed in, we might want to clear guest data
        if (event === 'SIGNED_IN') {
          clearGuestMessages();
          await refreshSubscriptionStatus();
        } else if (event === 'SIGNED_OUT') {
          setSubscriptionStatus(null);
          setIsPremium(false);
        }
      }
    );

    // THEN check for existing session
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await refreshSubscriptionStatus();
      }
      
      setLoading(false);
    })();

    return () => subscription.unsubscribe();
  }, []);

  // Add a separate effect to perform an additional subscription check after a delay
  // This helps with edge cases where the subscription data might not be immediately available
  useEffect(() => {
    if (user && !isPremium && !isRefreshingSubscription.current) {
      const checkTimer = setTimeout(() => {
        refreshSubscriptionStatus();
      }, 2000);
      
      return () => clearTimeout(checkTimer);
    }
  }, [user, isPremium]);

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      toast.success('Registration successful! Please check your email for verification.');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Clear guest data when signing in successfully
      clearGuestMessages();
      
      toast.success('Logged in successfully!');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setSubscriptionStatus(null);
      setIsPremium(false);
      
      toast.info('Logged out successfully');
      navigate('/auth');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'An error occurred during sign out');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        loading,
        isPremium,
        subscriptionStatus,
        signUp,
        signIn,
        signOut,
        refreshSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
