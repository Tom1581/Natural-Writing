import Link from 'next/link';
import { POSTS } from '@/lib/posts';
import { SITE_LINKS } from '@/components/SiteNav';

/** Site-wide footer: crawlable links to every important page. */
export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="site-footer-inner">
        <div>
          <p className="site-footer-title">Natural Quill</p>
          <p>Turns AI drafts into natural, human writing while keeping citations, numbers, and headings intact.</p>
          <p>
            Contact: <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a>
          </p>
        </div>
        <div>
          <p className="site-footer-title">Product</p>
          <ul>
            {SITE_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
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
      </div>
      <p className="site-footer-legal">© {new Date().getFullYear()} Natural Quill</p>
    </footer>
  );
}
