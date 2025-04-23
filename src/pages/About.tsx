import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Layout } from '@/components/ui/layout';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';

const About = () => {
  const { isPremium } = useAuth();
  useScrollToTop();

  return (
    <Layout showBackButton backToHome title="About AMAA - Advanced AI Assistant Platform">
      <div className="container mx-auto px-4 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-full flex justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="bg-background/80 dark:bg-background/30 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
            <h1 className="text-3xl font-bold mb-6 text-center">About AMAA - Your AI Assistant for Everyone</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Meet AMAA, Your Everyday AI Assistant</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA is built as an AI Assistant for everyone—no matter your profession or background. We believe technology should be accessible, stress-free, and genuinely helpful.
                  <br /><br />
                  AMAA can help with your questions, assist with writing, explore new ideas, analyze information, and simplify your daily tasks. We’re here to make smart tools easy and fun for people everywhere.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">What Can AMAA Do for You?</h2>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>Answer your questions and explain things in easy language</li>
                  <li>Help you write and edit text or emails</li>
                  <li>Find information and summarize key ideas</li>
                  <li>Assist with creative tasks like brainstorming or story writing</li>
                  <li>Analyze simple data and help you understand it</li>
                  <li>Support with technical or everyday problems</li>
                  <li>Offer helpful suggestions and fun facts</li>
                  <li>Let you pick your preferred look and style for the interface</li>
                  {isPremium && (
                    <>
                      <li>Enjoy unlimited and faster processing</li>
                      <li>Access advanced customization and organization options</li>
                      <li>Get higher-level support and voice features</li>
                      <li>Manage your AI conversations more easily</li>
                    </>
                  )}
                </ul>
              </section>
              
              {!isPremium && (
                <section className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                  <h2 className="text-xl font-semibold mb-3 text-primary">Upgrade to Premium</h2>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Unlock more with premium for just $6.99:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80 mb-4">
                    <li>Unlimited and faster AI responses</li>
                    <li>Extra customization and organizing tools</li>
                    <li>Better voice interaction features</li>
                    <li>Priority help and support</li>
                  </ul>
                  <div className="flex justify-center">
                    <Link to="/subscribe">
                      <Button className="gap-2">
                        <CreditCard size={16} />
                        <span>Upgrade Now</span>
                      </Button>
                    </Link>
                  </div>
                </section>
              )}
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Enterprise-Grade Technology</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA.PRO leverages state-of-the-art AI technology and robust infrastructure to deliver consistent, reliable performance. Our system continuously evolves through advanced machine learning while maintaining strict data privacy and security protocols. We employ sophisticated processing algorithms to ensure accurate, relevant, and contextual responses to your queries.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">About Angelyze</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Angelyze, the company behind AMAA, is a pioneering technology firm based in Croatia, EU. Our international team combines expertise in artificial intelligence, user experience design, and enterprise software development. We're committed to advancing the field of AI assistance while maintaining the highest standards of ethical AI development and user privacy.
                </p>
                <br></br>
                <p className="text-foreground/80 leading-relaxed">
                  Check the latest Angelyze project <a href="https://convertlab.pro/" className="text-primary hover:underline">Convert Lab</a>, a free file conversion and transcription, as well as a unit conversion tool!
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Contact Information</h2>
                <p className="text-foreground/80 leading-relaxed">
                  We value your feedback and are here to assist you with any questions or concerns.
                </p>
                <div className="mt-2">
                  <p className="text-foreground/80">Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                  <p className="text-foreground/80">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
                  <br></br>
                  <p className="text-foreground/80">AMAA.pro is proudly featured AI Tool on <a href="https://freeaitools.wiki/" className="text-primary hover:underline">Free AI Tools Directory Wikipedia</a>.</p>
                </div>
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

export default About;
