import type { Metadata } from 'next';
import localFont from 'next/font/local';
import Link from 'next/link';
import LearnHeader from '@/components/learning/LearnHeader';
import LearnProductSwitcher from '@/components/learning/LearnProductSwitcher';
import './learn.css';

const inter = localFont({ src: '../../fonts/inter-latin.woff2', weight: '100 900', variable: '--font-inter', display: 'swap' });
const outfit = localFont({ src: '../../fonts/outfit-latin.woff2', weight: '100 900', variable: '--font-outfit', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL('https://naturalquill.one'),
  applicationName: 'Natural Quill Writing Studio',
  title: {
    default: 'Writing Studio — K–12 Writing Practice with Feedback | Natural Quill',
    template: '%s | Natural Quill Writing Studio',
  },
  description: 'Short writing lessons, grade-level prompts, and specific feedback that helps students from kindergarten to grade 12 revise their own writing and build real skills.',
  // The home page lives in this layout, so Search Console's meta-tag verification must be here too.
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ? { verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION } } : {}),
};

/**
 * Root layout for Writing Studio, including the site's home page. It is a separate root from
 * the converter site on purpose: navigating between them is a full page load, so the site's ad and
 * analytics scripts are never present here. Do not add third-party scripts to this file.
 */
export default function LearnLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${outfit.variable}`}>
      <body>
        <a className="lw-skip" href="#main">Skip to content</a>
        <LearnProductSwitcher />
        <LearnHeader />
        <main id="main" className="lw-main">{children}</main>
        <footer className="lw-footer">
          <div className="lw-footer-inner">
            <span>© {new Date().getFullYear()} Natural Quill Writing Studio. No ads on learning pages.</span>
            <nav aria-label="Footer">
              <Link href="/learn/how-it-works">How it works</Link>
              <Link href="/learn/for-parents">For parents</Link>
              <Link href="/learn/for-teachers">For teachers</Link>
              <Link href="/learn/grades">Grades</Link>
              <Link href="/learn/prompts">Prompts</Link>
              <Link href="/learn/rubrics">Rubrics</Link>
              <Link href="/learn/examples">Examples</Link>
              <Link href="/learn/curriculum">Curriculum</Link>
              <Link href="/learn/guides">Guides</Link>
              <Link href="/learn/accessibility">Accessibility</Link>
              <Link href="/learn/privacy">Privacy for families</Link>
              <a href="/support">Support</a>
            </nav>
          </div>
        </footer>
      </body>
    </html>
  );
}
