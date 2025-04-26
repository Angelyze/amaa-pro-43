
import React from 'react';
import { Helmet } from 'react-helmet';

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
  // Convert schema object to JSON string
  const schemaJSON = schema ? JSON.stringify(schema) : '';

  return (
    <Helmet>
      {/* Basic metadata */}
      <html lang={lang} />
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={canonicalUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImage} />
      
      {/* Schema.org structured data */}
      {schema && (
        <script type="application/ld+json">{schemaJSON}</script>
      )}
    </Helmet>
  );
};

export default SEOHead;
