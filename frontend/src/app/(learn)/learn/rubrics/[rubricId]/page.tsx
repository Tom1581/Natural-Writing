import type { Metadata } from 'next';
import { SkillIcon } from '@/components/learning/icons';
import ReviewBadge from '@/components/learning/ReviewBadge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { BAND_LABELS, LEVEL_LABELS, UK_YEARS_BY_BAND } from '@/lib/learning/levels';
import { getCatalog, getRubricPublic, gradeSlug, SITE_URL } from '@/lib/learning/public';
import { ldJson, PUBLISHER } from '@/lib/learning/seo';

type Props = { params: Promise<{ rubricId: string }> };

export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog?.rubrics ?? []).map((r) => ({ rubricId: r.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const rubric = await getRubricPublic((await params).rubricId);
  if (!rubric) return { title: 'Rubric not found' };
  const title = `${rubric.title} Rubric (Free, Printable)`;
  const description = `A four-level ${rubric.title.toLowerCase()} rubric covering ${rubric.dimensions.map((d) => d.name.toLowerCase()).join(', ')}, with scored student-style examples. ${BAND_LABELS[rubric.band]} (${UK_YEARS_BY_BAND[rubric.band]} in England).`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/rubrics/${rubric.id}` },
    openGraph: { title, description, url: `${SITE_URL}/learn/rubrics/${rubric.id}`, type: 'article' },
  };
}

export default async function RubricPage({ params }: Props) {
  const rubric = await getRubricPublic((await params).rubricId);
  if (!rubric) notFound();
  const levels = [1, 2, 3, 4] as const;
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: rubric.title,
    learningResourceType: 'Rubric',
    educationalLevel: BAND_LABELS[rubric.band],
    inLanguage: 'en',
    isAccessibleForFree: true,
    url: `${SITE_URL}/learn/rubrics/${rubric.id}`,
    publisher: PUBLISHER,
    teaches: rubric.dimensions.map((d) => d.studentGoal),
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      <Breadcrumbs items={[{ name: 'Rubrics', href: '/learn/rubrics' }, { name: rubric.title, href: `/learn/rubrics/${rubric.id}` }]} />
      <p className="lw-eyebrow">
        {BAND_LABELS[rubric.band]} · {UK_YEARS_BY_BAND[rubric.band]} in England · version {rubric.version}
      </p>
      <h1>{rubric.title} rubric</h1>
      <ReviewBadge itemId={rubric.id} />
      <p className="lw-lede" style={{ maxWidth: '46em' }}>
        Each skill is rated from 1 to 4 for one piece of writing. Level 3 means the piece meets the goal for the task. Levels are categories for
        feedback, not percentages or a grade-level score.
      </p>
      {rubric.bandInfo?.status === 'early_access' && (
        <p className="lw-notice lw-early-access" style={{ maxWidth: '50em' }}>
          <strong>Early access.</strong> This rubric is written for our pilot and is still being reviewed by classroom teachers.
        </p>
      )}
      <div className="lw-btn-row lw-noprint" style={{ margin: '12px 0 20px' }}>
        <Link className="lw-btn lw-btn-primary" href="/learn/dashboard">Write with this rubric</Link>
        {rubric.examples.map((e) => (
          <Link key={e.id} className="lw-btn lw-btn-secondary" href={`/learn/examples/${e.id}`}>
            See a model piece: {e.title}
          </Link>
        ))}
        <span className="lw-small lw-muted">Tip: use your browser’s Print to get a one-page copy.</span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table className="lw-rubric-table">
          <caption className="lw-small lw-muted" style={{ textAlign: 'left', marginBottom: 6 }}>
            {rubric.title}: level descriptions for each skill
          </caption>
          <thead>
            <tr>
              <th scope="col">Skill</th>
              {levels.map((n) => (
                <th key={n} scope="col">
                  {n} · {LEVEL_LABELS[n]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rubric.dimensions.map((d) => (
              <tr key={d.skillId}>
                <th scope="row">
                  <span className="lw-skill-label">
                    <SkillIcon skillId={d.skillId} size={18} /> {d.name}
                  </span>
                  <div className="lw-small lw-muted" style={{ fontWeight: 400 }}>{d.studentGoal}</div>
                </th>
                {levels.map((n) => (
                  <td key={n} data-level={n}>{d.levels[n]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="lw-section">
        <h2>Scored examples</h2>
        <p className="lw-muted" style={{ maxWidth: '46em' }}>
          Short examples written for this site (not real student work), with the level for each skill and why.
        </p>
        {rubric.anchors.map((a, i) => (
          <div key={i} className="lw-card" style={{ marginTop: 12 }}>
            <blockquote className="lw-model" style={{ margin: 0 }}>{a.text}</blockquote>
            <ul className="lw-plain-list lw-small" style={{ marginTop: 10 }}>
              {rubric.dimensions.map((d) => (
                <li key={d.skillId}>
                  {d.name}: <strong>{a.ratings[d.skillId] ?? '–'}</strong>
                </li>
              ))}
            </ul>
            <p className="lw-small" style={{ margin: '8px 0 0' }}>
              <strong>Why:</strong> {a.note}
            </p>
          </div>
        ))}
      </section>

      <section className="lw-section lw-grid lw-grid-2">
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>Lessons for these skills</h2>
          <ul className="lw-list">
            {rubric.lessons.map((l) => (
              <li key={l.id}>
                <Link href={`/learn/lessons/${l.id}`}>{l.title}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>Prompts that use this rubric</h2>
          <ul className="lw-list">
            {rubric.prompts.map((p) => (
              <li key={p.id}>
                <Link href={`/learn/prompts/${p.id}`}>{p.title}</Link>
              </li>
            ))}
          </ul>
          <p className="lw-small" style={{ margin: 0 }}>
            See the {rubric.bandInfo?.grades.map((g, i) => (
              <span key={g}>
                {i > 0 && ', '}
                <Link href={`/learn/grades/${gradeSlug(g)}`}>{g === 'K' ? 'kindergarten' : `grade ${g}`}</Link>
              </span>
            ))}{' '}
            pages for standards.
          </p>
        </div>
      </section>
    </>
  );
}
