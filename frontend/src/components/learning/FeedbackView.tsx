'use client';
import { SkillIcon } from './icons';

import Link from 'next/link';
import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import LevelMeter from './LevelMeter';
import PictureSet from './PictureSet';
import ReadAloud from './ReadAloud';
import SignInPrompt from './SignInPrompt';
import SupportPanel from './SupportPanel';
import { learningApi, runUntilSettled } from '@/lib/learning/api';
import { localize } from '@/lib/learning/localize';
import { useSession } from '@/lib/learning/session';
import { feedbackHighlights, segments, type Highlight } from '@/lib/learning/highlights';
import type { JobStatus, SubmissionView } from '@/lib/learning/types';

/** Bands whose feedback has not yet been checked against teacher-rated samples. */
const EARLY_ACCESS_BANDS = ['K-2', '9-10', '11-12'];

function waitingMessage(job: JobStatus | null) {
  if (!job) return 'Getting your feedback ready…';
  if (job.state === 'running') return 'Reading your writing…';
  if (job.failureCode === 'rate_limited') {
    return `Lots of students are writing right now. Your writing is saved, and feedback should be ready in about ${Math.max(job.retryInSeconds ?? 20, 5)} seconds.`;
  }
  if (job.failureCode === 'daily_budget') {
    return 'Feedback has reached today’s limit for the free service. Your writing is saved and will get feedback automatically after midnight (UTC). You can keep writing or try a lesson in the meantime.';
  }
  if (job.failureCode === 'provider_unavailable') return 'The feedback service is slow right now. Your writing is saved; we’re trying again.';
  return 'Getting your feedback ready…';
}

