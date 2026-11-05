import type { Metadata } from 'next';
import { SkillIcon } from '@/components/learning/icons';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { getCatalog } from '@/lib/learning/public';
import { BAND_LABELS, BAND_ORDER, UK_YEARS_BY_BAND } from '@/lib/learning/levels';

export const metadata: Metadata = {
  title: 'Writing Lessons for Kindergarten to Grade 12',
  description: 'Short writing lessons from kindergarten to grade 12 (Foundation to Year 12; Years 1–13 in England): opinions and claims, evidence and counterclaims, informative writing, story openings and details, sentences, word choice and punctuation. Aligned to US, Canadian, UK and Australian curricula.',
  alternates: { canonical: '/learn/lessons' },
};

export default async function LessonsPage() {
  const catalog = await getCatalog();
  if (!catalog) return <p className="lw-notice">Lessons are loading slowly right now. Please refresh in a minute.</p>;
  const skillName = (id: string) => catalog.skills.find((s) => s.id === id)?.name ?? id;

  return (
    <>
      <Breadcrumbs items={[{ name: 'Lessons', href: '/learn/lessons' }]} />
      <h1>Writing lessons</h1>
      <p className="lw-muted" style={{ maxWidth: '42em' }}>
        Each lesson takes 8–18 minutes: a short explanation, an example and a non-example, one practice question,
        then a writing task on a new topic. Every lesson lists the Common Core, Ontario, England and Australian curriculum statements it
        targets. For five-minute sentence and grammar sets, see <Link href="/learn/practice">Practice</Link>.
      </p>
      {BAND_ORDER.map((band) => (
        <section key={band} className="lw-section" style={{ marginTop: 32 }} id={`band-${band}`}>
          <h2>
            {BAND_LABELS[band]} <span className="lw-muted lw-small">({UK_YEARS_BY_BAND[band]} in England)</span>
          </h2>
          <div className="lw-grid lw-cols-3" style={{ marginTop: 12 }}>
            {catalog.lessons.filter((l) => l.band === band).map((l) => (
              <Link key={l.id} href={`/learn/lessons/${l.id}`} className="lw-card lw-link-card lw-banded" data-band={band}>
                <span className="lw-card-icon">
                  <SkillIcon skillId={l.skillId} size={22} />
                </span>
                <h3>{l.title}</h3>
                <p className="lw-small" style={{ marginBottom: 6 }}>{l.objective}</p>
                <p className="lw-muted lw-small" style={{ margin: 0 }}>{skillName(l.skillId)} · about {l.minutes} min</p>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
