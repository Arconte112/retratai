export default function JsonLd() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "RetratAI",
    "description": "Genera fotos profesionales de alta calidad en minutos usando inteligencia artificial. Ideal para LinkedIn, redes sociales y perfiles profesionales.",
    "applicationCategory": "Photography",
    "operatingSystem": "Web-based",
    "offers": {
      "@type": "Offer",
      "price": "9.99",
      "priceCurrency": "EUR"
    },
    "provider": {
      "@type": "Organization",
      "name": "RetratAI",
      "email": "info@retratai.com"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "150"
    },
    "featureList": [
      "Fotos profesionales con IA",
      "Optimización para LinkedIn",
      "Múltiples estilos",
      "Entrega rápida"
    ]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
} 