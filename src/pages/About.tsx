
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { CreditCard } from 'lucide-react';
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
            <h1 className="text-3xl font-bold mb-6 text-center">About AMAA – The AI Assistant for Everyone</h1>
            
            <div className="space-y-6">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Empowering People with Advanced AI Tools</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA (Ask Me About Anything) is designed to make the power of artificial intelligence accessible to professionals, teams, and individuals across all industries. Our platform combines state-of-the-art AI capabilities, intuitive user experience, and robust security to help you streamline tasks, enhance productivity, and drive innovation—no matter your background or area of expertise.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Comprehensive Features for Your Workflow</h2>
                <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                  <li><span className="font-medium">Conversational AI:</span> Natural language Q&A, explanations, and clarifications</li>
                  <li><span className="font-medium">Content Creation:</span> Professional email and message drafts, content rewriting, document summaries</li>
                  <li><span className="font-medium">Research & Analysis:</span> Quick facts, market research, web search, citation generation</li>
                  <li><span className="font-medium">Data Tools:</span> Data extraction, table analysis, and charting (CSV/XLS support)</li>
                  <li><span className="font-medium">Text & Code Utilities:</span> Translation, proofing, summarization, code explanations</li>
                  <li><span className="font-medium">Customization Tools:</span> Choose your preferred app appearance and settings</li>
                  <li><span className="font-medium">Voice Assist:</span> Hands-free communication and voice input/output</li>
                  <li><span className="font-medium">Privacy & Security:</span> Enterprise-grade infrastructure and strict data protection</li>
                  {isPremium && (
                    <>
                      <li><span className="font-medium">Unlimited AI Access:</span> Faster and unlimited question processing</li>
                      <li><span className="font-medium">Advanced Organization:</span> Chat history and management</li>
                      <li><span className="font-medium">Premium Voice Features:</span> Priority AI voice usage and transcription</li>
                      <li><span className="font-medium">Priority User Support:</span> Dedicated help and accelerated response</li>
                    </>
                  )}
                </ul>
              </section>
              
              {!isPremium && (
                <section className="bg-primary/10 p-6 rounded-xl border border-primary/20">
                  <h2 className="text-xl font-semibold mb-3 text-primary">Upgrade to Premium</h2>
                  <p className="text-foreground/80 leading-relaxed mb-4">
                    Unlock the full power of AMAA for $6.99/month:
                  </p>
                  <ul className="list-disc pl-5 space-y-2 text-foreground/80 mb-4">
                    <li>Unlimited and accelerated AI responses</li>
                    <li>Advanced customization and organization</li>
                    <li>Premium voice input/output tools</li>
                    <li>Dedicated Premium user support</li>
                  </ul>
                  <div className="flex justify-center">
                    <Link to="/subscribe">
                      <Button className="gap-2">
                        <CreditCard size={16} />
                        Upgrade Now
                      </Button>
                    </Link>
                  </div>
                </section>
              )}
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Cutting-Edge Enterprise Technology</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA.PRO leverages advanced machine learning, a secure European infrastructure, and continuous improvements to deliver accurate, contextual results. All user interactions are protected by rigorous privacy controls and best-in-class security measures.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">About Angelyze</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Angelyze, the Croatian-based company behind AMAA, brings together a global team of experts in AI, UX, and enterprise development. Our vision is to enable professionals everywhere to benefit from ethical and dependable artificial intelligence tools.
                </p>
                <br />
                <p className="text-foreground/80 leading-relaxed">
                  Discover more at <a href="https://convertlab.pro/" className="text-primary hover:underline">Convert Lab</a>: free file conversion, transcription, and unit calculation from Angelyze.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Contact & Recognition</h2>
                <p className="text-foreground/80 leading-relaxed">
                  Reach out for guidance, partnership, or support.
                </p>
                <div className="mt-2">
                  <p className="text-foreground/80">Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                  <p className="text-foreground/80">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
                  <br />
                  <p className="text-foreground/80">AMAA.pro is listed in the <a href="https://freeaitools.wiki/" className="text-primary hover:underline">Free AI Tools Directory (Wikipedia)</a>.</p>
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
