import Link from 'next/link';
import type { ReactNode } from 'react';

export type Product = 'converter' | 'studio';

/**
 * One mark per product, drawn on a 24px grid in currentColor: a pencil with a tick for practice
 * that gets feedback, and a draft page turning into a finished page for the converter. Each sits
 * on its own tinted tile so the two products differ by shape and by color.
 */
const ICONS: Record<Product, ReactNode> = {
  studio: (
    <>
      <path d="M3 20.5h7" />
      <path d="M16.5 3.5l3.5 3.5L9 18l-4.5 1 1-4.5z" />
      <path d="M14 6l3.5 3.5" />
      <path d="M15 17.5l2 2 4-4.5" />
    </>
  ),
  converter: (
    <>
      <rect x="3" y="3" width="8" height="10" rx="1.6" />
      <path d="M5.5 6.5h3M5.5 9.5h2" />
      <rect x="13" y="11" width="8" height="10" rx="1.6" />
      <path d="M15.5 14.5h3M15.5 17.5h3" />
      <path d="M14 3.5h1.5a2 2 0 0 1 2 2V8" />
      <path d="M15.7 6.4l1.8 1.8 1.8-1.8" />
    </>
  ),
};

const PRODUCTS: { id: Product; href: string; name: string; who: string }[] = [
  { id: 'studio', href: '/', name: 'Writing Studio', who: 'K–12 writing practice with feedback' },
  { id: 'converter', href: '/converter', name: 'Writing Converter', who: 'Optional tool for adults revising AI drafts' },
];

/**
 * The one control shared by both parts of the site: a thin bar above each section's own
 * header that names both products and marks where you are. Each section keeps its own look,
 * header and audience; this bar is the only place they meet.
 */
export default function ProductSwitcher({ current, variant, hide = [] }: { current: Product; variant: 'dark' | 'studio'; hide?: Product[] }) {
  const items = PRODUCTS.filter((p) => !hide.includes(p.id));
  return (
    <nav aria-label="Natural Quill products" className={`nq-switcher nq-switcher-${variant}`}>
      <div className="nq-switcher-inner">
        <span className="nq-switcher-brand">Natural Quill</span>
        <ul>
          {items.map((p) => (
            <li key={p.id}>
              <Link href={p.href} aria-current={p.id === current ? 'page' : undefined}>
                <span className="nq-switcher-icon" data-product={p.id} aria-hidden="true">
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={1.9} strokeLinecap="round" strokeLinejoin="round">
                    {ICONS[p.id]}
                  </svg>
                </span>
                <strong>{p.name}</strong>
                <span className="nq-switcher-who">{p.who}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
