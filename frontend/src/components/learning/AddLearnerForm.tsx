'use client';

import { useEffect, useState } from 'react';
import { learningApi } from '@/lib/learning/api';
import { API } from '@/lib/learning/public';
import { readRegion, writeRegion } from '@/lib/learning/region';
import type { Catalog, FrameworkId, Learner } from '@/lib/learning/types';

const COVERAGE: Record<FrameworkId, string> = {
  'us-ccss': 'Kindergarten to Grade 12. Kindergarten–Grade 2 and Grades 9–12 are in early access.',
  'ca-on': 'Grades 1–12 (Ontario curriculum). Grades 1–2 and 9–12 are in early access; other provinces are coming later.',
  'uk-eng': 'Years 1–13 (National Curriculum in England). Years 1–3 and 10–13 are in early access.',
  'au-ac9': 'Foundation to Year 12 (Australian Curriculum). Foundation–Year 2 and Years 9–12 are in early access.',
};

export default function AddLearnerForm({ onCreated, onCancel }: { onCreated: (l: Learner) => void; onCancel?: () => void }) {
  const [catalog, setCatalog] = useState<Pick<Catalog, 'noticeVersion' | 'frameworks'> | null>(null);
  // Rendered only on the client (after sign-in), so reading the saved country here is safe.
  const [curriculum, setCurriculum] = useState<FrameworkId>(() => readRegion() ?? 'us-ccss');
  const [displayName, setDisplayName] = useState('');
  const [localGrade, setLocalGrade] = useState('');
  const [relationship, setRelationship] = useState('parent_guardian');
  const [agree, setAgree] = useState(false);
  const [over13, setOver13] = useState(false);
  const self = relationship === 'self';
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${API}/v1/learning/catalog`)
      .then((r) => r.json())
      .then(setCatalog)
      .catch(() => setError('Could not reach Writing Studio. Please refresh in a minute.'));
  }, []);

  const framework = catalog?.frameworks.find((f) => f.id === curriculum);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!catalog) return;
    setBusy(true);
    setError(null);
    try {
      writeRegion(curriculum);
      onCreated(
        await learningApi.createLearner({
          displayName,
          curriculum,
          localGrade,
          relationship,
          agreeToNotice: agree,
          noticeVersion: catalog.noticeVersion,
          ...(self ? { confirmedAge13: over13 } : {}),
        }),
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the profile.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="lw-card" onSubmit={submit} style={{ maxWidth: 580 }}>
      <h2>{self ? 'Make your own profile' : 'Add a student'}</h2>
      <p className="lw-muted lw-small">{self ? 'Use your first name or a nickname.' : 'Use a first name or nickname. You can add more students later.'}</p>
      <div className="lw-field">
        <label htmlFor="learner-rel">This profile is for</label>
        <select id="learner-rel" className="lw-select" value={relationship} onChange={(e) => setRelationship(e.target.value)}>
          <option value="parent_guardian">My child (I’m their parent or guardian)</option>
          <option value="teacher">My student (I’m a teacher, with permission from the school or family)</option>
          <option value="self">Me (I’m a student aged 13 or older)</option>
        </select>
      </div>
      <div className="lw-field">
        <label htmlFor="learner-name">{self ? 'Your first name or nickname' : 'Student’s first name or nickname'}</label>
        <input id="learner-name" className="lw-input" required maxLength={40} value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </div>
      <div className="lw-field">
        <label htmlFor="learner-country">Country and curriculum</label>
        <select
          id="learner-country"
          className="lw-select"
          value={curriculum}
          onChange={(e) => {
            setCurriculum(e.target.value as FrameworkId);
            setLocalGrade('');
          }}
        >
          {catalog?.frameworks.map((f) => (
            <option key={f.id} value={f.id}>
              {f.country}: {f.shortName}
            </option>
          ))}
        </select>
        <span className="lw-small lw-muted">Sets the spelling, the year names and the curriculum statements in reports.</span>
      </div>
      <div className="lw-field">
        <label htmlFor="learner-grade">{framework?.gradeWord === 'Year' ? 'Year at school' : 'Grade in school'}</label>
        <select id="learner-grade" className="lw-select" required value={localGrade} onChange={(e) => setLocalGrade(e.target.value)} disabled={!framework}>
          <option value="" disabled>
            Choose
          </option>
          {framework?.localGrades.map((g) => (
            <option key={g} value={g}>
              {framework.localGradeLabels?.[g] ?? `${framework.gradeWord} ${g}`}
            </option>
          ))}
        </select>
        <span className="lw-small lw-muted">{COVERAGE[curriculum]}</span>
        {framework && localGrade && framework.gradeNotes?.[localGrade] && (
          <span className="lw-small lw-muted" style={{ display: 'block', marginTop: 4 }}>
            {framework.gradeNotes[localGrade]}
          </span>
        )}
      </div>
      {self && (
        <label className="lw-check" style={{ margin: '6px 0 10px' }}>
          <input type="checkbox" checked={over13} onChange={(e) => setOver13(e.target.checked)} required />
          <span>
            I am 13 or older. <span className="lw-muted lw-small">(Younger students need a parent or teacher to make their profile, or can practice without an account.)</span>
          </span>
        </label>
      )}
      <label className="lw-check" style={{ margin: '6px 0 16px' }}>
        <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} required />
        {self ? (
          <span>
            I agree to the{' '}
            <a href="/learn/privacy" target="_blank" rel="noreferrer">
              learning notice
            </a>
            , including sending my writing to an AI service to get feedback.
          </span>
        ) : (
          <span>
            I am this student’s parent/guardian, or a teacher with permission, and I agree to the{' '}
            <a href="/learn/privacy" target="_blank" rel="noreferrer">
              learning notice
            </a>
            , including sending the student’s writing to an AI service to get feedback.
          </span>
        )}
      </label>
      {error && (
        <p role="alert" className="lw-notice lw-notice-warn">
          {error}
        </p>
      )}
      <div className="lw-btn-row">
        <button className="lw-btn lw-btn-primary" type="submit" disabled={busy || !catalog || !agree || (self && !over13)}>
          {busy ? 'Saving…' : 'Create profile'}
        </button>
        {onCancel && (
          <button className="lw-btn lw-btn-quiet" type="button" onClick={onCancel}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}
