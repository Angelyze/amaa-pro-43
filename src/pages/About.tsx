
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CreditCard } from 'lucide-react';
import { Layout } from '@/components/ui/layout';
import { useAuth } from '@/contexts/AuthContext';

const About = () => {
  const { isPremium } = useAuth();
  
  return (
    <Layout showBackButton title="About AMAA">
      <div className="container mx-auto px-4 py-16">
        <div className="w-full max-w-3xl mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-full flex justify-center">
              <Logo />
            </div>
          </div>
          
          <div className="bg-background/80 dark:bg-background/30 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
            <h1 className="text-3xl font-bold mb-6 text-center">About AMAA</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Our Mission</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA.pro (Ask Me About Anything) is designed to provide users with an advanced AI models that can help answer questions, search the internet, generate various types of content, and assist with various tasks. The mission is to make AI technology accessible, helpful, and user-friendly for everyone while providing a superior experience. Think of it as a Google 2.0!
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">What We Offer</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  AMAA combines multy cutting-edge AI models with a simple, intuitive interface to provide:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>Instant and coherent, context-aware text responses and conversations</li>
                  <li>Content generation and creative writing assistance</li>
                  <li>Research help and information summarization</li>
                  <li>Writing or debugging code in various programming languages, solving math problems</li>
                  <li>Real-time internet search and up-to-date information</li>
                  <li>Upload images for analysis, such as identifying objects, extracting text, or interpreting visual content.</li>
                  <li>Various Themes</li>

                  {isPremium && (
                    <>
                    <li>Unlimited conversations and queries</li>
                    <li>Profile and Theme customization options</li>
                    <li>Advanced AI models and capabilities</li>
                    <li>Save, delete, and manage conversations</li>
                    <li>Multiple text to speech voice options</li>
                    <li>Premium support</li>
                    </>
                  )}
                </ul>
              </section>
              
              {!isPremium && (
                <section className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                  <h2 className="text-xl font-semibold mb-3 text-primary">Go Premium</h2>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Upgrade to our premium plan to unlock the full potential of AMAA:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80 mb-4">
                    <li>Unlimited conversations and queries</li>
                    <li>Profile and Theme customization options</li>
                    <li>Advanced AI models and capabilities</li>
                    <li>Save, delete, and manage conversations</li>
                    <li>Multiple Text to Speech voice options</li>
                    <li>Premium support</li>
                  </ul>
                  <div className="flex justify-center">
                    <Link to="/subscribe">
                      <Button className="gap-2">
                        <CreditCard size={16} />
                        <span>Subscribe Now</span>
                      </Button>
                    </Link>
                  </div>
                </section>
              )}
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Our Technology</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA is powered by state-of-the-art language models and a robust backend infrastructure. We continuously improve our technology to provide more accurate, helpful, and safe responses. Our system is designed to learn from interactions while maintaining user privacy and data security.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Our Company</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Angelyze is the company behind AMAA. Founded with the vision of making AI accessible to everyone, we're committed to developing tools that enhance productivity and creativity. Our team combines expertise in artificial intelligence, user experience design, and software development.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Contact Us</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Have questions or feedback? We'd love to hear from you!
                </p>
                <div className="mt-2">
                  <p className="text-foreground/80">Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                  <p className="text-foreground/80">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
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
