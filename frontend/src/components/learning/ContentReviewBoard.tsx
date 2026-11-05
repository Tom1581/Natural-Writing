'use client';

import { useEffect, useMemo, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { BAND_LABELS, BAND_ORDER } from '@/lib/learning/levels';
import { useSession } from '@/lib/learning/session';
import type { ContentQueue } from '@/lib/learning/types';

type Item = ContentQueue['items'][number];
const TYPE_LABEL: Record<Item['itemType'], string> = { lesson: 'Lesson', prompt: 'Prompt', rubric: 'Rubric', drill: 'Practice set' };
const DECISION_LABEL: Record<string, string> = { approve: 'Approved', changes: 'Needs changes', comment: 'Comment' };
const STORE_KEY = 'nq-reviewer';

function itemHref(item: Item) {
  if (item.itemType === 'lesson') return `/learn/lessons/${item.id}`;
  if (item.itemType === 'rubric') return `/learn/rubrics/${item.id}`;
  if (item.itemType === 'drill') return `/learn/practice/${item.id}`;
  // Check-ins and checkpoints have no public page; reviewers open them in the writing view.
  return item.reserved ? `/learn/write/${item.id}` : `/learn/prompts/${item.id}`;
}

function readReviewer(): { name: string; role: string } {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) ?? '') as { name: string; role: string };
  } catch {
    return { name: '', role: '' };
  }
}

