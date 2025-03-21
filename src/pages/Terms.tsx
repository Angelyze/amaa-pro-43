
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Terms = () => {
  const lastUpdated = "March 21, 2025";
  
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 py-16">
      <div className="absolute inset-0 -z-10 background-pattern"></div>
      
      <div className="w-full max-w-3xl">
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
        
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
          <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
          <p className="text-center text-muted-foreground mb-6">Last updated: {lastUpdated}</p>
          
          <div className="space-y-6 text-foreground/80">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">1. Acceptance of Terms</h2>
              <p className="leading-relaxed">
                By accessing or using AMAA, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">2. Description of Service</h2>
              <p className="leading-relaxed">
                AMAA is an AI assistant service that provides users with responses to queries, content generation, and various forms of assistance. The service is provided on an "as is" and "as available" basis.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">3. User Accounts</h2>
              <p className="leading-relaxed">
                Some features of AMAA may require user registration. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">4. User Conduct</h2>
              <p className="leading-relaxed mb-3">
                When using AMAA, you agree not to:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Use the service for any illegal purposes</li>
                <li>Upload or transmit viruses or malicious code</li>
                <li>Attempt to gain unauthorized access to the service</li>
                <li>Use the service to generate harmful, abusive, or unethical content</li>
                <li>Interfere with or disrupt the integrity of the service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">5. Subscription and Billing</h2>
              <p className="leading-relaxed">
                AMAA offers both free and premium subscription plans. By subscribing to a premium plan, you agree to pay the applicable fees. Subscription fees are billed in advance on a recurring basis. You can cancel your subscription at any time.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">6. Intellectual Property</h2>
              <p className="leading-relaxed">
                All content generated through AMAA belongs to the user. However, the service itself, including software, design, and system architecture, is the property of Angelyze and is protected by intellectual property laws.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">7. Limitation of Liability</h2>
              <p className="leading-relaxed">
                Angelyze shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">8. Changes to Terms</h2>
              <p className="leading-relaxed">
                Angelyze reserves the right to modify these Terms of Service at any time. We will provide notice of significant changes. Your continued use of AMAA after such modifications constitutes your acceptance of the updated terms.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">9. Contact Information</h2>
              <p className="leading-relaxed">
                If you have any questions about these Terms, please contact us at <a href="mailto:angelyzeshop@gmail.com" className="text-teal hover:underline">angelyzeshop@gmail.com</a>.
              </p>
              <p className="mt-2">
                Angelyze<br />
                10430 Samobor<br />
                Zagreb County, Croatia - EU
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
