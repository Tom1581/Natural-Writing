import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { GUIDES } from '@/lib/learning/guides';
import { itemListLd, ldJson } from '@/lib/learning/seo';

export const metadata: Metadata = {
  title: 'Writing Guides for Parents and Teachers',
  description:
    'Practical guides on teaching and supporting writing from kindergarten to grade 12: rubrics, counterclaims, early writing, AI feedback, and how school years line up across countries.',
  alternates: { canonical: '/learn/guides' },
};

export default function GuidesIndex() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(itemListLd('Writing guides', GUIDES.map((g) => ({ name: g.title, href: `/learn/guides/${g.slug}` })))) }}
      />
      <Breadcrumbs items={[{ name: 'Guides', href: '/learn/guides' }]} />
      <h1>Guides for parents and teachers</h1>
      <p className="lw-lede" style={{ maxWidth: '44em' }}>
        Short, practical guides to supporting writing at home and in class. Each one links to lessons and rubrics you can use straight away.
      </p>
      <div className="lw-grid lw-cols-3" style={{ marginTop: 20 }}>
        {GUIDES.map((g) => (
          <Link key={g.slug} href={`/learn/guides/${g.slug}`} className="lw-card lw-link-card">
            <span className="lw-pill">{g.audience}</span>
            <h2 style={{ fontSize: '1.2rem', marginTop: 10 }}>{g.title}</h2>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>{g.description}</p>
          </Link>
        ))}
      </div>
    </>
  );
}
