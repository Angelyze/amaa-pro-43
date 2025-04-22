
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { createBillingPortalSession } from "@/services/subscriptionService";
import { CreditCard } from "lucide-react";

const CustomStripePortalUrl = ""; // Put your Stripe Billing Portal URL here if you want to override

const SubscriptionTab = () => {
  const { user, subscriptionStatus } = useAuth();
  const [loading, setLoading] = useState(false);

  // Format date if available
  let periodEnd = "";
  if (subscriptionStatus?.currentPeriodEnd) {
    periodEnd = new Date(subscriptionStatus.currentPeriodEnd * 1000).toLocaleDateString();
  }

  const openStripePortal = async () => {
    setLoading(true);
    try {
      let portalUrl = CustomStripePortalUrl;
      if (!portalUrl) {
        // Use the Edge Function to create one if no override URL provided!
        portalUrl = await createBillingPortalSession(window.location.href);
      }
      if (portalUrl) {
        window.open(portalUrl, "_blank");
        toast.success("Stripe Billing Portal opened!");
      } else {
        toast.error("Unable to open Stripe Billing Portal.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Status</span>
        <Badge className="bg-teal hover:bg-teal">Premium</Badge>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Next Billing</span>
        <span>{periodEnd || "N/A"}</span>
      </div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-medium">Subscription ID</span>
        <span className="text-xs text-muted-foreground break-all">{subscriptionStatus?.customerId || "N/A"}</span>
      </div>
      <Button className="mt-4" onClick={openStripePortal} disabled={loading}>
        <CreditCard className="w-4 h-4 mr-2"/> Manage Billing
      </Button>
    </div>
  );
};

export default SubscriptionTab;
