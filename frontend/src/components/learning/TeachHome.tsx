'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import ReviewQueue from './ReviewQueue';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { useSession } from '@/lib/learning/session';
import type { ClassSummary } from '@/lib/learning/types';

export default function TeachHome() {
  const { kind, ready } = useSession();
  const [classes, setClasses] = useState<ClassSummary[] | null>(null);
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    learningApi
      .classes()
      .then(setClasses)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load classes.'));
  }, []);

  useEffect(() => {
    if (kind === 'adult') load();
  }, [kind, load]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="use teacher tools" />;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await learningApi.createClass(name);
      setName('');
      load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the class.');
    }
  }

  return (
    <>
      <p className="lw-eyebrow">Teacher tools</p>
      <h1>Your classes</h1>
      <p className="lw-muted" style={{ maxWidth: '44em' }}>
        Group the student profiles you manage into classes, assign prompts and lessons, see where the class is, and check or correct AI feedback.
        Add students on the <Link href="/learn/dashboard">Students</Link> page, and give each one a sign-in code to use on school devices.
      </p>
      {error && <p className="lw-notice lw-notice-warn">{error}</p>}
      <div className="lw-grid lw-grid-3" style={{ marginTop: 16 }}>
        {classes?.map((c) => (
          <Link key={c.id} href={`/learn/teach/classes/${c.id}`} className="lw-card lw-link-card">
            <h2 style={{ fontSize: '1.2rem' }}>{c.name}</h2>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>
              {c.students} {c.students === 1 ? 'student' : 'students'}
            </p>
          </Link>
        ))}
        <form className="lw-card" onSubmit={create}>
          <label htmlFor="class-name" className="lw-label">
            New class
          </label>
          <input
            id="class-name"
            className="lw-input"
            required
            maxLength={60}
            placeholder="e.g. Room 12 or Year 7 English"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={{ margin: '6px 0 10px' }}
          />
          <button className="lw-btn lw-btn-primary" type="submit">
            Create class
          </button>
        </form>
      </div>
      <section className="lw-section">
        <h2>Review queue</h2>
        <p className="lw-muted lw-small">
          Newest first. Pieces a student flagged, or that couldn’t get feedback, are at the top. Open one to read it, adjust a level, or leave a
          note.
        </p>
        <ReviewQueue />
      </section>
    </>
  );
}
