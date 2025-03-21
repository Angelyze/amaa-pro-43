
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Check, ArrowLeft } from 'lucide-react';

const Subscribe = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 py-16">
      <div className="absolute inset-0 -z-10 background-pattern"></div>
      
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="self-start mb-6">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to App</span>
            </Button>
          </Link>
          <div className="w-full flex justify-center">
            <Logo />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-center mb-8">Upgrade to Premium</h1>
        
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
                <Button variant="outline" className="w-full">Current Plan</Button>
              </Link>
            </CardFooter>
          </Card>
          
          <Card className="border-teal">
            <CardHeader className="bg-teal/5 rounded-t-lg">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-teal text-white px-4 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
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
              <Button className="w-full bg-teal hover:bg-teal-light">
                Subscribe Now
              </Button>
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
