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
            <h1 className="text-3xl font-bold mb-6 text-center">About AMAA - Your Intelligent Digital Assistant</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Our Mission</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA.pro (Ask Me About Anything) is an innovative digital productivity platform designed to revolutionize how professionals interact with advanced AI technology. Our mission is to empower users with intelligent assistance for research, content creation, and complex problem-solving while maintaining the highest standards of privacy and security. We're building the next generation of AI-powered productivity tools that adapt to your needs.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Comprehensive Features</h2>
                <p className="text-foreground/80 leading-relaxed mb-4">
                  Our platform combines cutting-edge AI technology with an intuitive interface to deliver:
                </p>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li>Intelligent conversational assistance with context awareness</li>
                  <li>Advanced content generation and creative writing support</li>
                  <li>Professional research assistance and data analysis</li>
                  <li>Technical problem-solving across multiple domains</li>
                  <li>Real-time information processing and synthesis</li>
                  <li>Visual content analysis and interpretation</li>
                  <li>Customizable interface themes for optimal productivity</li>

                  {isPremium && (
                    <>
                    <li>Unlimited high-priority processing</li>
                    <li>Advanced customization and personalization</li>
                    <li>Enhanced processing capabilities</li>
                    <li>Comprehensive conversation management</li>
                    <li>Premium voice interaction features</li>
                    <li>Priority technical support</li>
                    </>
                  )}
                </ul>
              </section>
              
              {!isPremium && (
                <section className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                  <h2 className="text-xl font-semibold mb-3 text-primary">Upgrade to Premium</h2>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Enhance your productivity with our premium features for just $6.99:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80 mb-4">
                    <li>Unlimited high-priority processing</li>
                    <li>Advanced customization and personalization</li>
                    <li>Enhanced processing capabilities</li>
                    <li>Comprehensive conversation management</li>
                    <li>Premium voice interaction features</li>
                    <li>Priority technical support</li>
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
