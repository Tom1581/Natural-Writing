import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Fragment } from 'react';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import PictureSet from '@/components/learning/PictureSet';
import { BandChip, SkillIcon } from '@/components/learning/icons';
import { BAND_LABELS, LEVEL_LABELS, UK_YEARS_BY_BAND } from '@/lib/learning/levels';
import { getCatalog, getExamplePublic, SITE_URL } from '@/lib/learning/public';
import { GENRE_NAMES, ldJson, PUBLISHER } from '@/lib/learning/seo';
import type { ExampleView } from '@/lib/learning/types';

type Props = { params: Promise<{ exampleId: string }> };

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog?.examples ?? []).map((e) => ({ exampleId: e.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ex = await getExamplePublic((await params).exampleId);
  if (!ex) return { title: 'Example not found' };
  const kind = GENRE_NAMES[ex.genre].toLowerCase();
  const title = `${BAND_LABELS[ex.band]} ${GENRE_NAMES[ex.genre]} Writing Example: “${ex.title}”`;
  const description = `An annotated ${kind} writing example for ${BAND_LABELS[ex.band].toLowerCase()} (${UK_YEARS_BY_BAND[ex.band]} in England), rated skill by skill on our rubric, with notes on what works and how to go further.`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/examples/${ex.id}` },
    openGraph: { title, description, url: `${SITE_URL}/learn/examples/${ex.id}`, type: 'article' },
  };
}

/** Splits the text into plain runs and numbered highlights for each note (first occurrence, no overlaps). */
function annotate(ex: ExampleView) {
  const spans = ex.notes
    .map((n, i) => ({ i, start: ex.text.indexOf(n.quote), end: ex.text.indexOf(n.quote) + n.quote.length }))
    .filter((s) => s.start >= 0)
    .sort((a, b) => a.start - b.start);
  const out: { text: string; note?: number }[] = [];
  let at = 0;
  for (const s of spans) {
    if (s.start < at) continue;
    if (s.start > at) out.push({ text: ex.text.slice(at, s.start) });
    out.push({ text: ex.text.slice(s.start, s.end), note: s.i });
    at = s.end;
  }
  if (at < ex.text.length) out.push({ text: ex.text.slice(at) });
  return out;
}

export default async function ExamplePage({ params }: Props) {
  const ex = await getExamplePublic((await params).exampleId);
  if (!ex) notFound();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: `${ex.title}: annotated ${GENRE_NAMES[ex.genre].toLowerCase()} writing example`,
    learningResourceType: 'Annotated writing example',
    educationalLevel: BAND_LABELS[ex.band],
    inLanguage: 'en',
    isAccessibleForFree: true,
    url: `${SITE_URL}/learn/examples/${ex.id}`,
    publisher: PUBLISHER,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      <Breadcrumbs items={[{ name: 'Writing examples', href: '/learn/examples' }, { name: ex.title, href: `/learn/examples/${ex.id}` }]} />
      <div className="lw-card-meta">
        <BandChip band={ex.band} />
        <span className="lw-pill">{GENRE_NAMES[ex.genre]}</span>
      </div>
      <h1>{ex.title}</h1>
      <p className="lw-muted" style={{ maxWidth: '46em' }}>
        A model piece written for this site in the voice of {ex.writer}. It is not real student work. Numbered highlights match the notes.
      </p>

      <details className="lw-card" style={{ margin: '12px 0 20px' }}>
        <summary style={{ cursor: 'pointer' }}>
          <strong>The task:</strong> {ex.prompt.title}
        </summary>
        <p style={{ marginTop: 10 }}>{ex.prompt.task}</p>
        {ex.prompt.picture && <PictureSet id={ex.prompt.picture.id} description={ex.prompt.picture.description} compact />}
        {ex.prompt.sources.map((s) => (
          <div key={s.title} className="lw-source" style={{ marginBottom: 10 }}>
            <strong>{s.title}</strong>
            <p style={{ margin: '6px 0 0' }}>{s.text}</p>
          </div>
        ))}
        <p className="lw-small" style={{ margin: 0 }}>
          <Link href={`/learn/prompts/${ex.prompt.id}`}>Write your own answer to this task</Link>
        </p>
      </details>

      <div className="lw-feedback-layout">
        <section className="lw-card" aria-labelledby="ex-text">
          <h2 id="ex-text" style={{ fontSize: '1.1rem' }}>The piece</h2>
          <div className="lw-example-text">
            {annotate(ex).map((s, i) =>
              s.note === undefined ? (
                <Fragment key={i}>{s.text}</Fragment>
              ) : (
                <a key={i} href={`#note-${s.note + 1}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  <mark>
                    {s.text}
                    <sup aria-label={`note ${s.note + 1}`}>{s.note + 1}</sup>
                  </mark>
                </a>
              ),
            )}
          </div>
        </section>
        <section aria-labelledby="ex-notes">
          <h2 id="ex-notes" style={{ fontSize: '1.1rem' }}>Notes</h2>
          <ol className="lw-example-notes">
            {ex.notes.map((n, i) => {
              const dim = ex.rubric.dimensions.find((d) => d.skillId === n.skillId);
              return (
                <li key={i} id={`note-${i + 1}`}>
                  <span className="lw-note-num" aria-hidden="true">{i + 1}</span>
                  <strong className="lw-skill-label">
                    <SkillIcon skillId={n.skillId} size={16} /> {dim?.name}
                  </strong>
                  <p style={{ margin: '4px 0 0' }}>{n.comment}</p>
                </li>
              );
            })}
          </ol>
        </section>
      </div>

      <section className="lw-section lw-grid lw-grid-2">
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>Levels on the {ex.rubric.title.toLowerCase()} rubric</h2>
          <ul className="lw-plain-list">
            {ex.rubric.dimensions.map((d) => {
              const r = ex.ratings[d.skillId];
              return (
                <li key={d.skillId}>
                  <span className="lw-skill-label">
                    <SkillIcon skillId={d.skillId} size={18} /> {d.name}
                  </span>
                  <span className="lw-small">
                    {r ? (
                      <>
                        <strong>{r}</strong> · {LEVEL_LABELS[r]}
                      </>
                    ) : (
                      <span className="lw-muted">Not rated (typed by an adult)</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <p className="lw-small" style={{ margin: 0 }}>
            <Link href={`/learn/rubrics/${ex.rubric.id}`}>See the full rubric</Link>
          </p>
        </div>
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>Why it works</h2>
          <p>{ex.whyItWorks}</p>
          <h2 style={{ fontSize: '1.15rem' }}>To go further</h2>
          <p style={{ marginBottom: 0 }}>{ex.nextStep}</p>
        </div>
      </section>

      {ex.others.length > 0 && (
        <section className="lw-section">
          <h2 style={{ fontSize: '1.15rem' }}>More {BAND_LABELS[ex.band].toLowerCase()} examples</h2>
          <ul className="lw-list">
            {ex.others.map((o) => (
              <li key={o.id}>
                <Link href={`/learn/examples/${o.id}`}>{o.title}</Link> <span className="lw-muted lw-small">· {GENRE_NAMES[o.genre]}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}
