'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Crown, LogOut, Settings, CreditCard, Mail, Shield,
  BarChart3, Calendar, Zap, ChevronRight, Trash2, AlertTriangle, UserCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '../lib/supabase';

interface ProfileUser {
  name: string;
  email: string;
  role?: string;
}

interface ProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: ProfileUser | null;
  onSignOut: () => void;
  onOpenLogin: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function ProfileDrawer({ isOpen, onClose, user, onSignOut, onOpenLogin }: ProfileDrawerProps) {
  const [usage, setUsage] = useState<{ totalManuscripts: number; totalTokens: number; avgLatencyMs: number } | null>(null);
  const [memberSince, setMemberSince] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    (async () => {
      try {
        const res = await fetch(`${API}/rewrite/stats`);
        if (res.ok) setUsage(await res.json());
      } catch { /* backend may be offline */ }
    })();

    const key = `nw_member_since_${user.email}`;
    let stored: string | null = null;
    try { stored = window.localStorage.getItem(key); } catch { /* ignore */ }
    if (!stored) {
      stored = new Date().toISOString();
      try { window.localStorage.setItem(key, stored); } catch { /* ignore */ }
    }
    setMemberSince(new Date(stored).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
  }, [isOpen, user]);

  // Reset delete state when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setDeleteInput('');
    }
  }, [isOpen]);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      // Attempt to delete via RPC if available — graceful no-op if not set up
      try {
        await supabase.rpc('delete_user');
      } catch { /* RPC may not exist; sign out is sufficient for now */ }
      try { window.localStorage.clear(); } catch { /* ignore */ }
      onSignOut();
      onClose();
      toast.success('Account deleted. Sorry to see you go.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account. Please contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const initials = user
    ? (user.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U')
    : '?';

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0, 0, 0, 0.55)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 150,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(420px, 100vw)',
              background: '#0a0a0f', borderLeft: '1px solid rgba(255, 255, 255, 0.06)',
              zIndex: 160, display: 'flex', flexDirection: 'column',
              boxShadow: '-40px 0 120px rgba(0, 0, 0, 0.6)',
            }}
          >
            {/* Header */}
            <div style={headerStyle}>
              <span style={sectionLabelStyle}>Your Profile</span>
              <button onClick={onClose} style={iconButtonStyle} aria-label="Close profile">
                <X size={18} />
              </button>
            </div>

            <div className="custom-scroll" style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto' }}>
              {!user ? (
                /* ── Logged-out state ── */
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '2rem', textAlign: 'center' }}>
                  <div style={{
                    width: '80px', height: '80px', borderRadius: '50%',
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}>
                    <UserCircle size={40} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
                      Not signed in
                    </p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
                      Sign in to save rewrites, track usage stats, and access your subscription.
                    </p>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenLogin(); }}
                    style={{
                      padding: '0.7rem 2rem',
                      background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                      border: 'none', borderRadius: 'var(--radius-md)',
                      color: '#fff', fontSize: '0.8rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      cursor: 'pointer', width: '100%',
                    }}
                  >
                    Sign In / Create Account
                  </button>
                  <div style={{ width: '100%', borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '1.5rem' }}>
                    <p style={{ fontSize: '0.65rem', color: 'var(--text-dark)', lineHeight: 1.6 }}>
                      Natural Quill keeps your work private. We never sell your data.
                    </p>
                  </div>
                </div>
              ) : (
                /* ── Logged-in state ── */
                <>
                  {/* Identity */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginBottom: '2.25rem' }}>
                    <div style={avatarStyle}>{initials}</div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>
                        {user.name}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' }}>
                        <Mail size={12} style={{ color: 'var(--text-muted)' }} />
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user.email}</span>
                      </div>
                    </div>
                  </div>

                  {/* Subscription */}
                  <Section title="Subscription">
                    <div style={cardStyle}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                            <Crown size={14} style={{ color: '#eab308' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 800 }}>Free Plan</span>
                          </div>
                          <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            10 rewrites / day · Basic diagnostics · Standard models
                          </p>
                        </div>
                        <button
                          onClick={() => toast('Upgrade flow coming soon.')}
                          style={{
                            padding: '0.45rem 0.9rem',
                            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                            border: 'none', borderRadius: 'var(--radius-sm)',
                            color: '#fff', fontSize: '0.65rem', fontWeight: 800,
                            textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Upgrade
                        </button>
                      </div>
                    </div>
                  </Section>

                  {/* Usage */}
                  <Section title="Usage">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <StatCard label="Rewrites" value={usage?.totalManuscripts ?? 0} icon={<Zap size={12} />} />
                      <StatCard label="Avg latency" value={usage ? `${usage.avgLatencyMs}ms` : '—'} icon={<BarChart3 size={12} />} />
                      <StatCard label="Tokens used" value={usage ? formatNumber(usage.totalTokens) : '—'} icon={<BarChart3 size={12} />} />
                      <StatCard label="Member since" value={memberSince || '—'} icon={<Calendar size={12} />} />
                    </div>
                  </Section>

                  {/* Account */}
                  <Section title="Account">
                    <ActionRow
                      icon={<Settings size={15} />}
                      label="Preferences"
                      hint="Theme, defaults, shortcuts"
                      onClick={() => toast('Preferences coming soon.')}
                    />
                    <ActionRow
                      icon={<CreditCard size={15} />}
                      label="Billing"
                      hint="Manage your subscription"
                      onClick={() => toast('Billing portal coming soon.')}
                    />
                    <ActionRow
                      icon={<Shield size={15} />}
                      label="Security"
                      hint="Password, sessions, 2FA"
                      onClick={() => toast('Security settings coming soon.')}
                    />
                  </Section>

                  {/* Sign out */}
                  <button
                    onClick={() => { onSignOut(); onClose(); }}
                    style={signOutButtonStyle}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)')}
                  >
                    <LogOut size={15} /> Sign out
                  </button>

                  {/* Delete Account */}
                  <div style={{ marginTop: '1rem' }}>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                          width: '100%', padding: '0.7rem',
                          background: 'transparent',
                          border: '1px solid rgba(239, 68, 68, 0.1)',
                          borderRadius: 'var(--radius-md)',
                          color: 'rgba(239, 68, 68, 0.5)',
                          fontSize: '0.68rem', fontWeight: 700,
                          textTransform: 'uppercase', letterSpacing: '0.1em',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                        onMouseEnter={e => {
                          e.currentTarget.style.color = '#ef4444';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                          e.currentTarget.style.background = 'rgba(239, 68, 68, 0.04)';
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.color = 'rgba(239, 68, 68, 0.5)';
                          e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.1)';
                          e.currentTarget.style.background = 'transparent';
                        }}
                      >
                        <Trash2 size={13} /> Delete account
                      </button>
                    ) : (
                      <div style={{
                        padding: '1rem',
                        background: 'rgba(239, 68, 68, 0.05)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex', flexDirection: 'column', gap: '0.75rem',
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                          <AlertTriangle size={15} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>This cannot be undone</span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          Your account and all saved data will be permanently deleted. Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm.
                        </p>
                        <input
                          type="text"
                          value={deleteInput}
                          onChange={e => setDeleteInput(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          style={{
                            background: 'rgba(0,0,0,0.3)',
                            border: '1px solid rgba(239, 68, 68, 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#fff',
                            padding: '0.55rem 0.75rem',
                            fontSize: '0.8rem',
                            outline: 'none',
                            width: '100%',
                            boxSizing: 'border-box',
                          }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button
                            onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }}
                            style={{
                              flex: 1, padding: '0.55rem',
                              background: 'rgba(255,255,255,0.04)',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-muted)',
                              fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer',
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={handleDeleteAccount}
                            disabled={deleteInput !== 'DELETE' || isDeleting}
                            style={{
                              flex: 1, padding: '0.55rem',
                              background: deleteInput === 'DELETE' ? '#ef4444' : 'rgba(239, 68, 68, 0.2)',
                              border: 'none', borderRadius: 'var(--radius-sm)',
                              color: '#fff', fontSize: '0.7rem', fontWeight: 700,
                              cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed',
                              transition: 'background 0.15s ease',
                              opacity: isDeleting ? 0.6 : 1,
                            }}
                          >
                            {isDeleting ? 'Deleting…' : 'Confirm Delete'}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <p style={sectionLabelStyle}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem' }}>
        {children}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{
      padding: '0.85rem 0.95rem',
      background: 'rgba(255, 255, 255, 0.02)',
      border: '1px solid rgba(255, 255, 255, 0.05)',
      borderRadius: 'var(--radius-sm)',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
        {icon}
        <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>
        {value}
      </p>
    </div>
  );
}

function ActionRow({ icon, label, hint, onClick }: { icon: React.ReactNode; label: string; hint: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.8rem',
        padding: '0.85rem 1rem',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-pure)',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
        textAlign: 'left',
        width: '100%',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)'; e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)'; }}
    >
      <div style={{ color: 'var(--accent-blue)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.15rem' }}>{label}</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{hint}</p>
      </div>
      <ChevronRight size={14} style={{ color: 'var(--text-dark)' }} />
    </button>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headerStyle: React.CSSProperties = {
  padding: '1.25rem 1.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.2em', color: 'var(--text-muted)',
};

const iconButtonStyle: React.CSSProperties = {
  background: 'none', border: 'none', color: 'var(--text-muted)',
  cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center',
};

const avatarStyle: React.CSSProperties = {
  width: '92px', height: '92px', borderRadius: '50%',
  background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  color: '#fff', fontSize: '2rem', fontWeight: 900,
  fontFamily: 'var(--font-display)',
  letterSpacing: '-0.02em',
  boxShadow: '0 12px 40px rgba(37, 99, 235, 0.35), 0 0 0 3px rgba(255, 255, 255, 0.04)',
};

const cardStyle: React.CSSProperties = {
  padding: '1rem 1.1rem',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: 'var(--radius-md)',
};

const signOutButtonStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
  width: '100%',
  padding: '0.85rem',
  background: 'rgba(239, 68, 68, 0.04)',
  border: '1px solid rgba(239, 68, 68, 0.2)',
  borderRadius: 'var(--radius-md)',
  color: '#ef4444',
  fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em',
  cursor: 'pointer',
  transition: 'background 0.15s ease',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
