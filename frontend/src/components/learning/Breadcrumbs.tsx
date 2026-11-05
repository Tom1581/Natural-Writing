import Link from 'next/link';
import { breadcrumbLd, ldJson } from '@/lib/learning/seo';

/** Visible breadcrumb trail plus matching BreadcrumbList structured data. The last item is the current page. */
export default function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  const trail = [{ name: 'Writing Studio', href: '/' }, ...items];
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(breadcrumbLd(trail)) }} />
      <nav aria-label="Breadcrumb" className="lw-crumbs">
        <ol>
          {trail.map((it, i) => (
            <li key={it.href}>
              {i < trail.length - 1 ? <Link href={it.href}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
