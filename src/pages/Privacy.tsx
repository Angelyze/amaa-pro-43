import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Layout } from '@/components/ui/layout';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const Privacy = () => {
  const lastUpdated = "April 22, 2025";
  useScrollToTop();

  return (
    <Layout showBackButton backToHome title="Privacy Policy - Secure AI Assistant Platform">
      <div className="container mx-auto px-4 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-full flex justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="bg-background/80 dark:bg-background/30 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
            <h1 className="text-3xl font-bold mb-2 text-center">Privacy Policy</h1>
            <p className="text-center text-muted-foreground mb-6">Last updated: {lastUpdated}</p>
            
            <div className="space-y-6 text-foreground/80">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">1. Our Commitment to Privacy</h2>
                <p className="leading-relaxed">
                  At Angelyze, we prioritize the protection of your personal data. This Privacy Policy outlines our comprehensive approach to data collection, usage, and security when you use our advanced AI assistant platform, AMAA. We are committed to maintaining the trust you place in us by ensuring transparent data practices and robust security measures.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">2. Information Collection</h2>
                <p className="leading-relaxed mb-3">
                  We collect and process the following types of information to provide and improve our service:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Account information (email, profile details)</li>
                  <li>Service interaction data</li>
                  <li>Technical information</li>
                  <li>Subscription and payment details</li>
                  <li>User preferences and settings</li>
                  <li>Platform usage patterns</li>
                  <li>Customization preferences</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">3. Data Usage</h2>
                <p className="leading-relaxed mb-3">
                  Your information enables us to:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Deliver personalized assistance</li>
                  <li>Enhance service performance</li>
                  <li>Process subscription payments</li>
                  <li>Provide service updates</li>
                  <li>Maintain platform security</li>
                  <li>Optimize user experience</li>
                  <li>Improve our technology</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">4. Data Protection</h2>
                <p className="leading-relaxed">
                  We implement industry-leading security measures to protect your information, including advanced encryption, secure data storage, and strict access controls. Our infrastructure is regularly audited and updated to maintain the highest security standards. We process data in compliance with GDPR and other applicable privacy regulations.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">5. Data Retention</h2>
                <p className="leading-relaxed">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements. For free users, we may retain conversation history for up to 30 days. For premium users, we retain data according to the terms of the subscription plan.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">6. Data Sharing and Disclosure</h2>
                <p className="leading-relaxed mb-3">
                  We may share your information with:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Service providers who assist us in operating our business</li>
                  <li>Payment processors for subscription management</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners, with your explicit consent</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  We do not sell your personal data to third parties. Any data sharing is conducted with appropriate safeguards for your privacy.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">7. Your Data Protection Rights</h2>
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
                  <li>Rights related to automated decision-making and profiling</li>
                </ul>
                <p className="mt-3 leading-relaxed">
                  To exercise these rights, please contact us at <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a>.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">8. Cookies and Tracking Technologies</h2>
                <p className="leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with a small amount of data that may include an anonymous unique identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">9. International Data Transfers</h2>
                <p className="leading-relaxed">
                  Your information may be transferred to and processed in countries other than the one in which you reside. These countries may have data protection laws that are different from those in your country. We have implemented appropriate safeguards to protect your personal data when transferred internationally.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">10. Children's Privacy</h2>
                <p className="leading-relaxed">
                  Our service is not intended for individuals under the age of 16. We do not knowingly collect personal data from children. If we become aware that we have collected personal data from a child without verification of parental consent, we take steps to remove that information.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">11. Changes to This Privacy Policy</h2>
                <p className="leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "last updated" date.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">12. Contact Us</h2>
                <p className="leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us at:
                </p>
                <p className="mt-2">
                  Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a><br />
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
              © Copyright 2025 <Link to="/" className="text-primary mx-1.5 hover:text-primary/90 transition-colors">AMAA.pro</Link>. Powered by AMAA
            </div>
          </div>
        </div>
      </footer>
    </Layout>
  );
};

export default Privacy;
