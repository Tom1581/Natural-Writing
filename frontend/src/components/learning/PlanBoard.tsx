'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { localize } from '@/lib/learning/localize';
import { useLearners, useSession } from '@/lib/learning/session';
import { TOPICS, type PlanItem, type PlanView } from '@/lib/learning/types';

const KIND_LABEL: Record<PlanItem['kind'], string> = {
  check_in: 'Check-in',
  lesson: 'Lesson + writing',
  prompt: 'Writing',
  drill: 'Quick practice',
  checkpoint: 'Checkpoint',
};

const TOPIC_LABEL: Record<string, string> = {
  animals: 'Animals',
  nature: 'Nature',
  science: 'Science',
  sports: 'Sports',
  arts: 'Arts & music',
  technology: 'Technology',
  school: 'School life',
  community: 'Community',
  adventure: 'Adventure',
  food: 'Food',
};

const SKILL_OPTIONS: { id: string; name: string }[] = [
  { id: 'purpose.claim', name: 'Clear opinion or claim' },
  { id: 'purpose.story', name: 'Story setup' },
  { id: 'purpose.topic', name: 'Clear topic and focus' },
  { id: 'organization.structure', name: 'Organization' },
  { id: 'development.evidence', name: 'Reasons and evidence' },
  { id: 'development.detail', name: 'Story details' },
  { id: 'development.information', name: 'Facts and explanation' },
  { id: 'sentences.control', name: 'Sentences' },
  { id: 'word_choice.precision', name: 'Word choice' },
  { id: 'conventions.mechanics', name: 'Conventions' },
];

function hrefFor(item: PlanItem, promptId = item.promptId) {
  if (item.kind === 'lesson' && item.lessonId) return `/learn/lessons/${item.lessonId}`;
  if (item.kind === 'drill' && item.drillId) return `/learn/practice/${item.drillId}`;
  return promptId ? `/learn/write/${promptId}` : '/learn/dashboard';
}

const fmt = (iso: string | null) => (iso ? new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }) : '');

