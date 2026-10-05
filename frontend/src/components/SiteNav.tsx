import Link from 'next/link';
import BrandMark from '@/components/BrandMark';

const LINKS = [
  { href: '/', label: 'AI Humanizer' },
  { href: '/research-paper-humanizer', label: 'For Research Papers' },
  { href: '/ai-phrase-checker', label: 'Free Phrase Checker' },
  { href: '/blog', label: 'Guides' },
  { href: '/pricing', label: 'Pricing' },
];

/** Top navigation for content pages (the homepage tool has its own header). */
export default function SiteNav() {
  return (
    <nav className="site-nav" aria-label="Main">
      <Link href="/" className="site-nav-brand">
        <BrandMark size={30} />
        <span>Natural Quill</span>
      </Link>
      <div className="site-nav-links">
        {LINKS.slice(1).map((l) => (
          <Link key={l.href} href={l.href}>
            {l.label}
          </Link>
        ))}
        <Link href="/" className="site-nav-cta">
          Try the humanizer
        </Link>
      </div>
    </nav>
  );
}

export { LINKS as SITE_LINKS };
