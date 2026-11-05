import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy for Families and Teachers',
  description: 'What Natural Quill Writing Studio collects about students, how student writing is used to give feedback, and how to delete it.',
  alternates: { canonical: '/learn/privacy' },
};

/** Keep in sync with LEARNING_NOTICE_VERSION in backend/src/learning/learning.dto.ts. */
const NOTICE_VERSION = '2026-11-05';

export default function LearningPrivacyPage() {
  return (
    <article className="lw-lesson">
      <p className="lw-eyebrow">Learning notice · version {NOTICE_VERSION}</p>
      <h1>Privacy for families and teachers</h1>
      <p>
        This notice covers Writing Studio: the home page and the pages under <code>/learn</code>. There are three ways to practice:
      </p>
      <ul className="lw-list">
        <li><strong>Without an account</strong>, at any age. Nothing is saved by us (see below).</li>
        <li><strong>With a profile an adult makes</strong>: a parent, guardian, or a teacher with permission creates it and agrees to this notice first. This is the only way for students under 13 to have saved work.</li>
        <li><strong>With their own account</strong>, for students aged 13 or older, who agree to this notice themselves.</li>
      </ul>

      <section className="lw-card">
        <h2>Practicing without an account</h2>
        <ul className="lw-list">
          <li>The draft is kept only in the student’s own browser, so it stays there if they leave and come back on the same device.</li>
          <li>When they ask for feedback, the task and their text are sent to our server and the AI service to produce it, then discarded. We don’t store the writing, the feedback, a name, or an account.</li>
          <li>To share the free service fairly, we count feedback requests per connection for an hour, in memory only, and we record how many AI tokens each request used, without any text or identity.</li>
          <li>If the writing suggests the student may be unsafe, the feedback page shows them how to get help. No adult is told, because we don’t know who they are.</li>
        </ul>
      </section>

      <section className="lw-card">
        <h2>What we collect</h2>
        <ul className="lw-list">
          <li><strong>The adult’s sign-in</strong> (email address) so only you can see your students’ work.</li>
          <li><strong>For each student:</strong> a first name or nickname, and their school grade.</li>
          <li><strong>The student’s writing</strong>, planning notes, reflections, and the feedback they receive.</li>
          <li><strong>Their country and curriculum</strong> (for example, England), so spelling, year names and curriculum links match their school.</li>
          <li><strong>Notes and level corrections</strong> that the adult who manages the profile adds to a piece of writing.</li>
        </ul>
        <p>We don’t ask for a student’s birth date, school, address, photo, or any health or disability information. Please remind students not to include personal details such as addresses or phone numbers in their writing.</p>
      </section>

      <section className="lw-card">
        <h2>How student writing is used</h2>
        <ul className="lw-list">
          <li>To give feedback on that piece of writing, to check a draft against its success checklist when the student asks (“Am I on track?”), and to suggest what to practice next.</li>
          <li>
            To produce feedback, the writing task and the student’s text are sent to an AI service provider
            (currently Groq). We don’t send the student’s name, the adult’s email, or other account details.
          </li>
          <li>We don’t sell student information, use it for advertising, or use it to train our own AI models.</li>
          <li>Learning pages don’t show ads and don’t load advertising or marketing analytics scripts.</li>
        </ul>
      </section>

      <section className="lw-card">
        <h2>Who can see a student’s work</h2>
        <ul className="lw-list">
          <li>The adult who created the profile (a parent, guardian or teacher). Nobody else: there are no public pages, galleries, leaderboards or messaging.</li>
          <li>For students 13 or older with their own account: only that student. They can download or delete their profile the same way an adult can.</li>
          <li>
            The student, if the adult gives them a sign-in code. A code opens only that student’s own profile. It can’t create or delete profiles,
            see other students, or open the adult’s account. Codes are stored only in scrambled (hashed) form, and making a new code cancels the old one.
          </li>
          <li>Teachers can group the profiles they manage into classes. A class view shows only those profiles.</li>
        </ul>
      </section>

      <section className="lw-card">
        <h2>About the feedback</h2>
        <p>
          Feedback is generated by AI and checked automatically. Every quoted piece of evidence must match the
          student’s actual words. It can still be wrong, so use the “This feedback seems wrong” button whenever
          something looks off. Levels (1 to 4) describe one piece of writing against a practice rubric. They are not
          school grades, a grade-level score, or any kind of diagnosis.
        </p>
      </section>

      <section className="lw-card">
        <h2>Deleting information</h2>
        <p>
          On the <a href="/learn/dashboard">Students</a> page you can download all of a student’s data as a file, or delete the
          profile at any time. Deleting permanently removes the student’s writing, feedback, notes and progress from our database. To delete your adult
          account or ask a question, email <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a>.
        </p>
      </section>
    </article>
  );
}
