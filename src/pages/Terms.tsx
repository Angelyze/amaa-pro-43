import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Layout } from '@/components/ui/layout';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Terms = () => {
  const lastUpdated = "April 22, 2025";
  useScrollToTop();

  return (
    <Layout showBackButton backToHome title="Terms of Service - AMAA AI Assistant Platform">
      <div className="container mx-auto px-4 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-full flex justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="bg-background/80 dark:bg-background/30 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
            <h1 className="text-3xl font-bold mb-2 text-center">Terms of Service</h1>
            <p className="text-center text-muted-foreground mb-6">Last updated: {lastUpdated}</p>
            
            <div className="space-y-6 text-foreground/80">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">1. Terms Acceptance</h2>
                <p className="leading-relaxed">
                  By accessing or using the AMAA platform and its advanced AI capabilities, you agree to be bound by these Terms of Service. Please review these terms carefully before using our service.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">2. Service Description</h2>
                <p className="leading-relaxed">
                  AMAA is an advanced AI-powered digital assistant platform that provides intelligent responses, content generation, research assistance, and various productivity tools. Our service employs sophisticated technology to process and analyze information, providing personalized assistance while maintaining high standards of privacy and security.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">3. User Accounts</h2>
                <p className="leading-relaxed">
                  Some features of AMAA require user registration. You are responsible for:
                </p>
                <ul className="list-disc pl-5 space-y-2 mt-2">
                  <li>Maintaining account security and confidentiality</li>
                  <li>Providing accurate and current information</li>
                  <li>Updating account information as needed</li>
                  <li>All activities occurring under your account</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">4. Acceptable Use</h2>
                <p className="leading-relaxed mb-3">
                  When using AMAA, you agree not to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Use the service for any unlawful purposes</li>
                  <li>Upload malicious code or content</li>
                  <li>Attempt unauthorized access to the service</li>
                  <li>Generate harmful or unethical content</li>
                  <li>Interfere with service operations</li>
                  <li>Conduct unauthorized data collection</li>
                  <li>Redistribute or resell service features</li>
                  <li>Attempt to reverse engineer the AI systems</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">5. Premium Subscriptions</h2>
                <p className="leading-relaxed">
                  AMAA offers both standard and premium subscription plans. Premium subscribers enjoy enhanced features, including advanced processing capabilities, unlimited usage, personalization options, and priority support. Subscription fees are billed in advance on a recurring basis. Cancellations take effect at the end of the current billing period without refunds for partial periods.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">6. Intellectual Property</h2>
                <p className="leading-relaxed">
                  While users retain rights to their generated content, AMAA's platform, including its AI technology, interface design, and system architecture, remains the intellectual property of Angelyze. The service is protected by copyright, trademark, and other applicable laws.
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
                  If you have any questions about these Terms, please contact us at <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a>.
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
