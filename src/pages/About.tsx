import React from 'react';
import { Link } from 'react-router-dom';
import { Layout } from '@/components/ui/layout';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useScrollToTop } from '@/hooks/useScrollToTop';
import { Star, MessageSquare, FileText, CircleCheck, Heart } from 'lucide-react';
import { PremiumComparison } from '@/components/about/PremiumComparison';
import { TeamMember } from '@/components/about/TeamMember';
import { Stats } from '@/components/about/Stats';
import { ProjectCard } from '@/components/about/ProjectCard';

const About = () => {
  const { isPremium } = useAuth();
  useScrollToTop();

  return (
    <Layout showBackButton backToHome title="About AMAA.pro">
      <div className="w-full bg-gradient-to-b from-background/50 to-background flex flex-col min-h-screen">
        {/* Main content container without bottom padding */}
        <div className="container mx-auto px-4 pt-16 pb-0 flex-1">
          <div className="max-w-[800px] mx-auto">
            {/* Hero Section */}
            <div className="flex flex-col items-center text-center space-y-6">
              <div className="animate-float">
                <Logo />
              </div>
              <h1 className="text-4xl font-bold tracking-tight">
                Your AI Research Assistant for Coding, Content, and File Analysis
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px]">
                Transform your workflow with AI-powered research, code analysis, and content generation. Join thousands of developers and content creators who trust AMAA.pro.
              </p>
              <div className="flex gap-4 flex-wrap justify-center">
                <Link to="/auth">
                  <Button size="lg" className="gap-2">
                    Start Free <Star className="w-4 h-4" />
                  </Button>
                </Link>
                {!isPremium && (
                  <Link to="/subscribe">
                    <Button size="lg" variant="outline" className="gap-2">
                      Upgrade to Premium <CircleCheck className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>

            {/* Empowering People Section */}
            <div className="mt-16 text-center">
              <h2 className="text-2xl font-bold mb-6">Empowering People with Advanced AI Tools</h2>
              <p className="text-muted-foreground leading-relaxed">
                AMAA.pro (Ask Me About Anything) is designed to make the power of artificial intelligence accessible to professionals, teams, and individuals across all industries. Our platform combines state-of-the-art AI capabilities, intuitive user experience, and robust security to help you streamline tasks, enhance productivity, and drive innovation—no matter your background or area of expertise. The mission is to make AI technology accessible, helpful, and user-friendly for everyone while providing a superior experience. Think of it as a Google 2.0!
              </p>
            </div>

            {/* Stats Section */}
            <div className="mt-16">
              <Stats />
            </div>

            {/* Use Cases Grid */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">What You Can Do with AMAA.pro</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <MessageSquare className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Smart Research & Analysis</h3>
                      <p className="text-muted-foreground">Get instant answers to complex questions with context-aware AI that understands your needs and provides detailed explanations.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <FileText className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Advanced Content Generation</h3>
                      <p className="text-muted-foreground">Create high-quality content, from technical documentation to creative writing, with AI that adapts to your style and requirements.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <Star className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">File Processing & Analysis</h3>
                      <p className="text-muted-foreground">Upload and analyze files, get insights, and generate summaries with our advanced AI processing capabilities.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 bg-foreground/5 p-5 rounded-lg border border-foreground/10">
                    <CircleCheck className="w-6 h-6 text-primary mt-1" />
                    <div>
                      <h3 className="text-lg font-semibold">Code Understanding</h3>
                      <p className="text-muted-foreground">Get code explanations, suggestions for improvements, and help with debugging across multiple programming languages.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Comparison Section */}
            <div className="mt-24" id="premium">
              <h2 className="text-2xl font-bold text-center mb-4">Choose Your Plan</h2>
              <p className="text-center text-muted-foreground mb-12">Unlock unlimited AI capabilities for just $6.99/month</p>
              <PremiumComparison />
            </div>

            {/* Meet the Team & Projects Section - no bottom margin */}
            <div className="mt-24">
              <h2 className="text-2xl font-bold text-center mb-12">Meet the Team & Projects</h2>
              <p className="text-foreground/80 leading-relaxed mb-12">
                Angelyze is a pioneering technology company based in Croatia, EU, dedicated to making artificial intelligence accessible and practical for everyone. We combine cutting-edge AI technology with user-friendly interfaces to create tools that solve real-world problems. Our mission is to empower individuals and businesses with AI solutions that are not only powerful but also ethical and easy to use.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <TeamMember 
                  name="Angelo Horvat"
                  role="CEO & Founder"
                  avatar="photo-1488590528505-98d2b5aba04b"
                  bio="Driving innovation in AI accessibility and practical applications. Leading the development of intelligent solutions that make advanced technology available to everyone."
                />
                <ProjectCard 
                  name="Convert Lab"
                  role="Conversion and Transcription"
                  image="photo-1486312338219-ce68d2c6f44d"
                  description="Your all-in-one free solution for file conversion, transcription, and unit measurement. Free, secure, and powered by advanced AI technology - no login required."
                  link="https://convertlab.pro"
                />
              </div>
              <br></br>
            </div>

            {/* Contact & Recognition Section */}
            <div className="mt-14 mb-0">
              <h2 className="text-2xl font-bold text-left mb-6">Contact & Recognition</h2>
              <p className="text-left mb-6 text-muted-foreground">
                Reach out for guidance, partnership, or support.
              </p>
              <div className="text-left text-muted-foreground space-y-2">
                <p>Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                <p className="mt-4">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
                <p className="mt-6">AMAA.pro is listed in the Free AI Tools Directory (Wikipedia)</p>
              </div>
            </div>
          </div>
        </div>
        {/* Footer with no top margin to eliminate gap */}
        <footer className="footer-container mt-0 border-t-0">
          <div className="container mx-auto px-4">
            <div className="flex flex-col items-center justify-center">
              <div className="footer-nav">
                <Link to="/" className="footer-link">Home</Link>
                <Link to="/about" className="footer-link">About</Link>
                <Link to="/terms" className="footer-link">Terms</Link>
                <Link to="/privacy" className="footer-link">Privacy</Link>
              </div>
              <div className="copyright">
                © Copyright 2025 <Link to="/" className="text-teal mx-1.5 hover:text-teal-light transition-colors">AMAA.pro</Link>. Powered by AMAA.pro <Heart size={12} className="text-teal ml-1.5 animate-pulse-gentle" />
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Layout>
  );
};

export default About;
