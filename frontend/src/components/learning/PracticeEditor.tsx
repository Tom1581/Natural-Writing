'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';
import LocalizedText from './LocalizedText';
import PictureSet from './PictureSet';
import DictationButton from './DictationButton';
import ReadAloud from './ReadAloud';
import GuestFeedback from './GuestFeedback';
import { ApiError, learningApi } from '@/lib/learning/api';
import { BAND_LABELS, LEVEL_LABELS } from '@/lib/learning/levels';
import { API } from '@/lib/learning/public';
import { useRegion } from '@/lib/learning/region';
import { useLearners, useSession } from '@/lib/learning/session';
import type { Catalog, CoachResult, Draft, GuestFeedbackResult, WritingPrompt } from '@/lib/learning/types';

type SaveState = 'idle' | 'saving' | 'saved' | 'error' | 'conflict';
const SAVE_LABEL: Record<SaveState, string> = {
  idle: 'Not changed yet',
  saving: 'Saving…',
  saved: 'Saved',
  error: 'Not saved: check your connection. We’ll keep trying.',
  conflict: 'This draft changed in another tab',
};

const countWords = (t: string) => (t.trim().match(/\S+/g) || []).length;

/** Guests' drafts live only in this browser, one per prompt. */
const guestKey = (promptId: string) => `nq-guest-draft:${promptId}`;
function readGuestDraft(promptId: string): { content: string; planning: Record<string, string>; grade?: string } | null {
  try {
    return JSON.parse(localStorage.getItem(guestKey(promptId)) ?? 'null');
  } catch {
    return null;
  }
}
function writeGuestDraft(promptId: string, value: { content: string; planning: Record<string, string>; grade?: string }) {
  try {
    localStorage.setItem(guestKey(promptId), JSON.stringify(value));
  } catch {
    /* storage unavailable: the text stays on screen */
  }
}

