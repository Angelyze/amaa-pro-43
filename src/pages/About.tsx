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
        <div className="container mx-auto px-4 pt-16 pb-0 flex-1">
          <div className="max-w-[800px] mx-auto">
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

            <div className="mt-20 text-center">
              <h2 className="text-2xl font-bold mb-6">Empowering People with Advanced AI Tools</h2>
              <p className="text-muted-foreground text-left leading-relaxed">
                AMAA.pro (Ask Me About Anything) is designed to make the power of artificial intelligence accessible to professionals, teams, and individuals across all industries. Our platform combines state-of-the-art AI capabilities, intuitive user experience, and robust security to help you streamline tasks, enhance productivity, and drive innovation—no matter your background or area of expertise. The mission is to make AI technology accessible, helpful, and user-friendly for everyone while providing a superior experience. Think of it as a Google 2.0!
              </p>
            </div>

            <div className="mt-10">
              <Stats />
            </div>

            <div className="mt-20">
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

            <div className="mt-20" id="premium">
              <h2 className="text-2xl font-bold text-center mb-4">Choose Your Plan</h2>
              <p className="text-center text-muted-foreground mb-12">Unlock unlimited AI capabilities for just $6.99/month</p>
              <PremiumComparison />
            </div>

            <div className="mt-20">
              <h2 className="text-2xl font-bold text-center mb-12">Meet the Team & Projects</h2>
              <div className="flex items-center gap-6 mb-10">
                <img src="/Angelyze.png" alt="Angelyze Logo" className="w-30 h-30 object-contain" />
                <p className="text-foreground/80 text-left leading-relaxed">
                  Angelyze is a pioneering technology company based in Croatia, EU, dedicated to making artificial intelligence accessible and practical for everyone. We combine cutting-edge AI technology with user-friendly interfaces to create tools that solve real-world problems. Our mission is to empower individuals and businesses with AI solutions that are not only powerful but also ethical and easy to use.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProjectCard 
                  name="Angelo Horvat"
                  role="CEO & Founder"
                  image="/image.jpg"
                  description="Driving innovation in AI accessibility and practical applications. Leading the development of intelligent solutions that make advanced technology available to everyone."
                  link="https://angelyze.org"
                />
                <ProjectCard 
                  name="Convert Lab"
                  role="File Conversion and Transcription"
                  image="/Convert Lab Logo.png"
                  description="Your all-in-one free solution for file conversion, transcription, and unit measurement. Free, secure, and powered by advanced AI technology - no login required."
                  link="https://convertlab.pro"
                />
              </div>
            </div>

            <div className="mt-20 mb-0">
              <h2 className="text-2xl font-bold text-left mb-6">Contact & Recognition</h2>
              <div className="flex items-start gap-6">
                <div className="flex-1">
                  <p className="text-left mb-6 text-muted-foreground">
                    Reach out for guidance, partnership, or support.
                  </p>
                  <div className="text-left text-muted-foreground space-y-2">
                    <p>Email: <a href="mailto:info@amaa.pro" className="text-primary hover:underline">info@amaa.pro</a></p>
                    <p className="mt-4">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
                    <p>
                      <a href="https://freeaitools.wiki/AITools/post/amaa-pro-B6bfwWfPgB2J7Qp" className="text-primary hover:underline">AMAA.pro</a> is listed in the <a href="https://freeaitools.wiki/" className="text-primary hover:underline">Free AI Tools Directory (Wikipedia)</a>.
                    </p>
                  </div>
                </div>
                <img src="/AMAApp.png" alt="AMAA.pro Logo" className="w-35 h-35 object-contain" />
              </div>
            </div>
            <br></br>
          </div>
        </div>
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
