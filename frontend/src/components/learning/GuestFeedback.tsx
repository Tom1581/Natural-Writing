'use client';

import Link from 'next/link';
import { Fragment, useMemo, useState } from 'react';
import LevelMeter from './LevelMeter';
import ReadAloud from './ReadAloud';
import SupportPanel from './SupportPanel';
import { SkillIcon } from './icons';
import { feedbackHighlights, segments } from '@/lib/learning/highlights';
import { localize } from '@/lib/learning/localize';
import type { FrameworkId, GuestFeedbackResult } from '@/lib/learning/types';

type Complete = Extract<GuestFeedbackResult, { kind: 'complete' }>;

/** Feedback for a guest, shown in place of the editor. Nothing here is saved anywhere but this page. */
export default function GuestFeedback({
  result,
  text,
  title,
  curriculum,
  onRevise,
}: {
  result: Complete;
  text: string;
  title: string;
  curriculum: FrameworkId;
  onRevise: () => void;
}) {
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const f = result.feedback;
  const highlights = useMemo(() => feedbackHighlights(f, activeNote), [f, activeNote]);
  const skillName = (id: string) => localize(result.skillNames[id] ?? id, curriculum);
  const focusNote = (noteId: string) => {
    setActiveNote(noteId);
    requestAnimationFrame(() => document.getElementById(`mark-${noteId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  };

  return (
    <>
      <p className="lw-eyebrow">Practice without an account</p>
      <h1>{title}</h1>
      {result.support && <SupportPanel support={result.support} />}
      <p className="lw-lede" style={{ fontSize: '1.1rem', maxWidth: '50em' }}>{f.summary}</p>
      {result.band === 'K-2' && (
        <ReadAloud
          text={[f.summary, ...f.strengths.map((s) => s.message), ...f.nextSteps.map((n) => `${n.message} ${n.hint}`)].join(' ')}
          label="Read my feedback aloud"
        />
      )}

      <div className="lw-feedback-layout">
        <section className="lw-card" aria-label="Your writing">
          <h2 style={{ fontSize: '1.1rem' }}>What you wrote</h2>
          <div className="lw-submitted">
            {segments(text, highlights).map((s, i) =>
              s.noteId ? (
                <mark key={i} id={`mark-${s.noteId}`} data-kind={s.kind} data-active={activeNote === s.noteId} onClick={() => setActiveNote(s.noteId!)}>
                  {s.text}
                </mark>
              ) : (
                <Fragment key={i}>{s.text}</Fragment>
              ),
            )}
          </div>
        </section>

        <section aria-label="Feedback">
          {f.strengths.map((s, i) => (
            <div key={`s${i}`} className="lw-note lw-note-strength" data-active={activeNote === `strength-${i}`}>
              <h3>What works · {skillName(s.skillId)}</h3>
              <p style={{ margin: 0 }}>{s.message}</p>
              {s.quote && (
                <button type="button" className="lw-btn lw-btn-quiet lw-small" onClick={() => focusNote(`strength-${i}`)}>
                  Show in my writing
                </button>
              )}
            </div>
          ))}
          {f.nextSteps.map((n, i) => (
            <div key={`n${i}`} className="lw-note lw-note-next">
              <h3>
                {i === 0 ? 'Try next' : 'Also try'} · {skillName(n.skillId)}
              </h3>
              <p style={{ margin: 0 }}>{n.message}</p>
              <p className="lw-hint">
                <strong>Think about it:</strong> {n.hint}
              </p>
            </div>
          ))}

          <div className="lw-btn-row" style={{ margin: '8px 0 20px' }}>
            <button className="lw-btn lw-btn-primary" type="button" onClick={onRevise}>
              Revise my writing
            </button>
            {result.suggestedLesson && (
              <Link className="lw-btn lw-btn-secondary" href={`/learn/lessons/${result.suggestedLesson.id}`}>
                Lesson: {result.suggestedLesson.title}
              </Link>
            )}
          </div>

          <div className="lw-card">
            <h2 style={{ fontSize: '1.1rem' }}>Skill levels for this draft</h2>
            <ul className="lw-levels">
              {f.dimensions.map((d) => (
                <li key={d.skillId} className="lw-level-row">
                  <div>
                    <strong className="lw-skill-label">
                      <SkillIcon skillId={d.skillId} size={18} /> {skillName(d.skillId)}
                    </strong>
                    <div className="lw-small lw-muted">{d.reason}</div>
                    {d.evidence[0] && (
                      <div className="lw-btn-row" style={{ gap: 12 }}>
                        <button type="button" onClick={() => focusNote(`skill-${d.skillId}`)}>
                          Show evidence
                        </button>
                      </div>
                    )}
                  </div>
                  <LevelMeter rating={d.rating} notRated={d.evidenceState === 'not_applicable'} />
                </li>
              ))}
            </ul>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>
              Levels are practice guidance for this one piece, not a school grade.
            </p>
          </div>

          <div className="lw-card lw-guest-save">
            <h2 style={{ fontSize: '1.1rem' }}>Want to keep your progress?</h2>
            <p className="lw-small" style={{ marginTop: 0 }}>
              Without an account, nothing is saved: copy your writing if you want to keep it. With a profile you get saved drafts, a plan that adapts,
              progress over time and a portfolio.
            </p>
            <ul className="lw-list lw-small">
              <li>Ask a parent or teacher to make you a profile and give you a sign-in code.</li>
              <li>13 or older? You can make your own account.</li>
            </ul>
            <Link className="lw-btn lw-btn-secondary lw-btn-small" href="/learn/sign-in">
              Sign in or make an account
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
