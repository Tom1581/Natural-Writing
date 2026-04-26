'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Crown, LogOut, Settings, CreditCard, Mail, Shield,
  BarChart3, Calendar, Zap, ChevronRight, Trash2, AlertTriangle,
  UserCircle, Check, Loader2, KeyRound, Star, Infinity as InfinityIcon,
  ExternalLink, Edit3,
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
  subscriptionTier: string | null;
  onOpenPricing: () => void;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PLAN_INFO: Record<string, { label: string; color: string; icon: React.ReactNode; desc: string }> = {
  starter: { label: 'Starter', color: '#60a5fa', icon: <Zap size={14} />, desc: '10,000 prepaid words · All styles · Email support' },
  pro:     { label: 'Pro',     color: '#a78bfa', icon: <Star size={14} />, desc: '50,000 prepaid words · Priority processing · Style cloning' },
  unlimited: { label: 'Unlimited', color: '#34d399', icon: <InfinityIcon size={14} />, desc: 'Unlimited monthly plan · Fastest processing · Priority support' },
};

interface AccessState {
  tier: string | null;
  wordsRemaining: number;
  totalWordsPurchased: number;
  freeWordsUsed: number;
  freeWordsLimit: number;
  unlimitedActive: boolean;
  subscriptionStatus: string | null;
  canManageBilling: boolean;
}

type Section = 'main' | 'preferences' | 'security';

