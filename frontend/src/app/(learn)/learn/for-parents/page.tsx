import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'For Parents: Writing Practice Your Child Can Do at Home',
  description:
    'How parents use Writing Studio: create a profile, give your child a sign-in code, follow their two-week plan and progress report, and keep control of their data. No ads.',
  alternates: { canonical: '/learn/for-parents' },
};

export default function ForParents() {
  return (
    <article className="lw-lesson">
      <Breadcrumbs items={[{ name: 'For parents', href: '/learn/for-parents' }]} />
      <p className="lw-eyebrow">For parents and guardians</p>
      <h1>Help your child become a stronger writer</h1>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Getting started (five minutes)</h2>
        <ol className="lw-list">
          <li>Create an account and add a profile with your child’s first name or nickname, country and school year.</li>
          <li>Give them a sign-in code so they can practise on their own device. The code opens only their own writing, never your account.</li>
          <li>They begin with a two-piece writing check-in. After that, their two-week plan tells them what to do each session.</li>
        </ol>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>What you can see and do</h2>
        <ul className="lw-list">
          <li>Every piece, with the feedback and the levels for each skill.</li>
          <li>A printable progress report linked to your country’s curriculum.</li>
          <li>Change how often they practise, or choose the skill they focus on.</li>
          <li>Turn on supports: read-aloud, larger text, dictation, or simpler feedback for children learning English.</li>
          <li>Download everything, or delete the profile at any time.</li>
        </ul>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>How to help without taking over</h2>
        <ul className="lw-list">
          <li>Ask your child to read their next step aloud and tell you what they’ll change. Let them make the change.</li>
          <li>Praise the specific move (“you explained why that example matters”), not just the level.</li>
          <li>Keep sessions short: 15–20 minutes, two to four times a week, works better than one long session.</li>
        </ul>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Safety and privacy</h2>
        <p>
          No ads or marketing trackers on learning pages, and no public profiles or messaging. If your child writes something that suggests they
          may not be safe, you’ll see a note asking you to read that piece, and your child sees where to get help. The site is not monitored around
          the clock. Details are in the <Link href="/learn/privacy">privacy notice</Link>.
        </p>
      </section>
      <Link className="lw-btn lw-btn-primary" href="/learn/sign-in">
        Create a free account
      </Link>
    </article>
  );
}
