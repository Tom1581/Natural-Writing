'use client';

import { useState } from 'react';
import { learningApi } from '@/lib/learning/api';
import LocalizedText from './LocalizedText';
import type { DrillItem } from '@/lib/learning/types';

/** Runs a practice set in the browser. Choices are checked instantly; rewrites are self-checked against samples. */
/** Records completion for the signed-in student's plan; silent for visitors. */
function recordCompletion(drillId: string) {
  let learnerId: string | null = null;
  try {
    learnerId = localStorage.getItem('nq-learn-active-learner');
  } catch {
    /* no storage */
  }
  if (learnerId) learningApi.completeDrill(learnerId, drillId).catch(() => null);
}

export default function DrillPlayer({ items, drillId }: { items: DrillItem[]; drillId: string }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [answer, setAnswer] = useState('');
  const [revealed, setRevealed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const item = items[index];
  const choiceItems = items.filter((i) => i.kind === 'choice').length;

  function next() {
    if (index + 1 >= items.length) {
      setDone(true);
      recordCompletion(drillId);
    } else {
      setIndex(index + 1);
      setPicked(null);
      setAnswer('');
      setRevealed(false);
    }
  }

  if (done) {
    return (
      <div className="lw-card" role="status">
        <h2>Set complete</h2>
        <p>
          You answered {correctCount} of {choiceItems} choice questions correctly on the first try, and practiced {items.length - choiceItems} rewrites.
        </p>
        <p className="lw-muted lw-small">The best practice is using these moves in your own writing. Try them in your next draft.</p>
        <button
          className="lw-btn lw-btn-secondary"
          type="button"
          onClick={() => {
            setIndex(0);
            setPicked(null);
            setAnswer('');
            setRevealed(false);
            setCorrectCount(0);
            setDone(false);
          }}
        >
          Practice again
        </button>
      </div>
    );
  }

  return (
    <div className="lw-card">
      <div className="lw-progress" style={{ marginBottom: 12 }}>
        <span className="lw-small lw-muted">
          Question {index + 1} of {items.length}
        </span>
        <div className="lw-bar" aria-hidden="true">
          <span style={{ width: `${(index / items.length) * 100}%` }} />
        </div>
      </div>
      <p style={{ fontWeight: 600, fontSize: '1.05rem' }}>
        <LocalizedText text={item.prompt} />
      </p>

      {item.kind === 'choice' ? (
        <>
          {item.detail && (
            <p className="lw-source">
              <LocalizedText text={item.detail} />
            </p>
          )}
          <div role="group" aria-label="Answer choices">
            {item.options.map((o, i) => (
              <button
                key={o.text}
                type="button"
                className="lw-option"
                data-result={picked === i ? (o.correct ? 'correct' : 'wrong') : undefined}
                disabled={picked !== null && item.options[picked].correct && !o.correct}
                onClick={() => {
                  if (picked === null && o.correct) setCorrectCount((c) => c + 1);
                  setPicked(i);
                }}
              >
                <LocalizedText text={o.text} />
              </button>
            ))}
          </div>
          <p aria-live="polite" style={{ minHeight: '1.6em' }}>
            {picked !== null && (
              <>
                <strong>{item.options[picked].correct ? 'Yes! ' : 'Not quite. '}</strong>
                <LocalizedText text={item.options[picked].feedback} />
              </>
            )}
          </p>
          <button className="lw-btn lw-btn-primary" type="button" onClick={next} disabled={picked === null || !item.options[picked].correct}>
            {index + 1 >= items.length ? 'Finish' : 'Next'}
          </button>
        </>
      ) : (
        <>
          <p className="lw-model">
            <LocalizedText text={item.original} />
          </p>
          <label htmlFor="drill-answer" className="lw-label">
            Your version
          </label>
          <textarea id="drill-answer" className="lw-textarea" rows={3} value={answer} onChange={(e) => setAnswer(e.target.value)} style={{ marginTop: 6 }} />
          {!revealed ? (
            <button className="lw-btn lw-btn-secondary" type="button" onClick={() => setRevealed(true)} disabled={!answer.trim()} style={{ marginTop: 10 }}>
              Compare
            </button>
          ) : (
            <div aria-live="polite" style={{ marginTop: 12 }}>
              <p className="lw-label">Check yours:</p>
              <ul className="lw-checklist">
                {item.checklist.map((c) => (
                  <li key={c}>
                    <LocalizedText text={c} />
                  </li>
                ))}
              </ul>
              <p className="lw-label">{item.samples.length > 1 ? 'Some good answers:' : 'One good answer:'}</p>
              <ul className="lw-list">
                {item.samples.map((sample) => (
                  <li key={sample}>
                    <LocalizedText text={sample} />
                  </li>
                ))}
              </ul>
              <p className="lw-small lw-muted">Yours doesn’t have to match. If it meets the checklist, it works.</p>
              <button className="lw-btn lw-btn-primary" type="button" onClick={next}>
                {index + 1 >= items.length ? 'Finish' : 'Next'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
