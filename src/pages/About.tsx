
import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Star, CircleDollarSign, MessageSquare, FileText, Award, Sparkles, Clock, Shield, CircleCheck } from 'lucide-react';
import { Testimonial } from '@/components/about/Testimonial';
import { JourneyTimeline } from '@/components/about/JourneyTimeline';
import { Separator } from '@/components/ui/separator';
import { Footer } from '@/components/Footer';
import { PremiumComparison } from '@/components/about/PremiumComparison';
import { TeamMember } from '@/components/about/TeamMember';
import { Stats } from '@/components/about/Stats';
import { AspectRatio } from '@/components/ui/aspect-ratio';

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
                Transform Your Productivity with AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Our AI assistant helps thousands of professionals generate content, answer questions, and accomplish tasks faster than ever before.
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
                      Upgrade to Premium <CircleDollarSign className="w-4 h-4" />
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
              <h2 className="text-2xl font-bold text-center mb-12">Why Choose AMAA.pro?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <MessageSquare className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Natural Conversations</h3>
                      <p className="text-muted-foreground">Our advanced AI maintains context and provides human-like responses that actually answer your questions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <FileText className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Content Creation</h3>
                      <p className="text-muted-foreground">Generate blog posts, marketing copy, emails, and more with just a few prompts.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <Sparkles className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Voice Customization</h3>
                      <p className="text-muted-foreground">Choose from various voices for our text-to-speech feature, with even more options for premium users.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <CircleCheck className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Premium Experience</h3>
                      <p className="text-muted-foreground">Enjoy priority processing, unlimited conversations, and advanced customization with our premium plan.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <Clock className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Save Time</h3>
                      <p className="text-muted-foreground">Users report saving 5+ hours per week on content creation, research, and problem-solving tasks.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <Shield className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Privacy First</h3>
                      <p className="text-muted-foreground">Your data privacy is our priority. We never share your conversations or use them to train our models.</p>
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

            {/* Use Cases Section */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">What Can You Do With AMAA.pro?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/10">
                  <h3 className="font-semibold text-lg mb-4">For Content Creators</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Generate article outlines and drafts</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Create social media content calendars</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Suggest headline variations and SEO improvements</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Help with editing and proofreading</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-foreground/5 p-6 rounded-lg border border-foreground/10">
                  <h3 className="font-semibold text-lg mb-4">For Professionals</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Draft professional emails and responses</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Research topics and summarize information</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Generate reports and presentations</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CircleCheck className="w-5 h-5 text-primary flex-shrink-0" />
                      <span>Brainstorm ideas and solutions</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* User Testimonials */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">What Our Users Say</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Testimonial
                  content="AMAA.pro has revolutionized my content workflow. I'm producing twice as much high-quality content in half the time. The premium features are absolutely worth it."
                  author="Sarah Chen"
                  role="Content Creator"
                />
                <Testimonial
                  content="As a digital marketer, I rely on AMAA.pro daily. The custom voice features and conversation history have become essential tools in my workflow."
                  author="Marcus Rodriguez"
                  role="Digital Marketer"
                />
                <Testimonial
                  content="The voice customization is incredible! Being able to have content read back to me in different voices helps me catch errors and improve flow."
                  author="Priya Sharma"
                  role="Novelist & Blogger"
                />
                <Testimonial
                  content="I was skeptical about another AI tool, but AMAA.pro is different. The conversations feel natural, and it actually understands complex requests."
                  author="James Wilson"
                  role="Product Manager"
                />
              </div>
            </div>

            {/* Journey Timeline */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Our Journey & Roadmap</h2>
              <JourneyTimeline />
            </div>

            {/* Meet the Team */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Meet the Team</h2>
              <p className="text-center text-muted-foreground mb-8">
                We're a passionate team of AI experts and developers dedicated to making artificial intelligence accessible and useful for everyone.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <TeamMember 
                  name="Maria Kovač" 
                  role="Founder & AI Director" 
                  bio="PhD in Computer Science with 10+ years experience in natural language processing and AI development."
                />
                <TeamMember 
                  name="Tomas Novak" 
                  role="Lead Developer" 
                  bio="Full-stack developer with expertise in building scalable AI applications and cloud infrastructure."
                />
                <TeamMember 
                  name="Ana Perić" 
                  role="UX/UI Designer" 
                  bio="Designer focused on creating intuitive and accessible interfaces for AI-powered applications."
                />
              </div>
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
      <Footer />
    </Layout>
  );
};

export default About;
