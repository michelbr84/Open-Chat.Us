// Structured Data for SEO
const structuredData = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "OpenChat",
  "description": "Modern, real-time, open community chat platform with private messaging, multi-theme UI, and crypto donation support.",
  "url": "https://open-chat.us",
  "applicationCategory": "CommunicationApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  },
  "author": {
    "@type": "Organization",
    "name": "OpenChat"
  }
};

// Create and inject structured data script
const script = document.createElement('script');
script.type = 'application/ld+json';
script.textContent = JSON.stringify(structuredData);
document.head.appendChild(script);