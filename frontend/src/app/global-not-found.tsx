import type { Metadata } from 'next';
import Link from 'next/link';
import localFont from 'next/font/local';
import './globals.css';

const inter = localFont({ src: '../fonts/inter-latin.woff2', weight: '100 900', variable: '--font-inter', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://naturalquill.one'),
  title: 'Page not found | Natural Quill',
  robots: { index: false, follow: true },
};

/** Needed because the app has two root layouts: (learn) for Writing Studio and the home page, (site) for the converter. */
export default function GlobalNotFound() {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', textAlign: 'center' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Page not found</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>That page doesn’t exist or has moved.</p>
            <p style={{ display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
              <Link href="/" style={{ color: 'var(--accent-blue-hover)' }}>Writing Studio</Link>
              <Link href="/converter" style={{ color: 'var(--accent-blue-hover)' }}>Writing Converter</Link>
            </p>
          </div>
        </main>
      </body>
    </html>
  );
}
