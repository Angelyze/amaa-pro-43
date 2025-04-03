
import { Toaster } from "@/components/ui/toaster";
import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import Subscribe from "./pages/Subscribe";
import About from "./pages/About";
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import Profile from "./pages/Profile";
import PrivateRoute from "./components/PrivateRoute";

const App = () => {
  // Add a global UI cleanup utility
  useEffect(() => {
    // Function to close any stuck UI elements
    const cleanupUIElements = () => {
      // Close tooltips
      document.querySelectorAll('[data-state="open"][role="tooltip"]').forEach(tooltip => {
        tooltip.setAttribute('data-state', 'closed');
      });
      
      // Close dialogs
      document.querySelectorAll('[data-state="open"][role="dialog"]').forEach(dialog => {
        dialog.setAttribute('data-state', 'closed');
      });
      
      // Close menus
      document.querySelectorAll('[data-state="open"][role="menu"]').forEach(menu => {
        menu.setAttribute('data-state', 'closed');
      });
    };

    // Run on component mount and route changes
    cleanupUIElements();
    
    // Add a click listener to the document body to close open UI elements when clicking elsewhere
    const handleBodyClick = (e: MouseEvent) => {
      // Don't interfere with clicks on interactive elements
      const target = e.target as HTMLElement;
      const isInteractive = 
        target.closest('button') || 
        target.closest('a') || 
        target.closest('[role="button"]') ||
        target.closest('input') ||
        target.closest('[data-radix-focus-guard]');
      
      if (!isInteractive) {
        cleanupUIElements();
      }
    };
    
    document.body.addEventListener('click', handleBodyClick);
    
    return () => {
      document.body.removeEventListener('click', handleBodyClick);
    };
  }, []);

  return (
    <div className="app-container relative">
      <Toaster />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/subscribe" element={<Subscribe />} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/about" element={<About />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
};

export default App;
