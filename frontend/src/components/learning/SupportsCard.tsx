'use client';

import { useState } from 'react';
import { learningApi } from '@/lib/learning/api';
import type { Learner, Supports } from '@/lib/learning/types';

const OPTIONS: { key: keyof Supports; label: string; help: string }[] = [
  { key: 'eal', label: 'Learning English as an additional language', help: 'Feedback uses simpler sentences, and ideas are never marked down because of grammar.' },
  { key: 'readAloud', label: 'Read aloud', help: 'Shows read-aloud buttons prominently on tasks and lessons.' },
  { key: 'largerText', label: 'Larger text', help: 'Starts the writing area with larger text on this student’s devices.' },
  { key: 'dictation', label: 'Dictation (speech to text)', help: 'Adds a microphone button. Dictated pieces don’t count as spelling evidence.' },
];

/** Learning supports for one student. These are preferences, not diagnoses, and are never shared. */
export default function SupportsCard({ learner, onSaved }: { learner: Learner; onSaved: () => void }) {
  const [supports, setSupports] = useState<Supports>(learner.supports ?? {});
  const [saving, setSaving] = useState(false);

  async function toggle(key: keyof Supports) {
    const next = { ...supports, [key]: !supports[key] };
    setSupports(next);
    setSaving(true);
    try {
      await learningApi.updateSupports(learner.id, { [key]: next[key] });
      onSaved();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="lw-card">
      <h3>Learning supports</h3>
      <p className="lw-small lw-muted">Optional. Turn on what helps {learner.displayName}; no reasons or records needed.</p>
      {OPTIONS.map((o) => (
        <label key={o.key} className="lw-check" style={{ marginBottom: 10 }}>
          <input type="checkbox" checked={!!supports[o.key]} disabled={saving} onChange={() => toggle(o.key)} />
          <span>
            <strong>{o.label}</strong>
            <br />
            <span className="lw-small lw-muted">{o.help}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
