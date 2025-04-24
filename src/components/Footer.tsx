
import { Link } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer-container mt-24">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-[800px] mx-auto">
          <div className="flex flex-wrap justify-between gap-8">
            <div className="w-full md:w-auto">
              <h3 className="font-semibold mb-4">AMAA.pro</h3>
              <p className="text-sm text-muted-foreground max-w-[300px]">
                Your intelligent AI assistant for conversation, content creation, and productivity.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="text-muted-foreground hover:text-primary">About Us</Link></li>
                <li><a href="mailto:info@amaa.pro" className="text-muted-foreground hover:text-primary">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
                <li><Link to="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-6" />
          
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-xs text-muted-foreground">
              © {currentYear} Angelyze. All rights reserved.
            </p>
            <div className="flex gap-4">
              <a href="https://angelyze.org/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary">
                Angelyze
              </a>
              <a href="https://convertlab.pro/" target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-primary">
                Convert Lab
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
