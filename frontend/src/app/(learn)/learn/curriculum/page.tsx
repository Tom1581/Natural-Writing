import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { getCatalog } from '@/lib/learning/public';

export const metadata: Metadata = {
  title: 'Curriculum Alignment: US, Canada, UK and Australia Writing Standards',
  description:
    'How Writing Studio lessons and rubrics map to Common Core (US), the Ontario Language curriculum (Canada), the National Curriculum in England, and the Australian Curriculum v9.0, with official wording quoted for every grade and year.',
  alternates: { canonical: '/learn/curriculum' },
};

const BLURB: Record<string, string> = {
  'us-ccss': 'Writing standards W.1–W.5 (plus W.8 for source-based work in grades 9–12) and Language standards L.1–L.3 and L.6, Kindergarten to Grade 12.',
  'ca-on': 'Ontario Language 2023 (Strands B and D) for Grades 1–8, English Grade 9 (ENL1W, 2023), and the Writing strand of English 2007 for Grades 10–12.',
  'uk-eng': 'Statutory programmes of study for Year 1, Year 2, Years 3–4, Years 5–6, key stage 3 and key stage 4, plus the 2018 KS2 writing teacher assessment framework.',
  'au-ac9': 'Literacy (Creating texts) and Language content descriptions from Australian Curriculum: English v9.0, Foundation to Year 10, and Senior Secondary English for Years 11–12.',
};

export default async function CurriculumIndex() {
  const catalog = await getCatalog();
  return (
    <>
      <Breadcrumbs items={[{ name: 'Curriculum', href: '/learn/curriculum' }]} />
      <p className="lw-eyebrow">Curriculum alignment</p>
      <h1>Matched to the writing goals your school uses</h1>
      <p className="lw-lede" style={{ maxWidth: '46em' }}>
        Every rubric skill in Writing Studio is mapped to the official writing statements for each grade or year. We quote the wording exactly and
        link to the source document, so teachers and parents can check the match themselves.
      </p>
      <div className="lw-grid lw-grid-2" style={{ marginTop: 24 }}>
        {(catalog?.frameworks ?? []).map((f) => (
          <Link key={f.id} href={`/learn/curriculum/${f.id}`} className="lw-card lw-link-card">
            <p className="lw-eyebrow">{f.country}</p>
            <h2 style={{ fontSize: '1.3rem' }}>{f.name}</h2>
            <p className="lw-small lw-muted">{f.version}</p>
            <p className="lw-small">{BLURB[f.id]}</p>
            <p className="lw-small" style={{ margin: 0 }}>
              <strong>
                {f.localGradeLabels[f.localGrades[0]]} to {f.localGradeLabels[f.localGrades[f.localGrades.length - 1]]}
              </strong>{' '}
              →
            </p>
          </Link>
        ))}
      </div>
      <section className="lw-section lw-card">
        <h2>How grade and year names line up</h2>
        <p className="lw-small lw-muted">Content is grouped by age. England counts one year ahead, because Year 1 is the year children turn six.</p>
        <div style={{ overflowX: 'auto' }}>
          <table className="lw-table">
            <thead>
              <tr>
                <th>Typical age at start</th>
                <th>United States</th>
                <th>Canada (Ontario)</th>
                <th>England</th>
                <th>Australia</th>
              </tr>
            </thead>
            <tbody>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((g) => (
                <tr key={g}>
                  <td>
                    {g + 5}–{g + 6}
                  </td>
                  <td>{g === 0 ? 'Kindergarten' : `Grade ${g}`}</td>
                  <td>{g === 0 ? 'Kindergarten (not graded)' : `Grade ${g}`}</td>
                  <td>Year {g + 1}</td>
                  <td>{g === 0 ? 'Foundation' : `Year ${g}`}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="lw-small lw-muted" style={{ margin: '10px 0 0' }}>
          School-year start dates and age cut-offs differ by state, province and country; this table is a guide.
        </p>
      </section>
      <section className="lw-section">
        <p className="lw-notice">
          Alignment is a planning aid written for this pilot. It shows which statements each practice activity targets. It does not certify that a
          student has met a standard, and it is not endorsed by any education authority.
        </p>
      </section>
    </>
  );
}
