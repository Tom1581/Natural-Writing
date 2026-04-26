'use client';

import React, { useState } from 'react';
import { LifeBuoy, X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const SUPPORT_EMAIL = 'stockitupcs@gmail.com';

interface ContactSupportProps {
  isOpen: boolean;
  onClose: () => void;
}

interface FormState {
  firstName: string;
  lastName: string;
  email: string;
  message: string;
}

const EMPTY: FormState = { firstName: '', lastName: '', email: '', message: '' };

const INPUT: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 10, padding: '0.8rem 1rem',
  fontSize: '0.84rem', fontWeight: 500, color: '#ddd',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

const LABEL: React.CSSProperties = {
  display: 'block', fontSize: '0.58rem', fontWeight: 800,
  textTransform: 'uppercase', letterSpacing: '0.3em', color: '#333',
  marginBottom: '0.5rem',
};

export default function ContactSupport({ isOpen, onClose }: ContactSupportProps) {
  const [form, setForm]           = useState<FormState>(EMPTY);
  const [sending, setSending]     = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const set = (k: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(prev => ({ ...prev, [k]: e.target.value }));

  const focus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = 'rgba(59,130,246,0.45)');
  const blur  = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    (e.target.style.borderColor = 'rgba(255,255,255,0.07)');

  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);
  const canSend    = !!form.firstName.trim() && !!form.lastName.trim() && emailValid && form.message.trim().length >= 10;

  const handleSubmit = () => {
    if (!canSend || sending) return;
    setSending(true);

    const subject = `[Natural Quill] Message from ${form.firstName} ${form.lastName}`;
    const body =
      `Name: ${form.firstName} ${form.lastName}\n` +
      `From: ${form.email}\n\n` +
      `${form.message}`;

    window.location.href =
      `mailto:${SUPPORT_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(body)}`;

    // Give the OS a moment to open the mail client, then show success
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 800);
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => { setForm(EMPTY); setSubmitted(false); }, 400);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={handleClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', zIndex: 200 }}
          />

          {/* Drawer — slides from right */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 460,
              background: '#070707',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '-80px 0 160px rgba(0,0,0,0.9)',
              zIndex: 210, display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 38, height: 38, borderRadius: 10,
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.18)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <LifeBuoy size={16} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Contact & Support</h2>
                  <p style={{ margin: 0, fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#2e2e2e' }}>
                    We usually reply within 24 hours
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
              >
                <X size={19} />
              </button>
            </div>

            {/* Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column' }}>
              <AnimatePresence mode="wait">
                {submitted ? (
                  /* ── Success state ── */
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                    style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem', textAlign: 'center', padding: '2rem 0' }}
                  >
                    <div style={{
                      width: 56, height: 56, borderRadius: '50%',
                      background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <CheckCircle2 size={24} style={{ color: '#4ade80' }} />
                    </div>
                    <div>
                      <p style={{ margin: '0 0 0.4rem', fontSize: '1rem', fontWeight: 800, color: '#ddd' }}>
                        Your mail client is ready!
                      </p>
                      <p style={{ margin: 0, fontSize: '0.75rem', color: '#444', lineHeight: 1.7 }}>
                        Your message to <span style={{ color: '#60a5fa' }}>{SUPPORT_EMAIL}</span> has been<br />
                        prepared. Just hit <strong style={{ color: '#ddd' }}>Send</strong> in your mail app.<br />
                        We'll reply to <span style={{ color: '#60a5fa' }}>{form.email}</span>.
                      </p>
                    </div>
                    <button
                      onClick={handleClose}
                      style={{
                        marginTop: '0.5rem', padding: '0.6rem 1.5rem',
                        background: 'rgba(37,99,235,0.12)', border: '1px solid rgba(37,99,235,0.2)',
                        borderRadius: 9, color: '#60a5fa', fontSize: '0.7rem', fontWeight: 700,
                        cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Close
                    </button>
                  </motion.div>
                ) : (
                  /* ── Form ── */
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}
                  >
                    {/* Name row */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <div>
                        <label style={LABEL}>First Name</label>
                        <input
                          type="text"
                          placeholder="Jane"
                          value={form.firstName}
                          onChange={set('firstName')}
                          onFocus={focus} onBlur={blur}
                          style={INPUT}
                        />
                      </div>
                      <div>
                        <label style={LABEL}>Last Name</label>
                        <input
                          type="text"
                          placeholder="Smith"
                          value={form.lastName}
                          onChange={set('lastName')}
                          onFocus={focus} onBlur={blur}
                          style={INPUT}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div>
                      <label style={LABEL}>Email</label>
                      <input
                        type="email"
                        placeholder="example@gmail.com"
                        value={form.email}
                        onChange={set('email')}
                        onFocus={focus} onBlur={blur}
                        style={{
                          ...INPUT,
                          borderColor: form.email && !emailValid ? 'rgba(239,68,68,0.45)' : undefined,
                        }}
                      />
                      {form.email && !emailValid && (
                        <p style={{ margin: '0.3rem 0 0', fontSize: '0.58rem', color: '#ef4444' }}>
                          Enter a valid email address
                        </p>
                      )}
                    </div>

                    {/* Message */}
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <label style={{ ...LABEL, marginBottom: 0 }}>Comments & Questions</label>
                        <span style={{ fontSize: '0.57rem', fontWeight: 700, color: form.message.length < 10 ? '#333' : '#4ade80' }}>
                          {form.message.length} chars
                        </span>
                      </div>
                      <textarea
                        placeholder="Describe your question, issue, or feedback…"
                        value={form.message}
                        onChange={set('message')}
                        onFocus={focus} onBlur={blur}
                        style={{
                          ...INPUT, height: 180, resize: 'none',
                          lineHeight: 1.7, borderRadius: 12, padding: '0.9rem 1rem',
                        }}
                      />
                    </div>

                    {/* Info */}
                    <div style={{
                      padding: '0.75rem 1rem',
                      background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.09)',
                      borderRadius: 10,
                    }}>
                      <p style={{ margin: 0, fontSize: '0.63rem', color: '#3a3a3a', fontWeight: 700, lineHeight: 1.6 }}>
                        For billing issues, include your account email. For bugs, describe what you were doing when it happened.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            {!submitted && (
              <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <button
                  onClick={handleSubmit}
                  disabled={!canSend || sending}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.9rem',
                    background: canSend && !sending ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(37,99,235,0.12)',
                    border: 'none', borderRadius: 10,
                    color: canSend && !sending ? '#fff' : 'rgba(255,255,255,0.2)',
                    fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                    cursor: canSend && !sending ? 'pointer' : 'not-allowed',
                    transition: 'all 0.2s', fontFamily: 'inherit',
                    boxShadow: canSend && !sending ? '0 4px 20px rgba(37,99,235,0.35)' : 'none',
                  }}
                >
                  {sending
                    ? <><Loader2 size={14} className="animate-spin" /> Opening mail app…</>
                    : <><Send size={14} /> Send Message</>
                  }
                </button>
                {!canSend && form.message.length > 0 && form.message.length < 10 && (
                  <p style={{ margin: '0.45rem 0 0', fontSize: '0.6rem', color: '#f59e0b', textAlign: 'center' }}>
                    Add a bit more detail (10 characters minimum)
                  </p>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
