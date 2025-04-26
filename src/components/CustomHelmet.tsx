
import React from 'react';

interface CustomHelmetProps {
  children?: React.ReactNode;
  title?: string;
  description?: string;
  lang?: string;
}

const CustomHelmet: React.FC<CustomHelmetProps> = ({ 
  children, 
  title, 
  description,
  lang 
}) => {
  React.useEffect(() => {
    // Update document title if provided
    if (title) {
      document.title = title;
    }
    
    // Update meta description if provided
    if (description) {
      let metaDescription = document.querySelector('meta[name="description"]');
      if (metaDescription) {
        metaDescription.setAttribute('content', description);
      } else {
        metaDescription = document.createElement('meta');
        metaDescription.setAttribute('name', 'description');
        metaDescription.setAttribute('content', description);
        document.head.appendChild(metaDescription);
      }
    }

    // Update html lang attribute if provided
    if (lang) {
      document.documentElement.setAttribute('lang', lang);
    }
  }, [title, description, lang]);

  // Children are ignored in this simple implementation
  // In a real implementation, we'd process them to update the document head
  
  return null; // Helmet doesn't render anything to the DOM
};

export default CustomHelmet;
