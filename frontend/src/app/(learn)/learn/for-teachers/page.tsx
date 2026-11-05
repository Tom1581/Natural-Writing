import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Teachers: Writing Practice, Rubric Feedback and Class Insights',
  description:
    'How teachers use Writing Studio: school accounts, class lists with sign-in codes, assignments, a review queue, correcting AI levels, wellbeing flags and curriculum-aligned reports from kindergarten to grade 12.',
  alternates: { canonical: '/learn/for-teachers' },
};

export default function ForTeachers() {
  return (
    <article className="lw-lesson">
      <Breadcrumbs items={[{ name: 'For teachers', href: '/learn/for-teachers' }]} />
      <p className="lw-eyebrow">For teachers</p>
      <h1>More writing practice, with you in charge of the judgment</h1>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Set up a class</h2>
        <ol className="lw-list">
          <li>Create a school account (or join one when your admin invites you).</li>
          <li>Paste your class list: names and year or grade only. Each student gets a sign-in code; print the cards.</li>
          <li>Assign a prompt, with or without a lesson first, and an optional due date.</li>
        </ol>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Stay in control of the feedback</h2>
        <ul className="lw-list">
          <li>The review queue puts wellbeing flags first, then pieces a student reported, then pieces worth a second look.</li>
          <li>Adjust any AI level with a note the student sees, or confirm the levels with one click. Corrections update the student’s plan.</li>
          <li>See how many students are at each level for each skill. Levels are counted, never averaged.</li>
        </ul>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Built on your curriculum</h2>
        <p>
          Every rated skill is mapped to the official statements for your grade or year: Common Core, Ontario Language (2023), the National
          Curriculum in England, or the Australian Curriculum v9.0. <Link href="/learn/curriculum">See the alignment</Link>.
        </p>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>School controls</h2>
        <ul className="lw-list">
          <li>Admins invite and remove staff. Removing someone ends their access straight away, including to students they added.</li>
          <li>An activity log records exports, deletions, codes and corrections, without any student writing.</li>
          <li>Student profiles hold a first name or nickname and a year. No addresses, birth dates or records.</li>
        </ul>
        <p className="lw-small lw-muted" style={{ margin: 0 }}>
          Check your school or district’s policies on student data before using any online service; this is an early version.
        </p>
      </section>
      <Link className="lw-btn lw-btn-primary" href="/learn/school">
        Set up a school
      </Link>
    </article>
  );
}
