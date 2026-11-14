import Link from 'next/link';
import { POSTS } from '@/lib/posts';
import { SITE_LINKS } from '@/components/SiteNav';

/** Writing Studio pages most useful to someone arriving from the humanizer side. Plain anchors: a different root layout. */
const STUDIO_LINKS = [
  { href: '/', label: 'Writing Studio home' },
  { href: '/learn/lessons', label: 'Writing lessons' },
  { href: '/learn/practice', label: 'Practice sets' },
  { href: '/learn/prompts', label: 'Writing prompts' },
  { href: '/learn/rubrics', label: 'Writing rubrics' },
  { href: '/learn/guides', label: 'Guides for parents and teachers' },
];

/** Site-wide footer: crawlable links to every important page, in both halves of the site. */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-title">Natural Quill</p>
          <p>
            Two ways to get natural writing: Writing Studio builds the skill with K–12 practice and feedback, and the AI Humanizer revises an
            AI-assisted draft while checking citations and numbers.
          </p>
          <p>
            Contact: <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a>
          </p>
        </div>
        <div>
          <p className="site-footer-title">AI Humanizer</p>
          <ul>
            {SITE_LINKS.filter((l) => l.href !== '/').map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="site-footer-title">Writing Studio (K–12)</p>
          <ul>
            {STUDIO_LINKS.map((l) => (
              <li key={l.href}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="site-footer-title">Guides</p>
          <ul>
            {POSTS.slice(0, 6).map((p) => (
              <li key={p.slug}>
                <Link href={`/blog/${p.slug}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="site-footer-title">About and policies</p>
          <ul>
            <li><Link href="/about">About Natural Quill</Link></li>
            <li><Link href="/support">Contact and Support</Link></li>
            <li><Link href="/privacy">Privacy Policy</Link></li>
            <li><Link href="/terms">Terms of Use</Link></li>
          </ul>
        </div>
      </div>
      <p className="site-footer-legal">© {new Date().getFullYear()} Natural Quill</p>
    </footer>
  );
}
