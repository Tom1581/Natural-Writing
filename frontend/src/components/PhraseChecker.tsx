'use client';

import { useDeferredValue, useMemo, useState, type ReactNode } from 'react';
import { analyzeRhythm, findAiPhrases, type PhraseMatch } from '@/lib/aiPhrases';
import { trackEvent } from '@/lib/analytics';
import { PREFILL_KEY } from '@/lib/prefill';

const EXAMPLE = `In today's digital age, social media plays a crucial role in shaping how adolescents see themselves. It is important to note that these platforms offer a wide range of benefits. Furthermore, they foster connection and serve as a powerful tool for self-expression. Moreover, recent research delves into the intricate tapestry of online life, underscoring the need for valuable insights. In conclusion, schools must embark on a journey to unlock the full potential of digital literacy.`;


function variationLabel(v: number, sentences: number) {
  if (sentences < 4) return 'add more text';
  if (v < 0.3) return 'low: sentences are similar lengths';
  if (v < 0.5) return 'moderate';
  return 'high: good mix of short and long';
}

export default function PhraseChecker() {
  const [text, setText] = useState('');
  const deferred = useDeferredValue(text);

  const matches = useMemo(() => findAiPhrases(deferred), [deferred]);
  const rhythm = useMemo(() => analyzeRhythm(deferred), [deferred]);
  const strong = matches.filter((m) => m.phrase.level === 'strong').length;
  const per100 = rhythm.words ? (matches.length / rhythm.words) * 100 : 0;

  const grouped = useMemo(() => {
    const byLabel = new Map<string, { match: PhraseMatch; count: number }>();
    for (const m of matches) {
      const entry = byLabel.get(m.phrase.label);
      if (entry) entry.count++;
      else byLabel.set(m.phrase.label, { match: m, count: 1 });
    }
    return [...byLabel.values()].sort(
      (a, b) => Number(b.match.phrase.level === 'strong') - Number(a.match.phrase.level === 'strong') || b.count - a.count,
    );
  }, [matches]);

  const highlighted = useMemo(() => {
    const parts: ReactNode[] = [];
    let last = 0;
    matches.forEach((m, i) => {
      if (m.start < last) return;
      if (m.start > last) parts.push(deferred.slice(last, m.start));
      parts.push(
        <mark key={i} className={`checker-mark checker-mark-${m.phrase.level}`} title={`Try: ${m.phrase.instead}`}>
          {m.text}
        </mark>,
      );
      last = m.end;
    });
    parts.push(deferred.slice(last));
    return parts;
  }, [matches, deferred]);

  const sendToHumanizer = () => {
    try {
      window.sessionStorage.setItem(PREFILL_KEY, text);
    } catch {
      /* storage blocked: the user can paste manually */
    }
    trackEvent('natural_quill_checker_to_humanizer', { word_count: rhythm.words, flagged: matches.length });
    window.location.href = '/';
  };

  return (
    <div className="checker">
      <div className="checker-input">
        <label htmlFor="checker-text" className="checker-label">
          Paste your text
        </label>
        <textarea
          id="checker-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste an essay, email, or article. Nothing is uploaded; the check runs in your browser."
          rows={14}
        />
        <div className="checker-actions">
          <button type="button" onClick={() => setText(EXAMPLE)} className="checker-secondary">
            Try an example
          </button>
          {text && (
            <button type="button" onClick={() => setText('')} className="checker-secondary">
              Clear
            </button>
          )}
        </div>
      </div>

      <div className="checker-results" aria-live="polite">
        {!deferred.trim() ? (
          <p className="checker-empty">Results appear here as you type: flagged words and phrases, suggested replacements, and how varied your sentence lengths are.</p>
        ) : (
          <>
            <div className="checker-stats">
              <div>
                <strong>{matches.length}</strong>
                <span>flagged ({strong} strong)</span>
              </div>
              <div>
                <strong>{per100.toFixed(1)}</strong>
                <span>per 100 words</span>
              </div>
              <div>
                <strong>{rhythm.variation.toFixed(2)}</strong>
                <span>sentence variety: {variationLabel(rhythm.variation, rhythm.sentences)}</span>
              </div>
              <div>
                <strong>{rhythm.emDashes}</strong>
                <span>em dashes</span>
              </div>
            </div>

            {rhythm.repeatedOpeners.length > 0 && (
              <p className="checker-note">
                Repeated sentence openers:{' '}
                {rhythm.repeatedOpeners.map((o) => `"${o.word}" (${o.count}×)`).join(', ')}. Vary how sentences begin.
              </p>
            )}

            <div className="checker-highlight">{highlighted}</div>

            {grouped.length > 0 && (
              <ul className="checker-list">
                {grouped.map(({ match, count }) => (
                  <li key={match.phrase.label}>
                    <span className={`checker-dot checker-dot-${match.phrase.level}`} aria-label={match.phrase.level} />
                    <span className="checker-found">
                      {match.text}
                      {count > 1 && <em> ×{count}</em>}
                    </span>
                    <span className="checker-instead">Try: {match.phrase.instead}</span>
                  </li>
                ))}
              </ul>
            )}

            <button type="button" className="checker-cta" onClick={sendToHumanizer}>
              Rewrite this text with Natural Quill →
            </button>
          </>
        )}
      </div>
    </div>
  );
}
