'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { learningApi } from '@/lib/learning/api';
import type { ReviewItem } from '@/lib/learning/types';

const STATE: Record<string, string> = {
  complete: 'Feedback ready',
  queued: 'Waiting',
  running: 'Reading…',
  not_scored: 'Too short',
  needs_review: 'Needs a look',
  failed: 'Needs a look',
};

export default function ReviewQueue({ classId }: { classId?: string }) {
  const [items, setItems] = useState<ReviewItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    learningApi
      .review(classId)
      .then((r) => !cancelled && setItems(r))
      .catch((e) => !cancelled && setError(e instanceof Error ? e.message : 'Could not load submissions.'));
    return () => {
      cancelled = true;
    };
  }, [classId]);

  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!items) return <p className="lw-muted">Loading…</p>;
  if (!items.length) return <p className="lw-muted">No submissions yet.</p>;

  return (
    <div className="lw-card" style={{ overflowX: 'auto' }}>
      <table className="lw-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Piece</th>
            <th>Date</th>
            <th>Status</th>
            <th>Flags</th>
          </tr>
        </thead>
        <tbody>
          {items.map((i) => (
            <tr key={i.submissionId}>
              <td>{i.learner.displayName}</td>
              <td>
                <Link href={`/learn/feedback/${i.submissionId}`}>{i.promptTitle}</Link>
                <div className="lw-small lw-muted">
                  {i.attemptNumber === 1 ? 'First draft' : `Revision ${i.attemptNumber - 1}`}
                  {i.assistanceMode === 'coached' ? ' · with hints' : ''}
                </div>
              </td>
              <td>{new Date(i.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</td>
              <td>{STATE[i.state] ?? i.state}</td>
              <td>
                {i.needsAttention.map((n) => (
                  <span key={n} className={`lw-pill ${n.startsWith('Wellbeing') ? 'lw-pill-warn' : 'lw-pill-next'}`} style={{ marginRight: 4 }}>
                    {n}
                  </span>
                ))}
                {i.reviewed && <span className="lw-pill lw-pill-good">Reviewed</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
