'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import AddLearnerForm from './AddLearnerForm';
import LevelMeter from './LevelMeter';
import SignInPrompt from './SignInPrompt';
import SupportsCard from './SupportsCard';
import { learningApi } from '@/lib/learning/api';
import { localize } from '@/lib/learning/localize';
import { writeRegion } from '@/lib/learning/region';
import { useLearners, useSession } from '@/lib/learning/session';
import type { Dashboard, Learner } from '@/lib/learning/types';

const STATE_LABEL = { not_observed: 'Not seen yet', practicing: 'Practicing', demonstrated: 'Shown on 2 prompts', check_due: 'Time to check again' } as const;
const JOB_LABEL: Record<string, string> = {
  complete: 'Feedback ready',
  queued: 'Waiting for feedback',
  running: 'Reading…',
  not_scored: 'Needs more writing',
  needs_review: 'Feedback needs another look',
  failed: 'Feedback needs another look',
};

const formatDate = (iso: string) => new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });

function StudentCodeCard({ learner, onChange }: { learner: Learner; onChange: () => void }) {
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (learner.hasAccessCode && !window.confirm(`Make a new code for ${learner.displayName}? The old code will stop working.`)) return;
    setBusy(true);
    setError(null);
    try {
      setCode((await learningApi.createAccessCode(learner.id)).code);
      onChange();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create a code.');
    } finally {
      setBusy(false);
    }
  }

  async function revoke() {
    setBusy(true);
    await learningApi.revokeAccessCode(learner.id).catch(() => null);
    setCode(null);
    setBusy(false);
    onChange();
  }

  return (
    <div className="lw-card">
      <h3>Student sign-in code</h3>
      <p className="lw-small lw-muted">
        With a code, {learner.displayName} can sign in on any device (a school laptop, for example) and see only their own writing. Codes don’t give
        access to your account.
      </p>
      {code ? (
        <div className="lw-code-reveal" role="status">
          <span className="lw-code-big">{code}</span>
          <p className="lw-small" style={{ margin: '6px 0 0' }}>
            Write this down now; it won’t be shown again. Students enter it at <strong>/learn/sign-in</strong> under “I’m a student”.
          </p>
        </div>
      ) : (
        <p className="lw-small">{learner.hasAccessCode ? 'A code is active.' : 'No code yet.'}</p>
      )}
      {error && <p className="lw-notice lw-notice-warn">{error}</p>}
      <div className="lw-btn-row">
        <button className="lw-btn lw-btn-secondary" type="button" onClick={generate} disabled={busy}>
          {learner.hasAccessCode ? 'Make a new code' : 'Create a code'}
        </button>
        {learner.hasAccessCode && (
          <button className="lw-btn lw-btn-quiet" type="button" onClick={revoke} disabled={busy}>
            Turn off code
          </button>
        )}
      </div>
    </div>
  );
}

