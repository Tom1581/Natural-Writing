'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import LevelMeter from './LevelMeter';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { LEVEL_LABELS } from '@/lib/learning/levels';
import { localize } from '@/lib/learning/localize';
import { useSession } from '@/lib/learning/session';
import type { Report } from '@/lib/learning/types';

const STATE = { not_observed: 'Not seen yet', practicing: 'Practicing', demonstrated: 'Shown on 2+ prompts', check_due: 'Shown before; time to check again' } as const;
const fmt = (iso: string) => new Date(iso).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

/** Small history of levels, first to latest. Hollow dots were revisions or written with hints. */
function History({ points }: { points: Report['skills'][number]['history'] }) {
  if (!points.length) return <span className="lw-muted">–</span>;
  const w = Math.max(points.length * 18, 40);
  return (
    <svg width={w} height={44} role="img" aria-label={`Levels over time: ${points.map((p) => p.rating).join(', ')}`} className="lw-history">
      {[1, 2, 3, 4].map((n) => (
        <line key={n} x1={0} x2={w} y1={44 - n * 9} y2={44 - n * 9} className="lw-history-grid" />
      ))}
      <polyline points={points.map((p, i) => `${9 + i * 18},${44 - p.rating * 9}`).join(' ')} className="lw-history-line" />
      {points.map((p, i) => (
        <circle key={i} cx={9 + i * 18} cy={44 - p.rating * 9} r={4} className={p.independent ? 'lw-history-dot' : 'lw-history-dot lw-history-dot-open'}>
          <title>
            {fmt(p.date)}: level {p.rating} ({LEVEL_LABELS[p.rating]}), {p.promptTitle}
            {p.independent ? '' : ' (revision or with hints)'}
          </title>
        </circle>
      ))}
    </svg>
  );
}

export default function ReportView({ learnerId }: { learnerId: string }) {
  const { kind, ready } = useSession();
  const [report, setReport] = useState<Report | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!kind) return;
    learningApi
      .report(learnerId)
      .then(setReport)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the report.'));
  }, [kind, learnerId]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (!kind) return <SignInPrompt what="see this report" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!report) return <p className="lw-muted">Loading…</p>;

  const { learner, totals } = report;
  return (
    <article className="lw-report">
      <div className="lw-card-title lw-no-print">
        <Link href="/learn/dashboard">← Back</Link>
        <button className="lw-btn lw-btn-secondary" type="button" onClick={() => window.print()}>
          Print or save as PDF
        </button>
      </div>
      <header className="lw-report-head">
        <p className="lw-eyebrow">Writing progress report</p>
        <h1>{learner.displayName}</h1>
        <p className="lw-muted">
          {learner.gradeLabel} · {report.framework.name} ({report.framework.version}) · generated {fmt(report.generatedAt)}
        </p>
      </header>

      <section className="lw-stats">
        <div>
          <strong>{totals.pieces}</strong>
          <span>pieces written</span>
        </div>
        <div>
          <strong>{totals.revisions}</strong>
          <span>revisions</span>
        </div>
        <div>
          <strong>{totals.words.toLocaleString()}</strong>
          <span>words in total</span>
        </div>
        <div>
          <strong>{totals.reflections}</strong>
          <span>reflections</span>
        </div>
      </section>

      <section className="lw-section">
        <h2>Skills</h2>
        <p className="lw-small lw-muted">
          Latest level from the most recent first draft. Filled dots are first drafts written independently; hollow dots are revisions or pieces
          written with hints.
        </p>
        <div className="lw-card" style={{ overflowX: 'auto' }}>
          <table className="lw-table">
            <thead>
              <tr>
                <th>Skill</th>
                <th>Status</th>
                <th>Latest level</th>
                <th>Over time</th>
                <th>{learner.gradeLabel} curriculum statements</th>
              </tr>
            </thead>
            <tbody>
              {report.skills.map((k) => (
                <tr key={k.skillId}>
                  <td>
                    <strong>{localize(k.name, learner.curriculum)}</strong>
                  </td>
                  <td>{localize(STATE[k.state], learner.curriculum)}</td>
                  <td>
                    <LevelMeter rating={k.latestRating} />
                  </td>
                  <td>
                    <History points={k.history} />
                  </td>
                  <td className="lw-small">
                    {k.standards.map((st) => (
                      <div key={st.code + st.text} title={st.text}>
                        <span className="lw-code">{st.framework === 'uk-eng' ? st.scope : st.shortCode}</span>{' '}
                        {(st.text || st.title || '').slice(0, 110)}
                        {(st.text || '').length > 110 ? '…' : ''}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="lw-section">
        <h2>Recent writing</h2>
        {report.pieces.length === 0 && <p className="lw-muted">No writing submitted yet.</p>}
        {report.pieces.slice(0, 12).map((p) => (
          <div key={p.submissionId} className="lw-card lw-report-piece">
            <div className="lw-card-title">
              <h3 style={{ margin: 0 }}>
                <Link href={`/learn/feedback/${p.submissionId}`}>{p.promptTitle}</Link>
              </h3>
              <span className="lw-small lw-muted">
                {fmt(p.date)} · {p.attemptNumber === 1 ? 'first draft' : `revision ${p.attemptNumber - 1}`} · {p.words} words
                {p.assistanceMode === 'coached' ? ' · with hints' : ''}
              </span>
            </div>
            {p.summary && <p style={{ margin: '8px 0 4px' }}>{p.summary}</p>}
            {p.nextStep && (
              <p className="lw-small" style={{ margin: 0 }}>
                <strong>Next step:</strong> {p.nextStep.message}
              </p>
            )}
            {p.reflection && (
              <p className="lw-small lw-muted" style={{ margin: '4px 0 0' }}>
                <strong>Student reflection:</strong> “{p.reflection}”
              </p>
            )}
          </div>
        ))}
      </section>

      <p className="lw-notice">{report.note}</p>
    </article>
  );
}
