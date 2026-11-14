import AdultOnly from '@/components/learning/AdultOnly';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { getGuide, GUIDES } from '@/lib/learning/guides';
import { SITE_URL } from '@/lib/learning/public';
import { ldJson, PUBLISHER } from '@/lib/learning/seo';

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

const anchor = (heading: string) => heading.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const guide = getGuide((await params).slug);
  if (!guide) return { title: 'Guide not found' };
  // Guides carry their own search title (60 characters or fewer), so the brand suffix is left off.
  const title = guide.seoTitle ?? guide.title;
  return {
    title: { absolute: title },
    description: guide.description,
    alternates: { canonical: `/learn/guides/${guide.slug}` },
    openGraph: {
      title,
      description: guide.description,
      url: `${SITE_URL}/learn/guides/${guide.slug}`,
      type: 'article',
      publishedTime: guide.published,
      modifiedTime: guide.updated,
    },
  };
}

export default async function GuidePage({ params }: Props) {
  const guide = getGuide((await params).slug);
  if (!guide) notFound();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: guide.title,
    description: guide.description,
    datePublished: guide.published,
    dateModified: guide.updated,
    author: PUBLISHER,
    publisher: PUBLISHER,
    audience: { '@type': 'Audience', audienceType: guide.audience },
    mainEntityOfPage: `${SITE_URL}/learn/guides/${guide.slug}`,
  };
  const updated = new Date(`${guide.updated}T12:00:00Z`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
  return (
    <article className="lw-article">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      <Breadcrumbs items={[{ name: 'Guides', href: '/learn/guides' }, { name: guide.title, href: `/learn/guides/${guide.slug}` }]} />
      <p className="lw-eyebrow">For {guide.audience.toLowerCase()}</p>
      <h1>{guide.title}</h1>
      <p className="lw-small lw-muted">
        By the Natural Quill Writing Studio team · Updated <time dateTime={guide.updated}>{updated}</time>
      </p>
      <p className="lw-lede">{guide.intro}</p>
      <nav className="lw-toc" aria-label="In this guide">
        <p className="lw-label" style={{ marginTop: 0 }}>In this guide</p>
        <ol className="lw-list lw-small">
          {guide.sections.map((s) => (
            <li key={s.heading}>
              <a href={`#${anchor(s.heading)}`}>{s.heading}</a>
            </li>
          ))}
        </ol>
      </nav>
      {guide.sections.map((s) => (
        <section key={s.heading} aria-labelledby={anchor(s.heading)}>
          <h2 id={anchor(s.heading)}>{s.heading}</h2>
          {s.paragraphs.filter(Boolean).map((p) => (
            <p key={p.slice(0, 40)}>{p}</p>
          ))}
          {s.table && (
            <div style={{ overflowX: 'auto' }}>
              <table className="lw-table lw-guide-table">
                <caption>{s.table.caption}</caption>
                <thead>
                  <tr>
                    {s.table.head.map((h) => (
                      <th key={h} scope="col">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {s.table.rows.map((row) => (
                    <tr key={row[0]}>
                      {row.map((cell, i) =>
                        i === 0 ? (
                          <th key={cell} scope="row">
                            {cell}
                          </th>
                        ) : (
                          <td key={`${i}-${cell.slice(0, 24)}`}>{cell}</td>
                        ),
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {s.list && (
            <ul className="lw-list">
              {s.list.map((li) => (
                <li key={li}>{li}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
      <section className="lw-section lw-card">
        <h2 style={{ fontSize: '1.15rem', marginTop: 0 }}>Keep going</h2>
        <ul className="lw-list">
          {guide.related.map((r) => (
            <li key={r.href}>
              <Link href={r.href}>{r.label}</Link>
            </li>
          ))}
        </ul>
      </section>
      {guide.fromBlog && (
        <AdultOnly>
          <section className="lw-section lw-card">
            <h2 style={{ fontSize: '1.15rem', marginTop: 0 }}>For adults: more from Natural Quill on AI and writing</h2>
            <ul className="lw-list">
              {guide.fromBlog.map((r) => (
                <li key={r.href}>
                  <a href={r.href}>{r.label}</a>
                </li>
              ))}
            </ul>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>
              These articles are on the AI Humanizer side of Natural Quill, which is written for adults and shows ads.
            </p>
          </section>
        </AdultOnly>
      )}
    </article>
  );
}
