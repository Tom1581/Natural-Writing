'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { API } from '@/lib/learning/public';
import { useSession } from '@/lib/learning/session';
import type { AuditEntry, Catalog, RosterResult, SchoolDetail } from '@/lib/learning/types';

const ACTIONS: Record<string, string> = {
  'school.created': 'Created the school',
  'member.invited': 'Invited a staff member',
  'member.joined': 'Joined the school',
  'member.removed': 'Removed a staff member',
  'roster.imported': 'Imported a class list',
  'student.code_created': 'Made a student sign-in code',
  'student.code_revoked': 'Turned off a student code',
  'student.deleted': 'Deleted a student profile',
  'student.exported': 'Downloaded a student’s data',
  'feedback.corrected': 'Corrected an AI level',
  'feedback.confirmed': 'Confirmed AI levels',
  'feedback.commented': 'Left a note on a piece',
  'wellbeing.resolved': 'Handled a wellbeing flag',
};

/** "Name, 5" or "Name<TAB>Year 5" per line; a header row is skipped. */
function parseRoster(text: string) {
  return text
    .split(/\r?\n/)
    .map((line) => line.split(/[,\t;]/).map((c) => c.trim()))
    .filter((cells) => cells[0] && !/^(name|student)/i.test(cells[0]))
    .map(([displayName, grade = '']) => ({ displayName, localGrade: grade.replace(/^(grade|year|yr|gr)\s*/i, '') }));
}

