'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { BAND_LABELS, BAND_ORDER } from '@/lib/learning/levels';
import { useSession } from '@/lib/learning/session';
import type { OperatorMetrics } from '@/lib/learning/types';

const fmt = (n: number) => n.toLocaleString('en-US');
const pct = (v: number | null) => (v === null ? '–' : `${Math.round(v * 100)}%`);
const PURPOSE: Record<string, string> = {
  evaluation: 'Feedback',
  repair: 'Feedback repairs',
  second_opinion: 'Second readings',
  coach: '“Am I on track?” checks',
};

function Stat({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="lw-card lw-stat">
      <p className="lw-stat-label">{label}</p>
      <p className="lw-stat-value">{value}</p>
      {note && <p className="lw-small lw-muted" style={{ margin: 0 }}>{note}</p>}
    </div>
  );
}

/** Single-series column chart of tokens per day; the budget is drawn as a reference line. */
function DailyTokens({ daily, budget }: { daily: OperatorMetrics['ai']['daily']; budget: number }) {
  const [hover, setHover] = useState<number | null>(null);
  const max = Math.max(budget, ...daily.map((d) => d.tokens)) * 1.08;
  const W = 640;
  const H = 200;
  const pad = { l: 8, r: 8, t: 12, b: 24 };
  const bw = (W - pad.l - pad.r) / daily.length;
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - v / max);
  const active = hover === null ? null : daily[hover];
  return (
    <figure className="lw-chart" style={{ margin: 0 }}>
      <figcaption className="lw-small lw-muted">AI tokens per day (UTC), last 14 days. The dashed line is the daily budget.</figcaption>
      <div style={{ position: 'relative' }}>
        <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`AI tokens per day for the last ${daily.length} days; daily budget ${fmt(budget)} tokens`} onMouseLeave={() => setHover(null)}>
          <line x1={pad.l} x2={W - pad.r} y1={y(budget)} y2={y(budget)} stroke="var(--lw-ink-3)" strokeDasharray="4 4" strokeWidth={1} />
          <line x1={pad.l} x2={W - pad.r} y1={H - pad.b} y2={H - pad.b} stroke="var(--lw-line)" strokeWidth={1} />
          {daily.map((d, i) => {
            const x = pad.l + i * bw;
            const top = y(d.tokens);
            const h = Math.max(0, H - pad.b - top);
            return (
              <g key={d.date}>
                {h > 0 && (
                  <path
                    d={`M ${x + 3} ${H - pad.b} V ${top + Math.min(4, h)} Q ${x + 3} ${top} ${x + 7} ${top} H ${x + bw - 7} Q ${x + bw - 3} ${top} ${x + bw - 3} ${top + Math.min(4, h)} V ${H - pad.b} Z`}
                    fill="var(--lw-accent)"
                    opacity={hover === null || hover === i ? 1 : 0.55}
                  />
                )}
                {(i === 0 || i === daily.length - 1 || i % 4 === 0) && (
                  <text x={x + bw / 2} y={H - 8} textAnchor="middle" fontSize={11} fill="var(--lw-ink-3)">
                    {d.date.slice(5)}
                  </text>
                )}
                {/* Hit target covers the full column, larger than the bar. */}
                <rect x={x} y={pad.t} width={bw} height={H - pad.t - pad.b} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.date}: ${fmt(d.tokens)} tokens, ${d.calls} calls`} />
              </g>
            );
          })}
        </svg>
        {active && hover !== null && (
          <div className="lw-chart-tip" style={{ left: `${((hover + 0.5) / daily.length) * 100}%` }} role="status">
            <strong>{active.date}</strong>
            <span>{fmt(active.tokens)} tokens</span>
            <span>{active.calls} calls{active.rateLimited ? ` · ${active.rateLimited} rate-limited` : ''}</span>
          </div>
        )}
      </div>
      <details style={{ marginTop: 8 }}>
        <summary className="lw-small" style={{ cursor: 'pointer' }}>Show as a table</summary>
        <table className="lw-table lw-small" style={{ marginTop: 8 }}>
          <thead>
            <tr>
              <th>Date</th>
              <th>Tokens</th>
              <th>Calls</th>
              <th>Rate-limited</th>
            </tr>
          </thead>
          <tbody>
            {daily.map((d) => (
              <tr key={d.date}>
                <td>{d.date}</td>
                <td>{fmt(d.tokens)}</td>
                <td>{d.calls}</td>
                <td>{d.rateLimited}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}

export default function MetricsBoard() {
  const { kind, ready } = useSession();
  const [m, setM] = useState<OperatorMetrics | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== 'adult') return;
    learningApi
      .metrics()
      .then(setM)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load metrics.'));
  }, [kind]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="see usage metrics" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!m) return <p className="lw-muted">Loading…</p>;
  const { ai, learning } = m;
  const usedPct = ai.budget ? ai.tokensToday / ai.budget : 0;
  const helpfulTotal = learning.helpfulness30.yes + learning.helpfulness30.somewhat + learning.helpfulness30.no;

  return (
    <>
      <p className="lw-eyebrow">Site operator</p>
      <h1>Usage and learning</h1>
      <p className="lw-muted" style={{ maxWidth: '48em' }}>
        AI spend against the free-tier budget, and the learning signals that show whether students are getting value. Counts only; no student text.
        See also <Link href="/learn/admin/quality">feedback quality</Link>.
      </p>

      <section className="lw-section">
        <h2>AI budget</h2>
        {usedPct >= 0.8 && (
          <p className="lw-notice lw-notice-warn">
            {usedPct >= 1 ? 'Today’s budget is used up: new feedback waits until midnight UTC.' : `${Math.round(usedPct * 100)}% of today’s budget is used.`} If
            this happens often, it’s time to raise AI_DAILY_TOKEN_BUDGET with a paid plan.
          </p>
        )}
        <div className="lw-grid lw-grid-4">
          <Stat label="Tokens today" value={fmt(ai.tokensToday)} note={`of ${fmt(ai.budget)} (${Math.round(usedPct * 100)}%)`} />
          <Stat label="Left today" value={fmt(ai.remainingToday)} note="Resets at midnight UTC" />
          <Stat label="Tokens per feedback" value={ai.tokensPerFeedbackLast7Days === null ? '–' : fmt(ai.tokensPerFeedbackLast7Days)} note="Last 7 days, including repairs, second readings and checks" />
          <Stat label="Rate-limited calls" value={fmt(ai.rateLimitedLast7Days)} note="Last 7 days" />
        </div>
        <div className="lw-card" style={{ marginTop: 16 }}>
          <DailyTokens daily={ai.daily} budget={ai.budget} />
        </div>
        <table className="lw-table lw-small" style={{ marginTop: 12 }}>
          <caption className="lw-small lw-muted" style={{ textAlign: 'left' }}>Last 7 days by purpose</caption>
          <thead>
            <tr>
              <th>Purpose</th>
              <th>Calls</th>
              <th>Tokens</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(ai.byPurposeLast7Days).map(([k, v]) => (
              <tr key={k}>
                <td>{PURPOSE[k] ?? k}</td>
                <td>{fmt(v.calls)}</td>
                <td>{fmt(v.tokens)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="lw-section">
        <h2>Learning (last 30 days)</h2>
        <div className="lw-grid lw-grid-4">
          <Stat label="Active students" value={fmt(learning.activeLearners30)} note={`${fmt(learning.learners)} profiles in total`} />
          <Stat label="Completed loops" value={fmt(learning.completedLoops30)} note="Students who got feedback and then revised" />
          <Stat label="Returning students" value={fmt(learning.returningLearners30)} note="Wrote on 2 or more days" />
          <Stat label="Adult corrections" value={pct(learning.correctionRate30)} note={`${learning.adultCorrections30} corrections, ${learning.adultConfirmations30} confirmations`} />
          <Stat label="Feedback given" value={fmt(learning.feedback30)} note={`${fmt(learning.submissions30)} submissions`} />
          <Stat
            label="Found it helpful"
            value={helpfulTotal ? pct(learning.helpfulness30.yes / helpfulTotal) : '–'}
            note={`${learning.helpfulness30.yes} yes · ${learning.helpfulness30.somewhat} somewhat · ${learning.helpfulness30.no} no`}
          />
          <Stat label="Waiting for budget" value={fmt(learning.jobStates.waiting_for_budget ?? 0)} note="Saved pieces queued until the budget resets" />
          <Stat label="Need review" value={fmt((learning.jobStates.needs_review ?? 0) + (learning.jobStates.failed ?? 0))} note="Feedback we didn’t show" />
        </div>
        <table className="lw-table lw-small" style={{ marginTop: 12 }}>
          <caption className="lw-small lw-muted" style={{ textAlign: 'left' }}>By grade band</caption>
          <thead>
            <tr>
              <th>Band</th>
              <th>Profiles</th>
              <th>Feedback (30 days)</th>
            </tr>
          </thead>
          <tbody>
            {BAND_ORDER.map((b) => (
              <tr key={b}>
                <td>{BAND_LABELS[b]}</td>
                <td>{fmt(learning.learnersByBand[b] ?? 0)}</td>
                <td>{fmt(learning.evaluationsByBand30[b] ?? 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
      <p className="lw-small lw-muted">Updated {new Date(m.generatedAt).toLocaleString()}.</p>
    </>
  );
}
