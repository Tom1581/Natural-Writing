import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How Writing Studio Works: Check-in, Lessons, Feedback and Revision',
  description:
    'How students practise writing in Writing Studio: a two-piece check-in, a two-week plan, short lessons, writing with a success checklist, rubric feedback with evidence, revision, and an independent checkpoint.',
  alternates: { canonical: '/learn/how-it-works' },
};

const STEPS = [
  {
    title: '1. A two-piece check-in',
    body: 'Students write one opinion or argument piece and one story, on their own, with no timer and no hints. Each piece is rated on six skills, so the first plan rests on more than one sample of writing.',
  },
  {
    title: '2. A two-week plan',
    body: 'The plan picks one main goal (the skill that needs it most) and one skill to keep strong. It schedules 2–4 short sessions a week: a lesson, practice prompts matched to the student’s interests, quick practice sets, and an independent checkpoint at the end. A parent or teacher can choose the focus instead.',
  },
  {
    title: '3. Short lessons',
    body: 'Each 10–15 minute lesson has a goal, a short explanation, a model with notes, a weak example to diagnose, a practice question with hints, and then a writing task on a new topic.',
  },
  {
    title: '4. Writing with a checklist',
    body: 'Every prompt shows its success checklist, planning questions and the rubric. While drafting, students can press “Am I on track?” to check the draft against the checklist: no score, and it never writes for them.',
  },
  {
    title: '5. Feedback with evidence',
    body: 'Each skill gets a level from 1 to 4, and every rating quotes the student’s own words. Students see one or two strengths and one next step with a guiding question. If a quote can’t be found in the writing, the feedback is rejected rather than shown.',
  },
  {
    title: '6. Revise and reflect',
    body: 'Students revise the same draft, see which skills went up, and answer “What did you change, and why?”. Revisions show growth, but a skill only counts as shown after the student does it on two different prompts, on different days, on their own.',
  },
];

export default function HowItWorks() {
  return (
    <article className="lw-lesson">
      <Breadcrumbs items={[{ name: 'How it works', href: '/learn/how-it-works' }]} />
      <p className="lw-eyebrow">How it works</p>
      <h1>Practice that builds real writing skills</h1>
      <p className="lw-lede" style={{ fontSize: '1.1rem' }}>
        Writing Studio follows the cycle teachers use: model, practise, get feedback, revise, then show it again on something new.
      </p>
      {STEPS.map((s) => (
        <section key={s.title} className="lw-card">
          <h2 style={{ fontSize: '1.2rem' }}>{s.title}</h2>
          <p style={{ margin: 0 }}>{s.body}</p>
        </section>
      ))}
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>What the levels mean</h2>
        <ul className="lw-list">
          <li><strong>1 · Getting started:</strong> the skill is attempted but breaks down often.</li>
          <li><strong>2 · Developing:</strong> some of the skill is there; it isn’t consistent yet.</li>
          <li><strong>3 · Meets the goal:</strong> the piece does what the rubric describes for this grade.</li>
          <li><strong>4 · Beyond the goal:</strong> purposeful control beyond what the task asks.</li>
        </ul>
        <p className="lw-small lw-muted" style={{ margin: 0 }}>
          Levels describe one piece of writing. They are practice guidance, not school grades, a grade-level score, or a diagnosis.
        </p>
      </section>
      <div className="lw-btn-row" style={{ marginTop: 20 }}>
        <Link className="lw-btn lw-btn-primary" href="/learn/dashboard">
          Start writing practice
        </Link>
        <Link className="lw-btn lw-btn-secondary" href="/learn/curriculum">
          See the curriculum alignment
        </Link>
      </div>
    </article>
  );
}
