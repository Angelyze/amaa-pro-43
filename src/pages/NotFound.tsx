
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEOHead from "@/components/SEOHead";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <>
      <SEOHead 
        title="Page Not Found - AMAA.pro"
        description="The page you're looking for doesn't exist or has been moved."
        canonicalUrl={`https://amaa.pro${location.pathname}`}
      />
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center max-w-md glass p-8 rounded-3xl animate-fade-in">
          <h1 className="text-7xl font-bold text-gradient mb-6">404</h1>
          <p className="text-xl mb-8">This page doesn't exist or has been moved.</p>
          <Link to="/">
            <Button className="flex items-center gap-2 amaa-button">
              <ArrowLeft size={18} />
              Return Home
            </Button>
          </Link>
        </div>
      </div>
    </>
  );
};

export default NotFound;
