import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { getCatalog } from '@/lib/learning/public';
import { BAND_LABELS, BAND_ORDER } from '@/lib/learning/levels';

export const metadata: Metadata = {
  title: 'Sentence and Grammar Practice, Kindergarten to Grade 12',
  description:
    'Free five-minute practice sets: fix run-on sentences and fragments, combine sentences, choose transitions, use exact words, punctuate dialogue, integrate quotations and qualify claims. Kindergarten to Grade 12.',
  alternates: { canonical: '/learn/practice' },
};

export default async function PracticeIndex() {
  const catalog = await getCatalog();
  if (!catalog) return <p className="lw-notice">Practice sets are loading slowly right now. Please refresh in a minute.</p>;
  const skillName = (id: string) => catalog.skills.find((s) => s.id === id)?.name ?? id;
  return (
    <>
      <Breadcrumbs items={[{ name: 'Practice', href: '/learn/practice' }]} />
      <p className="lw-eyebrow">Quick practice</p>
      <h1>Sentence and grammar practice</h1>
      <p className="lw-muted" style={{ maxWidth: '44em' }}>
        Short sets of 4–5 questions on the sentence-level skills students use in every piece: sentences, transitions, word choice and punctuation.
        Answers are checked instantly in your browser. No sign-in needed.
      </p>
      {BAND_ORDER.map((band) => (
        <section key={band} className="lw-section" style={{ marginTop: 32 }}>
          <h2>{BAND_LABELS[band]}</h2>
          <div className="lw-grid lw-grid-3" style={{ marginTop: 12 }}>
            {catalog.drills
              .filter((d) => d.band === band)
              .map((d) => (
                <Link key={d.id} href={`/learn/practice/${d.id}`} className="lw-card lw-link-card">
                  <span className="lw-pill">{skillName(d.skillId)}</span>
                  <h3 style={{ marginTop: 10 }}>{d.title}</h3>
                  <p className="lw-small lw-muted" style={{ margin: 0 }}>
                    {d.description} · {d.items} questions
                  </p>
                </Link>
              ))}
          </div>
        </section>
      ))}
    </>
  );
}
