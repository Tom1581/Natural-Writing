import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

const URL = 'https://naturalquill.one/support';

export const metadata: Metadata = {
  title: 'Contact and Support',
  description: 'Contact Natural Quill about writing-tool problems, account access, billing, privacy, and content corrections.',
  alternates: { canonical: URL },
};

export default function SupportPage() {
  return (
    <main className="content-shell">
      <SiteNav />
      <article className="page-content article">
        <header className="page-hero">
          <h1>Contact and Support</h1>
          <p className="article-lede">
            Email <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a> for help with Natural Quill.
          </p>
        </header>

        <section>
          <h2>What we can help with</h2>
          <ul>
            <li>A rewrite that failed, changed a key detail, or produced an unclear result.</li>
            <li>Account access, a purchased word balance, or a monthly subscription.</li>
            <li>A billing question, privacy request, or correction to a writing guide.</li>
          </ul>
          <p>
            In your message, describe the problem and include the account email if relevant. For a technical error,
            the page you were using and the error message are helpful. Please do not email passwords, full payment
            card numbers, or confidential writing that you do not want included in a support email.
          </p>
        </section>

        <section>
          <h2>Useful pages</h2>
          <p>
            See <Link href="/pricing">Pricing</Link> for plan details, <Link href="/privacy">Privacy Policy</Link>
            {' '}for data practices, and <Link href="/terms">Terms of Use</Link> for purchase and usage terms.
          </p>
        </section>
      </article>
    </main>
  );
}
