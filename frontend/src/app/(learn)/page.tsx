import type { Metadata } from 'next';
import Link from 'next/link';
import ConverterCallout from '@/components/learning/ConverterCallout';
import HeroIllustration from '@/components/learning/HeroIllustration';
import { getCatalog, gradeSlug, SITE_URL, usGradeName } from '@/lib/learning/public';
import { BAND_LABELS, BAND_ORDER } from '@/lib/learning/levels';
import { GUIDES } from '@/lib/learning/guides';
import { GENRE_NAMES, ldJson, PUBLISHER } from '@/lib/learning/seo';
import { BandChip, BandScene, FeatureIcon, SkillIcon } from '@/components/learning/icons';

export const metadata: Metadata = {
  title: { absolute: 'Natural Quill: K–12 Writing Practice with Specific Feedback' },
  description:
    'Writing lessons, prompts, rubrics and AI feedback that quotes the student’s own words and asks them to revise, from kindergarten to grade 12. Aligned to Common Core, Ontario, the National Curriculum in England and the Australian Curriculum. No ads.',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Natural Quill Writing Studio: writing practice with specific feedback',
    description: 'Short lessons, grade-level prompts and feedback that points to the student’s own sentences. Kindergarten to grade 12, aligned to US, Canadian, UK and Australian curricula.',
    url: SITE_URL,
    type: 'website',
  },
};

const FAQ = [
  {
    q: 'Does the AI write or rewrite the student’s work?',
    a: 'No. Feedback names one or two strengths and one next step, and gives a question or hint so the student makes the change. It never supplies sentences to copy.',
  },
  {
    q: 'How is the feedback checked?',
    a: 'Every rating must quote the student’s actual words, and the server checks each quote against the submitted text. Feedback with invented quotes is discarded. Teachers and parents can adjust any level and leave a note.',
  },
  {
    q: 'Which grades does it cover?',
    a: 'Kindergarten to grade 12 (Foundation to Year 12 in Australia; Years 1–13 in England). Grades 3–8 are fully available. Kindergarten to grade 2, where children talk about pictures and an adult can type their words, and grades 9–12, with source-based argument and synthesis, are in early access while we check feedback against teacher ratings.',
  },
  {
    q: 'Which curricula does it follow?',
    a: 'Each rubric skill is mapped to the Common Core State Standards (US), the Ontario Language curriculum (Canada), the National Curriculum in England, and the Australian Curriculum v9.0, with official wording quoted for every grade or year.',
  },
  {
    q: 'What do the levels mean?',
    a: 'Each skill is rated 1 (getting started) to 4 (beyond the goal) for one piece of writing. Level 3 means the piece meets the goal for that task. Levels are practice guidance, not school grades or a grade-level score.',
  },
  {
    q: 'Is it safe for children?',
    a: 'Anyone can practice without an account, and then we store nothing: the draft stays in their browser. For saved work, an adult creates the profile and agrees to the learning notice (students 13 or older can make their own). Students can sign in with a code that opens only their own work. Learning pages carry no ads or marketing trackers, and profiles can be exported or deleted at any time.',
  },
  {
    q: 'Is it free?',
    a: 'Yes. Lessons, practice sets, curriculum pages and writing feedback are free during the pilot, and you can write and get feedback without an account. An account adds saved drafts, a plan, progress reports and a portfolio.',
  },
];

const FEATURES = [
  { icon: 'quote', title: 'Feedback with evidence', body: 'A level for each skill, the sentence it’s based on, and one clear next step.' },
  { icon: 'check', title: '“Am I on track?”', body: 'Check a draft against the success checklist before submitting. No score, and nothing written for you.' },
  { icon: 'growth', title: 'Revise and see growth', body: 'Resubmit after revising and see which skills went up, then reflect on what changed.' },
  { icon: 'plan', title: 'A plan that adapts', body: 'A two-piece check-in, then lessons for the skill that needs it most, then fresh prompts to prove it.' },
  { icon: 'drill', title: 'Quick practice sets', body: 'Five-minute drills on sentences, transitions, word choice, punctuation and sources.' },
  { icon: 'report', title: 'Reports and portfolios', body: 'Printable progress reports linked to your curriculum’s wording, and a portfolio of best work.' },
  { icon: 'teacher', title: 'Teacher tools', body: 'Classes, assignments, a review queue and the power to correct any AI rating.' },
  { icon: 'reader', title: 'Built for every reader', body: 'Read-aloud, larger text, dictation, keyboard-friendly, with US, Canadian, British or Australian spelling.' },
];

const BAND_BLURB: Record<string, { ages: string; what: string }> = {
  'K-2': { ages: 'Ages 5–8', what: 'Picture prompts, telling before writing, and short feedback read aloud.' },
  '3-5': { ages: 'Ages 8–11', what: 'Reasons with examples, paragraphs, story order and sentences.' },
  '6-8': { ages: 'Ages 11–14', what: 'Claims and evidence, explaining significance, pacing and style.' },
  '9-10': { ages: 'Ages 14–16', what: 'Source-based argument with counterclaims, analysis and narrative craft.' },
  '11-12': { ages: 'Ages 16–18', what: 'Synthesis of sources that disagree, qualified claims, voice.' },
};

