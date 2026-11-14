import type { Metadata } from 'next';
import HumanizerWorkspace from '@/components/HumanizerWorkspace';
import HomeContent, { FAQS } from '@/components/HomeContent';
import { SITE_URL } from '@/lib/posts';

// Update this date whenever you ship a significant change to the converter page
const LAST_UPDATED = '2026-11-12';
const CONVERTER_URL = `${SITE_URL}/converter`;

export const metadata: Metadata = {
  // People search for this tool by name ("quill humanizer", "natural quill ai humanizer"), and the
  // site root now belongs to Writing Studio, so the name has to be in this title.
  title: { absolute: 'Natural Quill AI Humanizer: Revise AI Drafts Into Natural Writing' },
  description:
    'Paste an AI-assisted essay, report, or article and compare a more natural rewrite in the tone you choose. Natural Quill checks citations and numbers and asks you to review the meaning. Try 400 words free.',
  alternates: { canonical: CONVERTER_URL },
  openGraph: {
    type: 'website',
    url: CONVERTER_URL,
    siteName: 'Natural Quill',
    title: 'Natural Quill AI Humanizer: Revise AI Drafts Into Natural Writing',
    description: 'Compare a more natural rewrite of an AI-assisted draft, see the writing skill behind each change, and check citations and numbers. 400 words free.',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'Natural Quill AI Humanizer',
    alternateName: 'Natural Quill',
    url: CONVERTER_URL,
    operatingSystem: 'Web Browser',
    applicationCategory: 'WritingApp',
    inLanguage: 'en',
    description:
      'The Natural Quill AI Humanizer suggests more natural wording for AI-assisted drafts in academic, formal, and casual tones, and names the writing skill behind each change. Users should verify citations, numbers, and meaning.',
    featureList: [
      'Paragraph-by-paragraph AI text rewriting',
      'Academic, formal, natural, conversational, and blog tones',
      'Light, medium, and strong edit strength',
      'Automated checks for common citation and number patterns',
      'PDF and DOCX upload',
      'Descriptive writing diagnostics',
      'Links from each change to a free lesson on the skill behind it',
    ],
    screenshot: `${SITE_URL}/social/converter-card`,
    dateModified: LAST_UPDATED,
    offers: [
      { '@type': 'Offer', name: 'Free Trial', price: '0', priceCurrency: 'USD', url: CONVERTER_URL, description: '400 words free, no signup required' },
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

export default function ConverterPage() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <HumanizerWorkspace />
      <HomeContent />
    </main>
  );
}
