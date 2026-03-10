export default function JsonLd() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "At Takasa",
    "alternateName": "attakasa.com",
    "url": "https://atakasa.com",
    "description": "Türkiye'nin en yenilikçi takas ve ikinci el alım satım platformu.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": { "@type": "EntryPoint", "urlTemplate": "https://atakasa.com/?q={search_term_string}" },
      "query-input": "required name=search_term_string"
    },
    "publisher": {
      "@type": "Organization",
      "name": "At Takasa",
      "url": "https://atakasa.com",
      "logo": { "@type": "ImageObject", "url": "https://atakasa.com/logo.png" }
    }
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "At Takasa",
    "url": "https://atakasa.com",
    "description": "İkinci el eşya takas ve alım satım platformu",
    "foundingDate": "2024",
    "areaServed": "TR",
    "serviceType": ["Takas Platformu", "İkinci El Alım Satım", "Online Pazar Yeri"]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />
    </>
  );
}
