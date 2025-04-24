
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
          <p className="text-muted-foreground text-sm">Perfect for getting started</p>
        </div>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            <FeatureItem>Basic AI conversations</FeatureItem>
            <FeatureItem>Standard response time</FeatureItem>
            <FeatureItem>Limited to 30 messages per day</FeatureItem>
            <FeatureItem>Basic text-to-speech voices</FeatureItem>
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
          <Badge className="bg-primary text-white">Recommended</Badge>
        </div>
        <div className="bg-primary/5 p-6 pb-2 border-b border-primary/10">
          <h3 className="text-xl font-semibold">Premium Plan</h3>
          <p className="text-xl font-medium mt-2 flex items-center">
            $6.99
            <span className="text-muted-foreground text-sm ml-1">/month</span>
          </p>
          <p className="text-muted-foreground text-sm">Unlock the full power of AMAA.pro</p>
        </div>
        <CardContent className="pt-6">
          <ul className="space-y-3">
            <FeatureItem isPremium>Unlimited AI conversations</FeatureItem>
            <FeatureItem isPremium>Priority message processing</FeatureItem>
            <FeatureItem isPremium>Save & retrieve conversation history</FeatureItem>
            <FeatureItem isPremium>Advanced text-to-speech with custom voices</FeatureItem>
            <FeatureItem isPremium>Interactive content generation</FeatureItem>
            <FeatureItem isPremium>Voice customization options</FeatureItem>
            <FeatureItem isPremium>Premium email support</FeatureItem>
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
