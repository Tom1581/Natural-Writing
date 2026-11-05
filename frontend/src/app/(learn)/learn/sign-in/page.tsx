'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl, rememberAuthNext } from '@/lib/authRedirect';
import { startStudentSession } from '@/lib/learning/api';
import { useSession } from '@/lib/learning/session';

/** Read by /auth/callback so email-confirmation and Google sign-ins come back to the studio. */
const rememberDestination = () => rememberAuthNext('/learn/dashboard');

export default function SignInPage() {
  const router = useRouter();
  const { kind, ready } = useSession();
  const [who, setWho] = useState<'adult' | 'student'>('adult');
  const [code, setCode] = useState('');
  const [mode, setMode] = useState<'sign-in' | 'create'>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: 'error' | 'good'; text: string } | null>(null);

  useEffect(() => {
    if (ready && kind) router.replace('/learn/dashboard');
  }, [ready, kind, router]);

  async function studentSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      await startStudentSession(code);
      router.replace('/learn/dashboard');
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'That code didn’t work.' });
      setBusy(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      if (mode === 'sign-in') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.replace('/learn/dashboard');
      } else {
        rememberDestination();
        const { data, error } = await supabase.auth.signUp({ email, password, options: { emailRedirectTo: getAuthRedirectUrl() } });
        if (error) throw error;
        if (data.session) router.replace('/learn/dashboard');
        else setMessage({ kind: 'good', text: 'Check your email to confirm your account, then come back here to sign in.' });
      }
    } catch (err) {
      setMessage({ kind: 'error', text: err instanceof Error ? err.message : 'Sign-in failed. Please try again.' });
    } finally {
      setBusy(false);
    }
  }

  async function google() {
    rememberDestination();
    const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: getAuthRedirectUrl() } });
    if (error) setMessage({ kind: 'error', text: error.message });
  }

  return (
    <div style={{ maxWidth: 440, margin: '0 auto' }}>
      <div className="lw-tabs" role="tablist" aria-label="Who is signing in">
        <button type="button" role="tab" className="lw-tab" aria-selected={who === 'adult'} onClick={() => { setWho('adult'); setMessage(null); }}>
          Parent, teacher or 13+
        </button>
        <button type="button" role="tab" className="lw-tab" aria-selected={who === 'student'} onClick={() => { setWho('student'); setMessage(null); }}>
          I’m a student
        </button>
      </div>
      {who === 'student' ? (
        <>
          <h1>Student sign-in</h1>
          <p className="lw-muted">Type the code your teacher or parent gave you. It looks like <strong>K7QM-4XRT-9PWD</strong>.</p>
          <form className="lw-card" onSubmit={studentSignIn}>
            <div className="lw-field">
              <label htmlFor="code">Your code</label>
              <input
                id="code"
                className="lw-input lw-code-input"
                autoComplete="off"
                autoCapitalize="characters"
                spellCheck={false}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="XXXX-XXXX-XXXX"
              />
            </div>
            {message && <p role="alert" className="lw-notice lw-notice-warn">{message.text}</p>}
            <button className="lw-btn lw-btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
              {busy ? 'Checking…' : 'Start writing'}
            </button>
            <p className="lw-small lw-muted" style={{ margin: '12px 0 0' }}>On a shared computer, remember to sign out when you finish.</p>
          </form>
          <div className="lw-card" style={{ marginTop: 16 }}>
            <h2 style={{ fontSize: '1.1rem' }}>No code? You can still practice</h2>
            <p className="lw-small" style={{ marginTop: 0 }}>
              Pick a prompt, write, and get feedback without an account. Nothing is saved by us, so copy your writing if you want to keep it.
            </p>
            <div className="lw-btn-row">
              <Link className="lw-btn lw-btn-primary lw-btn-small" href="/learn/grades">
                Practice without an account
              </Link>
              <button
                className="lw-btn lw-btn-quiet lw-btn-small"
                type="button"
                onClick={() => {
                  setWho('adult');
                  setMode('create');
                  setMessage(null);
                }}
              >
                I’m 13 or older: make my own account
              </button>
            </div>
          </div>
        </>
      ) : (
      <>
      <h1>{mode === 'sign-in' ? 'Sign in' : 'Create an adult account'}</h1>
      <p className="lw-muted">
        For parents, guardians and teachers, and for students aged 13 or older. After you sign in, you’ll create a profile for each student (or
        for yourself), and practice in that profile. Already use the Writing Converter? The same Natural Quill account works here; converter plans and student
        work stay separate.
      </p>
      <div className="lw-card">
        <form onSubmit={submit}>
          <div className="lw-field">
            <label htmlFor="email">Email</label>
            <input id="email" className="lw-input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="lw-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="lw-input"
              type="password"
              autoComplete={mode === 'sign-in' ? 'current-password' : 'new-password'}
              minLength={mode === 'create' ? 8 : undefined}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {message && (
            <p role="alert" className={`lw-notice ${message.kind === 'error' ? 'lw-notice-warn' : 'lw-notice-good'}`}>{message.text}</p>
          )}
          <button className="lw-btn lw-btn-primary" type="submit" disabled={busy} style={{ width: '100%' }}>
            {busy ? 'Please wait…' : mode === 'sign-in' ? 'Sign in' : 'Create account'}
          </button>
        </form>
        <p style={{ textAlign: 'center', margin: '14px 0' }} className="lw-muted lw-small">or</p>
        <button className="lw-btn lw-btn-secondary" type="button" onClick={google} style={{ width: '100%' }}>
          Continue with Google
        </button>
      </div>
      <p style={{ textAlign: 'center', marginTop: 16 }}>
        {mode === 'sign-in' ? (
          <>New here? <button className="lw-btn lw-btn-quiet" type="button" onClick={() => setMode('create')}>Create an account</button></>
        ) : (
          <>Already have an account? <button className="lw-btn lw-btn-quiet" type="button" onClick={() => setMode('sign-in')}>Sign in</button></>
        )}
      </p>
      </>
      )}
    </div>
  );
}
