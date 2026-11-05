import type { Metadata } from 'next';
import ReviewBadge from '@/components/learning/ReviewBadge';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import PictureSet from '@/components/learning/PictureSet';
import { BAND_LABELS, LEVEL_LABELS, UK_YEARS_BY_BAND } from '@/lib/learning/levels';
import { getCatalog, getPromptPublic, SITE_URL } from '@/lib/learning/public';
import { GENRE_NAMES, ldJson, PUBLISHER } from '@/lib/learning/seo';

type Props = { params: Promise<{ promptId: string }> };

/** Only library prompts get public pages; check-ins and checkpoints stay unseen until a student meets them. */
export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog?.prompts ?? []).filter((p) => !p.checkIn && !p.checkpoint).map((p) => ({ promptId: p.id }));
}

async function load(id: string) {
  const prompt = await getPromptPublic(id);
  return prompt && !prompt.checkIn && !prompt.checkpoint ? prompt : null;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prompt = await load((await params).promptId);
  if (!prompt) return { title: 'Prompt not found' };
  const kind = GENRE_NAMES[prompt.genre].toLowerCase();
  const title = `${prompt.title}: ${BAND_LABELS[prompt.band]} ${GENRE_NAMES[prompt.genre]} Writing Prompt`;
  const description = `${prompt.task.length > 150 ? `${prompt.task.slice(0, 147)}…` : prompt.task} A free ${kind} writing prompt for ${BAND_LABELS[prompt.band].toLowerCase()} with a success checklist, planning questions and rubric.`;
  return {
    title,
    description,
    alternates: { canonical: `/learn/prompts/${prompt.id}` },
    openGraph: { title, description, url: `${SITE_URL}/learn/prompts/${prompt.id}`, type: 'article' },
  };
}

export default async function PromptPage({ params }: Props) {
  const prompt = await load((await params).promptId);
  if (!prompt) notFound();
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: prompt.title,
    description: prompt.task,
    learningResourceType: 'Writing prompt',
    educationalLevel: BAND_LABELS[prompt.band],
    inLanguage: 'en',
    isAccessibleForFree: true,
    timeRequired: prompt.band === 'K-2' ? 'PT10M' : prompt.band === '3-5' ? 'PT20M' : prompt.band === '6-8' ? 'PT25M' : 'PT40M',
    url: `${SITE_URL}/learn/prompts/${prompt.id}`,
    publisher: PUBLISHER,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: ldJson(ld) }} />
      <Breadcrumbs items={[{ name: 'Prompts', href: '/learn/prompts' }, { name: prompt.title, href: `/learn/prompts/${prompt.id}` }]} />
      <p className="lw-eyebrow">
        {BAND_LABELS[prompt.band]} · {UK_YEARS_BY_BAND[prompt.band]} in England · {GENRE_NAMES[prompt.genre]}
      </p>
      <h1>{prompt.title}</h1>
      <ReviewBadge itemId={prompt.id} />
      <div className="lw-grid lw-grid-2" style={{ alignItems: 'start' }}>
        <div>
          {prompt.picture && <PictureSet id={prompt.picture.id} description={prompt.picture.description} />}
          <p className="lw-lede">{prompt.task}</p>
          {prompt.adultGuide && (
            <p className="lw-notice">
              <strong>For the grown-up helping:</strong> {prompt.adultGuide}
            </p>
          )}
          {(prompt.sources ?? []).map((src) => (
            <div key={src.title} className="lw-source" style={{ marginBottom: 14 }}>
              <strong>{src.title}</strong>
              <p style={{ margin: '6px 0 0' }}>{src.text}</p>
            </div>
          ))}
          <div className="lw-btn-row lw-noprint" style={{ margin: '16px 0' }}>
            <Link className="lw-btn lw-btn-primary" href={`/learn/write/${prompt.id}`}>Write this with feedback</Link>
            <Link className="lw-btn lw-btn-secondary" href={`/learn/rubrics/${prompt.rubric.id}`}>See the rubric</Link>
          </div>
        </div>
        <div>
          <div className="lw-card">
            <h2 style={{ fontSize: '1.1rem' }}>Success checklist</h2>
            <ul className="lw-checklist">
              {prompt.successCriteria.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <h2 style={{ fontSize: '1.1rem' }}>Plan first</h2>
            <ul className="lw-list">
              {prompt.planningQuestions.map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>
              Suggested length: {prompt.suggestedWords.min}–{prompt.suggestedWords.max} words. Length is guidance, not part of the rating.
            </p>
          </div>
          <details className="lw-card" style={{ marginTop: 12 }}>
            <summary style={{ cursor: 'pointer' }}>
              <strong>What “meets the goal” looks like</strong>
            </summary>
            <ul className="lw-list lw-small" style={{ marginTop: 10 }}>
              {prompt.rubric.dimensions.map((d) => (
                <li key={d.skillId}>
                  <strong>{d.name}</strong> ({LEVEL_LABELS[3]}): {d.levels[3]}
                </li>
              ))}
            </ul>
          </details>
        </div>
      </div>
      <p className="lw-small lw-muted">
        Sources and pictures are written for this site, so no outside reading is needed. Signed-in students get feedback that quotes their own
        sentences, then revise.
      </p>
    </>
  );
}
