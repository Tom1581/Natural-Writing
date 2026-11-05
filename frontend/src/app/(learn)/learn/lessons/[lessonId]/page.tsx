import type { Metadata } from 'next';
import { BandChip, SkillIcon } from '@/components/learning/icons';
import ReviewBadge from '@/components/learning/ReviewBadge';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AlignmentPanel from '@/components/learning/AlignmentPanel';
import GuidedQuestion from '@/components/learning/GuidedQuestion';
import LocalizedText from '@/components/learning/LocalizedText';
import ReadAloud from '@/components/learning/ReadAloud';
import { getCatalog, getLesson, SITE_URL } from '@/lib/learning/public';
import { BAND_LABELS, UK_YEARS_BY_BAND } from '@/lib/learning/levels';
import type { Lesson } from '@/lib/learning/types';

type Props = { params: Promise<{ lessonId: string }> };


/** Pre-render every lesson at build time; new ones render on first request. */
export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog?.lessons ?? []).map((x) => ({ lessonId: x.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const lesson = await getLesson((await params).lessonId);
  if (!lesson) return { title: 'Lesson not found' };
  const title = `${lesson.title}: ${BAND_LABELS[lesson.band]} Writing Lesson`;
  const description = `${lesson.objective} A ${lesson.minutes}-minute lesson for ${BAND_LABELS[lesson.band].toLowerCase()} (${UK_YEARS_BY_BAND[lesson.band]} in England), with a model, a non-example, practice and a writing task. Aligned to Common Core, Ontario, England and Australian curricula.`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/lessons/${lesson.id}` },
    openGraph: { title, description, url: `${SITE_URL}/learn/lessons/${lesson.id}`, type: 'article' },
  };
}

function lessonJsonLd(lesson: Lesson) {
  const alignments = lesson.alignment.flatMap((block) =>
    block.grades.flatMap((g) =>
      g.statements.map((st) => ({
        '@type': 'AlignmentObject',
        alignmentType: 'teaches',
        educationalFramework: block.framework.shortName,
        targetName: st.framework === 'uk-eng' ? `${st.scope}: ${st.code}` : st.shortCode,
        ...(st.text ? { targetDescription: st.text } : {}),
        targetUrl: st.url,
      })),
    ),
  );
  const unique = [...new Map(alignments.map((a) => [`${a.educationalFramework}|${a.targetName}`, a])).values()];
  return {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: lesson.title,
    description: lesson.objective,
    url: `${SITE_URL}/learn/lessons/${lesson.id}`,
    learningResourceType: 'Lesson',
    educationalLevel: BAND_LABELS[lesson.band],
    teaches: lesson.skill?.name,
    timeRequired: `PT${lesson.minutes}M`,
    inLanguage: 'en',
    isAccessibleForFree: true,
    audience: { '@type': 'EducationalAudience', educationalRole: 'student' },
    publisher: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL },
    educationalAlignment: unique,
  };
}

export default async function LessonPage({ params }: Props) {
  const lesson = await getLesson((await params).lessonId);
  if (!lesson) notFound();
  const readText = [lesson.objective, ...lesson.explanation, 'Example.', lesson.model.text, ...lesson.model.annotations].join(' ');

  return (
    <article className="lw-lesson">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(lessonJsonLd(lesson)).replace(/</g, '\\u003c') }} />
      <Breadcrumbs items={[{ name: 'Lessons', href: '/learn/lessons' }, { name: lesson.title, href: `/learn/lessons/${lesson.id}` }]} />
      <div className="lw-card-meta">
        <BandChip band={lesson.band} />
        <span className="lw-pill lw-skill-label">
          <SkillIcon skillId={lesson.skillId} size={16} /> {lesson.skill?.name}
        </span>
        <span className="lw-small lw-muted">about {lesson.minutes} minutes</span>
      </div>
      <h1>{lesson.title}</h1>
      <ReviewBadge itemId={lesson.id} />
      <p className="lw-lede" style={{ fontSize: '1.15rem' }}>
        <strong>Goal:</strong> <LocalizedText text={lesson.objective} />
      </p>
      <ReadAloud text={readText} label="Read this lesson aloud" />

      <section className="lw-card lw-step-card" data-step="1">
        <h2>Learn</h2>
        {lesson.explanation.map((p) => (
          <p key={p}>
            <LocalizedText text={p} />
          </p>
        ))}
      </section>

      <section className="lw-card lw-step-card" data-step="2">
        <h2>See it in action</h2>
        <p className="lw-model">
          <LocalizedText text={lesson.model.text} />
        </p>
        <ul className="lw-list">
          {lesson.model.annotations.map((a) => (
            <li key={a}>
              <LocalizedText text={a} />
            </li>
          ))}
        </ul>
        <h3 style={{ marginTop: 20 }}>What’s missing here?</h3>
        <p className="lw-model lw-model-weak">
          <LocalizedText text={lesson.nonExample.text} />
        </p>
        <details>
          <summary style={{ cursor: 'pointer', fontWeight: 600 }}>Think first, then check</summary>
          <p style={{ marginTop: 8 }}>
            <LocalizedText text={lesson.nonExample.whatIsMissing} />
          </p>
        </details>
      </section>

      <section className="lw-card lw-step-card" data-step="3">
        <h2>Try it</h2>
        <GuidedQuestion guided={lesson.guided} />
        {lesson.drills.length > 0 && (
          <p className="lw-small" style={{ marginTop: 12 }}>
            More practice:{' '}
            {lesson.drills.map((d, i) => (
              <span key={d.id}>
                {i > 0 && ', '}
                <Link href={`/learn/practice/${d.id}`}>{d.title}</Link>
              </span>
            ))}
          </p>
        )}
      </section>

      <section className="lw-card lw-step-card" data-step="4">
        <h2>Now write your own</h2>
        <p>
          Use what you just practiced on a new topic: <strong>{lesson.practicePrompt.title}</strong>.
        </p>
        <p className="lw-muted lw-small">
          When you’re done: <LocalizedText text={lesson.exitCheck} />
        </p>
        <p className="lw-muted lw-small">
          Reflect: <LocalizedText text={lesson.reflection} />
        </p>
        <Link className="lw-btn lw-btn-primary" href={`/learn/write/${lesson.practicePrompt.id}?lesson=${lesson.id}`}>
          Start writing
        </Link>
      </section>

      <div style={{ marginTop: 24 }}>
        <AlignmentPanel alignment={lesson.alignment} />
      </div>

      {lesson.review.status === 'pilot' && (
        <p className="lw-small lw-muted" style={{ marginTop: 20 }}>
          Pilot lesson: written for this early version and awaiting review by a classroom teacher.
        </p>
      )}
    </article>
  );
}
