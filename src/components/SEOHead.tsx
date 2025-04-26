
import React from 'react';
import CustomHelmet from './CustomHelmet';

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  canonicalUrl?: string;
  lang?: string;
  schema?: Record<string, any>;
}

export const SEOHead: React.FC<SEOProps> = ({
  title = 'AMAA.pro - Your AI Research Assistant',
  description = 'Transform your workflow with AI-powered research, code analysis, and content generation. Join thousands of professionals who trust AMAA.pro.',
  keywords = 'AI assistant, code analysis, content generation, research tool, file analysis',
  ogImage = 'https://raw.githubusercontent.com/Angelyze/amaa-pro-43/main/public/og-image1.png',
  canonicalUrl = 'https://amaa.pro',
  lang = 'en',
  schema
}) => {
  // Add schema and other meta tags using useEffect
  React.useEffect(() => {
    // Handle OG tags
    const ogTags = [
      { property: 'og:type', content: 'website' },
      { property: 'og:url', content: canonicalUrl },
      { property: 'og:title', content: title },
      { property: 'og:description', content: description },
      { property: 'og:image', content: ogImage },
      { property: 'twitter:card', content: 'summary_large_image' },
      { property: 'twitter:url', content: canonicalUrl },
      { property: 'twitter:title', content: title },
      { property: 'twitter:description', content: description },
      { property: 'twitter:image', content: ogImage },
    ];
    
    // Add keywords
    const keywordsTag = document.querySelector('meta[name="keywords"]');
    if (keywordsTag) {
      keywordsTag.setAttribute('content', keywords);
    } else {
      const meta = document.createElement('meta');
      meta.setAttribute('name', 'keywords');
      meta.setAttribute('content', keywords);
      document.head.appendChild(meta);
    }
    
    // Add canonical link
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (canonicalLink) {
      canonicalLink.setAttribute('href', canonicalUrl);
    } else {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      canonicalLink.setAttribute('href', canonicalUrl);
      document.head.appendChild(canonicalLink);
    }
    
    // Add all OG tags
    ogTags.forEach(tag => {
      let ogTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (ogTag) {
        ogTag.setAttribute('content', tag.content);
      } else {
        ogTag = document.createElement('meta');
        ogTag.setAttribute('property', tag.property);
        ogTag.setAttribute('content', tag.content);
        document.head.appendChild(ogTag);
      }
    });
    
    // Add schema if provided
    if (schema) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (scriptTag) {
        scriptTag.textContent = JSON.stringify(schema);
      } else {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        scriptTag.textContent = JSON.stringify(schema);
        document.head.appendChild(scriptTag);
      }
    }
    
  }, [title, description, keywords, ogImage, canonicalUrl, schema]);

  return (
    <CustomHelmet 
      title={title}
      description={description}
      lang={lang}
    />
  );
};

export default SEOHead;
