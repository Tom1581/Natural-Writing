'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  Lock,
  ChevronRight,
  ShieldCheck,
  Loader2,
  User as UserIcon,
  KeyRound,
  CheckCircle2,
  Bot,
  ArrowRight,
  FileSearch,
  Fingerprint,
  ScanSearch,
  Radar,
  ShieldQuestion,
  Feather,
  BookOpen,
  X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';
import BrandMark from './BrandMark';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: any) => void;
}

type AuthMode = 'login' | 'register' | 'forgot';

export default function LoginModal({ isOpen, onClose, onLogin }: LoginModalProps) {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setAuthMode('login');
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.documentElement.classList.add('auth-modal-open');
    document.body.classList.add('auth-modal-open');

    return () => {
      document.documentElement.classList.remove('auth-modal-open');
      document.body.classList.remove('auth-modal-open');
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (authMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) {
           if (error.message.includes('Invalid login credentials')) {
              toast.error('No account found. Redirecting to access provision.');
              setAuthMode('register');
              return;
           }
           throw error;
        }
        onLogin({ name: data.user?.user_metadata?.name || 'Authorized Editor', role: 'user', email });
        onClose();
        toast.success('Access Granted • Welcome to Flagship v4');
      } else if (authMode === 'register') {
        if (password.length < 8) {
           toast.error('Security Protocol: Access key must be at least 8 characters.');
           setIsLoading(false);
           return;
        }
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/.test(password)) {
           toast.error('Security Protocol: Key requires 1 uppercase, 1 lowercase, 1 number, and 1 special character.');
           setIsLoading(false);
           return;
        }
        if (password !== confirmPassword) {
           toast.error('Access keys do not match.');
           setIsLoading(false);
           return;
        }
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name || 'New Writer' } }
        });
        if (error) throw error;
        onLogin({ name: data.user?.user_metadata?.name || 'New Writer', role: 'user', email });
        onClose();
        toast.success('Registration Complete • Neural Sync Initiated');
      } else if (authMode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        setAuthMode('login');
        toast.success('Recovery Sequence Initiated. Check your inbound stream.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Authentication sequence failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const getTitle = () => {
    switch (authMode) {
       case 'register': return 'Create your Natural Quill account';
       case 'forgot': return 'Reset your password';
       default: return 'Sign in to Natural Quill';
    }
  };

  const getButtonText = () => {
    switch (authMode) {
       case 'register': return 'Create Account';
       case 'forgot': return 'Send Reset Link';
       default: return 'Sign In';
    }
  };

  const getDescription = () => {
    switch (authMode) {
      case 'register':
        return 'Start a cleaner writing workflow with detector reference checks and natural-sounding rewrites.';
      case 'forgot':
        return 'Enter your email and we will send you a secure reset link.';
      default:
        return 'Sign in with email or Google to continue refining AI-generated writing into something more natural.';
    }
  };

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

  const handleGoogleAuth = async () => {
    setOauthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });
      if (error) throw error;
    } catch (err: any) {
      toast.error(err.message || 'Google sign-in is not available yet.');
      setOauthLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="modal-overlay"
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            zIndex: 200,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
          }}
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="modal-content modal-content-auth"
            style={{
              background: '#0a0a0f',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              borderRadius: '1.5rem',
              width: '100%',
              maxWidth: '480px',
              padding: '2.5rem',
              position: 'relative',
              boxShadow: '0 40px 100px rgba(0, 0, 0, 0.8)',
              overflow: 'hidden',
              maxHeight: '90vh',
              overflowY: 'auto',
            }}
          >
             <button
               onClick={onClose}
               aria-label="Close"
               style={{
                 position: 'absolute', top: '1rem', right: '1rem',
                 background: 'rgba(255,255,255,0.05)',
                 border: '1px solid rgba(255,255,255,0.08)',
                 borderRadius: '50%',
                 width: '32px', height: '32px',
                 display: 'flex', alignItems: 'center', justifyContent: 'center',
                 color: 'var(--text-muted)',
                 cursor: 'pointer',
                 zIndex: 20,
                 transition: 'all 0.15s ease',
               }}
               onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
               onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
             >
               <X size={14} />
             </button>
             <div className="flex-col items-center text-center relative z-10" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div className="icon-container-core login-brand-mark m-auto">
                   <BrandMark size={42} />
                </div>
                
                <h2 className="text-display login-title">Natural Quill</h2>
                <p className="text-subtitle login-subtitle">{getTitle()}</p>
                {authMode !== 'forgot' && (
                  <div className="login-reference-strip" aria-label="AI detector reference platforms">
                    {detectorReferences.map(({ name, icon: Icon, tone }) => (
                      <div key={name} className={`login-reference-pill login-reference-pill-${tone}`} title={`${name} reference`}>
                        <Icon size={14} strokeWidth={2.2} />
                        <span>{name}</span>
                      </div>
                    ))}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="flex-col w-full">
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
                         <span>{oauthLoading ? 'Redirecting to Google...' : 'Continue with Google'}</span>
                         {!oauthLoading && <ArrowRight size={15} />}
                       </button>

                       <div className="auth-divider">
                         <span>or continue with email</span>
                       </div>
                     </>
                   )}

                   <AnimatePresence mode="popLayout">
                     {authMode === 'register' && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="input-group">
                          <UserIcon className="input-icon" size={18} />
                          <input 
                            type="text" required placeholder="Full Designation (Name)"
                            className="input-field"
                            value={name} onChange={(e) => setName(e.target.value)}
                          />
                       </motion.div>
                     )}
                   </AnimatePresence>

                   <motion.div layout className="input-group">
                      <Mail className="input-icon" size={18} />
                      <input 
                        type="email" required placeholder="Email Address"
                        className="input-field"
                        value={email} onChange={(e) => setEmail(e.target.value)}
                      />
                   </motion.div>
                   
                   <AnimatePresence mode="popLayout">
                     {authMode !== 'forgot' && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="input-group">
                          <Lock className="input-icon" size={18} />
                          <input 
                            type="password" required placeholder="Access Key"
                            className="input-field"
                            value={password} onChange={(e) => setPassword(e.target.value)}
                          />
                       </motion.div>
                     )}
                     {authMode === 'register' && (
                       <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="input-group mt-3">
                          <Lock className="input-icon" size={18} />
                          <input 
                            type="password" required placeholder="Confirm Access Key"
                            className="input-field"
                            value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                       </motion.div>
                     )}
                   </AnimatePresence>

                   {authMode === 'forgot' && (
                     <div className="auth-helper-card">
                       <KeyRound size={16} />
                       <p>Password reset links are sent through Supabase email auth. Use the same email you signed up with.</p>
                     </div>
                   )}

                   <motion.button layout type="submit" disabled={isLoading} className="btn btn-primary mt-3">
                      {isLoading ? <Loader2 className="animate-spin" size={18} /> : <>{getButtonText()} <ChevronRight size={16} /></>}
                   </motion.button>
                </form>

                <div className="flex-col mt-6 gap-3">
                   {authMode === 'login' && <button onClick={() => setAuthMode('forgot')} className="text-link">Forgot your password?</button>}
                   {authMode === 'login' && <button onClick={() => setAuthMode('register')} className="text-link">New here? Create an account.</button>}
                   {authMode === 'register' && <button onClick={() => setAuthMode('login')} className="text-link">Already have an account? Sign in.</button>}
                   {authMode === 'forgot' && <button onClick={() => setAuthMode('login')} className="text-link">Back to sign in.</button>}
                </div>

                <div className="flex-center mt-6 grayscale opacity-20 gap-2">
                   <ShieldCheck size={14} />
                   <span className="text-subtitle">TLS 1.3 Encryption Active</span>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
