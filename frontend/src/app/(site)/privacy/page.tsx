import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';

const URL = 'https://naturalquill.one/privacy';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Natural Quill processes submitted writing, account and billing information, analytics, and advertising data.',
  alternates: { canonical: URL },
};

export default function PrivacyPage() {
  return (
    <main className="content-shell">
      <SiteNav />
      <article className="page-content article">
        <header className="page-hero">
          <h1>Privacy Policy</h1>
          <p className="article-lede">This page explains what information Natural Quill handles when you use the site and writing tools.</p>
          <p>Last updated: October 13, 2026</p>
        </header>

        <section>
          <h2>Information used to provide the service</h2>
          <ul>
            <li>
              <strong>Writing and results:</strong> when you submit text for a rewrite, the service processes the
              source text, your chosen settings, and the generated output. The service saves source and output text
              in the service database and may cache generated output. The saved-history interface is currently
              unavailable while we add account-scoped access.
            </li>
            <li>
              <strong>Accounts and purchases:</strong> if you create an account or buy a plan, we use your email,
              account details, purchase status, word balance, and Stripe customer or subscription identifiers to
              provide access and billing support. Account sign-in is handled through Supabase; checkout and the
              billing portal are handled through Stripe.
            </li>
            <li>
              <strong>Usage and technical information:</strong> the service tracks word usage and uses your IP
              address to apply free-use limits. It also records service usage and performance information needed to
              run and improve the tool.
            </li>
          </ul>
          <p>
            Depending on the model available for a rewrite, submitted text may be sent to an AI service provider,
            including Groq, Google Gemini, or OpenAI, so the provider can generate the requested result. Do not submit
            confidential information that you are not comfortable having processed by these services.
          </p>
        </section>

        <section>
          <h2>Analytics, advertising, and cookies</h2>
          <p>
            This site loads Google Analytics, Google Tag Manager, and Google AdSense code. Analytics helps us
            understand page visits and tool use. Google and other third-party advertising vendors may place and read
            cookies on your browser, or use web beacons, IP addresses, and other identifiers, to serve and measure ads.
            Google may use advertising cookies to show ads based on visits to this site and other sites.
          </p>
          <p>
            You can manage personalized Google ads in{' '}
            <a href="https://myadcenter.google.com/">Google My Ad Center</a>, review opt-out choices for some other
            advertising vendors at <a href="https://www.aboutads.info/choices/">YourAdChoices</a>, and adjust cookies
            in your browser.
            For more on Google&apos;s advertising data practices, see{' '}
            <a href="https://policies.google.com/technologies/ads">Google&apos;s advertising technologies page</a>.
            The site also uses browser storage for sign-in state and temporary writing-tool preferences.
          </p>
        </section>

        <section>
          <h2>Storage and requests</h2>
          <p>
            Submitted text, generated results, account details, and usage records may remain in the service&apos;s
            systems. We do not publish a fixed automatic deletion period. To ask what information is associated
            with your account, request a correction or deletion, or ask a privacy question, email{' '}
            <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a>. Include the account email if you have
            one, but do not send passwords or payment card details.
          </p>
          <p>
            This policy may change as the service changes. The date above shows the latest update to this page.
            See our <Link href="/support">support page</Link> for other ways to describe a product issue.
          </p>
        </section>
      </article>
    </main>
  );
}
