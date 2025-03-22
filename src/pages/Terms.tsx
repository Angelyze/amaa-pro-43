
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Layout } from '@/components/ui/layout';

const Terms = () => {
  const lastUpdated = "June 15, 2025";
  
  return (
    <Layout showBackButton title="Terms of Service">
      <div className="container mx-auto px-4 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-full flex justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="bg-white/70 dark:bg-black/50 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
            <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
            <p className="text-center text-muted-foreground mb-6">Last updated: {lastUpdated}</p>
            
            <div className="space-y-6 text-foreground/80">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">1. Acceptance of Terms</h2>
                <p className="leading-relaxed">
                  By accessing or using AMAA, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">2. Description of Service</h2>
                <p className="leading-relaxed">
                  AMAA is an AI assistant service that provides users with responses to queries, content generation, and various forms of assistance. The service is provided on an "as is" and "as available" basis. We may update or modify the service at any time without prior notice.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">3. User Accounts</h2>
                <p className="leading-relaxed">
                  Some features of AMAA require user registration. You are responsible for maintaining the confidentiality of your account information and for all activities that occur under your account. You must provide accurate, current, and complete information and keep your account information updated.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">4. User Conduct</h2>
                <p className="leading-relaxed mb-3">
                  When using AMAA, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use the service for any illegal purposes or to violate any laws</li>
                  <li>Upload or transmit viruses or malicious code</li>
                  <li>Attempt to gain unauthorized access to the service</li>
                  <li>Use the service to generate harmful, abusive, discriminatory, or unethical content</li>
                  <li>Interfere with or disrupt the integrity or performance of the service</li>
                  <li>Scrape, data-mine, or improperly extract data from the service</li>
                  <li>Reproduce, duplicate, copy, sell, or resell any portion of the service</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">5. Subscription and Billing</h2>
                <p className="leading-relaxed">
                  AMAA offers both free and premium subscription plans. By subscribing to a premium plan, you agree to pay the applicable fees as described at the time of purchase. Subscription fees are billed in advance on a recurring basis. You can cancel your subscription at any time, but we do not provide refunds for partial subscription periods.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">6. Intellectual Property</h2>
                <p className="leading-relaxed">
                  All content generated through AMAA belongs to the user who requested it, subject to these Terms. However, the service itself, including software, design, and system architecture, is the intellectual property of Angelyze and is protected by copyright, trademark, and other laws.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">7. Data Usage and Privacy</h2>
                <p className="leading-relaxed">
                  We collect and use your information as described in our Privacy Policy. By using AMAA, you consent to such collection and use of data. We may use anonymized data to improve our services and train our AI models.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">8. Limitation of Liability</h2>
                <p className="leading-relaxed">
                  Angelyze shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of or inability to use the service. Our total liability for all claims related to the service shall not exceed the amount paid by you for the service during the 12 months preceding the claim.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">9. Disclaimer of Warranties</h2>
                <p className="leading-relaxed">
                  The service is provided "as is" without any warranties of any kind, either express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, or non-infringement.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">10. Changes to Terms</h2>
                <p className="leading-relaxed">
                  Angelyze reserves the right to modify these Terms of Service at any time. We will provide notice of significant changes by posting the updated terms on our website. Your continued use of AMAA after such modifications constitutes your acceptance of the updated terms.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">11. Governing Law</h2>
                <p className="leading-relaxed">
                  These Terms shall be governed by the laws of the Republic of Croatia without regard to its conflict of law provisions. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts located in Croatia.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">12. Contact Information</h2>
                <p className="leading-relaxed">
                  If you have any questions about these Terms, please contact us at <a href="mailto:angelyzeshop@gmail.com" className="text-primary hover:underline">angelyzeshop@gmail.com</a>.
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
      
      <footer className="footer-container mt-auto">
        <div className="container mx-auto px-4">
          <div className="flex flex-col items-center justify-center">
            <div className="footer-nav">
              <Link to="/" className="footer-link">Home</Link>
              <Link to="/about" className="footer-link">About</Link>
              <Link to="/terms" className="footer-link">Terms</Link>
              <Link to="/privacy" className="footer-link">Privacy</Link>
            </div>
            <div className="copyright">
              © Copyright 2025 <Link to="/" className="text-primary mx-1.5 hover:text-primary/90 transition-colors">AMAA.pro</Link>. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Terms;
