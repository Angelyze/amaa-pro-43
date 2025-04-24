
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { BarChart2, Shield, Users, Star, FileText, FileCheck, FileLock, CircleDollarSign, Award } from 'lucide-react';

const About = () => {
  const { isPremium } = useAuth();
  useScrollToTop();

  return (
    <Layout showBackButton backToHome title="About AMAA.pro">
      {/* Hero Section */}
      <div className="w-full bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-[800px] mx-auto">
            <div className="flex flex-col items-center text-center space-y-6">
              <Logo />
              <h1 className="text-4xl font-bold tracking-tight">
                Your AI Assistant for Every Task
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Join thousands of professionals who use AMAA.pro to enhance their productivity and streamline their workflow.
              </p>
              <div className="flex gap-4">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Start Free <Star className="w-4 h-4" />
                  </Button>
                </Link>
                {!isPremium && (
                  <Link to="/subscribe">
                    <Button size="lg" variant="outline" className="gap-2">
                      Upgrade to Premium <CircleDollarSign className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
              <div className="flex items-center gap-8 pt-8 text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  <span>10K+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <span>Enterprise Ready</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <BarChart2 className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                    <p className="text-muted-foreground">Comprehensive data analysis and visualization tools at your fingertips.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Smart Content Creation</h3>
                    <p className="text-muted-foreground">Generate professional content in seconds with our AI assistant.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileCheck className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Automated Processing</h3>
                    <p className="text-muted-foreground">Streamline your workflow with intelligent automation.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Shield className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Enterprise Security</h3>
                    <p className="text-muted-foreground">Bank-grade encryption and privacy protection for your data.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileLock className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Premium Features</h3>
                    <p className="text-muted-foreground">Unlock advanced capabilities with our premium subscription.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Collaboration Tools</h3>
                    <p className="text-muted-foreground">Work seamlessly with your team in real-time.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Section */}
            {!isPremium && (
              <div className="mt-24 bg-primary/5 rounded-2xl p-8 border border-primary/10">
                <div className="text-center space-y-4 mb-8">
                  <h2 className="text-2xl font-bold">Upgrade to Premium</h2>
                  <p className="text-muted-foreground">Get unlimited access to all features for only $6.99/month</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Star className="w-5 h-5 text-primary" />
                      Premium Features
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Unlimited AI requests</li>
                      <li>• Priority processing</li>
                      <li>• Advanced customization</li>
                      <li>• Premium support</li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold flex items-center gap-2">
                      <Award className="w-5 h-5 text-primary" />
                      Enterprise Benefits
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>• Team collaboration</li>
                      <li>• Custom integrations</li>
                      <li>• Advanced security</li>
                      <li>• Analytics dashboard</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-8 flex justify-center">
                  <Link to="/subscribe">
                    <Button size="lg" className="gap-2">
                      Upgrade Now <CircleDollarSign className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {/* Technical Section */}
            <div className="mt-24 space-y-12">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Cutting-Edge Enterprise Technology</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA.pro leverages state-of-the-art AI technology and robust infrastructure to deliver consistent, reliable performance. Our system continuously evolves through advanced machine learning while maintaining strict data privacy and security protocols. We employ sophisticated processing algorithms to ensure accurate, relevant, and contextual responses to your queries.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">About Angelyze</h2>
                <p className="text-foreground/80 leading-relaxed">
                  <a href="https://angelyze.org/" className="text-primary hover:underline">Angelyze</a>, the company behind AMAA.pro, is a pioneering technology firm based in Croatia, EU. Our international team combines expertise in artificial intelligence, user experience design, and enterprise software development. We're committed to advancing the field of AI assistance while maintaining the highest standards of ethical AI development and user privacy.
                </p>
                <br />
                <p className="text-foreground/80 leading-relaxed">
                  Discover the newest project: <a href="https://convertlab.pro/" className="text-primary hover:underline">Convert Lab</a> - a free file conversion, transcription, and unit calculation from Angelyze.
                </p>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-24 space-y-6">
              <h2 className="text-xl font-semibold text-primary">Contact & Recognition</h2>
              <div className="space-y-2">
                <p className="text-foreground/80">Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                <p className="text-foreground/80">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
                <br />
                <p className="text-foreground/80">
                  <a href="https://freeaitools.wiki/AITools/post/amaa-pro-B6bfwWfPgB2J7Qp" className="text-primary hover:underline">AMAA.pro</a> is listed in the <a href="https://freeaitools.wiki/" className="text-primary hover:underline">Free AI Tools Directory (Wikipedia)</a>.
                </p>
              </div>
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