export default function PlanBoard() {
  const { kind, ready } = useSession();
  const { active } = useLearners(!!kind);
  const [view, setView] = useState<PlanView | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const activeId = active?.id;

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    learningApi
      .plan(activeId)
      .then((v) => !cancelled && setView(v))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load the plan.'));
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (!kind) return <SignInPrompt what="see your plan" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!view || view.learner.id !== activeId) return <p className="lw-muted">Loading your plan…</p>;

  const { plan, preferences, learner } = view;
  const L = (t: string) => localize(t, learner.curriculum);
  const done = plan.items.filter((i) => i.done).length;

  async function save(fn: () => Promise<PlanView>) {
    setSaving(true);
    setError(null);
    try {
      setView(await fn());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save.');
    } finally {
      setSaving(false);
    }
  }

  const toggleTopic = (t: string) =>
    save(() =>
      learningApi.updatePreferences(learner.id, {
        interests: preferences.interests.includes(t as never) ? preferences.interests.filter((x) => x !== t) : [...preferences.interests, t],
      }),
    );

  return (
    <>
      <p className="lw-eyebrow">
        <Link href="/learn/dashboard">{learner.displayName}</Link> · {learner.gradeLabel}
      </p>
      <h1>{plan.status === 'check_in' ? 'First, the writing check-in' : 'Your two-week plan'}</h1>

      {plan.status !== 'check_in' && plan.mainGoal && (
        <div className="lw-grid lw-grid-2" style={{ marginBottom: 20 }}>
          <div className="lw-card lw-card-accent">
            <p className="lw-eyebrow">Main goal</p>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{L(plan.mainGoal.name)}</h2>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>
              {plan.focusSetByAdult ? 'Chosen by your teacher or parent.' : `Chosen because your recent writing showed level ${plan.mainGoal.latestRating ?? '–'} of 4.`}
            </p>
          </div>
          <div className="lw-card">
            <p className="lw-eyebrow">Keep it strong</p>
            <h2 style={{ fontSize: '1.3rem', marginBottom: 4 }}>{plan.maintenance ? L(plan.maintenance.name) : '–'}</h2>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>
              {fmt(plan.startedAt)} – {fmt(plan.endsAt)} · {done} of {plan.items.length} done
            </p>
            <div className="lw-bar" style={{ marginTop: 10 }} aria-hidden="true">
              <span style={{ width: `${plan.items.length ? (done / plan.items.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>
      )}

      {plan.status === 'complete' && (
        <div className="lw-notice lw-notice-good" style={{ marginBottom: 16 }}>
          <strong>{plan.items.length && done === plan.items.length ? 'Plan complete. Nice work!' : 'This plan’s two weeks are over.'}</strong> Start a new plan based on
          your latest writing.{' '}
          <button className="lw-btn lw-btn-secondary lw-btn-small" type="button" disabled={saving} onClick={() => save(() => learningApi.restartPlan(learner.id))}>
            Start a new plan
          </button>
        </div>
      )}

      {[1, 2].map((week) => {
        const items = plan.items.filter((i) => i.week === week);
        if (!items.length) return null;
        return (
          <section key={week} className="lw-section" style={{ marginTop: 20 }}>
            {plan.status !== 'check_in' && <h2 style={{ fontSize: '1.2rem' }}>Week {week}</h2>}
            <ol className="lw-plan-list">
              {items.map((item) => (
                <li key={item.key} data-done={item.done} data-next={plan.next?.key === item.key}>
                  <span className="lw-plan-check" role="img" aria-label={item.done ? 'Done' : 'Not done yet'}>
                    {item.done ? '✓' : ''}
                  </span>
                  <div>
                    <p className="lw-small lw-muted" style={{ margin: 0 }}>
                      {KIND_LABEL[item.kind]} · about {item.minutes} min
                    </p>
                    <h3 style={{ margin: '2px 0 4px' }}>
                      <Link href={hrefFor(item)}>{item.title}</Link>
                    </h3>
                    <p className="lw-small" style={{ margin: 0 }}>{L(item.reason)}</p>
                    {item.alternative && !item.done && (
                      <p className="lw-small" style={{ margin: '4px 0 0' }}>
                        Or choose instead: <Link href={hrefFor(item, item.alternative.promptId)}>{item.alternative.title}</Link>
                      </p>
                    )}
                  </div>
                  {plan.next?.key === item.key && (
                    <Link className="lw-btn lw-btn-primary lw-btn-small" href={hrefFor(item)}>
                      Start
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </section>
        );
      })}

      <section className="lw-section lw-grid lw-grid-2">
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>How often</h2>
          <p className="lw-small lw-muted">Short sessions a few times a week work better than one long one.</p>
          <div className="lw-seg" role="group" aria-label="Sessions per week">
            {[2, 3, 4].map((n) => (
              <button
                key={n}
                type="button"
                aria-pressed={preferences.sessionsPerWeek === n}
                disabled={saving}
                onClick={() => save(() => learningApi.updatePreferences(learner.id, { sessionsPerWeek: n }))}
              >
                {n} a week
              </button>
            ))}
          </div>
          <h2 style={{ fontSize: '1.15rem', marginTop: 20 }}>I like writing about…</h2>
          <div className="lw-chips" role="group" aria-label="Interests">
            {TOPICS.map((t) => (
              <button key={t} type="button" className="lw-chip" aria-pressed={preferences.interests.includes(t)} disabled={saving} onClick={() => toggleTopic(t)}>
                {TOPIC_LABEL[t]}
              </button>
            ))}
          </div>
          <p className="lw-small lw-muted" style={{ marginBottom: 0 }}>Used to pick prompts you’ll enjoy. Optional.</p>
        </div>
        {kind === 'adult' && (
          <div className="lw-card">
            <h2 style={{ fontSize: '1.15rem' }}>Focus (parents and teachers)</h2>
            <p className="lw-small lw-muted">Choose the main goal yourself, or let the plan choose from {learner.displayName}’s writing. Changing it starts a new plan.</p>
            <select
              className="lw-select"
              value={preferences.focusSkillId ?? ''}
              disabled={saving}
              onChange={(e) => save(() => learningApi.setFocus(learner.id, e.target.value || null))}
              aria-label="Main goal"
            >
              <option value="">Choose automatically</option>
              {SKILL_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {L(s.name)}
                </option>
              ))}
            </select>
            {plan.status !== 'check_in' && (
              <button className="lw-btn lw-btn-quiet lw-btn-small" type="button" style={{ marginTop: 12 }} disabled={saving} onClick={() => save(() => learningApi.restartPlan(learner.id))}>
                Restart the plan now
              </button>
            )}
          </div>
        )}
      </section>
    </>
  );
}
