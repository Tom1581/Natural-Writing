import type { Metadata } from 'next';
import HumanizerWorkspace from '@/components/HumanizerWorkspace';
import HomeContent, { FAQS } from '@/components/HomeContent';
import { SITE_URL } from '@/lib/posts';

// Update this date whenever you ship a significant homepage change
const LAST_UPDATED = '2026-10-05';

export const metadata: Metadata = {
  title: { absolute: 'Free AI Humanizer for Essays and Papers | Natural Quill' },
  description:
    'Turn ChatGPT and other AI text into natural, human writing. Natural Quill rewrites paragraph by paragraph and keeps your citations, numbers, and headings intact. 400 words free, no signup.',
  alternates: { canonical: SITE_URL },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Natural Quill',
    url: SITE_URL,
    operatingSystem: 'Web Browser',
    applicationCategory: 'WritingApp',
    inLanguage: 'en',
    description:
      'Natural Quill rewrites AI-generated drafts into natural, human writing in academic, formal, or casual tones while preserving citations, numbers, and headings.',
    featureList: [
      'Paragraph-by-paragraph AI text rewriting',
      'Academic, formal, natural, conversational, and blog tones',
      'Light, medium, and strong edit strength',
      'Citation, number, heading, and reference list preservation',
      'PDF and DOCX upload',
      'Before-and-after AI-style diagnostics',
    ],
    screenshot: `${SITE_URL}/opengraph-image`,
    dateModified: LAST_UPDATED,
    offers: [
      { '@type': 'Offer', name: 'Free Trial', price: '0', priceCurrency: 'USD', url: SITE_URL, description: '400 words free, no signup required' },
      { '@type': 'Offer', name: 'Starter', price: '19.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing`, description: '10,000-word pack, one-time purchase' },
      { '@type': 'Offer', name: 'Pro', price: '29.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing`, description: '50,000-word pack, one-time purchase' },
      { '@type': 'Offer', name: 'Unlimited', price: '39.99', priceCurrency: 'USD', url: `${SITE_URL}/pricing`, description: 'Unlimited words, billed monthly' },
    ],
    publisher: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({
      '@type': 'Question',
      name: q,
      acceptedAnswer: { '@type': 'Answer', text: a },
    })),
  },
];

export default function HomePage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <HumanizerWorkspace />
      <HomeContent />
    </main>
  );
}
