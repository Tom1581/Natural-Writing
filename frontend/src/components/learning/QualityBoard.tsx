'use client';

import { useEffect, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { useSession } from '@/lib/learning/session';
import type { AgreementStats, QualitySummary } from '@/lib/learning/types';

const pct = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}%`);
const num = (v: number | null) => (v === null ? '–' : v.toFixed(2));
const LABEL: Record<string, string> = {
  self_harm: 'Self-harm',
  abuse: 'Possible abuse',
  threat: 'Threat to others',
  personal_info: 'Personal details',
  other: 'Other',
  screen: 'Phrase check',
  ai: 'AI check',
};

/** Shows a value against the plan's gate (within one level ≥ 90%, |bias| ≤ 0.3). */
function Gate({ stats }: { stats: AgreementStats }) {
  if (!stats.n) return <span className="lw-muted">No reviews yet</span>;
  const ok = (stats.adjacent ?? 0) >= 0.9 && Math.abs(stats.meanBias ?? 0) <= 0.3;
  return <span className={`lw-pill ${ok ? 'lw-pill-good' : 'lw-pill-next'}`}>{ok ? 'Within target' : 'Below target'}</span>;
}

export default function QualityBoard() {
  const { kind, ready } = useSession();
  const [q, setQ] = useState<QualitySummary | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== 'adult') return;
    learningApi
      .quality()
      .then(setQ)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load quality data.'));
  }, [kind]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="see quality data" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!q) return <p className="lw-muted">Loading…</p>;

  return (
    <>
      <p className="lw-eyebrow">Site operator</p>
      <h1>AI feedback quality</h1>
      <p className="lw-muted" style={{ maxWidth: '48em' }}>{q.note}</p>

      <section className="lw-stats">
        <div>
          <strong>{q.reviewedPieces}</strong>
          <span>pieces reviewed by an adult</span>
        </div>
        <div>
          <strong>{pct(q.agreement.overall.adjacent)}</strong>
          <span>within one level (target 90%)</span>
        </div>
        <div>
          <strong>{num(q.agreement.overall.meanBias)}</strong>
          <span>bias (AI − adult)</span>
        </div>
        <div>
          <strong>{q.safetyFlags.open}</strong>
          <span>open wellbeing flags</span>
        </div>
      </section>

      <section className="lw-section">
        <h2>Agreement by skill</h2>
        <div className="lw-card" style={{ overflowX: 'auto' }}>
          <table className="lw-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Reviews</th>
                <th>Exact</th>
                <th>Within 1</th>
                <th>Bias</th>
                <th>QWK</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {[...q.agreement.bySkill, { ...q.agreement.overall, skillId: 'all', name: 'All skills' }].map((s) => (
                <tr key={s.skillId}>
                  <td>{s.skillId === 'all' ? <strong>{s.name}</strong> : s.name}</td>
                  <td>{s.n}</td>
                  <td>{pct(s.exact)}</td>
                  <td>{pct(s.adjacent)}</td>
                  <td>{num(s.meanBias)}</td>
                  <td>{num(s.qwk)}</td>
                  <td>
                    <Gate stats={s} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lw-section lw-grid lw-grid-2">
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>Feedback pipeline</h2>
          <ul className="lw-plain-list">
            <li>
              <span>Submissions</span>
              <strong>{q.submissions}</strong>
            </li>
            {Object.entries(q.jobs).map(([state, n]) => (
              <li key={state}>
                <span>{state.replace('_', ' ')}</span>
                <strong>{n}</strong>
              </li>
            ))}
            <li>
              <span>Reported as wrong by a student or adult</span>
              <strong>{q.feedbackReports}</strong>
            </li>
          </ul>
        </div>
        <div className="lw-card">
          <h2 style={{ fontSize: '1.15rem' }}>Wellbeing flags (all time)</h2>
          <ul className="lw-plain-list">
            {Object.entries(q.safetyFlags.byCategory).map(([c, n]) => (
              <li key={c}>
                <span>{LABEL[c] ?? c}</span>
                <strong>{n}</strong>
              </li>
            ))}
            {Object.entries(q.safetyFlags.bySource).map(([c, n]) => (
              <li key={c}>
                <span className="lw-muted">{LABEL[c] ?? c}</span>
                <span className="lw-muted">{n}</span>
              </li>
            ))}
          </ul>
          <p className="lw-small lw-muted" style={{ margin: '8px 0 0' }}>Counts only. Flags are handled by the adult who manages each student.</p>
        </div>
      </section>
    </>
  );
}
