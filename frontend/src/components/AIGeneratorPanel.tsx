'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, ChevronDown, ChevronUp, Wand2, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';

const GEMINI_KEY = 'AIzaSyAaQwVlVf-mRbFQnty9jRNQTStTAxvNLAM';
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_KEY}`;

const PAPER_TYPES = [
  { value: 'essay', label: 'Essay' },
  { value: 'research', label: 'Research Paper' },
  { value: 'report', label: 'Report' },
  { value: 'blog', label: 'Blog Post' },
  { value: 'email', label: 'Professional Email' },
  { value: 'summary', label: 'Summary' },
  { value: 'analysis', label: 'Analysis' },
  { value: 'proposal', label: 'Proposal' },
];

const WORD_COUNTS = [
  { value: '150', label: '~150 words' },
  { value: '300', label: '~300 words' },
  { value: '500', label: '~500 words' },
  { value: '800', label: '~800 words' },
  { value: '1200', label: '~1200 words' },
];

interface AIGeneratorPanelProps {
  onGenerate: (text: string) => void;
}

export default function AIGeneratorPanel({ onGenerate }: AIGeneratorPanelProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [paperType, setPaperType] = useState('essay');
  const [wordCount, setWordCount] = useState('300');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preview, setPreview] = useState('');

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error('Enter a topic or prompt first.');
      return;
    }
    setIsGenerating(true);
    setPreview('');

    const systemPrompt = `Write a ${paperType} of approximately ${wordCount} words about the following topic. Write in a typical AI/academic style — use proper structure, transitions, and formal language. Do not add any meta-commentary, just the content itself.\n\nTopic: ${prompt.trim()}`;

    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: systemPrompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 },
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.error?.message || `Gemini API error ${res.status}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error('No content returned from Gemini.');

      setPreview(text.trim());
      toast.success('AI draft generated — click "Use this text" to load it.');
    } catch (err: any) {
      toast.error(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUse = () => {
    if (!preview) return;
    onGenerate(preview);
    toast.success('Loaded into editor — click Improve Text to humanize it.');
    setPreview('');
    setPrompt('');
    setIsOpen(false);
  };

  const handleClear = () => {
    setPreview('');
    setPrompt('');
  };

  return (
    <div style={{
      borderTop: '1px solid rgba(124,58,237,0.2)',
      background: 'linear-gradient(135deg, rgba(124,58,237,0.07) 0%, rgba(37,99,235,0.05) 100%)',
    }}>
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(v => !v)}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          width: '100%',
          padding: '1rem 1.5rem',
          background: 'transparent',
          border: 'none',
          borderBottom: isOpen ? '1px solid rgba(124,58,237,0.2)' : 'none',
          cursor: 'pointer',
          transition: 'background 0.2s ease',
        }}
        onMouseEnter={e => { if (!isOpen) e.currentTarget.style.background = 'rgba(124,58,237,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '38px', height: '38px', borderRadius: '10px',
            background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(124,58,237,0.4)',
            flexShrink: 0,
          }}>
            <Wand2 size={18} color="#fff" />
          </div>
          <div style={{ textAlign: 'left' }}>
            <p style={{ fontSize: '0.85rem', fontWeight: 800, color: isOpen ? '#c4b5fd' : '#a78bfa', margin: 0, letterSpacing: '-0.01em' }}>
              Generate AI Draft
            </p>
            <p style={{ fontSize: '0.68rem', color: 'rgba(167,139,250,0.6)', margin: 0, marginTop: '0.15rem' }}>
              Use Gemini to write a draft · then humanize it with Natural Quill
            </p>
          </div>
        </div>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.35rem 0.75rem',
          background: isOpen ? 'rgba(124,58,237,0.2)' : 'rgba(124,58,237,0.12)',
          border: '1px solid rgba(124,58,237,0.3)',
          borderRadius: '999px',
          color: '#a78bfa',
          fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          {isOpen ? <><ChevronUp size={12} /> Close</> : <><ChevronDown size={12} /> Open</>}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22 }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {/* Selectors row */}
              <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 140px' }}>
                  <label style={labelStyle}>Document type</label>
                  <select
                    value={paperType}
                    onChange={e => setPaperType(e.target.value)}
                    style={selectStyle}
                  >
                    {PAPER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', flex: '1 1 110px' }}>
                  <label style={labelStyle}>Length</label>
                  <select
                    value={wordCount}
                    onChange={e => setWordCount(e.target.value)}
                    style={selectStyle}
                  >
                    {WORD_COUNTS.map(w => <option key={w.value} value={w.value}>{w.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Prompt input */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                <label style={labelStyle}>Your topic / prompt</label>
                <textarea
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleGenerate(); }}
                  placeholder={`e.g. "The impact of social media on academic performance" or "Write an introduction for a climate change essay"`}
                  rows={3}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.08)',
                    borderRadius: '10px',
                    color: '#e8e8ed',
                    padding: '0.7rem 0.9rem',
                    fontSize: '0.8rem',
                    lineHeight: 1.6,
                    resize: 'vertical',
                    outline: 'none',
                    fontFamily: 'var(--font-body), system-ui, sans-serif',
                    transition: 'border-color 0.15s ease',
                    width: '100%',
                    boxSizing: 'border-box',
                  }}
                  onFocus={e => (e.currentTarget.style.borderColor = 'rgba(124,58,237,0.4)')}
                  onBlur={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)')}
                />
                <p style={{ fontSize: '0.58rem', color: 'var(--text-dark)', margin: 0 }}>Tip: ⌘ Enter to generate</p>
              </div>

              {/* Generate button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating || !prompt.trim()}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.7rem 1rem',
                  background: isGenerating || !prompt.trim()
                    ? 'rgba(124,58,237,0.2)'
                    : 'linear-gradient(135deg, #7c3aed, #2563eb)',
                  border: 'none', borderRadius: '10px',
                  color: '#fff', fontSize: '0.72rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: isGenerating || !prompt.trim() ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  opacity: !prompt.trim() ? 0.5 : 1,
                }}
              >
                {isGenerating
                  ? <><Loader2 size={14} className="animate-spin" /> Generating with Gemini…</>
                  : <><Sparkles size={14} /> Generate AI Draft</>
                }
              </button>

              {/* Preview */}
              <AnimatePresence>
                {preview && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    style={{
                      background: 'rgba(124,58,237,0.05)',
                      border: '1px solid rgba(124,58,237,0.2)',
                      borderRadius: '12px',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Preview header */}
                    <div style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '0.65rem 0.9rem',
                      borderBottom: '1px solid rgba(124,58,237,0.15)',
                      background: 'rgba(124,58,237,0.08)',
                    }}>
                      <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#a78bfa' }}>
                        AI Draft Preview · {preview.split(/\s+/).length} words
                      </span>
                      <button
                        onClick={handleClear}
                        style={{ background: 'none', border: 'none', color: '#a78bfa', cursor: 'pointer', padding: '0.1rem', display: 'flex' }}
                      >
                        <RotateCcw size={12} />
                      </button>
                    </div>

                    {/* Preview text */}
                    <div
                      className="custom-scroll"
                      style={{
                        maxHeight: '200px', overflowY: 'auto',
                        padding: '0.85rem 0.9rem',
                        fontSize: '0.75rem', color: 'rgba(232,232,237,0.7)',
                        lineHeight: 1.7, whiteSpace: 'pre-wrap',
                      }}
                    >
                      {preview}
                    </div>

                    {/* Action bar */}
                    <div style={{
                      display: 'flex', gap: '0.5rem',
                      padding: '0.65rem 0.9rem',
                      borderTop: '1px solid rgba(124,58,237,0.15)',
                    }}>
                      <button
                        onClick={handleUse}
                        style={{
                          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                          padding: '0.6rem',
                          background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                          border: 'none', borderRadius: '8px',
                          color: '#fff', fontSize: '0.68rem', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                        }}
                      >
                        <Sparkles size={12} /> Use this text → Humanize
                      </button>
                      <button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        style={{
                          padding: '0.6rem 0.8rem',
                          background: 'rgba(124,58,237,0.15)',
                          border: '1px solid rgba(124,58,237,0.25)',
                          borderRadius: '8px',
                          color: '#a78bfa', fontSize: '0.68rem', fontWeight: 800,
                          textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                        }}
                        title="Regenerate"
                      >
                        <RotateCcw size={13} />
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Shared styles ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase',
  letterSpacing: '0.15em', color: 'var(--text-muted)',
};

const selectStyle: React.CSSProperties = {
  appearance: 'none',
  background: 'rgba(255,255,255,0.03)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '8px',
  color: '#e8e8ed',
  fontSize: '0.75rem',
  fontWeight: 600,
  padding: '0.45rem 0.75rem',
  outline: 'none',
  cursor: 'pointer',
  width: '100%',
};
