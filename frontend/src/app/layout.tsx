import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';
import Script from 'next/script';
import { Suspense } from 'react';
import GoogleTagEvents from '@/components/GoogleTagEvents';
import SiteFooter from '@/components/SiteFooter';
import './globals.css';

// Self-hosted by next/font: no render-blocking request to Google Fonts.
const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const outfit = Outfit({ subsets: ['latin'], variable: '--font-outfit', display: 'swap' });

const SITE_URL = 'https://naturalquill.one';
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || 'G-4K5EKP75ZX';
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID || 'GTM-WBDCV3WN';
const GOOGLE_SITE_VERIFICATION = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '';
const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9080556102094416';

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
    'ai humanizer',
    'humanize ai text',
    'chatgpt humanizer',
    'humanize chatgpt text',
    'free ai humanizer',
    'ai to human text converter',
    'make ai writing sound human',
    'rewrite ai generated text',
    'humanize ai essay',
    'humanize research paper',
    'academic ai humanizer',
    'natural writing',
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
  ...(GOOGLE_SITE_VERIFICATION ? { verification: { google: GOOGLE_SITE_VERIFICATION } } : {}),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: SITE_URL,
    siteName: 'Natural Quill',
    title: 'Natural Quill — Humanize AI Text Into Natural Writing',
    description: 'Revise AI-generated drafts into natural, polished writing with better rhythm, word choice, flow, and readability. Free to try.',
  },
  twitter: {
    card: 'summary_large_image',
    site: '@naturalquill',
    creator: '@naturalquill',
    title: 'Natural Quill — Humanize AI Text Into Natural Writing',
    description: 'Revise AI-generated drafts into natural, polished writing with better rhythm, word choice, flow, and readability. Free to try.',
  },
};

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Natural Quill',
    alternateName: ['NaturalQuill', 'Natural Writing'],
    url: SITE_URL,
    inLanguage: 'en',
    description: 'Natural Quill helps writers revise AI-generated drafts into clearer, more natural, human-sounding writing.',
    publisher: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Natural Quill',
    url: SITE_URL,
    logo: `${SITE_URL}/apple-icon`,
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
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
  <head>
        {ADSENSE_CLIENT_ID && <meta name="google-adsense-account" content={ADSENSE_CLIENT_ID} />}
        {ADSENSE_CLIENT_ID && (
          <script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
          />
        )}
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
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
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
        <Suspense fallback={null}>
          <GoogleTagEvents gtmId={GTM_ID} gaMeasurementId={GA_MEASUREMENT_ID} />
        </Suspense>
        {children}
        <SiteFooter />
      </body>
    </html>
  );
}
