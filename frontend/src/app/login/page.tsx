'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, Lock, ChevronRight, ShieldCheck, Loader2,
  User as UserIcon, KeyRound, CheckCircle2, Bot, ArrowRight,
  FileSearch, Fingerprint, ScanSearch, Radar, ShieldQuestion,
  Feather, BookOpen,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { getAuthRedirectUrl } from '@/lib/authRedirect';
import BrandMark from '@/components/BrandMark';

type AuthMode = 'login' | 'register' | 'forgot';

const detectorReferences = [
  { name: 'Turnitin', icon: FileSearch, tone: 'blue' },
  { name: 'GPTZero', icon: Fingerprint, tone: 'green' },
  { name: 'QuillBot', icon: Feather, tone: 'teal' },
  { name: 'Grammarly', icon: CheckCircle2, tone: 'emerald' },
  { name: 'Originality', icon: ScanSearch, tone: 'gold' },
  { name: 'Copyleaks', icon: Radar, tone: 'violet' },
  { name: 'ZeroGPT', icon: Bot, tone: 'cyan' },
  { name: 'Writer', icon: BookOpen, tone: 'indigo' },
  { name: 'Winston AI', icon: ShieldQuestion, tone: 'rose' },
  { name: 'Sapling', icon: Fingerprint, tone: 'lime' },
  { name: 'Scribbr', icon: FileSearch, tone: 'amber' },
];

export default function LoginPage() {
  const router = useRouter();
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  // Redirect to home if already signed in
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        router.replace('/');
      } else {
        setCheckingSession(false);
      }
    });
  }, [router]);

  if (checkingSession) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    );
  }

  const getTitle = () => {
    switch (authMode) {
      case 'register': return 'Create your Natural Quill account';
      case 'forgot': return 'Reset your password';
      default: return 'Sign in to Natural Quill';
    }
  };

  const getDescription = () => {
    switch (authMode) {
      case 'register': return 'Start a cleaner writing workflow with detector reference checks and natural-sounding rewrites.';
      case 'forgot': return 'Enter your email and we will send you a secure reset link.';
      default: return 'Sign in with email or Google to continue refining AI-generated writing into something more natural.';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
          if (error.message.includes('Invalid login credentials') || error.message.includes('Email not confirmed')) {
            toast.error('Invalid email or password. Need an account?');
            setAuthMode('register');
            return;
          }
          throw error;
        }
        if (data.session) {
          toast.success('Welcome back!');
          router.replace('/');
        }
      } else if (authMode === 'register') {
        if (password.length < 8) {
          toast.error('Password must be at least 8 characters.');
          return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
          toast.error('Password requires 1 uppercase, 1 lowercase, 1 number, and 1 special character (!@#$%^&*).');
          return;
        }
        if (password !== confirmPassword) {
          toast.error('Passwords do not match.');
          return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { name: name || 'New Writer' },
            emailRedirectTo: getAuthRedirectUrl(),
          },
        });
        if (error) throw error;

        if (data.session) {
          // Auto-confirmed (email confirmation disabled in Supabase)
          toast.success('Account created! Welcome to Natural Quill.');
          router.replace('/');
        } else {
          // Email confirmation required
          toast.success('Check your inbox — we sent a confirmation link. After confirming, come back and sign in.');
          setAuthMode('login');
        }
      } else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: getAuthRedirectUrl(),
        });
        if (error) throw error;
        toast.success('Password reset link sent — check your email.');
        setAuthMode('login');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: getAuthRedirectUrl(),
        },
      });
      if (error) throw error;
      // Browser will redirect to Google — no need to reset oauthLoading
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in failed.');
      setOauthLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      padding: '1.5rem',
    }}>
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1f', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          background: '#0a0a0f',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: '1.5rem',
          width: '100%',
          maxWidth: '480px',
          padding: '2.5rem',
          boxShadow: '0 40px 100px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="icon-container-core login-brand-mark" style={{ margin: '0 auto' }}>
            <BrandMark size={42} />
          </div>

          <h2 className="text-display login-title">Natural Quill</h2>
          <p className="login-subtitle" style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
            {getTitle()}
          </p>

          {authMode !== 'forgot' && (
            <div className="login-reference-strip" aria-label="AI detector reference platforms">
              {detectorReferences.map(({ name: n, icon: Icon, tone }) => (
                <div key={n} className={`login-reference-pill login-reference-pill-${tone}`} title={`${n} reference`}>
                  <Icon size={14} strokeWidth={2.2} />
                  <span>{n}</span>
                </div>
              ))}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: '0' }}>
            {authMode !== 'forgot' && (
              <>
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={oauthLoading || isLoading}
                  className="auth-social-btn"
                >
                  <span className="google-mark" aria-hidden="true">
                    <span className="google-mark-blue">G</span>
                    <span className="google-mark-red">o</span>
                    <span className="google-mark-yellow">o</span>
                    <span className="google-mark-blue">g</span>
                    <span className="google-mark-green">l</span>
                    <span className="google-mark-red">e</span>
                  </span>
                  <span>{oauthLoading ? 'Redirecting to Google…' : 'Continue with Google'}</span>
                  {!oauthLoading && <ArrowRight size={15} />}
                </button>
                <div className="auth-divider"><span>or continue with email</span></div>
              </>
            )}

            <AnimatePresence mode="popLayout">
              {authMode === 'register' && (
                <motion.div
                  key="name-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="input-group"
                >
                  <UserIcon className="input-icon" size={18} />
                  <input
                    type="text"
                    required
                    placeholder="Full Name"
                    className="input-field"
                    value={name}
                    onChange={e => setName(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div layout className="input-group">
              <Mail className="input-icon" size={18} />
              <input
                type="email"
                required
                placeholder="Email Address"
                className="input-field"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </motion.div>

            <AnimatePresence mode="popLayout">
              {authMode !== 'forgot' && (
                <motion.div
                  key="password-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="input-group"
                >
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Password"
                    className="input-field"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </motion.div>
              )}
              {authMode === 'register' && (
                <motion.div
                  key="confirm-field"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="input-group"
                  style={{ marginTop: '0.75rem' }}
                >
                  <Lock className="input-icon" size={18} />
                  <input
                    type="password"
                    required
                    placeholder="Confirm Password"
                    className="input-field"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {authMode === 'forgot' && (
              <div className="auth-helper-card">
                <KeyRound size={16} />
                <p>A secure reset link will be sent to your email address.</p>
              </div>
            )}

            <motion.button
              layout
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{ marginTop: '0.75rem' }}
            >
              {isLoading
                ? <Loader2 className="animate-spin" size={18} />
                : <>
                    {authMode === 'register' ? 'Create Account' : authMode === 'forgot' ? 'Send Reset Link' : 'Sign In'}
                    <ChevronRight size={16} />
                  </>
              }
            </motion.button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem', marginTop: '1.5rem', width: '100%' }}>
            {authMode === 'login' && <button onClick={() => setAuthMode('forgot')} className="text-link">Forgot your password?</button>}
            {authMode === 'login' && <button onClick={() => setAuthMode('register')} className="text-link">New here? Create an account.</button>}
            {authMode === 'register' && <button onClick={() => setAuthMode('login')} className="text-link">Already have an account? Sign in.</button>}
            {authMode === 'forgot' && <button onClick={() => setAuthMode('login')} className="text-link">Back to sign in.</button>}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.5rem', opacity: 0.2, filter: 'grayscale(1)' }}>
            <ShieldCheck size={14} />
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>TLS 1.3 Encryption Active</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
