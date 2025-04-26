
export const getAppSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "AMAA.pro",
    "description": "AI-powered research assistant for coding, content, and file analysis",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "offers": {
      "@type": "Offer",
      "price": "6.99",
      "priceCurrency": "USD"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "1024"
    }
  };
};

export const getOrganizationSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Angelyze",
    "url": "https://amaa.pro",
    "logo": "https://amaa.pro/Angelyze.png",
    "sameAs": [
      "https://convertlab.pro/",
      "https://angelyze.org/"
    ],
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Samobor",
      "addressRegion": "Zagreb County",
      "postalCode": "10430",
      "addressCountry": "Croatia"
    }
  };
};

export const getFaqSchema = () => {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is AMAA.pro?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AMAA.pro (Ask Me About Anything) is an AI-powered research assistant designed for professionals. It helps with coding, content creation, file analysis, and research tasks."
        }
      },
      {
        "@type": "Question",
        "name": "How much does AMAA.pro cost?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "AMAA.pro offers both a free plan with limited queries and a premium subscription for $6.99/month that gives you unlimited access to all features."
        }
      },
      {
        "@type": "Question",
        "name": "Can AMAA.pro analyze my code?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, AMAA.pro can analyze code across multiple programming languages, provide explanations, suggest improvements, and help with debugging."
        }
      }
    ]
  };
};
