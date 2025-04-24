
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Star, MessageSquare, FileText, CircleCheck, Info } from 'lucide-react';
import { Footer } from '@/components/Footer';
import { PremiumComparison } from '@/components/about/PremiumComparison';
import { TeamMember } from '@/components/about/TeamMember';
import { Stats } from '@/components/about/Stats';
import { Testimonial } from '@/components/about/Testimonial';
import { JourneyTimeline } from '@/components/about/JourneyTimeline';

const About = () => {
  const { isPremium } = useAuth();
  useScrollToTop();

  return (
    <Layout showBackButton backToHome title="About AMAA.pro">
      <div className="w-full bg-gradient-to-b from-background/50 to-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-[800px] mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="animate-float">
                <Logo />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Your AI Assistant for Smart Conversations
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Generate content, answer questions, and accomplish tasks with our advanced AI assistant. Join thousands of satisfied users today.
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Try for Free <Star className="w-4 h-4" />
                  </Button>
                </Link>
                {!isPremium && (
                  <Link to="/subscribe">
                    <Button size="lg" variant="outline" className="gap-2">
                      Go Premium <Info className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Stats Section */}
            <div className="mt-16">
              <Stats />
            </div>

            {/* Features Grid */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Key Features</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <MessageSquare className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Smart Conversations</h3>
                      <p className="text-muted-foreground">Engage in natural conversations with context-aware responses that actually understand your needs.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <FileText className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Content Creation</h3>
                      <p className="text-muted-foreground">Generate blog posts, marketing copy, and professional content with our AI assistant.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <Star className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Premium Benefits</h3>
                      <p className="text-muted-foreground">Unlimited conversations, priority processing, and advanced customization options.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <CircleCheck className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">File Processing</h3>
                      <p className="text-muted-foreground">Upload and process files for enhanced content generation and analysis.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Comparison Section */}
            <div className="mt-24" id="premium">
              <h2 className="text-2xl font-bold text-center mb-4">Choose Your Plan</h2>
              <p className="text-center text-muted-foreground mb-12">Get unlimited access to all features for only $6.99/month</p>
              <PremiumComparison />
            </div>

            {/* User Testimonials */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">What Our Users Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Testimonial
                  content="AMAA.pro has transformed how I create content. The AI understands context and delivers exactly what I need."
                  author="Sarah Chen"
                  role="Content Creator"
                />
                <Testimonial
                  content="The unlimited conversations with the premium plan are worth every penny. It's like having a smart assistant always ready to help."
                  author="Marcus Rodriguez"
                  role="Digital Marketer"
                />
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Our Journey</h2>
              <JourneyTimeline />
            </div>

            {/* Meet the Team */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Meet the Team</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TeamMember 
                  name="Maria Kovač" 
                  role="Founder & AI Director" 
                  bio="Leading the development of advanced AI conversations and natural language processing."
                />
                <TeamMember 
                  name="Tomas Novak" 
                  role="Lead Developer" 
                  bio="Expert in building scalable AI applications and cloud infrastructure."
                />
                <TeamMember 
                  name="Ana Perić" 
                  role="UX/UI Designer" 
                  bio="Creating intuitive and accessible interfaces for AI interactions."
                />
              </div>
            </div>

            {/* Technical Section */}
            <div className="mt-24 space-y-12">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">About Angelyze</h2>
                <p className="text-foreground/80 leading-relaxed">
                  <a href="https://angelyze.org/" className="text-primary hover:underline">Angelyze</a>, the company behind AMAA.pro, is a pioneering technology firm based in Croatia, EU. Our team combines expertise in artificial intelligence and user experience design to create powerful, accessible AI tools.
                </p>
                <br />
                <p className="text-foreground/80 leading-relaxed">
                  Check out our newest project: <a href="https://convertlab.pro/" className="text-primary hover:underline">Convert Lab</a> - a free file conversion, transcription, and unit calculation tool.
                </p>
              </section>
            </div>

            {/* Contact Section */}
            <div className="mt-24 space-y-6">
              <h2 className="text-xl font-semibold text-primary">Contact Us</h2>
              <div className="space-y-2">
                <p className="text-foreground/80">Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                <p className="text-foreground/80">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </Layout>
  );
};

export default About;
