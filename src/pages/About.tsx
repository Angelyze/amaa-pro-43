
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Star, CircleDollarSign, MessageSquare, FileText, Award, Sparkles } from 'lucide-react';
import { Testimonial } from '@/components/about/Testimonial';
import { JourneyTimeline } from '@/components/about/JourneyTimeline';
import { Separator } from '@/components/ui/separator';

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
                Your AI Assistant for Every Task
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Join thousands of professionals who use AMAA.pro to enhance their productivity through intelligent conversations.
              </p>
              <div className="flex gap-4">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Try for Free <Star className="w-4 h-4" />
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
                  <MessageSquare className="w-5 h-5" />
                  <span>10K+ Users</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  <span>4.9/5 Rating</span>
                </div>
              </div>
            </div>

            {/* Features Grid */}
            <div className="mt-24 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MessageSquare className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Smart Conversations</h3>
                    <p className="text-muted-foreground">Engage in natural, context-aware conversations with our AI assistant.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <FileText className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Content Creation</h3>
                    <p className="text-muted-foreground">Generate professional content with intelligent assistance.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Star className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Premium Experience</h3>
                    <p className="text-muted-foreground">Enjoy advanced features and priority processing with our premium plan.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-6 h-6 text-primary mt-1" />
                  <div>
                    <h3 className="text-lg font-semibold">Voice Customization</h3>
                    <p className="text-muted-foreground">Choose from various voices for text-to-speech conversion.</p>
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
                      <li>• Save & manage conversations</li>
                      <li>• Custom TTS voices</li>
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

            {/* Journey Section */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Our Journey</h2>
              <JourneyTimeline />
            </div>

            {/* User Testimonials */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">What Our Users Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Testimonial
                  content="AMAA.pro has completely transformed how I interact with AI. The conversations feel natural and the responses are always on point."
                  author="Sarah Chen"
                  role="Content Creator"
                />
                <Testimonial
                  content="The premium features are worth every penny. Being able to save conversations and customize voices has been incredibly useful."
                  author="Marcus Rodriguez"
                  role="Digital Marketer"
                />
              </div>
            </div>

            {/* Meet the Team */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Meet the Team</h2>
              <p className="text-center text-muted-foreground mb-8">
                We're a passionate team of AI experts and developers working to make artificial intelligence accessible to everyone.
              </p>
            </div>

            {/* Technical Section */}
            <div className="mt-24 space-y-12">
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">Advanced AI Technology</h2>
                <p className="text-foreground/80 leading-relaxed">
                  AMAA.pro leverages state-of-the-art AI technology to deliver consistent, reliable performance. Our system continuously evolves through advanced machine learning while maintaining strict data privacy and security protocols.
                </p>
              </section>
              
              <section>
                <h2 className="text-xl font-semibold mb-3 text-primary">About Angelyze</h2>
                <p className="text-foreground/80 leading-relaxed">
                  <a href="https://angelyze.org/" className="text-primary hover:underline">Angelyze</a>, the company behind AMAA.pro, is a pioneering technology firm based in Croatia, EU. Our international team combines expertise in artificial intelligence and user experience design.
                </p>
                <br />
                <p className="text-foreground/80 leading-relaxed">
                  Discover our newest project: <a href="https://convertlab.pro/" className="text-primary hover:underline">Convert Lab</a> - a free file conversion, transcription, and unit calculation tool from Angelyze.
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
    </Layout>
  );
};

export default About;
