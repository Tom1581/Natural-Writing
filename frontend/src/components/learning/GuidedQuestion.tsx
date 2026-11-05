'use client';

import { useState } from 'react';
import LocalizedText from './LocalizedText';
import type { Lesson } from '@/lib/learning/types';

/** Lesson practice question. Checked in the browser; it needs no AI and works offline. */
export default function GuidedQuestion({ guided }: { guided: Lesson['guided'] }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [solved, setSolved] = useState(false);

  return (
    <div>
      <p style={{ fontWeight: 600 }}>
        <LocalizedText text={guided.question} />
      </p>
      {guided.detail && (
        <p className="lw-source">
          <LocalizedText text={guided.detail} />
        </p>
      )}
      <div role="group" aria-label="Answer choices" style={{ marginTop: 12 }}>
        {guided.options.map((o, i) => (
          <button
            key={o.text}
            type="button"
            className="lw-option"
            data-result={picked === i ? (o.correct ? 'correct' : 'wrong') : undefined}
            onClick={() => {
              setPicked(i);
              if (o.correct) setSolved(true);
            }}
            disabled={solved && !o.correct}
          >
            <LocalizedText text={o.text} />
          </button>
        ))}
      </div>
      <p aria-live="polite" style={{ minHeight: '1.6em', marginTop: 8 }}>
        {picked !== null && (
          <>
            <strong>{guided.options[picked].correct ? 'Yes! ' : 'Not quite. '}</strong>
            <LocalizedText text={guided.options[picked].feedback} />
            {!guided.options[picked].correct && ' Try another answer.'}
          </>
        )}
      </p>
    </div>
  );
}
