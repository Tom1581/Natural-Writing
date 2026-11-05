import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { getCatalog } from '@/lib/learning/public';
import { BAND_LABELS, BAND_ORDER } from '@/lib/learning/levels';

export const metadata: Metadata = {
  title: 'Writing Prompts for Kindergarten to Grade 12: Opinion, Informative and Narrative',
  description:
    'Free writing prompts from kindergarten to grade 12: picture prompts for young writers, opinion and argument, informative and explanatory, and narrative tasks, with success checklists and planning questions. High-school prompts include paired source texts.',
  alternates: { canonical: '/learn/prompts' },
};

const GENRES: { id: string; title: string }[] = [
  { id: 'opinion', title: 'Opinion and argument' },
  { id: 'informative', title: 'Informative and explanatory' },
  { id: 'narrative', title: 'Narrative' },
];

export default async function PromptLibrary() {
  const catalog = await getCatalog();
  if (!catalog) return <p className="lw-notice">Prompts are loading slowly right now. Please refresh in a minute.</p>;
  const visible = catalog.prompts.filter((p) => !p.checkIn && !p.checkpoint);
  return (
    <>
      <Breadcrumbs items={[{ name: 'Prompts', href: '/learn/prompts' }]} />
      <p className="lw-eyebrow">Prompt library</p>
      <h1>Writing prompts</h1>
      <p className="lw-muted" style={{ maxWidth: '46em' }}>
        {visible.length} prompts with a success checklist, planning questions and a rubric the student can see. Signed-in students get feedback
        on every piece. A few more prompts are kept back as check-ins and checkpoints, so students meet those for the first time when it counts.
      </p>
      {BAND_ORDER.map((band) => (
        <section key={band} className="lw-section" id={`band-${band}`}>
          <h2>{BAND_LABELS[band]}</h2>
          {GENRES.map((g) => {
            const items = visible.filter((p) => p.band === band && p.genre === g.id);
            if (!items.length) return null;
            return (
              <div key={g.id} style={{ marginTop: 16 }}>
                <h3>{g.title}</h3>
                <div className="lw-grid lw-grid-3" style={{ marginTop: 8 }}>
                  {items.map((p) => (
                    <Link key={p.id} href={`/learn/prompts/${p.id}`} className="lw-card lw-link-card">
                      <strong>{p.title}</strong>
                      <p className="lw-small lw-muted" style={{ margin: '6px 0' }}>
                        {p.task && p.task.length > 150 ? `${p.task.slice(0, 147)}…` : p.task}
                      </p>
                      <span className="lw-small lw-muted">{p.topics.join(' · ')}</span>
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      ))}
    </>
  );
}
