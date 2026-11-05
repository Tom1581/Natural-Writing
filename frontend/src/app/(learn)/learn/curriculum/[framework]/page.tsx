import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { FRAMEWORK_SLUGS, getCurriculum, gradeSlug } from '@/lib/learning/public';
import type { CurriculumView, Statement } from '@/lib/learning/types';

type Props = { params: Promise<{ framework: string }> };

const GENRE: Record<string, string> = { opinion: 'Opinion / argument', informative: 'Informative / explanatory', narrative: 'Narrative' };

type GradeGenres = CurriculumView['grades'][number]['genres'];

/** One row per skill across all genres; a statement used by only some genres is tagged with them. */
function mergeSkills(genres: GradeGenres) {
  const rows = new Map<string, { skillId: string; name: string; lessons: { id: string; title: string }[]; statements: { statement: Statement; genres: string[] }[] }>();
  for (const genre of genres) {
    for (const k of genre.skills) {
      const row = rows.get(k.skillId) ?? { skillId: k.skillId, name: k.name, lessons: [], statements: [] };
      for (const l of k.lessons) if (!row.lessons.some((x) => x.id === l.id)) row.lessons.push(l);
      for (const st of k.statements) {
        const found = row.statements.find((x) => x.statement.id === st.id);
        if (found) found.genres.push(genre.genre);
        else row.statements.push({ statement: st, genres: [genre.genre] });
      }
      rows.set(k.skillId, row);
    }
  }
  return [...rows.values()];
}

export function generateStaticParams() {
  return FRAMEWORK_SLUGS.map((framework) => ({ framework }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const view = await getCurriculum((await params).framework);
  if (!view) return { title: 'Curriculum not found' };
  const fw = view.framework;
  const range = `${view.grades[0].label} to ${view.grades[view.grades.length - 1].label}`;
  return {
    title: `${fw.shortName} Writing Standards, ${range}: Aligned Lessons`,
    description: `Writing practice aligned to the ${fw.name} (${fw.version}), ${range}. Official wording for opinion, informative and narrative writing, sentences, word choice and conventions, with a lesson for each skill.`,
    alternates: { canonical: `/learn/curriculum/${fw.id}` },
  };
}

export default async function CurriculumPage({ params }: Props) {
  const view = await getCurriculum((await params).framework);
  if (!view) notFound();
  const fw = view.framework;

  return (
    <>
      <Breadcrumbs items={[{ name: 'Curriculum', href: '/learn/curriculum' }, { name: fw.shortName, href: `/learn/curriculum/${fw.id}` }]} />
      <p className="lw-eyebrow">
        <Link href="/learn/curriculum">Curriculum alignment</Link> · {fw.country}
      </p>
      <h1>{fw.name}</h1>
      <p className="lw-muted">
        {fw.version}. Statements are quoted exactly. Sources:{' '}
        {fw.sources.map((s, i) => (
          <span key={s.url + i}>
            {i > 0 && '; '}
            <a href={s.url} target="_blank" rel="noreferrer">
              {s.title}
            </a>
          </span>
        ))}
        .
      </p>
      <nav className="lw-chip-nav" aria-label="Jump to">
        {view.grades.map((g) => (
          <a key={g.grade} href={`#g${g.grade}`} className="lw-pill">
            {g.label}
          </a>
        ))}
      </nav>
      {view.grades.map((g) => (
        <section key={g.grade} id={`g${g.grade}`} className="lw-section">
          <h2>{g.label}</h2>
          <p className="lw-small" style={{ marginTop: -4 }}>
            {g.note && <span className="lw-muted">{g.note} </span>}
            <Link href={`/learn/grades/${gradeSlug(g.grade)}`}>Prompts, lessons and rubrics for this age</Link>
          </p>
          <div style={{ overflowX: 'auto', marginTop: 12 }}>
            <table className="lw-table lw-align-table">
              <thead>
                <tr>
                  <th style={{ width: '22%' }}>Skill we rate</th>
                  <th>Official statement</th>
                  <th style={{ width: '20%' }}>Practice</th>
                </tr>
              </thead>
              <tbody>
                {mergeSkills(g.genres).map((k) => (
                  <tr key={k.skillId}>
                    <td>
                      <strong>{k.name}</strong>
                    </td>
                    <td>
                      {k.statements.map(({ statement: st, genres }) => (
                        <p key={st.id} style={{ margin: '0 0 8px' }}>
                          <a href={st.url} target="_blank" rel="noreferrer" className="lw-code">
                            {st.framework === 'uk-eng' ? st.code : st.shortCode}
                          </a>
                          {st.title && <span className="lw-small lw-muted"> {st.title}</span>}
                          {st.framework === 'uk-eng' && <span className="lw-small lw-muted"> · {st.scope}</span>}
                          {genres.length < g.genres.length && <span className="lw-small lw-muted"> · {genres.map((x) => GENRE[x] ?? x).join(', ')}</span>}
                          <br />
                          <span className="lw-small">{st.text || '(cited by code and title)'}</span>
                        </p>
                      ))}
                    </td>
                    <td className="lw-small">
                      {k.lessons.length ? (
                        k.lessons.map((l) => (
                          <Link key={l.id} href={`/learn/lessons/${l.id}`} style={{ display: 'block' }}>
                            {l.title}
                          </Link>
                        ))
                      ) : (
                        <span className="lw-muted">Revision and reflection after feedback</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
      <p className="lw-notice" style={{ marginTop: 32 }}>
        Alignment shows which official statements each activity targets. It does not certify attainment and is not endorsed by any education
        authority. {fw.id === 'ca-on' && 'Ontario D2.6 (Editing and Proofreading) and Strand B vocabulary are cited by code and title. '}
        {fw.id === 'uk-eng' && 'England’s programmes of study do not number their statements, so each is identified by key stage and section. '}
      </p>
    </>
  );
}
