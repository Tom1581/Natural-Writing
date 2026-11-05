'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import SignInPrompt from './SignInPrompt';
import { learningApi } from '@/lib/learning/api';
import { REGIONS } from '@/lib/learning/region';
import { useSession } from '@/lib/learning/session';
import type { FrameworkId, SchoolSummary } from '@/lib/learning/types';

export default function SchoolHome() {
  const { kind, ready } = useSession();
  const router = useRouter();
  const [summary, setSummary] = useState<SchoolSummary | null>(null);
  const [name, setName] = useState('');
  const [curriculum, setCurriculum] = useState<FrameworkId>('us-ccss');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (kind !== 'adult') return;
    learningApi
      .schools()
      .then(setSummary)
      .catch((e) => setError(e instanceof Error ? e.message : 'Could not load schools.'));
  }, [kind]);

  if (!ready) return <p className="lw-muted">Loading…</p>;
  if (kind !== 'adult') return <SignInPrompt what="use school accounts" />;

  async function create(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      const school = await learningApi.createSchool(name, curriculum);
      router.push(`/learn/school/${school.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the school.');
    }
  }

  async function accept(id: string) {
    try {
      await learningApi.acceptInvite(id);
      router.push(`/learn/school/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not accept the invitation.');
    }
  }

  return (
    <>
      <p className="lw-eyebrow">Schools</p>
      <h1>School accounts</h1>
      <p className="lw-muted" style={{ maxWidth: '46em' }}>
        A school account lets several teachers work with the same students. Admins invite teachers by email, import class lists, and can see who did
        what. When someone leaves the school, removing them ends their access straight away.
      </p>
      {error && <p className="lw-notice lw-notice-warn">{error}</p>}

      {summary?.invitations.map((inv) => (
        <div key={inv.organizationId} className="lw-notice lw-notice-good" style={{ marginBottom: 12 }}>
          You’ve been invited to join <strong>{inv.name}</strong> as {inv.role === 'admin' ? 'an admin' : 'a teacher'}.{' '}
          <button className="lw-btn lw-btn-primary lw-btn-small" type="button" onClick={() => accept(inv.organizationId)}>
            Accept
          </button>
        </div>
      ))}

      <div className="lw-grid lw-grid-3" style={{ marginTop: 16 }}>
        {summary?.schools.map((s) => (
          <Link key={s.id} href={`/learn/school/${s.id}`} className="lw-card lw-link-card">
            <h2 style={{ fontSize: '1.2rem' }}>{s.name}</h2>
            <p className="lw-small lw-muted" style={{ margin: 0 }}>{s.role === 'admin' ? 'Admin' : 'Teacher'}</p>
          </Link>
        ))}
        <form className="lw-card" onSubmit={create}>
          <h2 style={{ fontSize: '1.2rem' }}>Create a school</h2>
          <div className="lw-field">
            <label htmlFor="school-name">School name</label>
            <input id="school-name" className="lw-input" required minLength={2} maxLength={100} value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="lw-field">
            <label htmlFor="school-country">Country and curriculum</label>
            <select id="school-country" className="lw-select" value={curriculum} onChange={(e) => setCurriculum(e.target.value as FrameworkId)}>
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <button className="lw-btn lw-btn-primary" type="submit">
            Create school
          </button>
          <p className="lw-small lw-muted" style={{ margin: '10px 0 0' }}>You’ll be its first admin.</p>
        </form>
      </div>
    </>
  );
}
