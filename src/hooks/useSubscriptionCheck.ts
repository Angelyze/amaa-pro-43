
import { toast } from 'sonner';

interface SubscriptionCheckOptions {
  isPremium: boolean;
  guestQueriesCount: number;
  maxGuestQueries: number;
  setGuestQueriesCount: (count: number) => void;
}

export function useSubscriptionCheck(options: SubscriptionCheckOptions) {
  const { isPremium, guestQueriesCount, maxGuestQueries, setGuestQueriesCount } = options;

  const checkUserQueryLimit = (): boolean => {
    const userHasReachedLimit = !isPremium && guestQueriesCount >= maxGuestQueries;
    
    if (userHasReachedLimit) {
      toast.error(
        "You've reached the maximum number of free queries. Subscribe for unlimited access!",
        { 
          duration: 8000,
          action: {
            label: "Subscribe",
            onClick: () => window.location.href = "/subscribe"
          }
        }
      );
      return false;
    }
    
    return true;
  };

  const incrementQueryCount = (): number => {
    if (!isPremium) {
      const newCount = guestQueriesCount + 1;
      setGuestQueriesCount(newCount);
      
      if (newCount === maxGuestQueries) {
        toast.warning(
          "This is your last free query. Subscribe for unlimited access.",
          { 
            duration: 5000,
            action: {
              label: "Subscribe",
              onClick: () => window.location.href = "/subscribe"
            }
          }
        );
      }
      
      return newCount;
    }
    
    return guestQueriesCount;
  };

  return {
    checkUserQueryLimit,
    incrementQueryCount
  };
}
