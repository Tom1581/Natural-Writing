import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

const URL = 'https://naturalquill.one/about';

export const metadata: Metadata = {
  title: 'About Natural Quill',
  description: 'Learn what Natural Quill does, how its writing guides are published, and how to contact the team.',
  alternates: { canonical: URL },
};

export default function AboutPage() {
  return (
    <main className="content-shell">
      <SiteNav />
      <article className="page-content article">
        <header className="page-hero">
          <h1>About Natural Quill</h1>
          <p className="article-lede">
            Natural Quill is a writing tool for revising AI-assisted drafts. It helps you change repetitive phrasing,
            sentence rhythm, and tone while keeping the ideas and details you want to express.
          </p>
        </header>

        <section>
          <h2>What the tool does</h2>
          <p>
            Paste a draft or upload a document, choose a tone and edit strength, and review a revised version. The
            service processes text paragraph by paragraph and checks for details such as citations and numbers. You
            should still read the result closely, verify every source and claim, and make the final writing your own.
          </p>
          <p>
            The <Link href="/ai-phrase-checker">AI Phrase Checker</Link> is a separate, free browser-based tool for
            spotting stock phrases and repetitive sentence patterns. The <Link href="/blog">writing guides</Link> give
            practical revision advice and examples.
          </p>
        </section>

        <section>
          <h2>Who publishes the guides</h2>
          <p>
            Natural Quill publishes the guides on this site. They explain writing and editing from the perspective of
            a company that also offers a paid writing tool. Product comparisons are our own editorial view, not
            independent endorsements. We do not guarantee that a rewrite will receive a particular AI detector score.
          </p>
        </section>

        <section>
          <h2>Get in touch</h2>
          <p>
            For product feedback, a correction, or a support question, email{' '}
            <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a> or visit our{' '}
            <Link href="/support">support page</Link>. You can also read our <Link href="/privacy">Privacy Policy</Link>
            {' '}and <Link href="/terms">Terms of Use</Link>.
          </p>
        </section>
      </article>
    </main>
  );
}