/** Educator review queue: open an item, then approve it or say what needs to change. */
export default function ContentReviewBoard() {
  const { kind, ready } = useSession();
  const [queue, setQueue] = useState<ContentQueue | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [band, setBand] = useState<string>('all');
  const [type, setType] = useState<string>('all');
  const [status, setStatus] = useState<string>('todo');
  const [open, setOpen] = useState<string | null>(null);
  const [reviewer, setReviewer] = useState(() => (typeof window === 'undefined' ? { name: '', role: '' } : readReviewer()));
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const load = () =>
    learningApi
      .contentQueue()
      .then(setQueue)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load the review queue.'));

  useEffect(() => {
    if (kind === 'adult') void load();
  }, [kind]);

  const items = useMemo(
    () =>
      (queue?.items ?? []).filter(
        (i) =>
          (band === 'all' || i.band === band) &&
          (type === 'all' || i.itemType === type) &&
          (status === 'all' || (status === 'todo' ? i.approvals === 0 : status === 'changes' ? i.latestDecision === 'changes' : i.approvals > 0)),
      ),
    [queue, band, type, status],
  );

  async function decide(item: Item, decision: 'approve' | 'changes' | 'comment') {
    setFormError(null);
    setSaving(true);
    try {
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(reviewer));
      } catch {
        /* storage may be blocked; the review still saves */
      }
      await learningApi.addContentReview({ itemType: item.itemType, itemId: item.id, decision, notes, reviewerName: reviewer.name, reviewerRole: reviewer.role });
      setNotes('');
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : 'Could not save the review.');
    } finally {
      setSaving(false);
    }
  }

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="review content" />;
  if (error) return <p className="lw-notice lw-notice-warn">{error}</p>;
  if (!queue) return <p className="lw-muted">Loading…</p>;
  const approved = queue.items.filter((i) => i.approvals > 0).length;

  return (
    <>
      <p className="lw-eyebrow">Content review</p>
      <h1>Review lessons, prompts and rubrics</h1>
      <p className="lw-muted" style={{ maxWidth: '48em' }}>
        {approved} of {queue.items.length} items have at least one educator approval. Open an item, read it as a student would, then approve it or say
        what should change. Public pages show your role (not your name) next to an approval. A new version of an item starts unreviewed.
      </p>
      <div className="lw-btn-row" style={{ margin: '12px 0' }}>
        <label className="lw-small">
          Band{' '}
          <select className="lw-select" value={band} onChange={(e) => setBand(e.target.value)}>
            <option value="all">All</option>
            {BAND_ORDER.map((b) => (
              <option key={b} value={b}>{BAND_LABELS[b]}</option>
            ))}
          </select>
        </label>
        <label className="lw-small">
          Type{' '}
          <select className="lw-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="all">All</option>
            {Object.entries(TYPE_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="lw-small">
          Status{' '}
          <select className="lw-select" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="todo">Not yet approved</option>
            <option value="changes">Needs changes</option>
            <option value="done">Approved</option>
            <option value="all">All</option>
          </select>
        </label>
      </div>
      <div className="lw-card" style={{ marginBottom: 16 }}>
        <div className="lw-grid lw-grid-2">
          <div className="lw-field">
            <label htmlFor="rv-name">Your name (kept private)</label>
            <input id="rv-name" className="lw-input" value={reviewer.name} onChange={(e) => setReviewer({ ...reviewer, name: e.target.value })} />
          </div>
          <div className="lw-field">
            <label htmlFor="rv-role">Your role (shown publicly)</label>
            <input id="rv-role" className="lw-input" placeholder="e.g. Grade 4 teacher, Ontario" value={reviewer.role} onChange={(e) => setReviewer({ ...reviewer, role: e.target.value })} />
          </div>
        </div>
      </div>
      <p className="lw-small lw-muted">{items.length} items</p>
      <ul className="lw-plain-list">
        {items.map((item) => {
          const key = `${item.itemType}:${item.id}`;
          return (
            <li key={key} className="lw-card" style={{ display: 'block' }}>
              <div className="lw-card-title">
                <button type="button" className="lw-btn lw-btn-quiet" aria-expanded={open === key} onClick={() => setOpen(open === key ? null : key)}>
                  <strong>{item.title}</strong>
                </button>
                <span className="lw-small lw-muted">
                  {TYPE_LABEL[item.itemType]}
                  {item.reserved ? ' (check-in/checkpoint)' : ''} · {BAND_LABELS[item.band]} · v{item.version} ·{' '}
                  {item.approvals ? `${item.approvals} approval${item.approvals > 1 ? 's' : ''}` : 'not approved'}
                  {item.latestDecision === 'changes' ? ' · needs changes' : ''}
                </span>
              </div>
              {open === key && (
                <div style={{ marginTop: 10 }}>
                  <p className="lw-small">
                    <a href={itemHref(item)} target="_blank" rel="noreferrer">Open this {TYPE_LABEL[item.itemType].toLowerCase()} in a new tab</a>
                  </p>
                  {item.reviews.length > 0 && (
                    <ul className="lw-list lw-small">
                      {item.reviews.map((r) => (
                        <li key={r.id}>
                          <strong>{DECISION_LABEL[r.decision] ?? r.decision}</strong> by {r.reviewerName} ({r.reviewerRole}), {new Date(r.createdAt).toLocaleDateString()}
                          {r.notes && `: ${r.notes}`}
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="lw-field">
                    <label htmlFor={`notes-${key}`}>Notes (required if it needs changes)</label>
                    <textarea id={`notes-${key}`} className="lw-textarea" rows={3} maxLength={4000} value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </div>
                  {formError && <p role="alert" className="lw-notice lw-notice-warn">{formError}</p>}
                  <div className="lw-btn-row">
                    <button type="button" className="lw-btn lw-btn-primary" disabled={saving || !reviewer.name || !reviewer.role} onClick={() => decide(item, 'approve')}>Approve</button>
                    <button type="button" className="lw-btn lw-btn-secondary" disabled={saving || !reviewer.name || !reviewer.role} onClick={() => decide(item, 'changes')}>Needs changes</button>
                    <button type="button" className="lw-btn lw-btn-quiet" disabled={saving || !reviewer.name || !reviewer.role || !notes.trim()} onClick={() => decide(item, 'comment')}>Comment only</button>
                  </div>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </>
  );
}
