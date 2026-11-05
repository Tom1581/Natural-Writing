'use client';

import { useState } from 'react';
import { useRegion } from '@/lib/learning/region';
import type { AlignmentBlock, FrameworkId } from '@/lib/learning/types';

/**
 * Shows the official curriculum statements a lesson or skill is aligned to, for each country.
 * Texts are verbatim from the official documents (see /learn/curriculum).
 */
export default function AlignmentPanel({ alignment, title = 'Curriculum alignment' }: { alignment: AlignmentBlock[]; title?: string }) {
  const region = useRegion();
  const [picked, setPicked] = useState<FrameworkId | null>(null);
  const active = picked ?? region ?? alignment[0]?.framework.id;
  const block = alignment.find((a) => a.framework.id === active) ?? alignment[0];
  if (!block) return null;

  return (
    <section className="lw-card" aria-labelledby="alignment-title">
      <h2 id="alignment-title">{title}</h2>
      <p className="lw-muted lw-small">Official statements this practice is aligned to. Wording is quoted exactly from each curriculum.</p>
      <div className="lw-tabs" role="tablist" aria-label="Country">
        {alignment.map((a) => (
          <button
            key={a.framework.id}
            type="button"
            role="tab"
            className="lw-tab"
            aria-selected={a.framework.id === block.framework.id}
            onClick={() => setPicked(a.framework.id)}
          >
            {a.framework.country.replace(' (England)', '')}
          </button>
        ))}
      </div>
      <p className="lw-small lw-muted">
        {block.framework.shortName} · {block.framework.version}
      </p>
      <div className="lw-align-grid">
        {block.grades.map((g) => (
          <div key={g.grade} className="lw-align-col">
            <h3>{g.label}</h3>
            <ul className="lw-statements">
              {g.statements.map((st) => (
                <li key={st.id}>
                  <a href={st.url} target="_blank" rel="noreferrer" className="lw-code">
                    {st.framework === 'uk-eng' ? st.code : st.shortCode}
                  </a>
                  {st.title && <span className="lw-small lw-muted"> {st.title}</span>}
                  {st.framework === 'uk-eng' && <span className="lw-small lw-muted"> · {st.scope}</span>}
                  <p>{st.text || <span className="lw-muted">(cited by code and title)</span>}</p>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
