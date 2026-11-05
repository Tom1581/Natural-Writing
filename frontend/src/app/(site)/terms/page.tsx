import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

const URL = 'https://naturalquill.one/terms';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'The main terms for using Natural Quill, including writing-tool limitations, paid plans, cancellation, and support.',
  alternates: { canonical: URL },
};

export default function TermsPage() {
  return (
    <main className="content-shell">
      <SiteNav />
      <article className="page-content article">
        <header className="page-hero">
          <h1>Terms of Use</h1>
          <p className="article-lede">
            These are the main terms for using Natural Quill. A fuller billing agreement is displayed for review
            before you confirm a purchase.
          </p>
          <p>Last updated: October 13, 2026</p>
        </header>

        <section>
          <h2>The writing service</h2>
          <p>
            Natural Quill uses automated language models and editing rules to revise submitted writing. Results vary,
            and the service cannot guarantee that a result will pass any AI detector or meet a school, publisher, or
            employer&apos;s requirements. You are responsible for reviewing the output, checking facts and citations,
            and following any rules that apply to your work.
          </p>
          <p>
            The text you submit remains yours. Natural Quill does not claim ownership of your input or the output
            generated for you. We retain rights to the site, software, design, and brand.
          </p>
        </section>

        <section>
          <h2>Plans and billing</h2>
          <p>
            The free trial currently allows 400 words without an account. Starter and Pro are one-time purchases of
            word balances; Unlimited is a recurring monthly subscription. Current prices and included words appear
            on the <Link href="/pricing">Pricing page</Link> and at checkout. The service counts the input words you
            submit for a rewrite.
          </p>
          <p>
            The checkout agreement says that one-time word balances do not expire. It also says you may cancel a
            monthly subscription through the billing portal and keep access through the end of the current billing
            period. Purchasers must be at least 18 or the age of legal majority where they live.
          </p>
          <p>
            The checkout agreement states that purchases are final and that Natural Quill does not offer discretionary
            refunds. Rights that cannot be waived under applicable law remain unaffected. For a billing error or
            product problem, please <Link href="/support">contact support</Link>.
          </p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>
            Use the service lawfully and respect other people&apos;s rights. Do not use it for fraud, deception,
            academic misconduct, intellectual-property infringement, or attempts to bypass access controls. Do not
            scrape or resell the service without permission.
          </p>
        </section>

        <section>
          <h2>Privacy and questions</h2>
          <p>
            Read the <Link href="/privacy">Privacy Policy</Link> for information about submitted text, accounts,
            analytics, and advertising. For questions about these terms or a purchase, email{' '}
            <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a>.
          </p>
        </section>
      </article>
    </main>
  );
}
