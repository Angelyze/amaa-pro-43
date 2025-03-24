
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Layout } from '@/components/ui/layout';

const Privacy = () => {
  const lastUpdated = "March 24, 2025";
  
  return (
    <Layout showBackButton title="Privacy Policy">
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
                <h2 className="text-xl font-semibold mb-3 text-primary">1. Introduction</h2>
                <p className="leading-relaxed">
                  At Angelyze, we respect your privacy and are committed to protecting your personal data. This Privacy Policy explains how we collect, use, and safeguard your information when you use our AMAA service. It also describes your rights regarding your personal data.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">2. Information We Collect</h2>
                <p className="leading-relaxed mb-3">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>Account information (email, name, profile details)</li>
                  <li>Usage data (queries, interactions with the service)</li>
                  <li>Device information (IP address, browser type, device type)</li>
                  <li>Payment information for premium subscriptions</li>
                  <li>Content you upload or share through the service</li>
                  <li>Conversation history and interactions with our AI</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">3. How We Use Your Information</h2>
                <p className="leading-relaxed mb-3">
                  We use your information for the following purposes:
                </p>
                <ul className="list-disc pl-5 space-y-2">
                  <li>To provide and maintain our service</li>
                  <li>To improve and personalize your experience</li>
                  <li>To process payments and manage subscriptions</li>
                  <li>To communicate with you about service updates</li>
                  <li>To ensure the security of our service</li>
                  <li>To analyze usage patterns and optimize performance</li>
                  <li>To train and improve our AI models (using anonymized data)</li>
                  <li>To comply with legal obligations</li>
                </ul>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">4. Data Sharing and Disclosure</h2>
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
                <h2 className="text-xl font-semibold mb-3 text-primary">5. Data Retention</h2>
                <p className="leading-relaxed">
                  We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, including for the purposes of satisfying any legal, regulatory, tax, accounting, or reporting requirements. For free users, we may retain conversation history for up to 30 days. For premium users, we retain data according to the terms of the subscription plan.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">6. Data Security</h2>
                <p className="leading-relaxed">
                  We implement appropriate security measures to protect your personal data against unauthorized access, alteration, disclosure, or destruction. These measures include encryption, access controls, and regular security assessments. However, no method of transmission over the Internet or electronic storage is 100% secure.
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
                  To exercise these rights, please contact us at <a href="mailto:angelyzeshop@gmail.com" className="text-primary hover:underline">angelyzeshop@gmail.com</a>.
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
                  Email: <a href="mailto:angelyzeshop@gmail.com" className="text-primary hover:underline">angelyzeshop@gmail.com</a><br />
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

export default Privacy;