export default function SchoolView({ schoolId }: { schoolId: string }) {
  const { kind, ready } = useSession();
  const [school, setSchool] = useState<SchoolDetail | null>(null);
  const [catalog, setCatalog] = useState<Catalog | null>(null);
  const [audit, setAudit] = useState<AuditEntry[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'teacher' | 'admin'>('teacher');
  const [className, setClassName] = useState('');
  const [rosterText, setRosterText] = useState('');
  const [rosterClass, setRosterClass] = useState('');
  const [rosterAgree, setRosterAgree] = useState(false);
  const [result, setResult] = useState<RosterResult | null>(null);

  const load = useCallback(() => {
    learningApi
      .school(schoolId)
      .then((s) => {
        setSchool(s);
        if (s.myRole === 'admin') learningApi.schoolAudit(schoolId).then(setAudit).catch(() => null);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the school.'));
  }, [schoolId]);

  useEffect(() => {
    if (kind !== 'adult') return;
    load();
    fetch(`${API}/v1/learning/catalog`)
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => null);
  }, [kind, load]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="use school accounts" />;
  if (error && !school) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!school) return <p className="lw-muted">Loading…</p>;

  const isAdmin = school.myRole === 'admin';
  const fw = catalog?.frameworks.find((f) => f.id === school.curriculum);
  const rows = parseRoster(rosterText);
  const run = (fn: () => Promise<unknown>) => async () => {
    setError(null);
    try {
      await fn();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  return (
    <>
      <p className="lw-eyebrow">
        <Link href="/learn/school">Schools</Link> · {isAdmin ? 'Admin' : 'Teacher'}
      </p>
      <h1>{school.name}</h1>
      <p className="lw-muted">
        {school.students} students · {fw?.shortName ?? school.curriculum}
      </p>
      {error && <p className="lw-notice lw-notice-warn">{error}</p>}

      <div className="lw-grid lw-grid-2 lw-no-print">
        <section className="lw-card">
          <h2 style={{ fontSize: '1.2rem' }}>Staff</h2>
          <ul className="lw-plain-list">
            {school.members.map((m) => (
              <li key={m.id}>
                <span>
                  {m.email} <span className="lw-small lw-muted">· {m.role}{m.status === 'invited' ? ' (invited)' : ''}{m.isMe ? ' (you)' : ''}</span>
                </span>
                {isAdmin && !m.isMe && (
                  <button
                    className="lw-btn lw-btn-quiet lw-btn-small"
                    type="button"
                    onClick={run(async () => {
                      if (!window.confirm(`Remove ${m.email}? They will lose access to this school’s students immediately.`)) return;
                      setSchool(await learningApi.removeSchoolMember(school.id, m.id));
                    })}
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>
          {isAdmin && (
            <form
              className="lw-btn-row"
              style={{ marginTop: 12 }}
              onSubmit={(e) => {
                e.preventDefault();
                run(async () => {
                  setSchool(await learningApi.inviteMember(school.id, inviteEmail, inviteRole));
                  setInviteEmail('');
                })();
              }}
            >
              <input className="lw-input" style={{ flex: 2, minWidth: 180 }} type="email" required placeholder="teacher@school.org" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} aria-label="Email to invite" />
              <select className="lw-select" style={{ flex: 1, minWidth: 110 }} value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'teacher' | 'admin')} aria-label="Role">
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
              <button className="lw-btn lw-btn-secondary" type="submit">
                Invite
              </button>
            </form>
          )}
          {isAdmin && <p className="lw-small lw-muted" style={{ marginBottom: 0 }}>They accept by signing in with that email and opening the Schools page.</p>}
        </section>

        <section className="lw-card">
          <h2 style={{ fontSize: '1.2rem' }}>Classes</h2>
          <ul className="lw-plain-list">
            {school.classes.map((c) => (
              <li key={c.id}>
                <Link href={`/learn/teach/classes/${c.id}`}>{c.name}</Link>
                {!c.mine && <span className="lw-small lw-muted">another teacher’s class</span>}
              </li>
            ))}
          </ul>
          <form
            className="lw-btn-row"
            style={{ marginTop: 12 }}
            onSubmit={(e) => {
              e.preventDefault();
              run(async () => {
                await learningApi.createClass(className, school.id);
                setClassName('');
                load();
              })();
            }}
          >
            <input className="lw-input" style={{ flex: 1 }} required maxLength={60} placeholder="e.g. Year 5 Oak" value={className} onChange={(e) => setClassName(e.target.value)} aria-label="New class name" />
            <button className="lw-btn lw-btn-secondary" type="submit">
              Add class
            </button>
          </form>
        </section>
      </div>

      <section className="lw-section lw-card lw-no-print">
        <h2 style={{ fontSize: '1.2rem' }}>Import a class list</h2>
        <p className="lw-small lw-muted">
          One student per line: first name or nickname, then {fw?.gradeWord.toLowerCase() ?? 'grade'} (for example <code>Ava, {fw?.localGrades[2] ?? '5'}</code>).
          You can paste straight from a spreadsheet. Only names and {fw?.gradeWord.toLowerCase() ?? 'grade'}s are stored. Each student gets a sign-in code.
        </p>
        <textarea className="lw-textarea" rows={6} value={rosterText} onChange={(e) => setRosterText(e.target.value)} placeholder={'Ava, 5\nBen, 5\nChloe, 5'} aria-label="Class list" />
        <div className="lw-btn-row" style={{ marginTop: 10 }}>
          <select className="lw-select" style={{ maxWidth: 260 }} value={rosterClass} onChange={(e) => setRosterClass(e.target.value)} aria-label="Add to class">
            <option value="">Don’t add to a class</option>
            {school.classes.filter((c) => c.mine || isAdmin).map((c) => (
              <option key={c.id} value={c.id}>
                Add to {c.name}
              </option>
            ))}
          </select>
          <span className="lw-small lw-muted">{rows.length} students ready</span>
        </div>
        <label className="lw-check" style={{ margin: '12px 0' }}>
          <input type="checkbox" checked={rosterAgree} onChange={(e) => setRosterAgree(e.target.checked)} />
          <span>
            The school has authorized using Writing Studio with these students under its own policies, and I agree to the{' '}
            <a href="/learn/privacy" target="_blank" rel="noreferrer">
              learning notice
            </a>
            .
          </span>
        </label>
        <button
          className="lw-btn lw-btn-primary"
          type="button"
          disabled={!rows.length || !rosterAgree || !catalog}
          onClick={run(async () => {
            setResult(await learningApi.importRoster(school.id, { classId: rosterClass || undefined, students: rows, agreeToNotice: true, noticeVersion: catalog!.noticeVersion }));
            setRosterText('');
            load();
          })}
        >
          Import {rows.length || ''} students
        </button>
      </section>

      {result && (
        <section className="lw-section">
          <div className="lw-card-title lw-no-print">
            <h2>Sign-in cards</h2>
            <button className="lw-btn lw-btn-secondary" type="button" onClick={() => window.print()}>
              Print cards
            </button>
          </div>
          <p className="lw-small lw-muted lw-no-print">
            Codes are shown only now. Print or copy them before leaving this page. You can make a new code for any student later from the Students page.
          </p>
          {!result.codesEnabled && <p className="lw-notice lw-notice-warn">Student codes aren’t set up on the server yet (LEARNING_SESSION_SECRET), so no codes were made.</p>}
          <div className="lw-code-cards">
            {result.created.map((r) => (
              <div key={r.learnerId} className="lw-code-card">
                <strong>{r.displayName}</strong>
                <span className="lw-small lw-muted">{r.gradeLabel}</span>
                <span className="lw-code-big">{r.code ?? '—'}</span>
                <span className="lw-small">Sign in at naturalquill.one/learn → “I’m a student”</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {isAdmin && audit && (
        <section className="lw-section lw-no-print">
          <h2>Activity log</h2>
          <p className="lw-small lw-muted">Sensitive actions in this school. Student writing is never shown here.</p>
          <div className="lw-card" style={{ overflowX: 'auto' }}>
            <table className="lw-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Who</th>
                  <th>What</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((e, i) => (
                  <tr key={i}>
                    <td>{new Date(e.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</td>
                    <td>{e.actor}</td>
                    <td>
                      {ACTIONS[e.action] ?? e.action}
                      {e.detail && <span className="lw-small lw-muted"> · {e.detail}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </>
  );
}
