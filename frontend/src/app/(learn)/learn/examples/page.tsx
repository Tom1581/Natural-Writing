import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { BandChip } from '@/components/learning/icons';
import { BAND_LABELS, BAND_ORDER, UK_YEARS_BY_BAND } from '@/lib/learning/levels';
import { getCatalog } from '@/lib/learning/public';
import { GENRE_NAMES, itemListLd, ldJson } from '@/lib/learning/seo';

export const metadata: Metadata = {
  title: 'Writing Examples by Grade: Annotated Model Pieces From Kindergarten to Grade 12',
  description:
    'Annotated opinion, argument, informative and narrative writing examples for every grade band from kindergarten to grade 12, each rated on our rubric with notes on what works.',
  alternates: { canonical: '/learn/examples' },
};

export default async function ExamplesIndex() {
  const catalog = await getCatalog();
  const examples = catalog?.examples ?? [];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: ldJson(itemListLd('Annotated writing examples', examples.map((e) => ({ name: e.title, href: `/learn/examples/${e.id}` })))) }}
      />
      <Breadcrumbs items={[{ name: 'Writing examples', href: '/learn/examples' }]} />
      <h1>Writing examples</h1>
      <p className="lw-lede" style={{ maxWidth: '46em' }}>
        What strong writing looks like at each age. Every model piece answers one of our prompts, is rated skill by skill on the matching rubric,
        and has numbered notes showing what works and one way to go further.
      </p>
      {BAND_ORDER.map((band) => (
        <section key={band} className="lw-section">
          <h2>
            {BAND_LABELS[band]} <span className="lw-muted lw-small">({UK_YEARS_BY_BAND[band]} in England)</span>
          </h2>
          <div className="lw-grid lw-grid-3" style={{ marginTop: 12 }}>
            {examples
              .filter((e) => e.band === band)
              .map((e) => (
                <Link key={e.id} href={`/learn/examples/${e.id}`} className="lw-card lw-link-card lw-banded" data-band={band}>
                  <div className="lw-card-meta">
                    <BandChip band={band} short />
                    <span className="lw-pill">{GENRE_NAMES[e.genre]}</span>
                  </div>
                  <h3>{e.title}</h3>
                  <p className="lw-small lw-muted" style={{ margin: 0 }}>Written as {e.writer}</p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
