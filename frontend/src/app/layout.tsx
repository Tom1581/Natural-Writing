import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Natural Quill | AI Humanizer and Natural Writing Editor',
    template: '%s | Natural Quill'
  },
  description: 'Natural Quill helps rewrite AI-generated text into more natural, human-sounding writing with detector-aware editing, style controls, and cleaner readability.',
  keywords: ['Natural Quill', 'AI humanizer', 'natural writing AI', 'AI writing detector reference', 'rewrite AI text', 'human sounding writing'],
  authors: [{ name: 'Natural Quill' }],
  metadataBase: new URL('http://localhost:3001'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://naturalquill.ai',
    siteName: 'Natural Quill',
    title: 'Natural Quill | AI Humanizer and Writing Refinement',
    description: 'Rewrite AI-generated text into smoother, more natural writing with humanization controls and detector reference awareness.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Natural Quill preview' }]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Natural Quill | AI Humanizer',
    description: 'Cleaner, more natural writing for AI-assisted drafts.',
    images: ['/og-image.png']
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&family=Inter:wght@100..900&display=swap" rel="stylesheet" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
             __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "Natural Quill",
                "operatingSystem": "Web",
                "applicationCategory": "BusinessApplication",
                "description": "AI writing humanizer and editor for making machine-generated drafts sound more natural.",
                "offers": {
                   "@type": "Offer",
                   "price": "0",
                   "priceCurrency": "USD"
                }
             })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
