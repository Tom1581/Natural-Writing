import type { Metadata } from 'next';
import { BandChip, GradeLadder, SkillIcon } from '@/components/learning/icons';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { BAND_LABELS } from '@/lib/learning/levels';
import { GRADES, getGrade, gradeFromSlug, gradeSlug, SITE_URL, usGradeName } from '@/lib/learning/public';
import { GENRE_NAMES, ldJson, PUBLISHER } from '@/lib/learning/seo';
import type { GradeView } from '@/lib/learning/types';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return GRADES.map((g) => ({ slug: gradeSlug(g) }));
}

const otherNames = (view: GradeView) =>
  view.frameworks.filter((f) => f.id !== 'us-ccss').map((f) => `${f.label} in ${f.id === 'ca-on' ? 'Ontario' : f.id === 'uk-eng' ? 'England' : 'Australia'}`);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const grade = gradeFromSlug((await params).slug);
  const view = grade ? await getGrade(grade) : null;
  if (!grade || !view) return { title: 'Grade not found' };
  const name = usGradeName(grade);
  const others = otherNames(view);
  const title = `${name} Writing Practice: Prompts, Lessons and Rubrics`;
  const description = `What ${name.toLowerCase()} writers work on, with ${view.prompts.length} free writing prompts, ${view.lessons.length} short lessons, rubrics and the official writing standards for ${name} (${others.join(', ')}).`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/grades/${gradeSlug(grade)}` },
    openGraph: { title, description, url: `${SITE_URL}/learn/grades/${gradeSlug(grade)}`, type: 'website' },
  };
}

export default async function GradePage({ params }: Props) {
  const grade = gradeFromSlug((await params).slug);
  if (!grade) notFound();
  const view = await getGrade(grade);
  if (!view) return <p className="lw-notice">This page is loading slowly right now. Please refresh in a minute.</p>;
  const name = usGradeName(grade);
  const others = otherNames(view);
  const idx = GRADES.indexOf(grade as (typeof GRADES)[number]);
  const prev = idx > 0 ? GRADES[idx - 1] : null;
  const next = idx < GRADES.length - 1 ? GRADES[idx + 1] : null;
  const wordRanges = view.rubrics.filter((r) => r.words).map((r) => `${GENRE_NAMES[r.genre].toLowerCase()}: ${r.words!.min}–${r.words!.max} words`);

  const faq = [
    {
      q: `What should a ${name.toLowerCase()} student be able to write?`,
      a: `${view.band.note} In our rubrics, meeting the goal means, for example: ${view.rubrics
        .map((r) => `${r.goals[0].meets.replace(/\.$/, '').toLowerCase()} (${GENRE_NAMES[r.genre].toLowerCase()})`)
        .join('; ')}.`,
    },
    {
      q: `How long should writing be in ${name.toLowerCase()}?`,
      a: `Our ${BAND_LABELS[view.band.id].toLowerCase()} prompts suggest ${wordRanges.join(', ')}. Length is guidance only: a shorter piece that meets the checklist is better than a long one that doesn’t, and word counts are never part of the rating.`,
    },
    {
      q: `What is ${name.toLowerCase()} called in other countries?`,
      a: `${name} in the United States is ${others.join(', ')}. England counts school years one ahead, because Year 1 is the year children turn six.`,
    },
    {
      q: 'Is this free?',
      a: 'Lessons, prompts, rubrics and practice sets are free and need no account. Writing feedback is free during the pilot after a parent or teacher creates a student profile.',
    },
  ];

  const pageLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${name} writing practice`,
    url: `${SITE_URL}/learn/grades/${gradeSlug(grade)}`,
    educationalLevel: name,
    publisher: PUBLISHER,
    hasPart: view.lessons.map((l) => ({ '@type': 'LearningResource', name: l.title, url: `${SITE_URL}/learn/lessons/${l.id}` })),
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(pageLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqLd) }} />
      <Breadcrumbs items={[{ name: 'Grades', href: '/learn/grades' }, { name, href: `/learn/grades/${gradeSlug(grade)}` }]} />
      <GradeLadder current={grade} slugFor={gradeSlug} />
      <div className="lw-card-meta">
        <BandChip band={view.band.id} />
      </div>
      <h1>{name} writing practice</h1>
      <p className="lw-lede" style={{ maxWidth: '46em' }}>
        Prompts, lessons and rubrics for {name.toLowerCase()} writers, matched to the official writing standards. The same age group is{' '}
        {others.join(', ')}.
      </p>
      {view.band.status === 'early_access' && (
        <p className="lw-notice lw-early-access" style={{ maxWidth: '50em' }}>
          <strong>Early access.</strong> The full write–feedback–revise loop works for this grade, but feedback has not yet been checked against
          teacher-rated samples. {view.band.note}
        </p>
      )}
      <div className="lw-btn-row lw-noprint" style={{ margin: '16px 0 8px' }}>
        <Link className="lw-btn lw-btn-primary" href="/learn/dashboard">Start writing practice</Link>
        {view.lessons[0] && (
          <Link className="lw-btn lw-btn-secondary" href={`/learn/lessons/${view.lessons[0].id}`}>Try a lesson</Link>
        )}
      </div>

      <section className="lw-section">
        <h2>What {name.toLowerCase()} writers work toward</h2>
        <p className="lw-muted" style={{ maxWidth: '46em' }}>
          These are the “meets the goal” (level 3) descriptions from our {BAND_LABELS[view.band.id].toLowerCase()} rubrics. Each piece of writing is
          rated on every skill from 1 to 4.
        </p>
        <div className="lw-grid lw-grid-3" style={{ marginTop: 12 }}>
          {view.rubrics.map((r) => (
            <div key={r.id} className="lw-card">
              <h3>{GENRE_NAMES[r.genre]}</h3>
              <ul className="lw-list lw-small">
                {r.goals.map((g) => (
                  <li key={g.skillId}>
                    <strong className="lw-skill-label">
                      <SkillIcon skillId={g.skillId} size={16} /> {g.name}:
                    </strong>{' '}
                    {g.meets}
                  </li>
                ))}
              </ul>
              <p className="lw-small" style={{ margin: 0 }}>
                {r.words && <span className="lw-muted">Suggested length {r.words.min}–{r.words.max} words. </span>}
                <Link href={`/learn/rubrics/${r.id}`}>Full rubric with examples</Link>
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="lw-section">
        <div className="lw-card-title">
          <h2>Lessons</h2>
          <Link href={`/learn/lessons#band-${view.band.id}`}>All {BAND_LABELS[view.band.id].toLowerCase()} lessons</Link>
        </div>
        <div className="lw-grid lw-cols-3" style={{ marginTop: 12 }}>
          {view.lessons.map((l) => (
            <Link key={l.id} href={`/learn/lessons/${l.id}`} className="lw-card lw-link-card lw-banded" data-band={view.band.id}>
              <span className="lw-card-icon">
                <SkillIcon skillId={l.skillId} size={22} />
              </span>
              <h3>{l.title}</h3>
              <p className="lw-small" style={{ marginBottom: 6 }}>{l.objective}</p>
              <p className="lw-muted lw-small" style={{ margin: 0 }}>About {l.minutes} minutes</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="lw-section">
        <h2>Writing prompts</h2>
        <p className="lw-muted" style={{ maxWidth: '46em' }}>
          Pick one and write. You’ll get feedback on your own sentences, no account needed; sign in to save your work.
        </p>
        {(['opinion', 'informative', 'narrative'] as const).map((genre) => {
          const items = view.prompts.filter((p) => p.genre === genre);
          if (!items.length) return null;
          return (
            <div key={genre} style={{ marginTop: 16 }}>
              <h3>{GENRE_NAMES[genre]}</h3>
              <ul className="lw-list">
                {items.map((p) => (
                  <li key={p.id}>
                    <Link href={`/learn/prompts/${p.id}`}>{p.title}</Link>
                    <span className="lw-muted lw-small"> · {p.task.length > 140 ? `${p.task.slice(0, 137)}…` : p.task}</span>{' '}
                    <Link className="lw-small" href={`/learn/write/${p.id}?grade=${grade}`} aria-label={`Write: ${p.title}`}>
                      Write →
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <p className="lw-small lw-muted">A few more prompts are kept back as check-ins and checkpoints, so students meet them fresh.</p>
      </section>

      {view.examples.length > 0 && (
        <section className="lw-section">
          <h2>What strong writing looks like</h2>
          <div className="lw-grid lw-cols-3" style={{ marginTop: 12 }}>
            {view.examples.map((e) => (
              <Link key={e.id} href={`/learn/examples/${e.id}`} className="lw-card lw-link-card lw-banded" data-band={view.band.id}>
                <span className="lw-pill">{GENRE_NAMES[e.genre]}</span>
                <h3 style={{ marginTop: 10 }}>{e.title}</h3>
                <p className="lw-small lw-muted" style={{ margin: 0 }}>Annotated model piece</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {view.drills.length > 0 && (
        <section className="lw-section">
          <h2>Quick practice</h2>
          <ul className="lw-list">
            {view.drills.map((d) => (
              <li key={d.id}>
                <Link href={`/learn/practice/${d.id}`}>{d.title}</Link> <span className="lw-muted lw-small">· {d.description}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="lw-section">
        <h2>Official writing standards for {name.toLowerCase()}</h2>
        <p className="lw-muted" style={{ maxWidth: '46em' }}>
          The statements each rubric skill is matched to, quoted from the official documents. Open a country to see them.
        </p>
        {view.frameworks.map((f) => (
          <details key={f.id} className="lw-card" style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer' }}>
              <strong>
                {f.country}: {f.label}
              </strong>{' '}
              <span className="lw-muted lw-small">({f.shortName})</span>
            </summary>
            {f.note && <p className="lw-small lw-muted" style={{ marginTop: 10 }}>{f.note}</p>}
            {f.genres.map((g) => (
              <div key={g.genre} style={{ marginTop: 14 }}>
                <h3 style={{ fontSize: '1rem' }}>{GENRE_NAMES[g.genre]}</h3>
                <ul className="lw-list lw-small">
                  {g.skills.map((sk) => (
                    <li key={sk.skillId}>
                      <strong>{sk.name}:</strong>{' '}
                      {sk.statements.map((st, i) => (
                        <span key={st.id}>
                          {i > 0 && '; '}
                          <a href={st.url} target="_blank" rel="noreferrer">{st.shortCode}</a>
                          {st.text ? ` “${st.text}”` : st.title ? ` (${st.title})` : ''}
                        </span>
                      ))}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="lw-small" style={{ margin: '8px 0 0' }}>
              <Link href={`/learn/curriculum/${f.id}`}>Full {f.shortName} alignment</Link>
            </p>
          </details>
        ))}
      </section>

      <section className="lw-section">
        <h2>Questions</h2>
        <div className="lw-faq">
          {faq.map((f) => (
            <details key={f.q} className="lw-card">
              <summary>
                <strong>{f.q}</strong>
              </summary>
              <p style={{ marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <nav className="lw-section lw-btn-row lw-noprint" aria-label="Other grades">
        {prev && <Link className="lw-btn lw-btn-quiet" href={`/learn/grades/${gradeSlug(prev)}`}>← {usGradeName(prev)}</Link>}
        <Link className="lw-btn lw-btn-quiet" href="/learn/grades">All grades</Link>
        {next && <Link className="lw-btn lw-btn-quiet" href={`/learn/grades/${gradeSlug(next)}`}>{usGradeName(next)} →</Link>}
      </nav>
    </>
  );
}
