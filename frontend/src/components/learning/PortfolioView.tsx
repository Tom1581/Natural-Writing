'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { LEVEL_LABELS } from '@/lib/learning/levels';
import { localize } from '@/lib/learning/localize';
import { useLearners, useSession } from '@/lib/learning/session';
import type { PortfolioView as Portfolio } from '@/lib/learning/types';

/** The student's chosen best pieces, with levels and reflections. Prints cleanly for conferences. */
export default function PortfolioView() {
  const { kind, ready } = useSession();
  const { active } = useLearners(!!kind);
  const [data, setData] = useState<Portfolio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const activeId = active?.id;

  useEffect(() => {
    if (!activeId) return;
    learningApi
      .portfolio(activeId)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the portfolio.'));
  }, [activeId]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (!kind) return <SignInPrompt what="see a portfolio" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!data) return <p className="lw-muted">Loading…</p>;
  const fw = data.learner.curriculum;

  return (
    <>
      <p className="lw-eyebrow">
        {data.learner.displayName} · {data.learner.gradeLabel}
      </p>
      <h1>Portfolio</h1>
      <p className="lw-muted" style={{ maxWidth: '44em' }}>
        Pieces chosen as best work, with the levels and reflection for each. Add a piece from its feedback page. Use your browser’s Print to bring
        it to a conference.
      </p>
      {data.pieces.length === 0 && (
        <p className="lw-notice">
          No pieces yet. After feedback, choose “Add to my portfolio” on a piece you’re proud of. <Link href="/learn/dashboard">Go to my writing</Link>
        </p>
      )}
      {data.pieces.map((p) => (
        <article key={p.submissionId} className="lw-card" style={{ marginTop: 16, breakInside: 'avoid' }}>
          <div className="lw-card-title">
            <h2 style={{ fontSize: '1.2rem', margin: 0 }}>{p.prompt?.title ?? 'Writing'}</h2>
            <span className="lw-small lw-muted">
              {new Date(p.createdAt).toLocaleDateString()} · {p.attemptNumber === 1 ? 'First draft' : `Revision ${p.attemptNumber - 1}`}
            </span>
          </div>
          <div className="lw-submitted" style={{ marginTop: 10 }}>{p.text}</div>
          {p.levels.length > 0 && (
            <ul className="lw-plain-list lw-small" style={{ marginTop: 10 }}>
              {p.levels.map((l) => (
                <li key={l.skillId}>
                  {localize(l.name, fw)}: <strong>{l.rating ?? '–'}</strong>
                  {l.rating ? <span className="lw-muted"> ({LEVEL_LABELS[l.rating]})</span> : null}
                </li>
              ))}
            </ul>
          )}
          {p.reflection && (
            <p className="lw-small" style={{ margin: '10px 0 0' }}>
              <strong>My reflection:</strong> {p.reflection}
            </p>
          )}
          <p className="lw-small lw-noprint" style={{ margin: '10px 0 0' }}>
            <Link href={`/learn/feedback/${p.submissionId}`}>Open the feedback</Link>
          </p>
        </article>
      ))}
    </>
  );
}
