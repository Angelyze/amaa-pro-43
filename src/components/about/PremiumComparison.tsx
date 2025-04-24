
import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function PremiumComparison() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Card className="border-border overflow-hidden">
        <div className="bg-background p-6 pb-2">
          <h3 className="text-xl font-semibold">Free Plan</h3>
          <p className="text-xl font-medium mt-2">$0</p>
          <p className="text-muted-foreground text-sm">Try our AI assistant</p>
        </div>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            <FeatureItem>10 AI conversations per day</FeatureItem>
            <FeatureItem>Basic content generation</FeatureItem>
            <FeatureItem>Standard response time</FeatureItem>
            <FeatureItem>Community support</FeatureItem>
          </ul>
          <div className="mt-6">
            <Link to="/auth">
              <Button variant="outline" className="w-full" size="lg">
                Start for Free
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card className="border-primary overflow-hidden relative">
        <div className="absolute top-0 right-0 mt-4 mr-4">
          <Badge className="bg-primary text-white">Popular Choice</Badge>
        </div>
        <div className="bg-primary/5 p-6 pb-2 border-b border-primary/10">
          <h3 className="text-xl font-semibold">Premium Plan</h3>
          <p className="text-xl font-medium mt-2 flex items-center">
            $6.99
            <span className="text-muted-foreground text-sm ml-1">/month</span>
          </p>
          <p className="text-muted-foreground text-sm">Unlock full potential</p>
        </div>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            <FeatureItem isPremium>Unlimited AI conversations</FeatureItem>
            <FeatureItem isPremium>Priority processing</FeatureItem>
            <FeatureItem isPremium>Advanced content generation</FeatureItem>
            <FeatureItem isPremium>Save conversation history</FeatureItem>
            <FeatureItem isPremium>File upload & processing</FeatureItem>
            <FeatureItem isPremium>Premium support access</FeatureItem>
          </ul>
          <div className="mt-6">
            <Link to="/subscribe">
              <Button className="w-full" size="lg">
                Upgrade to Premium
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FeatureItem({ children, isPremium = false }: { children: React.ReactNode; isPremium?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <Check className={`w-5 h-5 ${isPremium ? "text-primary" : "text-muted-foreground"}`} />
      <span className={isPremium ? "text-foreground" : "text-muted-foreground"}>{children}</span>
    </li>
  );
}