export default function LearnerDashboard() {
  const { kind, ready } = useSession();
  const { learners, active, select, reload, error } = useLearners(!!kind);
  const [adding, setAdding] = useState(false);
  const [loaded, setLoaded] = useState<Dashboard | null>(null);
  const [dashError, setDashError] = useState<string | null>(null);
  const activeId = active?.id;

  useEffect(() => {
    if (!activeId) return;
    let cancelled = false;
    learningApi
      .dashboard(activeId)
      .then((d) => {
        if (cancelled) return;
        setLoaded(d);
        setDashError(null);
        writeRegion(d.learner.curriculum);
      })
      .catch((e) => {
        if (!cancelled) setDashError(e instanceof Error ? e.message : 'Could not load this student’s writing.');
      });
    return () => {
      cancelled = true;
    };
  }, [activeId]);

  // Only show data for the student currently selected, never the previous one's.
  const dash = loaded && loaded.learner.id === activeId ? loaded : null;
  const isAdult = kind === 'adult';

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (!kind) return <SignInPrompt />;
  if (error) return <p role="alert" className="lw-notice lw-notice-warn">{error}</p>;
  if (!learners) return <p className="lw-muted">Loading student profiles…</p>;

  if (isAdult && (learners.length === 0 || adding)) {
    return (
      <>
        {learners.length === 0 && (
          <>
            <h1>Welcome to Writing Studio</h1>
            <p className="lw-muted" style={{ maxWidth: '40em' }}>
              Create a profile for each student who will practice. Their first activity is a short writing check-in: two pieces, so their plan
              starts from real evidence.
            </p>
          </>
        )}
        <AddLearnerForm
          onCreated={(l) => {
            setAdding(false);
            select(l.id);
            reload();
          }}
          onCancel={learners.length ? () => setAdding(false) : undefined}
        />
      </>
    );
  }

  async function removeLearner() {
    if (!active) return;
    const ok = window.confirm(`Delete ${active.displayName}'s profile? This permanently deletes all of their writing, feedback and progress.`);
    if (!ok) return;
    await learningApi.deleteLearner(active.id);
    reload();
  }

  async function downloadExport() {
    if (!active) return;
    const data = await learningApi.exportData(active.id);
    const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `writing-studio-${active.displayName.replace(/\W+/g, '-').toLowerCase()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const rec = dash?.recommendation;
  const recHref = rec?.lessonId && rec.kind === 'lesson' ? `/learn/lessons/${rec.lessonId}` : rec?.promptId ? `/learn/write/${rec.promptId}` : null;

  return (
    <>
      <div className="lw-card-title" style={{ marginBottom: 20 }}>
        <div>
          <p className="lw-eyebrow">{active?.gradeLabel}</p>
          <h1 style={{ marginBottom: 0 }}>Hi, {active?.displayName}</h1>
        </div>
        {isAdult && (
          <div className="lw-btn-row">
            {learners.length > 1 && (
              <label className="lw-small">
                <span className="lw-muted">Student: </span>
                <select className="lw-select" style={{ width: 'auto', display: 'inline-block' }} value={active?.id} onChange={(e) => select(e.target.value)}>
                  {learners.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.displayName} ({l.gradeLabel})
                    </option>
                  ))}
                </select>
              </label>
            )}
            <button className="lw-btn lw-btn-secondary" type="button" onClick={() => setAdding(true)}>
              Add student
            </button>
          </div>
        )}
      </div>

      {dashError && <p role="alert" className="lw-notice lw-notice-warn">{dashError}</p>}
      {!dash && !dashError && <p className="lw-muted">Loading…</p>}

      {dash && isAdult && dash.safetyFlags.length > 0 && (
        <section className="lw-alert" role="alert" aria-labelledby="wellbeing-title">
          <h2 id="wellbeing-title">Please read {dash.learner.displayName}’s recent writing</h2>
          <p>
            {dash.safetyFlags.some((f) => f.category !== 'personal_info')
              ? 'Something in a recent piece may be about the student’s wellbeing. It may be fiction; please read it and check in with them.'
              : 'A recent piece may include personal details, such as a phone number or address.'}{' '}
            This site is not monitored around the clock; if a child is in immediate danger, contact emergency services.
          </p>
          <ul className="lw-plain-list">
            {dash.safetyFlags.map((f) => (
              <li key={f.id}>
                <span>
                  <strong>{f.level === 'urgent' ? 'Please read soon' : 'Worth a look'}</strong> · {f.reason}
                </span>
                <Link href={`/learn/feedback/${f.submissionId}`}>Open the piece</Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {dash && rec && (
        <>
          <div className="lw-grid lw-grid-2">
            <section className="lw-card lw-card-accent">
              <p className="lw-eyebrow">Today’s practice</p>
              <h2>
                {rec.kind === 'check_in' && `Writing check-in: ${rec.promptTitle}`}
                {rec.kind === 'lesson' && `Lesson: ${rec.lessonTitle}`}
                {rec.kind === 'prompt' && (rec.promptTitle ? `New prompt: ${rec.promptTitle}` : 'Feedback is on its way')}
                {rec.kind === 'done' && 'You’ve tried every prompt!'}
              </h2>
              <p className="lw-muted">{rec.reason}</p>
              {recHref && (
                <Link className="lw-btn lw-btn-primary" href={recHref}>
                  {rec.kind === 'lesson' ? 'Start the lesson' : 'Start writing'}
                </Link>
              )}
              {dash.plan.status !== 'check_in' && dash.plan.items.length > 0 && (
                <div className="lw-progress" style={{ marginTop: 16 }}>
                  <span className="lw-small lw-muted">
                    Two-week plan: {dash.plan.items.filter((i) => i.done).length} of {dash.plan.items.length} done ·{' '}
                    <Link href="/learn/plan">See the plan</Link>
                  </span>
                  <div className="lw-bar" aria-hidden="true">
                    <span style={{ width: `${(dash.plan.items.filter((i) => i.done).length / dash.plan.items.length) * 100}%` }} />
                  </div>
                </div>
              )}
              {dash.checkIn.done < dash.checkIn.total && (
                <div className="lw-progress" style={{ marginTop: 16 }}>
                  <span className="lw-small lw-muted">
                    Check-in: {dash.checkIn.done} of {dash.checkIn.total} pieces
                  </span>
                  <div className="lw-bar" role="progressbar" aria-valuemin={0} aria-valuemax={dash.checkIn.total} aria-valuenow={dash.checkIn.done}>
                    <span style={{ width: `${(dash.checkIn.done / dash.checkIn.total) * 100}%` }} />
                  </div>
                </div>
              )}
            </section>

            <section className="lw-card">
              <p className="lw-eyebrow">From your teacher</p>
              {dash.assignments.length === 0 ? (
                <p className="lw-muted">No assignments right now. Pick a lesson or a practice set any time.</p>
              ) : (
                <ul className="lw-plain-list">
                  {dash.assignments.map((a) => (
                    <li key={a.id}>
                      <Link href={a.lessonId ? `/learn/lessons/${a.lessonId}` : `/learn/write/${a.promptId}`}>{a.promptTitle}</Link>
                      {a.submitted ? <span className="lw-pill lw-pill-good">Submitted</span> : a.dueDate ? <span className="lw-pill">Due {formatDate(a.dueDate)}</span> : null}
                      {a.note && <p className="lw-small lw-muted" style={{ margin: '2px 0 0' }}>{a.note}</p>}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {dash.drills.length > 0 && (
            <section className="lw-section" style={{ marginTop: 28 }}>
              <h2>Quick practice</h2>
              <p className="lw-muted lw-small">Short sets for the skills your last pieces showed you’re still building. About 5 minutes each.</p>
              <div className="lw-grid lw-grid-3">
                {dash.drills.map((d) => (
                  <Link key={d.id} href={`/learn/practice/${d.id}`} className="lw-card lw-link-card">
                    <h3>{d.title}</h3>
                    <p className="lw-small lw-muted" style={{ margin: 0 }}>Practice set</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          <section className="lw-section" style={{ marginTop: 32 }}>
            <h2>Skills</h2>
            <p className="lw-muted lw-small">
              Levels come from the most recent first draft. A skill is “shown” after level 3 or 4 on two different prompts, written without hints.
            </p>
            <div className="lw-progress-strip">
              {dash.skills.map((s) => (
                <div key={s.skillId} className="lw-skill-chip">
                  <strong>{localize(s.name, dash.learner.curriculum)}</strong>
                  <span className={`lw-pill ${s.state === 'demonstrated' ? 'lw-pill-good' : s.state === 'practicing' ? 'lw-pill-next' : ''}`}>
                    {localize(STATE_LABEL[s.state], dash.learner.curriculum)}
                  </span>
                  {s.latestRating !== null && (
                    <div style={{ marginTop: 8 }}>
                      <LevelMeter rating={s.latestRating} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {dash.drafts.some((d) => d.hasUnsubmittedChanges) && (
            <section className="lw-section" style={{ marginTop: 32 }}>
              <h2>Keep going</h2>
              <div className="lw-grid lw-grid-3">
                {dash.drafts
                  .filter((d) => d.hasUnsubmittedChanges)
                  .map((d) => (
                    <Link key={d.id} href={`/learn/write/${d.promptId}`} className="lw-card lw-link-card">
                      <h3>{d.promptTitle}</h3>
                      <p className="lw-muted lw-small" style={{ margin: 0 }}>
                        {d.words} words · edited {formatDate(d.updatedAt)}
                      </p>
                    </Link>
                  ))}
              </div>
            </section>
          )}

          <section className="lw-section" style={{ marginTop: 32 }}>
            <div className="lw-card-title">
              <h2>Writing history</h2>
              <Link href={`/learn/report/${dash.learner.id}`}>Progress report</Link>
            </div>
            {dash.submissions.length === 0 ? (
              <p className="lw-muted">Nothing submitted yet. Finished pieces and their feedback will show up here.</p>
            ) : (
              <div className="lw-card" style={{ overflowX: 'auto' }}>
                <table className="lw-table">
                  <thead>
                    <tr>
                      <th>Prompt</th>
                      <th>Draft</th>
                      <th>Date</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dash.submissions.map((s) => (
                      <tr key={s.id}>
                        <td>
                          <Link href={`/learn/feedback/${s.id}`}>{s.promptTitle}</Link>
                        </td>
                        <td>{s.attemptNumber === 1 ? 'First draft' : `Revision ${s.attemptNumber - 1}`}</td>
                        <td>{formatDate(s.createdAt)}</td>
                        <td>{JOB_LABEL[s.state] ?? s.state}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {isAdult && active && (
            <section className="lw-section lw-grid lw-grid-2" style={{ marginTop: 40 }}>
              <StudentCodeCard learner={active} onChange={reload} />
              <SupportsCard key={active.id} learner={active} onSaved={reload} />
              <div className="lw-card">
                <h3>Manage {active.displayName}’s profile</h3>
                <div className="lw-btn-row">
                  <Link className="lw-btn lw-btn-secondary" href={`/learn/report/${active.id}`}>
                    Open progress report
                  </Link>
                  <button className="lw-btn lw-btn-quiet" type="button" onClick={downloadExport}>
                    Download all data
                  </button>
                </div>
                <p className="lw-small lw-muted" style={{ marginTop: 14 }}>
                  Deleting a profile permanently removes the student’s writing, feedback and progress.
                </p>
                <button className="lw-btn lw-btn-secondary" type="button" onClick={removeLearner} style={{ color: 'var(--lw-warn)' }}>
                  Delete this profile
                </button>
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
