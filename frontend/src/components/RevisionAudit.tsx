'use client';

import { useMemo, useState } from 'react';
import { compareTokens, extractCitationTokens, extractNumberTokens } from '@/lib/compareDrafts';

const EXAMPLE_BEFORE = 'In a fictional class survey, 18 of 40 students reported revising after midnight (Sample, 2024, p. 12). A separate result had p < .05.';
const EXAMPLE_AFTER = 'In a fictional survey, 18 of 40 students reported revising late (Sample, 2024, p. 12). A separate result had p = .05.';

function DifferenceList({ title, missing, added }: { title: string; missing: string[]; added: string[] }) {
  return (
    <section className="revision-audit-result">
      <h3>{title}</h3>
      {missing.length === 0 && added.length === 0 ? (
        <p>No token differences found. This does not mean the meaning is unchanged.</p>
      ) : (
        <>
          {missing.length > 0 && <p><strong>Missing from revision:</strong> {missing.join(', ')}</p>}
          {added.length > 0 && <p><strong>New in revision:</strong> {added.join(', ')}</p>}
        </>
      )}
    </section>
  );
}

export default function RevisionAudit() {
  const [before, setBefore] = useState('');
  const [after, setAfter] = useState('');

  const numbers = useMemo(() => compareTokens(extractNumberTokens(before), extractNumberTokens(after)), [before, after]);
  const citations = useMemo(() => compareTokens(extractCitationTokens(before), extractCitationTokens(after)), [before, after]);
  const hasBoth = before.trim().length > 0 && after.trim().length > 0;

  return (
    <div className="revision-audit">
      <div className="revision-audit-inputs">
        <label>
          <strong>Original draft</strong>
          <textarea value={before} onChange={(event) => setBefore(event.target.value)} rows={10} placeholder="Paste the original passage" />
        </label>
        <label>
          <strong>Revised draft</strong>
          <textarea value={after} onChange={(event) => setAfter(event.target.value)} rows={10} placeholder="Paste the revised passage" />
        </label>
      </div>
      <div className="revision-audit-actions">
        <button type="button" onClick={() => { setBefore(EXAMPLE_BEFORE); setAfter(EXAMPLE_AFTER); }}>Try a fictional example</button>
        <button type="button" onClick={() => { setBefore(''); setAfter(''); }} disabled={!before && !after}>Clear both</button>
      </div>
      {hasBoth ? (
        <div aria-live="polite">
          <DifferenceList title="Number tokens" missing={numbers.missing} added={numbers.added} />
          <DifferenceList title="Common citation patterns" missing={citations.missing} added={citations.added} />
          <p className="home-note">Read the sentences too: this checker does not compare inequality signs, units, dates in context, source accuracy, or the strength of a claim. In the example, “p &lt; .05” becomes “p = .05”; the numbers match, but the meaning changes.</p>
        </div>
      ) : (
        <p className="home-note">Enter both passages to compare visible number tokens and common citation patterns. The text stays in this browser tab.</p>
      )}
    </div>
  );
}
