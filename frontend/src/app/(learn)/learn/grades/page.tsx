import type { Metadata } from 'next';
import Link from 'next/link';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import { BAND_LABELS } from '@/lib/learning/levels';
import { GRADES, getCatalog, gradeSlug, localNames, usGradeName } from '@/lib/learning/public';
import { itemListLd, ldJson } from '@/lib/learning/seo';

export const metadata: Metadata = {
  title: 'Writing Practice by Grade and Year: Kindergarten to Grade 12',
  description:
    'Pick a grade or school year to see its writing goals, prompts, lessons, rubrics and official standards, with US grades, Ontario grades, England years and Australian years side by side.',
  alternates: { canonical: '/learn/grades' },
};

export default async function GradesIndex() {
  const catalog = await getCatalog();
  const frameworks = catalog?.frameworks ?? [];
  const columns = [
    { id: 'ca-on', label: 'Canada (Ontario)' },
    { id: 'uk-eng', label: 'England' },
    { id: 'au-ac9', label: 'Australia' },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: ldJson(itemListLd('Writing practice by grade', GRADES.map((g) => ({ name: `${usGradeName(g)} writing practice`, href: `/learn/grades/${gradeSlug(g)}` })))),
        }}
      />
      <Breadcrumbs items={[{ name: 'Grades', href: '/learn/grades' }]} />
      <h1>Writing practice by grade</h1>
      <p className="lw-lede" style={{ maxWidth: '46em' }}>
        Choose a grade to see what writers at that age work toward, with prompts, lessons, rubrics and the official standards. Each row lines up the
        same age group across four school systems.
      </p>
      <div style={{ overflowX: 'auto', marginTop: 20 }}>
        <table className="lw-table">
          <thead>
            <tr>
              <th>United States</th>
              {columns.map((c) => (
                <th key={c.id}>{c.label}</th>
              ))}
              <th>Group</th>
            </tr>
          </thead>
          <tbody>
            {GRADES.map((g) => {
              const names = localNames(frameworks, g);
              const band = catalog?.bands.find((b) => b.grades.includes(g));
              return (
                <tr key={g}>
                  <td>
                    <Link href={`/learn/grades/${gradeSlug(g)}`}>
                      <strong>{usGradeName(g)}</strong>
                    </Link>
                  </td>
                  {columns.map((c) => (
                    <td key={c.id}>{names.find((n) => n.id === c.id)?.label ?? '–'}</td>
                  ))}
                  <td className="lw-small">
                    {band ? BAND_LABELS[band.id] : ''}
                    {band?.status === 'early_access' && <span className="lw-muted"> · early access</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="lw-small lw-muted" style={{ marginTop: 10 }}>
        Ontario’s Kindergarten program isn’t organized by grade-level writing expectations, so Ontario practice starts at Grade 1. Start dates and
        age cut-offs vary by state, province and country.
      </p>
    </>
  );
}