export default function PracticeEditor({
  prompt,
  lessonId,
  initialGrade = null,
}: {
  prompt: WritingPrompt;
  lessonId: string | null;
  /** For guests arriving from a grade page: preselects their grade. */
  initialGrade?: string | null;
}) {
  const router = useRouter();
  const { kind, ready } = useSession();
  const { learners, active } = useLearners(!!kind);
  // Without a sign-in, anyone can practice: the draft stays in this browser and feedback isn't stored.
  const guest = ready && !kind;
  const region = useRegion() ?? 'us-ccss';
  const [guestGrade, setGuestGrade] = useState(initialGrade ?? '');
  const [guestResult, setGuestResult] = useState<Extract<GuestFeedbackResult, { kind: 'complete' }> | null>(null);
  const [submittedText, setSubmittedText] = useState('');
  const [catalog, setCatalog] = useState<Pick<Catalog, 'bands' | 'frameworks'> | null>(null);
  const [coach, setCoach] = useState<CoachResult | null>(null);
  const [coaching, setCoaching] = useState(false);
  const [coachError, setCoachError] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [content, setContent] = useState('');
  const [planning, setPlanning] = useState<Record<string, string>>({});
  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [conflict, setConflict] = useState<Draft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [tab, setTab] = useState<'task' | 'plan' | 'rubric'>('task');
  // K–2: an adult may type exactly what the child says; then spelling is not rated.
  const [scribed, setScribed] = useState(false);

  // Refs hold the latest values so the debounced saver never sends stale text.
  const revisionRef = useRef(0);
  const contentRef = useRef('');
  const planningRef = useRef<Record<string, string>>({});
  const dirtyRef = useRef(false);
  const dictatedRef = useRef(false);
  const savingRef = useRef<Promise<boolean> | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submitKeyRef = useRef<{ revision: number; key: string } | null>(null);
  const saveRef = useRef<() => Promise<boolean>>(async () => false);

  const bandMismatch = !!active && active.band !== prompt.band;
  const editable = guest || !!draft;

  useEffect(() => {
    if (!guest) return;
    const restore = () => {
      const saved = readGuestDraft(prompt.id);
      if (!saved) return;
      setContent(saved.content);
      setPlanning(saved.planning ?? {});
      contentRef.current = saved.content;
      planningRef.current = saved.planning ?? {};
      if (saved.grade) setGuestGrade(saved.grade);
      setSaveState('saved');
    };
    restore();
    fetch(`${API}/v1/learning/catalog`)
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => setCatalog(null));
  }, [guest, prompt.id]);

  useEffect(() => {
    if (!active || bandMismatch) return;
    learningApi
      .openDraft(active.id, prompt.id)
      .then((d) => {
        setDraft(d);
        setContent(d.content);
        setPlanning(d.planning ?? {});
        contentRef.current = d.content;
        planningRef.current = d.planning ?? {};
        revisionRef.current = d.revision;
        setSaveState(d.revision > 0 ? 'saved' : 'idle');
      })
      .catch((e) => setLoadError(e instanceof Error ? e.message : 'Could not open this draft.'));
  }, [active, bandMismatch, prompt.id]);

  /** Saves pending changes. Resolves true once the server has the latest text. */
  const save = useCallback(async (): Promise<boolean> => {
    if (guest) {
      writeGuestDraft(prompt.id, { content: contentRef.current, planning: planningRef.current, grade: guestGrade || undefined });
      dirtyRef.current = false;
      setSaveState('saved');
      return true;
    }
    if (!draft) return false;
    if (savingRef.current) await savingRef.current;
    if (!dirtyRef.current) return true;
    dirtyRef.current = false;
    setSaveState('saving');
    const run = (async () => {
      try {
        const res = await learningApi.saveDraft(draft.id, {
          content: contentRef.current,
          planning: planningRef.current,
          expectedRevision: revisionRef.current,
          ...(dictatedRef.current ? { usedDictation: true } : {}),
        });
        dictatedRef.current = false;
        revisionRef.current = res.revision;
        if (!dirtyRef.current) setSaveState('saved');
        return true;
      } catch (e) {
        dirtyRef.current = true;
        const current = e instanceof ApiError && e.status === 409 ? (e.body as { current?: Draft } | null)?.current : undefined;
        if (current) {
          setConflict(current);
          setSaveState('conflict');
        } else {
          setSaveState('error');
          timerRef.current = setTimeout(() => void saveRef.current(), 5000);
        }
        return false;
      } finally {
        savingRef.current = null;
      }
    })();
    savingRef.current = run;
    const ok = await run;
    if (ok && dirtyRef.current) return saveRef.current();
    return ok;
  }, [draft, guest, prompt.id, guestGrade]);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  const scheduleSave = useCallback(() => {
    dirtyRef.current = true;
    if (conflict) return;
    setSaveState('saving');
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => void save(), 1200);
  }, [conflict, save]);

  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => {
      if (dirtyRef.current) e.preventDefault();
    };
    window.addEventListener('beforeunload', warn);
    return () => {
      window.removeEventListener('beforeunload', warn);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  function resolveConflict(keep: 'mine' | 'theirs') {
    if (!conflict) return;
    revisionRef.current = conflict.revision;
    if (keep === 'theirs') {
      setContent(conflict.content);
      setPlanning(conflict.planning ?? {});
      contentRef.current = conflict.content;
      planningRef.current = conflict.planning ?? {};
      dirtyRef.current = false;
      setSaveState('saved');
      setConflict(null);
    } else {
      setConflict(null);
      dirtyRef.current = true;
      void save();
    }
  }

  async function checkProgress() {
    setCoachError(null);
    setCoaching(true);
    try {
      if (timerRef.current) clearTimeout(timerRef.current);
      if (!(await save()) || !draft) throw new Error('Your latest changes could not be saved yet. Try again in a moment.');
      setCoach(await learningApi.coach(draft.id));
    } catch (e) {
      setCoachError(e instanceof Error ? e.message : 'The coach is not available right now.');
    } finally {
      setCoaching(false);
    }
  }

  async function submitAsGuest() {
    setSubmitError(null);
    setSubmitting(true);
    try {
      await save();
      const text = contentRef.current;
      const result = await learningApi.guestFeedback({
        promptId: prompt.id,
        text,
        curriculum: region,
        // A grade from another age group (an old link, say) falls back to the server's default.
        ...(guestGrade && (!catalog || catalog.bands.find((b) => b.id === prompt.band)?.grades.includes(guestGrade)) ? { grade: guestGrade } : {}),
        ...(scribed ? { scribed: true } : {}),
      });
      if (result.kind === 'not_scored') throw new Error('Write a few more sentences first, then ask for feedback again.');
      setSubmittedText(text);
      setGuestResult(result);
      window.scrollTo({ top: 0 });
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Feedback is not available right now. Your writing is still on this page.');
    } finally {
      setSubmitting(false);
    }
  }

  async function submit() {
    if (guest) return submitAsGuest();
    setSubmitError(null);
    setSubmitting(true);
    try {
      if (timerRef.current) clearTimeout(timerRef.current);
      const saved = await save();
      if (!saved || !draft) throw new Error('Your latest changes could not be saved yet. Please try again in a moment.');
      const revision = revisionRef.current;
      // Reuse the key for the same saved revision, so a double click can't create two submissions.
      if (submitKeyRef.current?.revision !== revision) submitKeyRef.current = { revision, key: crypto.randomUUID() };
      const job = await learningApi.submit({
        draftId: draft.id,
        expectedRevision: revision,
        idempotencyKey: submitKeyRef.current.key,
        ...(scribed ? { scribed: true } : {}),
      });
      router.push(`/learn/feedback/${job.submissionId}?job=${job.jobId}`);
    } catch (e) {
      setSubmitError(e instanceof Error ? e.message : 'Could not submit. Your draft is saved.');
      setSubmitting(false);
    }
  }

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (guestResult) {
    return (
      <GuestFeedback
        result={guestResult}
        text={submittedText}
        title={prompt.title}
        curriculum={region}
        onRevise={() => {
          setGuestResult(null);
          window.scrollTo({ top: 0 });
        }}
      />
    );
  }
  if (kind && learners && learners.length === 0) {
    return <p className="lw-notice">Create a student profile first on <Link href="/learn/dashboard">My writing</Link>.</p>;
  }
  if (bandMismatch) {
    return (
      <p className="lw-notice">
        This prompt is for a different age group ({BAND_LABELS[prompt.band]}, US grades), and {active?.displayName} is in {active?.gradeLabel}.{' '}
        <Link href="/learn/dashboard">See prompts for {active?.displayName}</Link>.
      </p>
    );
  }
  if (loadError) return <p role="alert" className="lw-notice lw-notice-warn">{loadError}</p>;

  const words = countWords(content);
  const { min, max } = prompt.suggestedWords;
  const early = prompt.band === 'K-2';
  const sources = prompt.sources ?? [];
  const minForCoach = early ? 5 : 15;
  // A guest picks their grade within the prompt's age group, named the way their country does.
  const framework = catalog?.frameworks.find((f) => f.id === region);
  const guestGrades = (catalog?.bands.find((b) => b.id === prompt.band)?.grades ?? []).map((grade) => {
    const local = framework && Object.keys(framework.localToGrade).find((y) => framework.localToGrade[y] === grade);
    return { grade, label: (local && framework?.localGradeLabels?.[local]) || (grade === 'K' ? 'Kindergarten' : `Grade ${grade}`) };
  });

  return (
    <div className="lw-workspace">
      <aside className="lw-sidebar lw-card" aria-label="Prompt and planning">
        <div className="lw-tabs" role="tablist">
          {(['task', 'plan', 'rubric'] as const).map((t) => (
            <button key={t} role="tab" type="button" className="lw-tab" aria-selected={tab === t} onClick={() => setTab(t)}>
              {t === 'task' ? 'Task' : t === 'plan' ? 'Plan' : 'Rubric'}
            </button>
          ))}
        </div>

        {tab === 'task' && (
          <div role="tabpanel">
            {prompt.checkIn && <p className="lw-pill lw-pill-accent">Writing check-in</p>}
            {prompt.checkpoint && <p className="lw-pill lw-pill-accent">Checkpoint</p>}
            <h1 style={{ fontSize: '1.4rem' }}>{prompt.title}</h1>
            {prompt.picture && <PictureSet id={prompt.picture.id} description={prompt.picture.description} />}
            <p style={early ? { fontSize: '1.15rem' } : undefined}>
              <LocalizedText text={prompt.task} framework={active?.curriculum} />
            </p>
            <ReadAloud
              text={`${prompt.task} ${sources.map((src) => `${src.title}. ${src.text}`).join(' ')} Success checklist: ${prompt.successCriteria.join('. ')}`}
              label="Read the task aloud"
            />
            {prompt.adultGuide && (
              <div className="lw-notice" style={{ margin: '12px 0' }}>
                <strong>For the grown-up helping:</strong> {prompt.adultGuide}
              </div>
            )}
            {sources.map((src) => (
              <div key={src.title} className="lw-source" style={{ marginBottom: 14 }}>
                <strong>{src.title}</strong>
                <p style={{ margin: '6px 0 0' }}>
                  <LocalizedText text={src.text} framework={active?.curriculum} />
                </p>
              </div>
            ))}
            <p className="lw-label">Success checklist</p>
            <ul className="lw-checklist">
              {prompt.successCriteria.map((c) => (
                <li key={c}>
                  <LocalizedText text={c} framework={active?.curriculum} />
                </li>
              ))}
            </ul>
            {lessonId && <p className="lw-small"><Link href={`/learn/lessons/${lessonId}`}>Back to the lesson</Link></p>}
          </div>
        )}

        {tab === 'plan' && (
          <div role="tabpanel">
            <p className="lw-muted lw-small">Jot down ideas first. Notes save automatically and are not scored.</p>
            {prompt.planningQuestions.map((q, i) => (
              <div className="lw-field" key={q}>
                <label htmlFor={`plan-${i}`}>{q}</label>
                <textarea
                  id={`plan-${i}`}
                  className="lw-textarea"
                  rows={2}
                  maxLength={1000}
                  value={planning[String(i)] ?? ''}
                  disabled={!editable}
                  onChange={(e) => {
                    const next = { ...planningRef.current, [String(i)]: e.target.value };
                    planningRef.current = next;
                    setPlanning(next);
                    scheduleSave();
                  }}
                />
              </div>
            ))}
          </div>
        )}

        {tab === 'rubric' && (
          <div role="tabpanel">
            <p className="lw-muted lw-small">This is how the writing is rated. Level 3 means you met the goal.</p>
            {prompt.rubric.dimensions.map((d) => (
              <details key={d.skillId} style={{ marginBottom: 8 }}>
                <summary style={{ cursor: 'pointer', fontWeight: 600 }}>{d.name}</summary>
                <ul className="lw-list lw-small" style={{ marginTop: 6 }}>
                  {([3, 4, 2, 1] as const).map((n) => <li key={n}><strong>{n} · {LEVEL_LABELS[n]}:</strong> {d.levels[n]}</li>)}
                </ul>
              </details>
            ))}
          </div>
        )}
      </aside>

      <section aria-label="Your writing">
        <label htmlFor="writing" className="lw-label">Your writing</label>
        <p className="lw-small lw-muted" style={{ margin: '2px 0 8px' }}>Write in your own words. Don’t include your address, phone number or other private details.</p>
        <textarea
          id="writing"
          className="lw-writing"
          style={active?.supports?.largerText || early ? { fontSize: 'max(var(--lw-writing-size), 22px)' } : undefined}
          value={content}
          disabled={!editable}
          spellCheck
          placeholder={editable ? (early ? 'Write here, or a grown-up can type your words…' : 'Start writing here…') : 'Opening your draft…'}
          onChange={(e) => {
            contentRef.current = e.target.value;
            setContent(e.target.value);
            scheduleSave();
          }}
        />
        {active?.supports?.dictation && draft && (
          <DictationButton
            curriculum={active.curriculum}
            onText={(chunk) => {
              const next = `${contentRef.current}${contentRef.current && !/\s$/.test(contentRef.current) ? ' ' : ''}${chunk}`;
              contentRef.current = next;
              dictatedRef.current = true;
              setContent(next);
              scheduleSave();
            }}
          />
        )}
        {early && (
          <label className="lw-check" style={{ margin: '8px 0' }}>
            <input type="checkbox" checked={scribed} onChange={(e) => setScribed(e.target.checked)} />
            <span>
              A grown-up typed my words exactly as I said them. <span className="lw-muted lw-small">(Then spelling and punctuation are not rated.)</span>
            </span>
          </label>
        )}
        <div className="lw-editor-bar">
          <span className="lw-save-state" data-state={saveState} role="status" aria-live="polite">
            {guest && saveState === 'saved' ? 'Saved in this browser only' : SAVE_LABEL[saveState]}
          </span>
          <span className="lw-muted">{words} words · suggested {min}–{max}</span>
        </div>

        {conflict && (
          <div className="lw-notice lw-notice-warn" role="alert" style={{ maxWidth: '72ch', marginBottom: 16 }}>
            <p>This draft was changed in another tab or device. Which version do you want to keep?</p>
            <div className="lw-btn-row">
              <button className="lw-btn lw-btn-secondary" type="button" onClick={() => resolveConflict('mine')}>Keep what’s on this screen</button>
              <button className="lw-btn lw-btn-quiet" type="button" onClick={() => resolveConflict('theirs')}>Load the other version</button>
            </div>
          </div>
        )}

        {!guest && !prompt.checkIn && !prompt.checkpoint && (
          <div className="lw-card lw-coach" style={{ maxWidth: '72ch' }}>
            <div className="lw-card-title">
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Am I on track?</h2>
              <button className="lw-btn lw-btn-secondary" type="button" onClick={checkProgress} disabled={!draft || coaching || words < minForCoach || !!conflict}>
                {coaching ? 'Checking…' : 'Check my draft'}
              </button>
            </div>
            <p className="lw-small lw-muted">
              Checks your draft against the success checklist. No score, and it won’t write anything for you. Pieces written with checks still get
              full feedback; to count a skill as “shown”, write one piece on your own.
            </p>
            {coachError && <p role="alert" className="lw-notice lw-notice-warn">{coachError}</p>}
            {coach && (
              <div aria-live="polite">
                <ul className="lw-coach-list">
                  {coach.criteria.map((c) => (
                    <li key={c.criterion} data-status={c.status}>
                      <span className="lw-coach-status">{c.status === 'met' ? 'Done' : c.status === 'partly' ? 'Partly' : 'Not yet'}</span>
                      <div>
                        <strong>
                          <LocalizedText text={c.criterion} framework={active?.curriculum} />
                        </strong>
                        <p style={{ margin: '2px 0 0' }}>{c.tip}</p>
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="lw-small" style={{ margin: 0 }}>
                  {coach.encouragement} <span className="lw-muted">({coach.remaining} checks left today for this draft.)</span>
                </p>
              </div>
            )}
          </div>
        )}
        {(prompt.checkIn || prompt.checkpoint) && (
          <p className="lw-notice" style={{ maxWidth: '72ch', marginBottom: 16 }}>
            {prompt.checkIn
              ? 'This is a check-in, so write it on your own: there are no hints. It helps us see what to practice first. There’s no time limit.'
              : 'This is a checkpoint: a brand-new prompt you write on your own, without hints, to show what you’ve learned. There’s no time limit.'}
          </p>
        )}

        <div className="lw-card" style={{ maxWidth: '72ch' }}>
          <h2 style={{ fontSize: '1.1rem' }}>Ready for feedback?</h2>
          <p className="lw-muted lw-small">Read your writing once more and check it against the success checklist. Feedback usually takes under a minute.</p>
          {guest && (
            <>
              <div className="lw-field">
                <label htmlFor="guest-grade">Your grade</label>
                <select
                  id="guest-grade"
                  className="lw-select"
                  value={guestGrade}
                  onChange={(e) => {
                    setGuestGrade(e.target.value);
                    writeGuestDraft(prompt.id, { content: contentRef.current, planning: planningRef.current, grade: e.target.value || undefined });
                  }}
                >
                  <option value="">Not sure</option>
                  {guestGrades.map((g) => (
                    <option key={g.grade} value={g.grade}>
                      {g.label}
                    </option>
                  ))}
                </select>
                <span className="lw-small lw-muted">Feedback expects what students in your grade usually do.</span>
              </div>
              <p className="lw-small lw-muted">
                You’re practicing without an account, so nothing is saved by us: your draft stays in this browser, and feedback disappears when you
                leave. <Link href="/learn/sign-in">Sign in</Link> to keep your work and progress.
              </p>
            </>
          )}
          {submitError && <p role="alert" className="lw-notice lw-notice-warn">{submitError}</p>}
          <button className="lw-btn lw-btn-primary" type="button" onClick={submit} disabled={!editable || submitting || words === 0 || !!conflict}>
            {submitting ? 'Submitting…' : 'Get feedback'}
          </button>
        </div>
      </section>
    </div>
  );
}
