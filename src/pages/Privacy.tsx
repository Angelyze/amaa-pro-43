
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const Privacy = () => {
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
          <h1 className="text-3xl font-bold mb-2 text-center">Privacy Policy</h1>
          <p className="text-center text-muted-foreground mb-6">Last updated: {lastUpdated}</p>
          
          <div className="space-y-6 text-foreground/80">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">1. Introduction</h2>
              <p className="leading-relaxed">
                At Angelyze, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AMAA service.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">2. Information We Collect</h2>
              <p className="leading-relaxed mb-3">
                We may collect the following types of information:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Account information (email, name, profile details)</li>
                <li>Usage data (queries, interactions with the service)</li>
                <li>Device information (IP address, browser type, device type)</li>
                <li>Payment information for premium subscriptions</li>
                <li>Any content you upload or share through the service</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">3. How We Use Your Information</h2>
              <p className="leading-relaxed mb-3">
                We use your information for the following purposes:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>To provide and maintain our service</li>
                <li>To improve and personalize user experience</li>
                <li>To process payments and manage subscriptions</li>
                <li>To communicate with you about service updates</li>
                <li>To ensure the security of our service</li>
                <li>To comply with legal obligations</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">4. Data Retention</h2>
              <p className="leading-relaxed">
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">5. Data Security</h2>
              <p className="leading-relaxed">
                We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">6. Your Data Protection Rights</h2>
              <p className="leading-relaxed mb-3">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate data</li>
                <li>Right to erasure (right to be forgotten)</li>
                <li>Right to restrict processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing</li>
              </ul>
              <p className="mt-3 leading-relaxed">
                To exercise these rights, please contact us at <a href="mailto:angelyzeshop@gmail.com" className="text-teal hover:underline">angelyzeshop@gmail.com</a>.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">7. Cookies and Tracking Technologies</h2>
              <p className="leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">8. Changes to This Privacy Policy</h2>
              <p className="leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">9. Contact Us</h2>
              <p className="leading-relaxed">
                If you have any questions about this Privacy Policy, please contact us at:
              </p>
              <p className="mt-2">
                Email: <a href="mailto:angelyzeshop@gmail.com" className="text-teal hover:underline">angelyzeshop@gmail.com</a><br />
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

export default Privacy;