export default function FeedbackView({ submissionId }: { submissionId: string }) {
  const { kind, ready } = useSession();
  const [adjusting, setAdjusting] = useState<string | null>(null);
  const [adjustRating, setAdjustRating] = useState<number>(3);
  const [adjustComment, setAdjustComment] = useState('');
  const [adjustError, setAdjustError] = useState<string | null>(null);
  const [view, setView] = useState<SubmissionView | null>(null);
  const [job, setJob] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [reflection, setReflection] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [reported, setReported] = useState(false);
  const [helpfulness, setHelpfulness] = useState<SubmissionView['helpfulness']>(null);
  const [inPortfolio, setInPortfolio] = useState(false);

  const load = useCallback(async () => {
    const v = await learningApi.submission(submissionId);
    setView(v);
    setJob(v.job);
    setReflection(v.reflection ?? '');
    setReflectionSaved(!!v.reflection);
    setReported(v.feedbackReported);
    setHelpfulness(v.helpfulness);
    setInPortfolio(v.inPortfolio);
    return v;
  }, [submissionId]);

  useEffect(() => {
    if (!kind) return;
    const controller = new AbortController();
    (async () => {
      try {
        const v = await load();
        if (v.job && (v.job.state === 'queued' || v.job.state === 'running')) {
          await runUntilSettled(v.job.jobId, setJob, controller.signal);
          if (!controller.signal.aborted) await load();
        }
      } catch (e) {
        if (!controller.signal.aborted) setError(e instanceof Error ? e.message : 'Could not load feedback.');
      }
    })();
    return () => controller.abort();
  }, [kind, load]);

  const highlights = useMemo<Highlight[]>(() => {
    const f = view?.feedback;
    return f ? feedbackHighlights(f, activeNote) : [];
  }, [view, activeNote]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (!kind) return <SignInPrompt what="see feedback" />;
  if (error) return <p role="alert" className="lw-notice lw-notice-warn">{error}</p>;
  if (!view) return <p className="lw-muted">Loading…</p>;

  const f = view.feedback;
  const latestOverride = (skillId: string) => [...view.overrides].reverse().find((o) => o.skillId === skillId);
  const overallComments = view.overrides.filter((o) => o.skillId === 'overall');
  const isAdult = kind === 'adult';
  const openFlags = view.safetyFlags.filter((fl) => fl.status === 'open');

  async function resolve(flagId: string) {
    const note = window.prompt('What did you do? (For example: “Talked with the student; it was a story.”)');
    if (!note?.trim()) return;
    await learningApi.resolveFlag(flagId, note);
    await load();
  }

  async function confirmRatings() {
    await learningApi.confirmRatings(view!.id);
    await load();
  }

  async function saveAdjustment(skillId: string) {
    setAdjustError(null);
    if (!adjustComment.trim()) {
      setAdjustError('Add a short note explaining the change; the student sees it.');
      return;
    }
    try {
      await learningApi.override(view!.id, { skillId, rating: skillId === 'overall' ? null : adjustRating, comment: adjustComment });
      setAdjusting(null);
      setAdjustComment('');
      await load();
    } catch (e) {
      setAdjustError(e instanceof Error ? e.message : 'Could not save.');
    }
  }
  const skillName = (id: string) => localize(view.skillNames[id] ?? id, view.learner.curriculum);
  const reviseHref = view.prompt ? `/learn/write/${view.prompt.id}` : '/learn/dashboard';
  const early = view.prompt?.band === 'K-2';
  const settledWithoutFeedback = job && !f && ['not_scored', 'needs_review', 'failed'].includes(job.state);

  async function retry() {
    if (!job) return;
    setError(null);
    try {
      const status = await learningApi.retryJob(job.jobId);
      setJob(status);
      if (status.state === 'queued' || status.state === 'running') await runUntilSettled(status.jobId, setJob);
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not try again.');
    }
  }

  const focusNote = (noteId: string) => {
    setActiveNote(noteId);
    // The mark may only exist after this render (skill evidence is shown on request).
    requestAnimationFrame(() => document.getElementById(`mark-${noteId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  return (
    <>
      <p className="lw-eyebrow">
        {view.attemptNumber === 1 ? 'First draft' : `Revision ${view.attemptNumber - 1}`} · {view.learner.displayName}, {view.learner.gradeLabel}
      </p>
      <h1>{view.prompt?.title ?? 'Your writing'}</h1>
      {view.support && <SupportPanel support={view.support} />}
      {isAdult && openFlags.length > 0 && (
        <section className="lw-alert" aria-labelledby="flags-title">
          <h2 id="flags-title">Wellbeing check</h2>
          <ul className="lw-plain-list">
            {openFlags.map((fl) => (
              <li key={fl.id}>
                <span>
                  <strong>{fl.level === 'urgent' ? 'Please read soon' : 'Worth a look'}</strong> · {fl.reason}{' '}
                  <span className="lw-small lw-muted">({fl.source === 'screen' ? 'phrase check' : 'AI check'})</span>
                </span>
                <button className="lw-btn lw-btn-secondary lw-btn-small" type="button" onClick={() => resolve(fl.id)}>
                  Mark as handled
                </button>
              </li>
            ))}
          </ul>
          <p className="lw-small" style={{ margin: 0 }}>
            This may be fiction. Flags never change the student’s levels. If a child is in immediate danger, contact emergency services.
          </p>
        </section>
      )}
      {isAdult && view.checks.length > 0 && (
        <div className="lw-notice" style={{ marginBottom: 16 }}>
          <strong>Worth a second look:</strong> {view.checks.join(' ')} Use “Adjust level” below if a rating seems off.
        </div>
      )}
      {view.inputMode === 'dictation' && <p className="lw-pill">Written with dictation · spelling not rated</p>}
      {view.inputMode === 'scribed' && <p className="lw-pill">Typed by a grown-up from the student’s words · spelling not rated</p>}
      {isAdult && view.prompt && EARLY_ACCESS_BANDS.includes(view.prompt.band) && (
        <p className="lw-notice lw-early-access" style={{ marginBottom: 16 }}>
          <strong>Early access:</strong> feedback for {view.prompt.band === 'K-2' ? 'Kindergarten to Grade 2' : `grades ${view.prompt.band}`} works end to end but has not yet
          been checked against teacher-rated samples. Please read it with your own judgment, and use “Adjust level” if a rating seems off.
        </p>
      )}
      {view.prompt?.picture && <PictureSet id={view.prompt.picture.id} description={view.prompt.picture.description} compact />}
      {view.assistanceMode === 'coached' && (
        <p className="lw-pill lw-pill-accent">Written with “Am I on track?” hints</p>
      )}

      {!f && !settledWithoutFeedback && (
        <div className="lw-card" role="status" aria-live="polite">
          <h2 style={{ fontSize: '1.15rem' }}>Your writing is saved</h2>
          <p style={{ margin: 0 }}>{waitingMessage(job)}</p>
        </div>
      )}

      {settledWithoutFeedback && (
        <div className="lw-card" role="status">
          {job.state === 'not_scored' ? (
            <>
              <h2 style={{ fontSize: '1.15rem' }}>Write a little more first</h2>
              <p>There isn’t enough writing yet to give useful feedback. Add a few more sentences and submit again.</p>
              <Link className="lw-btn lw-btn-primary" href={reviseHref}>Keep writing</Link>
            </>
          ) : (
            <>
              <h2 style={{ fontSize: '1.15rem' }}>Your writing is saved. The feedback needs another look.</h2>
              <p>We couldn’t produce feedback we trust this time, so we didn’t show any. You can try again now.</p>
              <div className="lw-btn-row">
                <button className="lw-btn lw-btn-primary" type="button" onClick={retry}>Try again</button>
                <Link className="lw-btn lw-btn-secondary" href={reviseHref}>Back to my draft</Link>
              </div>
            </>
          )}
        </div>
      )}

      {f && (
        <>
          {view.draftChangedSinceSubmission && (
            <p className="lw-notice" style={{ marginBottom: 16 }}>
              You’ve changed your draft since this feedback. Highlights refer to the version below.
            </p>
          )}
          <p className="lw-lede" style={{ fontSize: '1.1rem', maxWidth: '50em' }}>{f.summary}</p>
          {(early || view.learner.supports?.readAloud) && (
            <ReadAloud
              text={[f.summary, ...f.strengths.map((s) => s.message), ...f.nextSteps.map((n) => `${n.message} ${n.hint}`)].join(' ')}
              label="Read my feedback aloud"
            />
          )}
          {overallComments.map((o) => (
            <div key={o.createdAt} className="lw-note lw-note-teacher" style={{ maxWidth: '50em' }}>
              <h3>Note from your teacher</h3>
              <p style={{ margin: 0 }}>{o.comment}</p>
            </div>
          ))}

          <div className="lw-feedback-layout">
            <section className="lw-card" aria-label="Your submitted writing">
              <h2 style={{ fontSize: '1.1rem' }}>What you wrote</h2>
              <div className="lw-submitted">
                {segments(view.text, highlights).map((s, i) =>
                  s.noteId ? (
                    <mark key={i} id={`mark-${s.noteId}`} data-kind={s.kind} data-active={activeNote === s.noteId} onClick={() => setActiveNote(s.noteId!)}>
                      {s.text}
                    </mark>
                  ) : (
                    <Fragment key={i}>{s.text}</Fragment>
                  ),
                )}
              </div>
            </section>

            <section aria-label="Feedback">
              {f.strengths.map((s, i) => (
                <div key={`s${i}`} className="lw-note lw-note-strength" data-active={activeNote === `strength-${i}`}>
                  <h3>What works · {skillName(s.skillId)}</h3>
                  <p style={{ margin: 0 }}>{s.message}</p>
                  {s.quote && (
                    <button type="button" className="lw-btn lw-btn-quiet lw-small" onClick={() => focusNote(`strength-${i}`)}>Show in my writing</button>
                  )}
                </div>
              ))}

              {f.nextSteps.map((n, i) => (
                <div key={`n${i}`} className="lw-note lw-note-next">
                  <h3>{i === 0 ? 'Try next' : 'Also try'} · {skillName(n.skillId)}</h3>
                  <p style={{ margin: 0 }}>{n.message}</p>
                  <p className="lw-hint"><strong>Think about it:</strong> {n.hint}</p>
                </div>
              ))}

              <div className="lw-helpful" role="group" aria-label="Was this feedback helpful?">
                <span className="lw-small">Was this feedback helpful?</span>
                {(['yes', 'somewhat', 'no'] as const).map((v) => (
                  <button
                    key={v}
                    type="button"
                    className="lw-btn lw-btn-quiet lw-btn-small"
                    aria-pressed={helpfulness === v}
                    onClick={async () => {
                      setHelpfulness(v);
                      await learningApi.setHelpfulness(view.id, v).catch(() => setHelpfulness(view.helpfulness));
                    }}
                  >
                    {v === 'yes' ? 'Yes' : v === 'somewhat' ? 'Somewhat' : 'Not really'}
                  </button>
                ))}
                {helpfulness && <span className="lw-small lw-muted" role="status">Thanks, that helps us improve.</span>}
              </div>

              <div className="lw-btn-row" style={{ margin: '8px 0 20px' }}>
                <Link className="lw-btn lw-btn-primary" href={reviseHref}>Revise this draft</Link>
                <button
                  type="button"
                  className="lw-btn lw-btn-secondary"
                  aria-pressed={inPortfolio}
                  onClick={async () => {
                    const next = !inPortfolio;
                    setInPortfolio(next);
                    await learningApi.setPortfolio(view.id, next).catch(() => setInPortfolio(!next));
                  }}
                >
                  {inPortfolio ? 'In my portfolio ✓' : 'Add to my portfolio'}
                </button>
                {view.suggestedLesson && (
                  <Link className="lw-btn lw-btn-secondary" href={`/learn/lessons/${view.suggestedLesson.id}`}>Lesson: {view.suggestedLesson.title}</Link>
                )}
              </div>

              <div className="lw-card">
                <h2 style={{ fontSize: '1.1rem' }}>Skill levels for this draft</h2>
                <ul className="lw-levels">
                  {f.dimensions.map((d) => {
                    const override = latestOverride(d.skillId);
                    const rating = override?.rating ?? d.rating;
                    const before = view.previousRatings?.[d.skillId];
                    const improved = typeof before === 'number' && rating !== null && rating > before;
                    return (
                      <li key={d.skillId} className="lw-level-row">
                        <div>
                          <strong className="lw-skill-label">
                            <SkillIcon skillId={d.skillId} size={18} /> {skillName(d.skillId)}
                          </strong>{' '}
                          {improved && <span className="lw-change-up">↑ up from {before}</span>}
                          <div className="lw-small lw-muted">
                            {d.evidenceState === 'not_applicable' && d.skillId === 'conventions.mechanics' && view.inputMode !== 'typed'
                              ? view.inputMode === 'scribed'
                                ? 'Not rated: a grown-up typed these words, so spelling and punctuation are theirs.'
                                : 'Not rated: speech-to-text wrote the spelling and punctuation.'
                              : d.reason}
                          </div>
                          {override && (
                            <div className="lw-small lw-teacher-adjust">
                              Teacher adjusted this to level {override.rating} (AI said {override.originalRating ?? '–'}): {override.comment}
                            </div>
                          )}
                          <div className="lw-btn-row" style={{ gap: 12 }}>
                            {d.evidence[0] && (
                              <button type="button" onClick={() => focusNote(`skill-${d.skillId}`)}>
                                Show evidence
                              </button>
                            )}
                            {isAdult && adjusting !== d.skillId && (
                              <button
                                type="button"
                                onClick={() => {
                                  setAdjusting(d.skillId);
                                  setAdjustRating(rating ?? 3);
                                  setAdjustComment('');
                                }}
                              >
                                Adjust level
                              </button>
                            )}
                          </div>
                          {isAdult && adjusting === d.skillId && (
                            <div className="lw-adjust">
                              <label className="lw-small">
                                Level{' '}
                                <select className="lw-select lw-select-small" value={adjustRating} onChange={(e) => setAdjustRating(Number(e.target.value))}>
                                  {[1, 2, 3, 4].map((n) => (
                                    <option key={n} value={n}>
                                      {n}
                                    </option>
                                  ))}
                                </select>
                              </label>
                              <textarea
                                className="lw-textarea"
                                rows={2}
                                maxLength={600}
                                placeholder="Why? The student will see this note."
                                value={adjustComment}
                                onChange={(e) => setAdjustComment(e.target.value)}
                              />
                              {adjustError && <p className="lw-small" style={{ color: 'var(--lw-warn)' }}>{adjustError}</p>}
                              <div className="lw-btn-row">
                                <button className="lw-btn lw-btn-secondary lw-btn-small" type="button" onClick={() => saveAdjustment(d.skillId)}>
                                  Save
                                </button>
                                <button className="lw-btn lw-btn-quiet lw-btn-small" type="button" onClick={() => setAdjusting(null)}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                        <LevelMeter rating={rating} notRated={d.evidenceState === 'not_applicable'} />
                      </li>
                    );
                  })}
                </ul>
                <p className="lw-small lw-muted" style={{ margin: '12px 0 0' }}>
                  Levels describe this piece of writing on a practice rubric. They aren’t school grades.
                </p>
                {isAdult && (
                  <div className="lw-btn-row" style={{ marginTop: 12 }}>
                    {view.reviewedByAdult ? (
                      <span className="lw-pill lw-pill-good">Reviewed by an adult</span>
                    ) : (
                      <button className="lw-btn lw-btn-secondary lw-btn-small" type="button" onClick={confirmRatings}>
                        Ratings look right ✓
                      </button>
                    )}
                  </div>
                )}
                {isAdult && (
                  <div style={{ marginTop: 12 }}>
                    {adjusting === 'overall' ? (
                      <div className="lw-adjust">
                        <textarea
                          className="lw-textarea"
                          rows={3}
                          maxLength={600}
                          placeholder="A note for the student about this piece"
                          value={adjustComment}
                          onChange={(e) => setAdjustComment(e.target.value)}
                        />
                        {adjustError && <p className="lw-small" style={{ color: 'var(--lw-warn)' }}>{adjustError}</p>}
                        <div className="lw-btn-row">
                          <button className="lw-btn lw-btn-secondary lw-btn-small" type="button" onClick={() => saveAdjustment('overall')}>
                            Save note
                          </button>
                          <button className="lw-btn lw-btn-quiet lw-btn-small" type="button" onClick={() => setAdjusting(null)}>
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button className="lw-btn lw-btn-quiet lw-btn-small" type="button" onClick={() => { setAdjusting('overall'); setAdjustComment(''); }}>
                        Add a note for the student
                      </button>
                    )}
                  </div>
                )}
              </div>

              {view.alignment.length > 0 && (
                <details className="lw-card">
                  <summary style={{ cursor: 'pointer', fontWeight: 600 }}>How this connects to {view.learner.gradeLabel} curriculum goals</summary>
                  <ul className="lw-statements" style={{ marginTop: 12 }}>
                    {view.alignment.map((a) => (
                      <li key={a.skillId}>
                        <strong>{skillName(a.skillId)}</strong>
                        {a.statements.map((st) => (
                          <p key={st.code + st.text} className="lw-small" style={{ margin: '4px 0 0' }}>
                            <a href={st.url} target="_blank" rel="noreferrer" className="lw-code">
                              {st.framework === 'uk-eng' ? st.scope : st.shortCode}
                            </a>{' '}
                            {st.text || st.title}
                          </p>
                        ))}
                      </li>
                    ))}
                  </ul>
                </details>
              )}

              {view.attemptNumber > 1 && (
                <div className="lw-card">
                  <h2 style={{ fontSize: '1.1rem' }}>Reflect</h2>
                  <label htmlFor="reflection" className="lw-label">What did you change, and why?</label>
                  <textarea id="reflection" className="lw-textarea" rows={3} maxLength={1000} value={reflection} onChange={(e) => { setReflection(e.target.value); setReflectionSaved(false); }} style={{ marginTop: 6 }} />
                  <div className="lw-btn-row" style={{ marginTop: 8 }}>
                    <button
                      className="lw-btn lw-btn-secondary"
                      type="button"
                      disabled={!reflection.trim() || reflectionSaved}
                      onClick={async () => {
                        await learningApi.saveReflection(view.id, reflection);
                        setReflectionSaved(true);
                      }}
                    >
                      {reflectionSaved ? 'Saved' : 'Save reflection'}
                    </button>
                  </div>
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                {reported ? (
                  <p className="lw-small lw-muted">Thanks, we’ve noted that this feedback seems wrong.</p>
                ) : reporting ? (
                  <div className="lw-card">
                    <label htmlFor="report" className="lw-label">What seems wrong?</label>
                    <textarea id="report" className="lw-textarea" rows={2} maxLength={500} value={reportReason} onChange={(e) => setReportReason(e.target.value)} style={{ marginTop: 6 }} />
                    <div className="lw-btn-row" style={{ marginTop: 8 }}>
                      <button
                        className="lw-btn lw-btn-secondary"
                        type="button"
                        disabled={!reportReason.trim()}
                        onClick={async () => {
                          await learningApi.reportFeedback(view.id, reportReason);
                          setReported(true);
                        }}
                      >
                        Send
                      </button>
                      <button className="lw-btn lw-btn-quiet" type="button" onClick={() => setReporting(false)}>Cancel</button>
                    </div>
                  </div>
                ) : (
                  <button className="lw-btn lw-btn-quiet lw-small" type="button" onClick={() => setReporting(true)}>This feedback seems wrong</button>
                )}
                <p className="lw-small lw-muted">Feedback is written by AI and can make mistakes.</p>
              </div>
            </section>
          </div>
        </>
      )}
    </>
  );
}