export default async function StudioHome() {
  const catalog = await getCatalog();
  const skillName = (id: string) => catalog?.skills.find((s) => s.id === id)?.name ?? id;
  const siteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Natural Quill',
    alternateName: ['Natural Quill Writing Studio', 'NaturalQuill'],
    url: SITE_URL,
    publisher: PUBLISHER,
    inLanguage: 'en',
    audience: { '@type': 'EducationalAudience', educationalRole: ['student', 'parent', 'teacher'] },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(siteLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(faqLd) }} />
      <section className="lw-hero">
        <div>
          <p className="lw-eyebrow">Writing practice · Kindergarten to Grade 12</p>
          <h1>Build real writing skills, one draft at a time.</h1>
          <p className="lw-lede">
            Students write to a short prompt, get feedback that points to their own sentences, and revise. Every piece shows which skills are growing
            and what to practice next, matched to your school’s curriculum.
          </p>
          <div className="lw-btn-row">
            <Link className="lw-btn lw-btn-primary lw-btn-large" href="/learn/grades">
              Start writing practice
            </Link>
            <Link className="lw-btn lw-btn-secondary lw-btn-large" href="/learn/sign-in">
              Sign in
            </Link>
          </div>
          <p className="lw-small lw-muted" style={{ margin: '10px 0 0' }}>
            No account or code needed to practice. Sign in to save your work and see progress over time.
          </p>
          <ul className="lw-badges" aria-label="Aligned curricula">
            <li>Common Core (US)</li>
            <li>Ontario Language (Canada)</li>
            <li>National Curriculum (England)</li>
            <li>Australian Curriculum v9.0</li>
          </ul>
        </div>
        <HeroIllustration />
      </section>
      <ConverterCallout />

      <section className="lw-section">
        <h2>How it works</h2>
        <ol className="lw-flow">
          <li>
            <strong>Check-in</strong>
            <span>Two short pieces show what the student already does well. No timer, no pass or fail.</span>
          </li>
          <li>
            <strong>Learn</strong>
            <span>A short lesson on the skill that needs it most: explanation, model, non-example, practice.</span>
          </li>
          <li>
            <strong>Write</strong>
            <span>A new prompt with a success checklist and planning space, plus an optional “Am I on track?” check.</span>
          </li>
          <li>
            <strong>Feedback &amp; revise</strong>
            <span>Levels with quoted evidence, one next step, then revision and reflection. Show it again on a fresh prompt.</span>
          </li>
        </ol>
      </section>

      <section className="lw-section" aria-labelledby="grades-title">
        <div className="lw-card-title">
          <h2 id="grades-title">Find your grade</h2>
          <Link href="/learn/grades">Compare grades and years</Link>
        </div>
        <div className="lw-bands">
          {(catalog?.bands ?? []).map((b) => (
            <div key={b.id} className="lw-band-card lw-banded" data-band={b.id}>
              <BandScene band={b.id} />
              <h3>{BAND_LABELS[b.id]}</h3>
              <p className="lw-small lw-muted" style={{ margin: 0 }}>
                {BAND_BLURB[b.id].ages}
                {b.status === 'early_access' && ' · early access'}
              </p>
              <p className="lw-small" style={{ margin: 0 }}>{BAND_BLURB[b.id].what}</p>
              <nav className="lw-band-grades" aria-label={`${BAND_LABELS[b.id]} grades`}>
                {b.grades.map((g) => (
                  <Link key={g} href={`/learn/grades/${gradeSlug(g)}`}>
                    {usGradeName(g)}
                  </Link>
                ))}
              </nav>
            </div>
          ))}
        </div>
        <p className="lw-small lw-muted" style={{ marginTop: 10 }}>
          Each grade page shows the same age group as an Ontario grade, an England year and an Australian year.
        </p>
      </section>

      <section className="lw-section">
        <div className="lw-grid lw-cols-4">
          {FEATURES.map((f) => (
            <div key={f.title} className="lw-feature">
              <span className="lw-card-icon">
                <FeatureIcon name={f.icon} />
              </span>
              <h3>{f.title}</h3>
              <p className="lw-small lw-muted">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="lw-section lw-card lw-curriculum-band">
        <div>
          <p className="lw-eyebrow">Curriculum alignment</p>
          <h2>The same goals your teachers use</h2>
          <p className="lw-muted">
            Each skill we rate is mapped to the official writing statements for every grade or year, quoted word for word with links to the source.
          </p>
          <Link className="lw-btn lw-btn-secondary" href="/learn/curriculum">
            See the alignment
          </Link>
        </div>
        <ul className="lw-plain-list">
          <li>
            <Link href="/learn/curriculum/us-ccss">United States: Common Core, Kindergarten to Grade 12</Link>
          </li>
          <li>
            <Link href="/learn/curriculum/ca-on">Canada: Ontario Language and English, Grades 1–12</Link>
          </li>
          <li>
            <Link href="/learn/curriculum/uk-eng">United Kingdom: National Curriculum in England, Years 1–13</Link>
          </li>
          <li>
            <Link href="/learn/curriculum/au-ac9">Australia: Australian Curriculum, Foundation to Year 12</Link>
          </li>
        </ul>
      </section>

      <section className="lw-section">
        <div className="lw-card-title">
          <h2>Lessons</h2>
          <Link href="/learn/lessons">All {catalog?.lessons.length ?? ''} lessons</Link>
        </div>
        {catalog ? (
          <div className="lw-grid lw-cols-5" style={{ marginTop: 16 }}>
            {BAND_ORDER.flatMap((band) => catalog.lessons.filter((l) => l.band === band).slice(0, 2)).map((l) => (
              <Link key={l.id} href={`/learn/lessons/${l.id}`} className="lw-card lw-link-card lw-banded" data-band={l.band}>
                <span className="lw-card-icon">
                  <SkillIcon skillId={l.skillId} size={22} />
                </span>
                <h3>{l.title}</h3>
                <p className="lw-muted lw-small" style={{ margin: 0 }}>
                  {skillName(l.skillId)} · about {l.minutes} min
                </p>
                <div style={{ marginTop: 10 }}>
                  <BandChip band={l.band} short />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <p className="lw-notice">Lessons are loading slowly right now. Please refresh in a minute.</p>
        )}
      </section>

      <section className="lw-section lw-grid lw-grid-2">
        <div className="lw-card">
          <h2>For parents</h2>
          <p>
            Create a profile for each child, give them a sign-in code, and let them practice. See their writing, feedback and progress report any
            time, and export or delete everything.
          </p>
          <p className="lw-muted lw-small">We ask for a first name or nickname and a school year, nothing more.</p>
          <Link href="/learn/privacy">How we handle your child’s writing</Link>
        </div>
        <div className="lw-card">
          <h2>For teachers</h2>
          <p>
            Group students into classes, assign a prompt (with or without a lesson), and see how many students are at each level per skill. Open any
            piece to adjust a level or leave a note; the student’s plan updates.
          </p>
          <Link href="/learn/teach">Open teacher tools</Link>
        </div>
      </section>

      <section className="lw-section">
        <div className="lw-card-title">
          <h2>What good writing looks like</h2>
          <Link href="/learn/examples">All {catalog?.examples?.length ?? ''} examples</Link>
        </div>
        <p className="lw-muted" style={{ maxWidth: '46em' }}>
          Annotated model pieces for every age, rated skill by skill, with notes on what works and how to go further.
        </p>
        <div className="lw-grid lw-cols-5" style={{ marginTop: 12 }}>
          {BAND_ORDER.map((band) => catalog?.examples?.find((e) => e.band === band && e.genre === (band === 'K-2' ? 'narrative' : band === '3-5' ? 'opinion' : band === '6-8' ? 'informative' : band === '9-10' ? 'opinion' : 'narrative')))
            .filter((e): e is NonNullable<typeof e> => !!e)
            .map((e) => (
              <Link key={e.id} href={`/learn/examples/${e.id}`} className="lw-card lw-link-card lw-banded" data-band={e.band}>
                <BandChip band={e.band} short />
                <h3 style={{ marginTop: 10 }}>{e.title}</h3>
                <p className="lw-small lw-muted" style={{ margin: 0 }}>{GENRE_NAMES[e.genre]}</p>
              </Link>
            ))}
        </div>
      </section>

      <section className="lw-section">
        <div className="lw-card-title">
          <h2>Guides for parents and teachers</h2>
          <Link href="/learn/guides">All guides</Link>
        </div>
        <div className="lw-grid lw-cols-3" style={{ marginTop: 16 }}>
          {GUIDES.slice(0, 6).map((g) => (
            <Link key={g.slug} href={`/learn/guides/${g.slug}`} className="lw-card lw-link-card">
              <span className="lw-pill">{g.audience}</span>
              <h3 style={{ marginTop: 10 }}>{g.title}</h3>
            </Link>
          ))}
        </div>
        <p className="lw-small" style={{ marginTop: 12 }}>
          Also see the free <Link href="/learn/rubrics">writing rubrics</Link> and <Link href="/learn/prompts">prompt library</Link>.
        </p>
      </section>

      <section className="lw-section">
        <h2>Questions</h2>
        <div className="lw-faq">
          {FAQ.map((f) => (
            <details key={f.q} className="lw-card">
              <summary>
                <strong>{f.q}</strong>
              </summary>
              <p style={{ marginTop: 10, marginBottom: 0 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="lw-section">
        <p className="lw-notice">
          This is an early version. Lessons and rubrics are written for this pilot and are still being reviewed by classroom teachers. Results are
          practice guidance, not school grades, and not a measure of grade level.
        </p>
      </section>
    </>
  );
}
