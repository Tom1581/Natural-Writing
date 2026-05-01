import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';

const SITE_URL = 'https://naturalquill.one';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-4K5EKP75ZX';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WBDCV3WN';
// Update this date whenever you ship a significant homepage change
const LAST_UPDATED = '2025-04-25';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: 'Natural Quill',
  icons: {
    icon: [
      { url: '/icon', type: 'image/png', sizes: '64x64' },
    ],
    shortcut: '/icon',
    apple: '/icon',
  },
  title: {
    default: 'Natural Quill — Humanize AI Text Into Natural Writing',
    template: '%s | Natural Quill',
  },
  description: 'Natural Quill helps writers revise AI-generated drafts into clearer, more natural, human-sounding writing. Improve sentence rhythm, word choice, flow, and readability while reducing common AI-style patterns. Free to try — no signup needed.',
  keywords: [
    // Humanizer core terms
    'ai humanizer',
    'humanize ai text',
    'humanize ai writing',
    'ai writing humanizer',
    'chatgpt humanizer',
    'humanize chatgpt text',
    'free ai humanizer',
    'ai text humanizer',
    // Rewrite terms
    'rewrite ai text',
    'rewrite ai generated text',
    'ai text rewriter',
    'ai content rewriter',
    'paraphrase ai text',
    // Intent-based phrases
    'make ai writing sound human',
    'make ai text sound natural',
    'ai to human text',
    'ai text converter',
    'fix ai writing',
    // Tool-specific
    'humanize chatgpt',
    'humanize claude ai',
    'humanize gemini text',
    'remove ai writing patterns',
    'reduce ai writing patterns',
    'ai detection writing signals',
    'gptzero writing patterns',
    'turnitin ai writing patterns',
    'scribbr ai writing patterns',
    // Feature keywords
    'human sounding writing',
    'natural writing',
    'improve ai writing',
    'ai writing editor',
    'readability improver',
    'writing voice improvement',
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
  verification: {
    google: 'PASTE_YOUR_GSC_VERIFICATION_CODE_HERE',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Natural Quill',
    title: 'Natural Quill — Humanize AI Text Into Natural Writing',
    description: 'Revise AI-generated drafts into natural, polished writing with better rhythm, word choice, flow, and readability. Free to try.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Natural Quill — AI writing humanizer and natural writing editor' }],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@naturalquill',
    creator: '@naturalquill',
    title: 'Natural Quill — Humanize AI Text Into Natural Writing',
    description: 'Revise AI-generated drafts into natural, polished writing with better rhythm, word choice, flow, and readability. Free to try.',
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
      {
        '@type': 'Question',
        name: 'Can Natural Quill reduce AI-style writing patterns?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Natural Quill helps reduce common AI-style patterns that tools like GPTZero, Scribbr, and Turnitin often evaluate, including low sentence variety, repetitive transitions, predictable phrasing, and flat rhythm. The goal is clearer, more natural writing for real readers.',
        },
      },
      {
        '@type': 'Question',
        name: 'Does Natural Quill work with ChatGPT, Claude, and Gemini output?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Yes. Natural Quill works with text generated by any AI model including ChatGPT, Claude, Gemini, Copilot, and others. Simply paste the AI-generated text into the editor and click Convert to humanize it.',
        },
      },
      {
        '@type': 'Question',
        name: 'How do I make AI text sound more human?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Paste your AI-generated text into Natural Quill, choose a tone and strength setting, then click Convert. The tool rewrites the text to improve sentence variety, reduce repetitive patterns, add natural phrasing, and make the draft read more like a person wrote it.',
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
        {GTM_ID && (
          <Script
            id="google-tag-manager"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${GTM_ID}');
              `,
            }}
          />
        )}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_MEASUREMENT_ID}');
                `,
              }}
            />
          </>
        )}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body>
        {GTM_ID && (
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        )}
        {children}
      </body>
    </html>
  );
}
