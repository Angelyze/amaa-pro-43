
import React from 'react';
import { Link } from 'react-router-dom';
import Logo from '@/components/Logo';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const About = () => {
  return (
    <div className="flex min-h-screen flex-col items-center justify-start px-4 py-16">
      <div className="absolute inset-0 -z-10 background-pattern"></div>
      
      <div className="w-full max-w-3xl">
        <div className="flex flex-col items-center mb-8">
          <Link to="/" className="self-start mb-6">
            <Button variant="ghost" className="flex items-center gap-2">
              <ArrowLeft size={16} />
              <span>Back to App</span>
            </Button>
          </Link>
          <div className="w-full flex justify-center">
            <Logo />
          </div>
        </div>
        
        <div className="bg-white/70 dark:bg-black/50 backdrop-blur-lg rounded-2xl p-8 shadow-glass">
          <h1 className="text-3xl font-bold mb-6 text-center">About AMAA</h1>
          
          <div className="space-y-6">
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">Our Mission</h2>
              <p className="text-foreground/80 leading-relaxed">
                AMAA (Ask Me Almost Anything) is designed to provide users with an advanced AI assistant that can help answer questions, generate content, and assist with various tasks. Our mission is to make AI technology accessible, helpful, and user-friendly for everyone.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">What We Offer</h2>
              <p className="text-foreground/80 leading-relaxed mb-4">
                AMAA combines cutting-edge AI models with a simple, intuitive interface to provide:
              </p>
              <ul className="list-disc pl-5 space-y-2 text-foreground/80">
                <li>Instant answers to a wide range of questions</li>
                <li>Content generation and creative writing assistance</li>
                <li>Research help and information summarization</li>
                <li>Personalized conversation experiences</li>
                <li>File analysis and data extraction capabilities</li>
              </ul>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">Our Company</h2>
              <p className="text-foreground/80 leading-relaxed">
                Angelyze is the company behind AMAA. Founded with the vision of making AI accessible to everyone, we're committed to developing tools that enhance productivity and creativity. Our team combines expertise in artificial intelligence, user experience design, and software development.
              </p>
            </section>
            
            <section>
              <h2 className="text-xl font-semibold mb-3 text-teal">Contact Us</h2>
              <p className="text-foreground/80 leading-relaxed">
                Have questions or feedback? We'd love to hear from you!
              </p>
              <div className="mt-2">
                <p className="text-foreground/80">Email: <a href="mailto:angelyzeshop@gmail.com" className="text-teal hover:underline">angelyzeshop@gmail.com</a></p>
                <p className="text-foreground/80">Address: Angelyze, 10430 Samobor, Zagreb County, Croatia - EU</p>
              </div>
            </section>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex justify-center gap-6">
              <Link to="/terms" className="text-teal hover:underline">Terms of Service</Link>
              <Link to="/privacy" className="text-teal hover:underline">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
