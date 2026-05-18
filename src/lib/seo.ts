// SEO helper functions for WordSolver

const SITE_URL = 'https://wordsolver.tech';
const SITE_NAME = 'WordSolver';

export function generateOrganizationSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: 'Your daily companion for color puzzle games. Get answers, use solvers, and play unlimited rounds of Colordle and Colorfle.',
    sameAs: []
  });
}

export function generateWebSiteSchema() {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/solver?q={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  });
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url
    }))
  });
}

export function generateArticleSchema(data: {
  title: string;
  description: string;
  url: string;
  datePublished: string;
  dateModified?: string;
  image?: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: data.title,
    description: data.description,
    url: data.url,
    datePublished: data.datePublished,
    dateModified: data.dateModified || data.datePublished,
    author: {
      '@type': 'Person',
      name: 'Alex Rivera',
      url: `${SITE_URL}/about`
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': data.url
    },
    image: data.image || `${SITE_URL}/og-image.png`
  });
}

export function generateWebApplicationSchema(data: {
  name: string;
  description: string;
  url: string;
  applicationCategory?: string;
}) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: data.name,
    description: data.description,
    url: data.url,
    applicationCategory: data.applicationCategory || 'GameApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD'
    }
  });
}

export function generateFAQSchema(items: { question: string; answer: string }[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  });
}

export function combineSchemas(...schemas: string[]): string {
  return JSON.stringify(schemas.map(s => JSON.parse(s)));
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
}
