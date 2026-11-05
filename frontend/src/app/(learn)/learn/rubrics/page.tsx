import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { BAND_LABELS, BAND_ORDER, UK_YEARS_BY_BAND } from '@/lib/learning/levels';
import { getCatalog } from '@/lib/learning/public';
import { GENRE_NAMES, itemListLd, ldJson } from '@/lib/learning/seo';

export const metadata: Metadata = {
  title: 'Free Writing Rubrics for Kindergarten to Grade 12',
  description:
    'Printable four-level writing rubrics for opinion and argument, informative and narrative writing, from kindergarten to grade 12, each with scored examples and links to lessons and prompts.',
  alternates: { canonical: '/learn/rubrics' },
};

export default async function RubricsIndex() {
  const catalog = await getCatalog();
  const rubrics = catalog?.rubrics ?? [];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(itemListLd('Writing rubrics', rubrics.map((r) => ({ name: r.title, href: `/learn/rubrics/${r.id}` })))) }}
      />
      <Breadcrumbs items={[{ name: 'Rubrics', href: '/learn/rubrics' }]} />
      <h1>Writing rubrics</h1>
      <p className="lw-lede" style={{ maxWidth: '46em' }}>
        The rubrics our feedback uses, published in full. Each one rates every skill from 1 to 4, where 3 means the writing meets the goal. Every
        rubric includes scored examples.
      </p>
      {BAND_ORDER.map((band) => (
        <section key={band} className="lw-section">
          <h2>
            {BAND_LABELS[band]} <span className="lw-muted lw-small">({UK_YEARS_BY_BAND[band]} in England)</span>
          </h2>
          <div className="lw-grid lw-grid-3" style={{ marginTop: 12 }}>
            {rubrics
              .filter((r) => r.band === band)
              .map((r) => (
                <Link key={r.id} href={`/learn/rubrics/${r.id}`} className="lw-card lw-link-card">
                  <span className="lw-pill">{GENRE_NAMES[r.genre]}</span>
                  <h3 style={{ marginTop: 10 }}>{r.title}</h3>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
