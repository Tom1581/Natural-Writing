import type { Metadata } from 'next';
import './globals.css';

const SITE_URL = 'https://naturalquill.ai';
// Update this date whenever you ship a significant homepage change
const LAST_UPDATED = '2025-04-25';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Natural Quill',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/icon.svg',
    apple: '/icon.svg',
  },
  title: {
    default: 'Natural Quill — Rewrite AI Text Into Natural, Human Writing',
    template: '%s | Natural Quill',
  },
  description: 'Natural Quill rewrites AI-generated drafts into clear, natural-sounding writing. Adjust tone, rhythm, and voice so your text reads like a real person wrote it.',
  keywords: [
    // Core product terms
    'ai humanizer',
    'humanize ai text',
    'humanize ai writing',
    'ai writing humanizer',
    'rewrite ai text',
    'rewrite ai generated text',
    // Intent-based phrases
    'make ai writing sound human',
    'make ai text sound natural',
    'ai to human text',
    'ai text converter',
    'fix ai writing',
    'paraphrase ai text',
    // Feature keywords
    'ai text rewriter',
    'ai content rewriter',
    'human sounding writing',
    'natural writing',
    'improve ai writing',
    'ai writing editor',
    'tone rewriter',
    'sentence flow editor',
    'readability improver',
    'ai draft editor',
    'writing voice improvement',
    'rewrite for clarity',
    // Brand
    'Natural Quill',
  ],
  authors: [{ name: 'Natural Quill', url: SITE_URL }],
  creator: 'Natural Quill',
  publisher: 'Natural Quill',
  category: 'Writing Tool',
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
  alternates: { canonical: SITE_URL },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Natural Quill',
    title: 'Natural Quill — Rewrite AI Text Into Natural, Human Writing',
    description: 'Natural Quill rewrites AI-generated drafts into clear, natural-sounding writing. Adjust tone, rhythm, and voice so your text reads like a real person wrote it.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Natural Quill — AI writing humanizer and tone editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@naturalquill',
    creator: '@naturalquill',
    title: 'Natural Quill — Rewrite AI Text Into Natural, Human Writing',
    description: 'Natural Quill rewrites AI-generated drafts into clear, natural-sounding writing. Adjust tone, rhythm, and voice so your text reads like a real person wrote it.',
    images: ['/og-image.png'],
  },
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
    availableOnDevice: 'Desktop, Mobile',
    description: 'Natural Quill rewrites AI-generated drafts into clearer, more natural writing. Adjust tone, rhythm, and voice to turn AI text into writing that sounds genuinely human.',
    featureList: [
      'AI text rewriting',
      'Tone and voice control',
      'Sentence rhythm and flow improvement',
      'Readability diagnostics',
      'Style strength settings',
      'Section-type-aware editing',
      'PDF and DOCX upload',
      'Manuscript history',
    ],
    screenshot: `${SITE_URL}/og-image.png`,
    dateModified: LAST_UPDATED,
    offers: [
      { '@type': 'Offer', name: 'Free Trial', price: '0', priceCurrency: 'USD', url: SITE_URL, description: '400 words free — no signup required' },
      { '@type': 'Offer', name: 'Starter', price: '19.99', priceCurrency: 'USD', url: `${SITE_URL}/#pricing`, description: '10,000 prepaid word pack, one-time purchase' },
      { '@type': 'Offer', name: 'Pro', price: '29.99', priceCurrency: 'USD', url: `${SITE_URL}/#pricing`, description: '50,000 prepaid word pack, one-time purchase' },
      { '@type': 'Offer', name: 'Unlimited', price: '39.99', priceCurrency: 'USD', url: `${SITE_URL}/#pricing`, description: 'Unlimited words, billed monthly', priceSpecification: { '@type': 'UnitPriceSpecification', billingDuration: 'P1M', billingIncrement: 1 } },
    ],
    publisher: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Natural Quill',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.png`,
    description: 'Natural Quill is an AI writing tool that rewrites AI-generated text into natural, human-sounding writing with tone, rhythm, and voice controls.',
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'stockitupcs@gmail.com',
      contactType: 'customer support',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://twitter.com/naturalquill',
    ],
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'What does Natural Quill do?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Natural Quill takes AI-generated text and rewrites it to sound more natural, clear, and human. It adjusts tone, sentence rhythm, word choice, and flow so your writing reads like it came from a real person.',
        },
      },
      {
        '@type': 'Question',
        name: 'How is Natural Quill different from a paraphraser?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Natural Quill does not just swap synonyms. It restructures sentences, adjusts voice and formality, improves readability, and uses multi-pass LLM rewriting to produce writing that genuinely sounds human — not just shuffled around.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is Natural Quill free to use?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Natural Quill includes a free trial of up to 400 words with no account required. After that you can upgrade to a Starter or Pro word pack, or subscribe to the Unlimited monthly plan.',
        },
      },
      {
        '@type': 'Question',
        name: 'What tones and writing styles does Natural Quill support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Natural Quill supports formal, informal, academic, and conversational tones. You can also set the rewrite strength from light editing to a full structural rewrite, and choose section types like introduction, conclusion, narrative, or data disclosure.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Natural Quill work for academic or professional writing?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Natural Quill is a general writing improvement tool suitable for essays, blog posts, reports, emails, and research writing. It rewrites for clarity and natural tone. Users are responsible for ensuring their final work meets any institutional or professional requirements.',
        },
      },
      {
        '@type': 'Question',
        name: 'Can I upload documents to Natural Quill?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Natural Quill supports uploading PDF and DOCX files directly into the editor for rewriting.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I make AI writing sound more natural?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Paste your AI-generated text into Natural Quill, choose a tone and strength setting, then click Convert. The tool rewrites your draft using a multi-pass process that adjusts sentence variety, removes AI phrasing patterns, and improves overall flow and readability.',
        },
      },
      {
        '@type': 'Question',
        name: 'What file formats does Natural Quill support?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Natural Quill supports direct text input as well as PDF and DOCX file uploads. You can paste text or upload a document directly into the editor.',
        },
      },
    ],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
