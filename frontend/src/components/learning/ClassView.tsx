'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import LevelMeter from './LevelMeter';
import ReviewQueue from './ReviewQueue';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { API } from '@/lib/learning/public';
import { BAND_LABELS, BAND_ORDER, LEVEL_LABELS } from '@/lib/learning/levels';
import { useSession } from '@/lib/learning/session';
import type { Catalog, ClassDetail, Learner } from '@/lib/learning/types';

export default function ClassView({ classId }: { classId: string }) {
  const { kind, ready } = useSession();
  const [cls, setCls] = useState<ClassDetail | null>(null);
  const [learners, setLearners] = useState<Learner[]>([]);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [addId, setAddId] = useState('');
  const [promptId, setPromptId] = useState('');
  const [lessonId, setLessonId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [note, setNote] = useState('');

  const load = useCallback(() => {
    Promise.all([learningApi.classDetail(classId), learningApi.listLearners()])
      .then(([c, l]) => {
        setCls(c);
        setLearners(l);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the class.'));
  }, [classId]);

  useEffect(() => {
    if (kind !== 'adult') return;
    load();
    fetch(`${API}/v1/learning/catalog`)
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => null);
  }, [kind, load]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="use teacher tools" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!cls) return <p className="lw-muted">Loading…</p>;

  const memberIds = new Set(cls.students.map((s) => s.learner.id));
  const prompt = catalog?.prompts.find((p) => p.id === promptId);
  const run = (fn: () => Promise<unknown>) => async () => {
    setError(null);
    try {
      await fn();
      load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <>
      <p className="lw-eyebrow">
        <Link href="/learn/teach">Teacher tools</Link>
      </p>
      <div className="lw-card-title">
        <h1>{cls.name}</h1>
        <button
          className="lw-btn lw-btn-quiet"
          type="button"
          onClick={async () => {
            if (!window.confirm(`Delete the class "${cls.name}"? Student profiles and their writing are kept.`)) return;
            await learningApi.deleteClass(cls.id);
            window.location.href = '/learn/teach';
          }}
        >
          Delete class
        </button>
      </div>

      <div className="lw-grid lw-grid-2">
        <section className="lw-card">
          <h2 style={{ fontSize: '1.2rem' }}>Students</h2>
          {cls.students.length === 0 && <p className="lw-muted lw-small">No students yet.</p>}
          <ul className="lw-plain-list">
            {cls.students.map((s) => (
              <li key={s.learner.id}>
                <span>
                  {s.learner.displayName} <span className="lw-small lw-muted">· {s.learner.gradeLabel}</span>
                </span>
                <span className="lw-btn-row" style={{ gap: 8 }}>
                  <Link className="lw-small" href={`/learn/report/${s.learner.id}`}>
                    Report
                  </Link>
                  <button className="lw-btn lw-btn-quiet lw-btn-small" type="button" onClick={run(() => learningApi.removeMember(cls.id, s.learner.id))}>
                    Remove
                  </button>
                </span>
              </li>
            ))}
          </ul>
          <div className="lw-btn-row" style={{ marginTop: 10 }}>
            <select className="lw-select" style={{ flex: 1 }} value={addId} onChange={(e) => setAddId(e.target.value)} aria-label="Add a student">
              <option value="">Add one of your students…</option>
              {learners
                .filter((l) => !memberIds.has(l.id))
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.displayName} ({l.gradeLabel})
                  </option>
                ))}
            </select>
            <button
              className="lw-btn lw-btn-secondary"
              type="button"
              disabled={!addId}
              onClick={run(async () => {
                await learningApi.addMember(cls.id, addId);
                setAddId('');
              })}
            >
              Add
            </button>
          </div>
        </section>

        <section className="lw-card">
          <h2 style={{ fontSize: '1.2rem' }}>Assign writing</h2>
          <div className="lw-field">
            <label htmlFor="as-prompt">Prompt</label>
            <select id="as-prompt" className="lw-select" value={promptId} onChange={(e) => { setPromptId(e.target.value); setLessonId(''); }}>
              <option value="">Choose a prompt…</option>
              {BAND_ORDER.map((band) => (
                <optgroup key={band} label={BAND_LABELS[band]}>
                  {catalog?.prompts
                    .filter((p) => p.band === band && !p.checkIn)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title} ({p.genre === 'opinion' ? 'opinion/argument' : p.genre})
                      </option>
                    ))}
                </optgroup>
              ))}
            </select>
          </div>
          <div className="lw-field">
            <label htmlFor="as-lesson">Lesson first (optional)</label>
            <select id="as-lesson" className="lw-select" value={lessonId} onChange={(e) => setLessonId(e.target.value)} disabled={!prompt}>
              <option value="">No lesson</option>
              {catalog?.lessons
                .filter((l) => l.band === prompt?.band)
                .map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.title}
                  </option>
                ))}
            </select>
          </div>
          <div className="lw-grid lw-grid-2" style={{ gap: 10 }}>
            <div className="lw-field">
              <label htmlFor="as-due">Due (optional)</label>
              <input id="as-due" type="date" className="lw-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </div>
            <div className="lw-field">
              <label htmlFor="as-note">Note (optional)</label>
              <input id="as-note" className="lw-input" maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <button
            className="lw-btn lw-btn-primary"
            type="button"
            disabled={!promptId}
            onClick={run(async () => {
              await learningApi.createAssignment(cls.id, { promptId, lessonId: lessonId || undefined, dueDate: dueDate || undefined, note: note || undefined });
              setPromptId('');
              setLessonId('');
              setDueDate('');
              setNote('');
            })}
          >
            Assign to class
          </button>
          <p className="lw-small lw-muted" style={{ margin: '8px 0 0' }}>Students see assignments that match their grade band.</p>
        </section>
      </div>

      {cls.assignments.length > 0 && (
        <section className="lw-section">
          <h2>Assignments</h2>
          <div className="lw-card" style={{ overflowX: 'auto' }}>
            <table className="lw-table">
              <thead>
                <tr>
                  <th>Prompt</th>
                  <th>Lesson</th>
                  <th>Due</th>
                  <th>Submitted</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {cls.assignments.map((a) => (
                  <tr key={a.id}>
                    <td>
                      {a.promptTitle} {a.band && <span className="lw-small lw-muted">· {BAND_LABELS[a.band]}</span>}
                    </td>
                    <td>{a.lessonTitle ?? '–'}</td>
                    <td>{a.dueDate ?? '–'}</td>
                    <td>
                      {a.submittedCount} of {cls.students.length}
                    </td>
                    <td>
                      <button className="lw-btn lw-btn-quiet lw-btn-small" type="button" onClick={run(() => learningApi.deleteAssignment(a.id))}>
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {cls.students.length > 0 && (
        <section className="lw-section">
          <h2>Where the class is</h2>
          <p className="lw-small lw-muted">Number of students at each level on their most recent first draft. Counts only; levels are never averaged.</p>
          <div className="lw-card" style={{ overflowX: 'auto' }}>
            <table className="lw-table">
              <thead>
                <tr>
                  <th>Skill</th>
                  {[1, 2, 3, 4].map((n) => (
                    <th key={n}>
                      {n} · {LEVEL_LABELS[n]}
                    </th>
                  ))}
                  <th>Not yet seen</th>
                </tr>
              </thead>
              <tbody>
                {cls.distribution.map((d) => (
                  <tr key={d.skillId}>
                    <td>{d.name}</td>
                    {[1, 2, 3, 4].map((n) => (
                      <td key={n}>{d.counts[n as 1 | 2 | 3 | 4] || ''}</td>
                    ))}
                    <td className="lw-muted">{d.counts.notYet || ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="lw-card" style={{ overflowX: 'auto', marginTop: 16 }}>
            <table className="lw-table">
              <thead>
                <tr>
                  <th>Student</th>
                  {cls.distribution.map((d) => (
                    <th key={d.skillId}>{d.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {cls.students.map((s) => (
                  <tr key={s.learner.id}>
                    <td>{s.learner.displayName}</td>
                    {cls.distribution.map((d) => {
                      const k = s.skills.find((x) => x.skillId === d.skillId);
                      return <td key={d.skillId}>{k?.latestRating ? <LevelMeter rating={k.latestRating} compact /> : <span className="lw-muted">–</span>}</td>;
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="lw-section">
        <h2>Review queue</h2>
        <ReviewQueue classId={cls.id} />
      </section>
    </>
  );
}
