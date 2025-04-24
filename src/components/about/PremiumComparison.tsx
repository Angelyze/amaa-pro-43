
import { Check, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";

export function PremiumComparison() {
  return (
    <div className="grid md:grid-cols-2 gap-8">
      <Card>
        <CardHeader>
          <CardTitle>Free Plan</CardTitle>
          <CardDescription>Basic access to AMAA.pro</CardDescription>
          <div className="text-3xl font-bold mt-2">$0</div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check size={18} className="text-muted-foreground mt-0.5" />
              <span>10 AI queries per day</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-muted-foreground mt-0.5" />
              <span>File upload analysis & transcription</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-muted-foreground mt-0.5" />
              <span>Web search integration</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-muted-foreground mt-0.5" />
              <span>Code creation and edit</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-muted-foreground mt-0.5" />
              <span>Advanced Research</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-muted-foreground mt-0.5" />
              <span>Voice input and basic Text to Speech</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Link to="/" className="w-full">
            <Button variant="outline" className="w-full">Current Plan</Button>
          </Link>
        </CardFooter>
      </Card>
      
      <Card className="border-teal">
        <CardHeader className="bg-teal/5 rounded-t-lg">
          <CardTitle>Premium Plan</CardTitle>
          <CardDescription>Full access to all AMAA.pro features</CardDescription>
          <div className="text-3xl font-bold mt-2">$6.99<span className="text-sm font-normal">/month</span></div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-start gap-2">
              <Check size={18} className="text-teal mt-0.5" />
              <span>Everything in Free Plan</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-teal mt-0.5" />
              <span>Unlimited AI queries</span>
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
              <span>Custom Text to Speech voice options</span>
            </li>
            <li className="flex items-start gap-2">
              <Check size={18} className="text-teal mt-0.5" />
              <span>Priority support access</span>
            </li>
          </ul>
        </CardContent>
        <CardFooter>
          <Link to="/subscribe" className="w-full">
            <Button className="w-full bg-teal hover:bg-teal-light">Subscribe Now</Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
