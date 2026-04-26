'use client';

import React, { useState } from 'react';
import { Feather, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export interface StyleProfile {
  name: string;
  adjectiveLevel: number;
  sentenceComplexity: number;
  preferredTransitions: string[];
  toneDescriptors: string[];
  contractionRate: 'high' | 'medium' | 'low';
  vocabularyBand: 'common' | 'sophisticated' | 'academic';
}

interface StyleClonerProps {
  onStyleCreated: (profile: StyleProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

const INPUT_STYLE: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: 10,
  padding: '0.85rem 1rem',
  fontSize: '0.85rem', fontWeight: 600, color: '#ddd',
  outline: 'none', fontFamily: 'inherit',
  transition: 'border-color 0.15s',
};

export default function StyleCloner({ onStyleCreated, isOpen, onClose }: StyleClonerProps) {
  const [sampleText,  setSampleText]  = useState('');
  const [isProfiling, setIsProfiling] = useState(false);
  const [styleName,   setStyleName]   = useState('');

  const wordCount  = sampleText.trim() ? sampleText.trim().split(/\s+/).length : 0;
  const wordColor  = wordCount === 0 ? '#333' : wordCount < 200 ? '#f59e0b' : wordCount <= 500 ? '#4ade80' : '#ef4444';
  const wordLabel  = wordCount < 200 ? '— add more' : wordCount <= 500 ? '✓ ideal' : '— too long';
  const canSubmit  = !isProfiling && wordCount >= 50;

  const handleProfile = async () => {
    if (!canSubmit) return;
    setIsProfiling(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/profile-style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, name: styleName || 'Custom Style' }),
      });
      const data = await res.json();
      onStyleCreated(data);
      toast.success('Style profile created');
      onClose();
    } catch { toast.error('Profile failed — is the backend running?'); }
    finally  { setIsProfiling(false); }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.78)', backdropFilter: 'blur(10px)', zIndex: 200 }}
          />

          {/* Drawer — slides from right */}
          <motion.div
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0, width: 480,
              background: '#070707',
              borderLeft: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '-80px 0 160px rgba(0,0,0,0.9)',
              zIndex: 210,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
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
                  <Feather size={16} style={{ color: '#60a5fa' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1rem', fontWeight: 900 }}>Stylistic Mirror</h2>
                  <p style={{ margin: 0, fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#2e2e2e' }}>
                    Clone your unique writing voice
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '0.25rem' }}
              >
                <X size={19} />
              </button>
            </div>

            {/* Form body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

              {/* Writer Identity */}
              <div>
                <label style={{ display: 'block', fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#333', marginBottom: '0.55rem' }}>
                  Writer Identity
                </label>
                <input
                  type="text"
                  placeholder="e.g., Hemingway, Executive, Academic Ghostwriter"
                  value={styleName}
                  onChange={e => setStyleName(e.target.value)}
                  style={INPUT_STYLE}
                  onFocus={e  => (e.target.style.borderColor = 'rgba(59,130,246,0.45)')}
                  onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
                />
              </div>

              {/* Author sample */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.55rem' }}>
                  <label style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#333' }}>
                    Author Sample
                  </label>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: wordColor }}>
                    {wordCount} words {wordCount > 0 && wordLabel}
                  </span>
                </div>
                <textarea
                  placeholder="Paste 200–500 words of your own writing here. The more distinctive the sample, the more accurate the style mirror."
                  value={sampleText}
                  onChange={e => setSampleText(e.target.value)}
                  style={{
                    ...INPUT_STYLE,
                    height: 240, resize: 'none', lineHeight: 1.7,
                    fontSize: '0.8rem', fontWeight: 500, color: '#bbb',
                    borderRadius: 12, padding: '1rem',
                  }}
                  onFocus={e  => (e.target.style.borderColor = 'rgba(59,130,246,0.45)')}
                  onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.07)')}
                />
              </div>

              {/* Info box */}
              <div style={{
                padding: '0.85rem 1rem',
                background: 'rgba(37,99,235,0.04)', border: '1px solid rgba(37,99,235,0.09)',
                borderRadius: 10,
              }}>
                <p style={{ margin: 0, fontSize: '0.65rem', color: '#3a3a3a', fontWeight: 700, lineHeight: 1.65 }}>
                  The algorithm extracts your sentence rhythm, vocabulary band, contraction rate, and transition patterns — then applies those fingerprints to every rewrite.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div style={{ padding: '1.25rem 1.75rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
              <button
                onClick={handleProfile}
                disabled={!canSubmit}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.9rem',
                  background: canSubmit ? 'linear-gradient(135deg,#1d4ed8,#3b82f6)' : 'rgba(37,99,235,0.12)',
                  border: 'none', borderRadius: 10,
                  color: canSubmit ? '#fff' : 'rgba(255,255,255,0.2)',
                  fontSize: '0.68rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
                  cursor: canSubmit ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                  boxShadow: canSubmit ? '0 4px 20px rgba(37,99,235,0.35)' : 'none',
                }}
              >
                {isProfiling
                  ? 'Decoding stylistic DNA…'
                  : <><Sparkles size={14} /> Mirror My Style</>
                }
              </button>
              {wordCount > 0 && wordCount < 50 && (
                <p style={{ margin: '0.5rem 0 0', fontSize: '0.6rem', color: '#f59e0b', textAlign: 'center' }}>
                  Paste at least 50 words to enable analysis
                </p>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