export default function ProfileDrawer({
  isOpen, onClose, user, onSignOut, onOpenLogin, subscriptionTier, onOpenPricing,
}: ProfileDrawerProps) {
  const [section, setSection] = useState<Section>('main');
  const [usage, setUsage] = useState<{ wordsUsed: number; limit: number } | null>(null);
  const [accessState, setAccessState] = useState<AccessState | null>(null);
  const [memberSince, setMemberSince] = useState<string>('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [billingLoading, setBillingLoading] = useState(false);

  // Preferences state
  const [editingName, setEditingName] = useState(false);
  const [newName, setNewName] = useState('');
  const [savingName, setSavingName] = useState(false);

  // Security state
  const [resetSent, setResetSent] = useState(false);
  const [sendingReset, setSendingReset] = useState(false);

  useEffect(() => {
    if (!isOpen || !user) return;

    Promise.all([
      fetch(`${API}/rewrite/free-usage?email=${encodeURIComponent(user.email)}`).then(r => r.ok ? r.json() : null).catch(() => null),
      fetch(`${API}/rewrite/access-status?email=${encodeURIComponent(user.email)}`).then(r => r.ok ? r.json() : null).catch(() => null),
    ]).then(([usageData, accessData]) => {
      if (usageData) setUsage(usageData);
      if (accessData) setAccessState(accessData);
    });

    // Member since from Supabase session
    supabase.auth.getSession().then(({ data }) => {
      const created = data.session?.user?.created_at;
      if (created) {
        setMemberSince(new Date(created).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
      } else {
        // Fallback to localStorage
        const key = `nw_member_since_${user.email}`;
        let stored: string | null = null;
        try { stored = localStorage.getItem(key); } catch {}
        if (!stored) {
          stored = new Date().toISOString();
          try { localStorage.setItem(key, stored); } catch {}
        }
        setMemberSince(new Date(stored).toLocaleDateString(undefined, { month: 'short', year: 'numeric' }));
      }
    });
  }, [isOpen, user]);

  useEffect(() => {
    if (!isOpen) {
      setShowDeleteConfirm(false);
      setDeleteInput('');
      setSection('main');
      setEditingName(false);
      setResetSent(false);
    }
  }, [isOpen]);

  const handleDeleteAccount = async () => {
    if (deleteInput !== 'DELETE') return;
    setIsDeleting(true);
    try {
      try { await supabase.rpc('delete_user'); } catch {}
      await supabase.auth.signOut();
      try { localStorage.clear(); } catch {}
      onSignOut();
      onClose();
      toast.success('Account deleted.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete account. Contact support.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSaveName = async () => {
    if (!newName.trim()) return;
    setSavingName(true);
    try {
      const { error } = await supabase.auth.updateUser({ data: { name: newName.trim() } });
      if (error) throw error;
      toast.success('Display name updated.');
      setEditingName(false);
      // Reload the page so header reflects new name
      window.location.reload();
    } catch (err: any) {
      toast.error(err.message || 'Failed to update name.');
    } finally {
      setSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setSendingReset(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/callback`,
      });
      if (error) throw error;
      setResetSent(true);
      toast.success('Password reset email sent — check your inbox.');
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email.');
    } finally {
      setSendingReset(false);
    }
  };

  const handleBilling = async () => {
    if (!subscriptionTier) {
      // Not subscribed — open pricing modal
      onClose();
      onOpenPricing();
      return;
    }
    if (subscriptionTier !== 'unlimited') {
      toast('Starter and Pro are one-time token packs. There is no recurring billing to manage.');
      return;
    }
    // Subscribed — open Stripe Customer Portal
    setBillingLoading(true);
    try {
      const res = await fetch(`${API}/stripe/billing-portal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user!.email }),
      });
      if (!res.ok) throw new Error('Could not open billing portal.');
      const { url } = await res.json();
      window.open(url, '_blank');
    } catch (err: any) {
      toast.error(err.message || 'Billing portal unavailable.');
    } finally {
      setBillingLoading(false);
    }
  };

  const initials = user
    ? (user.name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase() || 'U')
    : '?';

  const plan = subscriptionTier ? PLAN_INFO[subscriptionTier] : null;
  const usagePct = usage && usage.limit > 0
    ? Math.min(100, (usage.wordsUsed / usage.limit) * 100)
    : 0;
  const packUsed = accessState ? Math.max(0, accessState.totalWordsPurchased - accessState.wordsRemaining) : 0;
  const packPct = accessState && accessState.totalWordsPurchased > 0
    ? Math.min(100, (packUsed / accessState.totalWordsPurchased) * 100)
    : 0;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(8px)', WebkitBackdropFilter: 'blur(8px)', zIndex: 150,
            }}
          />
          <motion.aside
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 320, damping: 32 }}
            style={{
              position: 'fixed', right: 0, top: 0, bottom: 0, width: 'min(420px, 100vw)',
              background: '#0a0a0f', borderLeft: '1px solid rgba(255,255,255,0.06)',
              zIndex: 160, display: 'flex', flexDirection: 'column',
              boxShadow: '-40px 0 120px rgba(0,0,0,0.6)',
            }}
          >
            {/* Header */}
            <div style={headerStyle}>
              {section !== 'main' ? (
                <button onClick={() => setSection('main')} style={{ ...iconButtonStyle, fontSize: '0.7rem', gap: '0.4rem', display: 'flex', alignItems: 'center' }}>
                  ← Back
                </button>
              ) : (
                <span style={sectionLabelStyle}>Your Profile</span>
              )}
              <button onClick={onClose} style={iconButtonStyle} aria-label="Close"><X size={18} /></button>
            </div>

            <div className="custom-scroll" style={{ flex: 1, padding: '2rem 1.5rem', overflowY: 'auto' }}>

              {/* ── Guest state ── */}
              {!user ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', paddingTop: '2rem', textAlign: 'center' }}>
                  <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                    <UserCircle size={40} />
                  </div>
                  <div>
                    <p style={{ fontSize: '1.1rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.5rem' }}>Not signed in</p>
                    <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.6, maxWidth: '280px' }}>
                      Sign in to save rewrites, track usage, and manage your subscription.
                    </p>
                  </div>
                  <button
                    onClick={() => { onClose(); onOpenLogin(); }}
                    style={{ padding: '0.7rem 2rem', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: 'var(--radius-md)', color: '#fff', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', width: '100%' }}
                  >
                    Sign In / Create Account
                  </button>
                </div>
              ) : section === 'preferences' ? (
                /* ── Preferences ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <p style={sectionLabelStyle}>Display Name</p>
                    <div style={{ marginTop: '0.6rem' }}>
                      {editingName ? (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input
                            autoFocus
                            type="text"
                            value={newName}
                            onChange={e => setNewName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleSaveName(); if (e.key === 'Escape') setEditingName(false); }}
                            placeholder={user.name}
                            style={{ flex: 1, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(37,99,235,0.4)', borderRadius: 'var(--radius-sm)', color: '#fff', padding: '0.55rem 0.75rem', fontSize: '0.85rem', outline: 'none' }}
                          />
                          <button
                            onClick={handleSaveName}
                            disabled={savingName || !newName.trim()}
                            style={{ padding: '0.55rem 1rem', background: '#2563eb', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          >
                            {savingName ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
                          </button>
                          <button
                            onClick={() => setEditingName(false)}
                            style={{ padding: '0.55rem 0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.7rem', cursor: 'pointer' }}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => { setNewName(user.name); setEditingName(true); }}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', color: '#fff', cursor: 'pointer', textAlign: 'left' }}
                        >
                          <span style={{ fontSize: '0.85rem' }}>{user.name}</span>
                          <Edit3 size={13} style={{ color: 'var(--text-muted)' }} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={sectionLabelStyle}>Email</p>
                    <div style={{ marginTop: '0.6rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Mail size={13} style={{ color: 'var(--text-muted)' }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</span>
                    </div>
                    <p style={{ fontSize: '0.6rem', color: 'var(--text-dark)', marginTop: '0.4rem' }}>Email cannot be changed after account creation.</p>
                  </div>
                </div>
              ) : section === 'security' ? (
                /* ── Security ── */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div>
                    <p style={sectionLabelStyle}>Password Reset</p>
                    <div style={{ marginTop: '0.6rem', padding: '1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                        We'll send a secure reset link to <strong style={{ color: '#fff' }}>{user.email}</strong>.
                      </p>
                      {resetSent ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#34d399', fontSize: '0.75rem', fontWeight: 700 }}>
                          <Check size={14} /> Reset link sent — check your inbox.
                        </div>
                      ) : (
                        <button
                          onClick={handlePasswordReset}
                          disabled={sendingReset}
                          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', padding: '0.65rem', background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: 'var(--radius-sm)', color: '#60a5fa', fontSize: '0.72rem', fontWeight: 700, cursor: sendingReset ? 'not-allowed' : 'pointer' }}
                        >
                          {sendingReset ? <Loader2 size={13} className="animate-spin" /> : <KeyRound size={13} />}
                          {sendingReset ? 'Sending…' : 'Send password reset email'}
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <p style={sectionLabelStyle}>Active Sessions</p>
                    <button
                      onClick={async () => {
                        await supabase.auth.signOut({ scope: 'global' });
                        onSignOut(); onClose();
                        toast.success('Signed out from all devices.');
                      }}
                      style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.6rem', width: '100%', padding: '0.75rem 1rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 'var(--radius-sm)', color: '#ef4444', fontSize: '0.72rem', fontWeight: 700, cursor: 'pointer', textAlign: 'left' }}
                    >
                      <LogOut size={13} /> Sign out all other devices
                    </button>
                  </div>
                </div>
              ) : (
                /* ── Main ── */
                <>
                  {/* Identity */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.85rem', marginBottom: '2.25rem' }}>
                    <div style={avatarStyle}>{initials}</div>
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ fontSize: '1.2rem', fontWeight: 800, fontFamily: 'var(--font-display)', marginBottom: '0.3rem', letterSpacing: '-0.02em' }}>{user.name}</p>
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
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', color: plan?.color ?? '#eab308' }}>
                            {plan?.icon ?? <Crown size={14} />}
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#fff' }}>
                              {plan ? `${plan.label} Plan` : 'Free Plan'}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                            {plan?.desc ?? `${usage?.limit ?? 400} words total free trial`}
                          </p>
                        </div>
                        {!plan && (
                          <button
                            onClick={() => { onClose(); onOpenPricing(); }}
                            style={{ padding: '0.45rem 0.9rem', background: 'linear-gradient(135deg, #2563eb, #7c3aed)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.65rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', whiteSpace: 'nowrap' }}
                          >
                            Upgrade
                          </button>
                        )}
                      </div>

                      {/* Free usage bar */}
                      {!plan && usage !== null && (
                        <div style={{ marginTop: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Words used</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: usagePct > 80 ? '#ef4444' : usagePct > 60 ? '#f59e0b' : '#34d399' }}>
                              {usage.wordsUsed} / {usage.limit}
                            </span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${usagePct}%`, background: usagePct > 80 ? '#ef4444' : usagePct > 60 ? '#f59e0b' : '#34d399', borderRadius: '999px', transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      )}
                      {plan && subscriptionTier !== 'unlimited' && accessState && (
                        <div style={{ marginTop: '0.85rem' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                            <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>Words remaining</span>
                            <span style={{ fontSize: '0.6rem', fontWeight: 700, color: plan.color }}>
                              {accessState.wordsRemaining.toLocaleString()} / {accessState.totalWordsPurchased.toLocaleString()}
                            </span>
                          </div>
                          <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${100 - packPct}%`, background: plan.color, borderRadius: '999px', transition: 'width 0.4s ease' }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </Section>

                  {/* Usage stats */}
                  <Section title="Activity">
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem' }}>
                      <StatCard
                        label={subscriptionTier && subscriptionTier !== 'unlimited' ? 'Words remaining' : 'Words processed'}
                        value={
                          subscriptionTier && subscriptionTier !== 'unlimited'
                            ? (accessState ? `${accessState.wordsRemaining}` : '—')
                            : usage ? `${usage.wordsUsed}` : '—'
                        }
                        icon={<Zap size={12} />}
                      />
                      <StatCard label="Member since" value={memberSince || '—'} icon={<Calendar size={12} />} />
                    </div>
                  </Section>

                  {/* Account */}
                  <Section title="Account">
                    <ActionRow icon={<Settings size={15} />} label="Preferences" hint="Change name, defaults" onClick={() => setSection('preferences')} />
                    <ActionRow
                      icon={billingLoading ? <Loader2 size={15} className="animate-spin" /> : <CreditCard size={15} />}
                      label="Billing"
                      hint={
                        subscriptionTier === 'unlimited'
                          ? 'Manage subscription & invoices'
                          : subscriptionTier
                            ? 'Starter and Pro are one-time purchases'
                            : 'Upgrade your plan'
                      }
                      onClick={handleBilling}
                      badge={subscriptionTier === 'unlimited' ? <ExternalLink size={11} style={{ color: 'var(--text-dark)' }} /> : undefined}
                    />
                    <ActionRow icon={<Shield size={15} />} label="Security" hint="Password reset, sessions" onClick={() => setSection('security')} />
                  </Section>

                  {/* Sign out */}
                  <button
                    onClick={() => { onSignOut(); onClose(); }}
                    style={signOutButtonStyle}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'rgba(239,68,68,0.04)')}
                  >
                    <LogOut size={15} /> Sign out
                  </button>

                  {/* Delete account */}
                  <div style={{ marginTop: '1rem' }}>
                    {!showDeleteConfirm ? (
                      <button
                        onClick={() => setShowDeleteConfirm(true)}
                        style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.7rem', background: 'transparent', border: '1px solid rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)', color: 'rgba(239,68,68,0.5)', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'all 0.15s ease' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.3)'; e.currentTarget.style.background = 'rgba(239,68,68,0.04)'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = 'rgba(239,68,68,0.5)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.1)'; e.currentTarget.style.background = 'transparent'; }}
                      >
                        <Trash2 size={13} /> Delete account
                      </button>
                    ) : (
                      <div style={{ padding: '1rem', background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#ef4444' }}>
                          <AlertTriangle size={15} />
                          <span style={{ fontSize: '0.75rem', fontWeight: 800 }}>This cannot be undone</span>
                        </div>
                        <p style={{ fontSize: '0.68rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>
                          All your data will be permanently deleted. Type <strong style={{ color: '#ef4444' }}>DELETE</strong> to confirm.
                        </p>
                        <input
                          type="text" value={deleteInput} onChange={e => setDeleteInput(e.target.value)}
                          placeholder="Type DELETE to confirm"
                          style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 'var(--radius-sm)', color: '#fff', padding: '0.55rem 0.75rem', fontSize: '0.8rem', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button onClick={() => { setShowDeleteConfirm(false); setDeleteInput(''); }} style={{ flex: 1, padding: '0.55rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer' }}>Cancel</button>
                          <button onClick={handleDeleteAccount} disabled={deleteInput !== 'DELETE' || isDeleting} style={{ flex: 1, padding: '0.55rem', background: deleteInput === 'DELETE' ? '#ef4444' : 'rgba(239,68,68,0.2)', border: 'none', borderRadius: 'var(--radius-sm)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, cursor: deleteInput === 'DELETE' ? 'pointer' : 'not-allowed', opacity: isDeleting ? 0.6 : 1 }}>
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

// ─── Sub-components ───────────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <p style={sectionLabelStyle}>{title}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.6rem' }}>{children}</div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <div style={{ padding: '0.85rem 0.95rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginBottom: '0.3rem', color: 'var(--text-muted)' }}>
        {icon}
        <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em' }}>{label}</span>
      </div>
      <p style={{ fontSize: '0.95rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  );
}

function ActionRow({ icon, label, hint, onClick, badge }: { icon: React.ReactNode; label: string; hint: string; onClick: () => void; badge?: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', padding: '0.85rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-sm)', color: 'var(--text-pure)', cursor: 'pointer', transition: 'all 0.15s ease', textAlign: 'left', width: '100%' }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,0.3)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)'; }}
    >
      <div style={{ color: 'var(--accent-blue)' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.15rem' }}>{label}</p>
        <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{hint}</p>
      </div>
      {badge ?? <ChevronRight size={14} style={{ color: 'var(--text-dark)' }} />}
    </button>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const headerStyle: React.CSSProperties = { padding: '1.25rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' };
const sectionLabelStyle: React.CSSProperties = { fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'var(--text-muted)' };
const iconButtonStyle: React.CSSProperties = { background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '0.3rem', display: 'flex', alignItems: 'center' };
const avatarStyle: React.CSSProperties = { width: '92px', height: '92px', borderRadius: '50%', background: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '2rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', boxShadow: '0 12px 40px rgba(37,99,235,0.35), 0 0 0 3px rgba(255,255,255,0.04)' };
const cardStyle: React.CSSProperties = { padding: '1rem 1.1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 'var(--radius-md)' };
const signOutButtonStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%', padding: '0.85rem', background: 'rgba(239,68,68,0.04)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 'var(--radius-md)', color: '#ef4444', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer', transition: 'background 0.15s ease' };
