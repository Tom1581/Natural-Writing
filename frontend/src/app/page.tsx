'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, RotateCcw, Copy, Check, BookOpen,
  History, AlertCircle, Loader2, TrendingDown,
  Type, FolderOpen, RefreshCw, LifeBuoy,
  Server, FileText, ChevronDown, X, BarChart2, User, Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import StyleCloner, { StyleProfile } from '@/components/StyleCloner';
import ContactSupport from '@/components/ContactSupport';
import ManuscriptLibrary, { ManuscriptHistory } from '@/components/ManuscriptLibrary';
import TextInputPanel from '@/components/TextInputPanel';
import FlightDeck from '@/components/FlightDeck';
import LoginModal from '@/components/LoginModal';
import ProfileDrawer from '@/components/ProfileDrawer';
import AIGeneratorPanel from '@/components/AIGeneratorPanel';
import PricingModal from '@/components/PricingModal';
import { supabase } from '@/lib/supabase';
import BrandMark from '@/components/BrandMark';

// ─── Types ────────────────────────────────────────────────────────────────────

type Tone = 'natural' | 'conversational' | 'formal' | 'academic' | 'blog';
type Strength = 'light' | 'medium' | 'strong';
type SectionType = 'general' | 'introduction' | 'narrative' | 'data_disclosure' | 'conclusion' | 'cta';

interface AnalysisMetrics {
  sentenceLengthMean: number;
  sentenceLengthStd: number;
  sentenceLengthVariance: number;
  burstiness: number;
  repetitionScore: number;
  repeatedNGrams: { ngram: string; count: number }[];
  sentenceStarterRepetition: { starter: string; count: number }[];
  transitionOveruse: number;
  readability: { gradeLevel: number; readingEase: number; syllableCount: number };
  lexicalDiversity: { ttr: number; uniqueWords: number; complexityScore: number };
  passiveVoice: { count: number; ratio: number };
  hedgeDensity: number;
  nominalizationDensity: number;
  semanticRedundancy: number;
  aiTells: { phrase: string; count: number }[];
  emDashDensity: number;
  contractionRate: number;
  aiDetectionRisk: number;
  humanityScore: number;
  roboticMarkers: string[];
  detectedLanguage: string;
  sentiment: { overall: number; drift: number[] };
  paragraphCount: number;
  sentenceCount: number;
  protectedSpans: string[];
}

interface AccessStatus {
  tier: string | null;
  wordsRemaining: number;
  totalWordsPurchased: number;
  freeWordsUsed: number;
  freeWordsLimit: number;
  unlimitedActive: boolean;
  subscriptionStatus: string | null;
  canManageBilling: boolean;
}

interface ActiveUser {
  name: string;
  email: string;
  role?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const ADMIN_EMAILS = ['a15817348@gmail.com'];

// ─── Small helpers ────────────────────────────────────────────────────────────

function pct(n: number) { return `${Math.round(n * 100)}%`; }
function grade(n: number) { return n.toFixed(1); }

function ScoreBar({ value, label, good = 'high' }: { value: number; label: string; good?: 'high' | 'low' }) {
  const positive = good === 'high' ? value > 0.6 : value < 0.4;
  const color = positive ? 'var(--accent-blue)' : value > 0.7 || value < 0.3 ? '#ef4444' : '#f59e0b';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>{label}</span>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, color }}>{pct(value)}</span>
      </div>
      <div style={{ height: '4px', background: 'rgba(255,255,255,0.05)', borderRadius: '999px', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: pct(value), background: color, borderRadius: '999px', transition: 'width 0.5s ease' }} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Home() {
  const [authChecked, setAuthChecked] = useState(false);
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [alternatives, setAlternatives] = useState<string[]>([]);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [outputMetrics, setOutputMetrics] = useState<AnalysisMetrics | null>(null);
  const [isRewriting, setIsRewriting] = useState(false);
  const [copied, setCopied] = useState(false);

  // Options
  const [tone, setTone] = useState<Tone>('natural');
  const [strength, setStrength] = useState<Strength>('medium');
  const [sectionType, setSectionType] = useState<SectionType>('general');
  const [humanization, setHumanization] = useState(60); // 0–100
  const [selectedProfile, setSelectedProfile] = useState<StyleProfile | null>(null);
  const [variationSeed, setVariationSeed] = useState(0); // increments each regeneration

  // Library & history
  const [history, setHistory] = useState<ManuscriptHistory[]>([]);
  const [currentManuscriptId, setCurrentManuscriptId] = useState<string | null>(null);

  // Panel visibility
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isClonerOpen, setIsClonerOpen] = useState(false);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState<string | null>(null);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');
  const [useCount, setUseCount] = useState(0);
  const [cooldownUntil, setCooldownUntil] = useState(0);
  const [cooldownSecondsLeft, setCooldownSecondsLeft] = useState(0);

  useEffect(() => {
    if (cooldownUntil <= Date.now()) return;
    const id = setInterval(() => {
      const left = Math.ceil((cooldownUntil - Date.now()) / 1000);
      if (left <= 0) { setCooldownSecondsLeft(0); clearInterval(id); }
      else setCooldownSecondsLeft(left);
    }, 1000);
    return () => clearInterval(id);
  }, [cooldownUntil]);

  useEffect(() => {
    let cancelled = false;

    fetch(`${API}/health`, { cache: 'no-store' })
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!cancelled) setBackendStatus('online');
      })
      .catch(() => {
        if (!cancelled) setBackendStatus('offline');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const resolveUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (!isMounted) return;
        const sessionUser = data.session?.user;
        if (sessionUser) {
          const nextUser = {
            name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Editor',
            email: sessionUser.email || '',
            role: 'user',
          };
          setActiveUser(nextUser);
          setSubscriptionTier(null);
          try { window.localStorage.setItem('nw_active_user', JSON.stringify(nextUser)); } catch { /* ignore */ }
          fetchHistory();
        }
      } catch { /* offline / supabase unreachable */ }
      // Always allow access — guests get free 400-word trial
      if (isMounted) setAuthChecked(true);
    };

    resolveUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      const sessionUser = session?.user;
      if (sessionUser) {
        const nextUser = {
          name: sessionUser.user_metadata?.name || sessionUser.email?.split('@')[0] || 'Editor',
          email: sessionUser.email || '',
          role: 'user',
        };
        setActiveUser(nextUser);
        setIsLoginOpen(false);
        setSubscriptionTier(null);
        try { window.localStorage.setItem('nw_active_user', JSON.stringify(nextUser)); } catch { /* ignore */ }
      } else if (event === 'SIGNED_OUT') {
        setActiveUser(null);
        setSubscriptionTier(null);
        try { window.localStorage.removeItem('nw_active_user'); } catch { /* ignore */ }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!activeUser?.email) {
      setSubscriptionTier(null);
      return;
    }

    let cancelled = false;

    fetch(`${API}/rewrite/access-status?email=${encodeURIComponent(activeUser.email)}`)
      .then(r => r.ok ? r.json() : null)
      .then((data: AccessStatus | null) => {
        if (!cancelled) {
          setSubscriptionTier(data?.tier ?? null);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setSubscriptionTier(null);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeUser?.email]);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API}/rewrite/history`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setHistory(await res.json());
      setBackendStatus('online');
    } catch {
      setBackendStatus('offline');
    }
  };

  // ─── Actions ────────────────────────────────────────────────────────────────

  const handleRewrite = async () => {
    if (!inputText.trim()) {
      toast.error('Please enter some text to improve.');
      return;
    }

    // Increment seed on each call when there's already output (regeneration)
    const nextSeed = outputText ? variationSeed + 1 : 0;
    setVariationSeed(nextSeed);
    setIsRewriting(true);
    setShowDiagnostics(false);
    try {
      const res = await fetch(`${API}/rewrite/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          userEmail: activeUser?.email ?? null,
          subscriptionTier: subscriptionTier ?? null,
          options: {
            tone,
            strength,
            sectionType,
            humanization: humanization / 100,
            seed: nextSeed,
            styleProfile: selectedProfile ?? undefined,
          },
        }),
      });

      // 402 = free quota exceeded — open pricing modal
      if (res.status === 402) {
        const body = await res.json().catch(() => ({}));
        setIsRewriting(false);
        setIsPricingOpen(true);
        toast.error(body?.message || 'Free trial limit reached. Upgrade to continue.');
        return;
      }

      if (!res.ok) {
        let errMsg = `Server error ${res.status}`;
        try {
          const errBody = await res.json();
          errMsg = errBody?.message || errBody?.error || errMsg;
        } catch { /* ignore parse failure */ }
        throw new Error(errMsg);
      }
      const data = await res.json();

      setOutputText(data.bestVersion);
      setAlternatives(data.alternatives || []);
      setMetrics(data.metrics || null);
      setOutputMetrics(data.outputMetrics || null);
      setCurrentManuscriptId(data.id);
      setShowDiagnostics(true);
      fetchHistory();
      if (!ADMIN_EMAILS.includes(activeUser?.email ?? '')) {
        setUseCount(prev => prev + 1);
        const until = Date.now() + 60000;
        setCooldownUntil(until);
        setCooldownSecondsLeft(60);
      }

      if (data.humanizationDelta > 0) {
        toast.success(`AI-detection risk dropped by ${data.humanizationDelta} points.`);
      } else {
        toast.success('Text improved successfully.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Rewrite failed. Check your API connection.');
    } finally {
      setIsRewriting(false);
    }
  };

  const handleCopy = () => {
    const plain = outputText.replace(/<[^>]+>/g, '');
    navigator.clipboard.writeText(plain);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Copied to clipboard.');
  };

  const handleClear = () => {
    setInputText('');
    setOutputText('');
    setMetrics(null);
    setOutputMetrics(null);
    setAlternatives([]);
    setShowDiagnostics(false);
    setVariationSeed(0);
  };

  const handleSelectHistory = (item: ManuscriptHistory) => {
    setInputText(item.sourceText);
    setOutputText(item.optimizedText);
    setMetrics(item.metrics);
    setCurrentManuscriptId(item.id);
    if (item.metrics) setShowDiagnostics(true);
    setIsLibraryOpen(false);
  };

  const handleLogin = (user: ActiveUser) => {
    setActiveUser(user);
    setIsLoginOpen(false);
    try {
      window.localStorage.setItem('nw_active_user', JSON.stringify(user));
    } catch { /* ignore */ }
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    setActiveUser(null);
    try {
      window.localStorage.removeItem('nw_active_user');
    } catch { /* ignore */ }
    toast.success('Signed out.');
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (!authChecked) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-primary)',
      }}>
        <Loader2 size={24} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      </div>
    );
  }

  return (
    <main className="main-wrapper">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1f', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />
      <PricingModal
        isOpen={isPricingOpen}
        onClose={() => setIsPricingOpen(false)}
        user={activeUser}
        onLoginRequired={() => { setIsPricingOpen(false); setIsLoginOpen(true); }}
      />

      {/* Modals / Drawers */}
      <StyleCloner
        isOpen={isClonerOpen}
        onClose={() => setIsClonerOpen(false)}
        onStyleCreated={(p) => { setSelectedProfile(p); setIsClonerOpen(false); }}
      />
      <ContactSupport
        isOpen={isContactOpen}
        onClose={() => setIsContactOpen(false)}
      />
      <ManuscriptLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onSearch={() => {}}
        isSearching={false}
      />
      <FlightDeck isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />

      {/* ── About Us Modal ── */}
      <AnimatePresence>
        {isAboutOpen && (
          <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }} onClick={() => setIsAboutOpen(false)}>
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.97 }}
              transition={{ duration: 0.22 }}
              onClick={e => e.stopPropagation()}
              style={{ background: '#0d1117', border: '1px solid rgba(37,99,235,0.25)', borderRadius: '1.25rem', padding: '2.5rem', maxWidth: '580px', width: '100%', maxHeight: '85vh', overflowY: 'auto', position: 'relative', boxShadow: '0 0 60px rgba(37,99,235,0.15)' }}
            >
              <button onClick={() => setIsAboutOpen(false)} style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.75rem' }}>
                <BrandMark size={36} />
                <div>
                  <h2 style={{ fontSize: '1.3rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', color: 'var(--text-pure)', margin: 0 }}>Natural Quill</h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>AI Writing Humanizer</p>
                </div>
              </div>

              <p style={{ fontSize: '1rem', lineHeight: 1.75, color: 'var(--text-pure)', marginBottom: '1.5rem' }}>
                Natural Quill rewrites AI-generated text into writing that genuinely sounds human. We built this tool for students, professionals, and researchers who need their work to read with real voice — not the flat, repetitive patterns that AI detectors flag instantly.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem', marginBottom: '1.75rem' }}>
                {[
                  { title: 'Writing Quality', body: 'Every rewrite goes through multi-pass processing — adjusting sentence rhythm, burstiness, word choice, and flow so the output reads like a person actually sat down and wrote it.' },
                  { title: 'Deadline-Ready', body: 'Fast turnaround with no upload limits on paid plans. Paste, adjust, convert — your paper is ready in seconds, not hours.' },
                  { title: 'Academic Integrity', body: 'Natural Quill improves the naturalness and clarity of your writing. Your ideas stay yours — we only change how they sound, never what they say.' },
                  { title: 'Passes AI Detection', body: 'Engineered specifically to reduce detection signals measured by Turnitin, Scribbr, GPTZero, and similar tools — targeting burstiness, perplexity, and parallel structure patterns that detectors rely on.' },
                  { title: 'Lowest Price, No Subscriptions Traps', body: 'One-time word packs from $19.99. No auto-renew surprises. Pay once, use when you need it. Unlimited plan available for heavy users at $39.99/month.' },
                ].map(({ title, body }) => (
                  <div key={title} style={{ padding: '1rem 1.25rem', background: 'rgba(37,99,235,0.06)', border: '1px solid rgba(37,99,235,0.12)', borderRadius: '0.75rem' }}>
                    <p style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--accent-blue)', margin: '0 0 0.35rem' }}>{title}</p>
                    <p style={{ fontSize: '0.875rem', lineHeight: 1.65, color: '#c8d0e0', margin: 0 }}>{body}</p>
                  </div>
                ))}
              </div>

              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', margin: 0 }}>
                Questions? Reach us at <span style={{ color: 'var(--accent-blue)' }}>stockitupcs@gmail.com</span>
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={activeUser}
        onSignOut={handleSignOut}
        onOpenLogin={() => { setIsProfileOpen(false); setIsLoginOpen(true); }}
        subscriptionTier={subscriptionTier}
        onOpenPricing={() => { setIsProfileOpen(false); setIsPricingOpen(true); }}
      />

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1.5rem', padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="icon-container-core">
            <BrandMark size={42} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, fontFamily: 'var(--font-display)', letterSpacing: '-0.03em', lineHeight: 1 }}>
              Natural Quill
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem' }}>
              <p className="text-subtitle" style={{ margin: 0 }}>AI-powered writing improvement</p>
              <BackendStatusDot status={backendStatus} />
            </div>
          </div>
        </div>

        {/* Center: workspace actions */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
          <HeaderAction icon={<History size={14} />} label="History" onClick={() => setIsLibraryOpen(true)} />
          <HeaderAction icon={<LifeBuoy size={14} />} label="Support" onClick={() => setIsContactOpen(true)} />
          <HeaderAction icon={<Info size={14} />} label="About Us" onClick={() => setIsAboutOpen(true)} />
          <HeaderAction icon={<Server size={14} />} label="Stats" onClick={() => setIsStatsOpen(true)} />
          <a href="/blog" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: '0.5rem', border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none', transition: 'color 0.15s' }}
            onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={e => (e.currentTarget.style.color = 'var(--text-muted)')}>
            Blog
          </a>
        </nav>

        {/* Right: style chip + profile + primary action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          {selectedProfile && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              padding: '0.35rem 0.7rem',
              background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.25)',
              borderRadius: '999px',
            }}>
              <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--accent-blue)' }}>
                {selectedProfile.name}
              </span>
              <button onClick={() => setSelectedProfile(null)} style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={11} /></button>
            </div>
          )}

          <ProfileButton user={activeUser} onClick={() => setIsProfileOpen(true)} />
        </div>
      </header>

      {/* Backend offline banner */}
      {backendStatus === 'offline' && (
        <div style={{
          margin: '0 1.5rem',
          padding: '0.65rem 1rem',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <AlertCircle size={14} style={{ color: '#ef4444' }} />
          <span style={{ fontSize: '0.72rem', color: '#fecaca' }}>
            Cannot reach the backend at <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>{API}</code>. Start it with <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.35rem', borderRadius: '3px' }}>npm run start:dev</code> in the backend directory.
          </span>
          <button onClick={fetchHistory} className="btn btn-glass" style={{ marginLeft: 'auto', padding: '0.3rem 0.7rem', fontSize: '0.65rem' }}>
            Retry
          </button>
        </div>
      )}

      {/* ── Free tier banner ── */}
      {!subscriptionTier && (
        <div style={{
          margin: '0 1.5rem',
          padding: '0.55rem 1rem',
          background: 'rgba(124,58,237,0.06)',
          border: '1px solid rgba(124,58,237,0.2)',
          borderRadius: 'var(--radius-md)',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '0.7rem', color: 'rgba(167,139,250,0.85)', flex: 1 }}>
            <strong style={{ color: '#a78bfa' }}>Free trial:</strong>{' '}
            400 words total across all your rewrites.
            Subscribe for 10,000–unlimited words.
          </span>
          <button
            onClick={() => setIsPricingOpen(true)}
            style={{
              padding: '0.35rem 0.85rem',
              background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
              border: 'none', borderRadius: '999px',
              color: '#fff', fontSize: '0.6rem', fontWeight: 800,
              textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            Upgrade
          </button>
        </div>
      )}

      {/* ── Options bar ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '0 1.5rem', flexWrap: 'wrap' }}>
        <OptionSelect label="Tone" value={tone} onChange={v => setTone(v as Tone)} options={[
          { value: 'natural', label: 'Natural' },
          { value: 'conversational', label: 'Conversational' },
          { value: 'formal', label: 'Formal' },
          { value: 'academic', label: 'Academic' },
          { value: 'blog', label: 'Blog / Casual' },
        ]} />
        <OptionSelect label="Edit strength" value={strength} onChange={v => setStrength(v as Strength)} options={[
          { value: 'light', label: 'Light — minimal changes' },
          { value: 'medium', label: 'Medium — reword sentences' },
          { value: 'strong', label: 'Strong — restructure' },
        ]} />
        <OptionSelect label="Section type" value={sectionType} onChange={v => setSectionType(v as SectionType)} options={[
          { value: 'general', label: 'General' },
          { value: 'introduction', label: 'Introduction' },
          { value: 'narrative', label: 'Narrative' },
          { value: 'data_disclosure', label: 'Data / Technical' },
          { value: 'conclusion', label: 'Conclusion' },
          { value: 'cta', label: 'Call to Action' },
        ]} />

        {/* Humanization slider — core control */}
        <HumanizationSlider value={humanization} onChange={setHumanization} />

        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
          {outputText && (
            <button onClick={handleClear} className="btn btn-glass" style={{ padding: '0.5rem 1rem' }}>
              <RotateCcw size={14} /> Clear
            </button>
          )}
        </div>
      </div>

      {/* ── Tool strip: Text Diagnostics + AI Generator — above the editor grid ── */}
      <div style={{ padding: '0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>

        {/* Text Diagnostics — always visible; shows placeholder until first rewrite */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <button
            onClick={() => setShowDiagnostics(v => !v)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '0.85rem 1.25rem',
              background: 'transparent', border: 'none',
              borderBottom: showDiagnostics ? '1px solid rgba(255,255,255,0.06)' : 'none',
              cursor: 'pointer',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg,#1d4ed8,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <BarChart2 size={15} color="#fff" />
              </div>
              <div style={{ textAlign: 'left' }}>
                <p style={{ fontSize: '0.82rem', fontWeight: 800, color: showDiagnostics ? '#93c5fd' : '#60a5fa', margin: 0, letterSpacing: '-0.01em' }}>Text Diagnostics</p>
                <p style={{ fontSize: '0.65rem', color: 'rgba(96,165,250,0.6)', margin: 0, marginTop: '0.1rem' }}>
                  {metrics
                    ? <>AI risk: {metrics.aiDetectionRisk}% → {outputMetrics ? `${outputMetrics.aiDetectionRisk}%` : '—'} · Burstiness: {metrics.burstiness.toFixed(2)} → {outputMetrics ? outputMetrics.burstiness.toFixed(2) : '—'}</>
                    : 'Click "Convert to Natural Writing" to analyse your text'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.3rem 0.65rem', background: showDiagnostics ? 'rgba(37,99,235,0.2)' : 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.3)', borderRadius: '999px', color: '#60a5fa', fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              {showDiagnostics ? <><ChevronDown size={11} style={{ transform: 'rotate(180deg)' }} /> Hide</> : <><ChevronDown size={11} /> Show</>}
            </div>
          </button>

          <AnimatePresence>
            {showDiagnostics && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: 'hidden' }}>
                {metrics ? (
                  <div style={{ padding: '1.25rem 1.75rem' }}>
                    {metrics.detectedLanguage && metrics.detectedLanguage !== 'en' && (
                      <p style={{ fontSize: '0.65rem', color: 'var(--text-dark)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>Language detected: {metrics.detectedLanguage}</p>
                    )}
                    <AIRiskComparison inputRisk={metrics.aiDetectionRisk} outputRisk={outputMetrics?.aiDetectionRisk ?? null} />
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '1.25rem', marginTop: '1rem' }}>
                      <ScoreBar value={metrics.humanityScore} label="Naturalness" good="high" />
                      <ScoreBar value={Math.min(metrics.burstiness / 0.7, 1)} label="Sentence variety" good="high" />
                      <ScoreBar value={metrics.contractionRate} label="Contraction rate" good="high" />
                      <ScoreBar value={Math.min(metrics.readability.readingEase / 100, 1)} label="Reading ease" good="high" />
                      <ScoreBar value={1 - metrics.passiveVoice.ratio} label="Active voice" good="high" />
                      <ScoreBar value={1 - Math.min(metrics.hedgeDensity * 20, 1)} label="Directness" good="high" />
                      <ScoreBar value={1 - Math.min(metrics.nominalizationDensity * 5, 1)} label="Verb-forward" good="high" />
                      <ScoreBar value={1 - metrics.semanticRedundancy} label="No redundancy" good="high" />
                      <ScoreBar value={1 - Math.min(metrics.transitionOveruse, 1)} label="Transition balance" good="high" />
                      <ScoreBar value={metrics.lexicalDiversity.ttr} label="Word variety" good="high" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.75rem', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
                      <DiagStat label="Grade level" value={`${grade(metrics.readability.gradeLevel)} (Flesch-Kincaid)`} />
                      <DiagStat label="Avg sentence" value={`${grade(metrics.sentenceLengthMean)} words (σ=${grade(metrics.sentenceLengthStd)})`} />
                      <DiagStat label="Sentences" value={`${metrics.sentenceCount} across ${metrics.paragraphCount} paragraphs`} />
                      <DiagStat label="Unique words" value={`${metrics.lexicalDiversity.uniqueWords} (TTR ${pct(metrics.lexicalDiversity.ttr)})`} />
                      {metrics.passiveVoice.count > 0 && <DiagStat label="Passive voice" value={`${metrics.passiveVoice.count} sentences`} warn />}
                      {metrics.roboticMarkers.length > 0 && <DiagStat label="AI-like phrases" value={metrics.roboticMarkers.slice(0, 3).join(', ')} warn />}
                    </div>
                    {metrics.aiTells.length > 0 && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>AI-tell phrases in input: </span>
                        {metrics.aiTells.slice(0, 8).map(t => (
                          <span key={t.phrase} style={{ fontSize: '0.7rem', color: '#ef4444', marginRight: '0.75rem', fontWeight: 500 }}>
                            &quot;{t.phrase}&quot;{t.count > 1 && ` ×${t.count}`}
                          </span>
                        ))}
                        {outputMetrics && outputMetrics.aiTells.length === 0 && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginLeft: '0.5rem', fontWeight: 600 }}>→ all removed in improved version</span>
                        )}
                      </div>
                    )}
                    {(metrics.repeatedNGrams.length > 0 || metrics.sentenceStarterRepetition.length > 0) && (
                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                        {metrics.repeatedNGrams.length > 0 && (
                          <div style={{ marginBottom: '0.5rem' }}>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Repeated phrases: </span>
                            {metrics.repeatedNGrams.slice(0, 5).map(n => (
                              <span key={n.ngram} style={{ fontSize: '0.7rem', color: '#f59e0b', marginRight: '0.75rem' }}>&quot;{n.ngram}&quot; ×{n.count}</span>
                            ))}
                          </div>
                        )}
                        {metrics.sentenceStarterRepetition.length > 0 && (
                          <div>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Repeated openers: </span>
                            {metrics.sentenceStarterRepetition.slice(0, 3).map(s => (
                              <span key={s.starter} style={{ fontSize: '0.7rem', color: '#f59e0b', marginRight: '0.75rem' }}>&quot;{s.starter}…&quot; ×{s.count}</span>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(96,165,250,0.4)', fontSize: '0.8rem' }}>
                    Paste your text and click <strong style={{ color: 'rgba(96,165,250,0.7)' }}>Convert to Natural Writing</strong> to see AI-detection metrics here.
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* AI Generator */}
        <div className="glass-panel" style={{ borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
          <AIGeneratorPanel onGenerate={(text) => { setInputText(text); }} />
        </div>
      </div>

      {/* ── Main editor grid ── */}
      <div className="grid-workspace" style={{ flex: 1, minHeight: 0 }}>
        {/* Left: Editor */}
        <div className="glass-panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <div className="flex-row">
              <Type size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Your Text</span>
            </div>
            <button onClick={() => setIsLibraryOpen(true)} className="btn btn-glass" style={{ padding: '0.4rem 0.9rem', fontSize: '0.65rem' }}>
              <FolderOpen size={13} /> Open saved
            </button>
          </div>
          <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
            {/* Textarea */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <TextInputPanel
                value={inputText}
                onChange={setInputText}
                placeholder="Paste or type the AI-generated text you want to humanize — or upload a .pdf / .docx file above."
              />
            </div>

            {/* ── Generate button ── */}
            {(() => {
              const isAdmin = ADMIN_EMAILS.includes(activeUser?.email ?? '');
              const onCooldown = !isAdmin && cooldownSecondsLeft > 0;
              const maxed     = !isAdmin && useCount >= 3;
              const disabled  = isRewriting || !inputText.trim() || backendStatus === 'offline' || onCooldown || maxed;
              const ready     = !disabled;
              return (
                <div style={{
                  padding: '0.9rem 1.25rem 1.1rem',
                  borderTop: '1px solid rgba(37,99,235,0.14)',
                  background: 'rgba(37,99,235,0.03)',
                  flexShrink: 0, position: 'relative',
                }}>
                  <div style={{
                    position: 'absolute', inset: 0, pointerEvents: 'none',
                    background: 'radial-gradient(ellipse 70% 55% at 50% 100%, rgba(37,99,235,0.14) 0%, transparent 70%)',
                  }} />
                  <button
                    onClick={handleRewrite}
                    disabled={disabled}
                    title={
                      backendStatus === 'offline' ? 'Backend offline — start the server'
                      : !inputText.trim() ? 'Enter some text first'
                      : maxed ? 'Session limit reached (3 rewrites)'
                      : onCooldown ? `Cooldown — ${cooldownSecondsLeft}s`
                      : 'Humanize this text'
                    }
                    style={{
                      position: 'relative', width: '100%',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
                      padding: '0.95rem 1rem',
                      background: ready
                        ? 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)'
                        : 'rgba(37,99,235,0.18)',
                      border: ready
                        ? '1px solid rgba(96,165,250,0.5)'
                        : '1px solid rgba(37,99,235,0.18)',
                      borderRadius: '12px',
                      color: ready ? '#fff' : 'rgba(255,255,255,0.25)',
                      fontSize: '0.85rem', fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      cursor: disabled ? 'not-allowed' : 'pointer',
                      opacity: disabled && !isRewriting ? 0.5 : 1,
                      boxShadow: ready
                        ? '0 0 0 1px rgba(59,130,246,0.3), 0 4px 20px rgba(37,99,235,0.5), 0 8px 40px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.12)'
                        : 'none',
                      transition: 'all 0.2s ease',
                      fontFamily: 'var(--font-display)',
                      animation: ready ? 'btnPulse 2.5s ease-in-out infinite' : 'none',
                    }}
                    onMouseEnter={e => {
                      if (ready) {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.5), 0 8px 32px rgba(37,99,235,0.7), 0 16px 60px rgba(37,99,235,0.35), inset 0 1px 0 rgba(255,255,255,0.18)';
                        e.currentTarget.style.animation = 'none';
                      }
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.transform = '';
                      if (ready) e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.3), 0 4px 20px rgba(37,99,235,0.5), 0 8px 40px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.12)';
                    }}
                  >
                    {isRewriting
                      ? <><Loader2 size={18} className="animate-spin" />{outputText ? 'Generating new version…' : 'Humanizing…'}</>
                      : maxed
                      ? 'Session limit reached'
                      : onCooldown
                      ? `Wait ${cooldownSecondsLeft}s before next rewrite`
                      : outputText
                      ? <><RefreshCw size={18} /> Generate New Version</>
                      : <><Sparkles size={18} /> Convert to Natural Writing</>
                    }
                  </button>
                  <style>{`
                    @keyframes btnPulse {
                      0%,100% { box-shadow: 0 0 0 1px rgba(59,130,246,0.3), 0 4px 20px rgba(37,99,235,0.5), 0 8px 40px rgba(37,99,235,0.25), inset 0 1px 0 rgba(255,255,255,0.12); }
                      50%     { box-shadow: 0 0 0 3px rgba(59,130,246,0.18), 0 4px 28px rgba(37,99,235,0.75), 0 12px 60px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.18); }
                    }
                  `}</style>
                  {backendStatus === 'offline' && (
                    <p style={{ fontSize: '0.6rem', color: '#ef4444', textAlign: 'center', marginTop: '0.35rem', position: 'relative' }}>
                      API offline — run <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0 0.3rem', borderRadius: 3 }}>npm run start:dev</code> in the backend
                    </p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>

        {/* Right: Output */}
        <div className="glass-panel" style={{ flex: 1 }}>
          <div className="panel-header">
            <div className="flex-row">
              <FileText size={16} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>Improved Version</span>
            </div>
            <div className="flex-row" style={{ gap: '0.5rem' }}>
              {/* ── Improve Text button with cooldown ── */}
              {(() => {
                const isAdmin = ADMIN_EMAILS.includes(activeUser?.email ?? '');
                const isOnCooldown = !isAdmin && cooldownSecondsLeft > 0;
                const isMaxed = !isAdmin && useCount >= 3;
                const isDisabled = isRewriting || !inputText.trim() || backendStatus === 'offline' || isOnCooldown || isMaxed;
                const label = isRewriting
                  ? 'Improving…'
                  : isMaxed
                  ? 'Limit reached'
                  : isOnCooldown
                  ? `Wait ${cooldownSecondsLeft}s`
                  : outputText
                  ? 'Regenerate'
                  : 'Improve Text';
                const title = isMaxed
                  ? 'Maximum 3 uses per session'
                  : isOnCooldown
                  ? `Cooldown — ${cooldownSecondsLeft}s remaining`
                  : backendStatus === 'offline'
                  ? 'Backend is offline'
                  : !inputText.trim()
                  ? 'Enter some text first'
                  : 'Improve this text using the NLP algorithm';
                return (
                  <button
                    onClick={handleRewrite}
                    disabled={isDisabled}
                    title={title}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                      padding: '0.45rem 1rem',
                      background: isDisabled
                        ? 'rgba(37,99,235,0.08)'
                        : 'linear-gradient(135deg, #1d4ed8, #3b82f6)',
                      border: isDisabled
                        ? '1px solid rgba(37,99,235,0.15)'
                        : '1px solid rgba(96,165,250,0.4)',
                      borderRadius: '8px',
                      color: isDisabled ? 'rgba(255,255,255,0.3)' : '#fff',
                      fontSize: '0.65rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s ease',
                      whiteSpace: 'nowrap',
                      boxShadow: isDisabled ? 'none' : '0 2px 12px rgba(37,99,235,0.4)',
                      animation: !isDisabled ? 'headerBtnPulse 2.5s ease-in-out infinite' : 'none',
                    }}
                  >
                    {isRewriting
                      ? <Loader2 size={12} className="animate-spin" />
                      : isOnCooldown || isMaxed
                      ? null
                      : <Sparkles size={12} />}
                    {label}
                    {useCount > 0 && !isMaxed && !isAdmin && (
                      <span style={{ opacity: 0.5, fontSize: '0.55rem' }}>({useCount}/3)</span>
                    )}
                    {isAdmin && (
                      <span style={{ opacity: 0.45, fontSize: '0.55rem' }}>∞</span>
                    )}
                  </button>
                );
              })()}

              {alternatives.length > 0 && (
                <button onClick={() => setShowAlternatives(v => !v)} className="btn btn-glass" style={{ padding: '0.4rem 0.9rem', fontSize: '0.65rem' }}>
                  <ChevronDown size={13} /> {alternatives.length} alt.
                </button>
              )}
              {outputText && (
                <button onClick={handleCopy} className="btn btn-glass" style={{ padding: '0.4rem 0.9rem', fontSize: '0.65rem' }}>
                  {copied ? <Check size={13} /> : <Copy size={13} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              )}
            </div>
          </div>
          <style>{`
            @keyframes headerBtnPulse {
              0%, 100% { box-shadow: 0 2px 12px rgba(37,99,235,0.4); }
              50%       { box-shadow: 0 2px 20px rgba(37,99,235,0.7), 0 0 0 2px rgba(59,130,246,0.15); }
            }
          `}</style>

          <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
            {outputText ? (
              <div style={{ padding: '1.75rem 2rem' }}>
                {/* Improved text — always readable */}
                {outputText.replace(/<[^>]+>/g, '').split(/\n\n+/).map((para, idx) => (
                  <p key={idx} style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.8,
                    color: '#e8e8ed',
                    wordBreak: 'break-word',
                    fontFamily: 'var(--font-body), system-ui, sans-serif',
                    margin: idx === 0 ? 0 : '1em 0 0',
                  }}>
                    {para.trim()}
                  </p>
                ))}

                {/* Show diff toggle */}
                {inputText && (
                  <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '1rem' }}>
                    <button
                      onClick={() => setShowAlternatives(v => !v)}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                        padding: '0.4rem 0.85rem',
                        background: showAlternatives ? 'rgba(37,99,235,0.15)' : 'rgba(255,255,255,0.04)',
                        border: `1px solid ${showAlternatives ? 'rgba(37,99,235,0.4)' : 'rgba(255,255,255,0.08)'}`,
                        borderRadius: '999px',
                        color: showAlternatives ? 'var(--accent-blue)' : 'var(--text-muted)',
                        fontSize: '0.65rem', fontWeight: 700,
                        textTransform: 'uppercase', letterSpacing: '0.1em', cursor: 'pointer',
                      }}
                    >
                      <BarChart2 size={12} /> {showAlternatives ? 'Hide' : 'Show'} changes
                    </button>

                    {showAlternatives && (
                      <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {inputText.replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/).map((orig, i) => {
                          const improved = outputText.replace(/<[^>]+>/g, '').split(/(?<=[.!?])\s+/)[i] || '';
                          const changed = orig.trim() !== improved.trim();
                          if (!changed) return null;
                          return (
                            <div key={i} style={{ fontSize: '0.72rem', lineHeight: 1.6, borderLeft: '2px solid rgba(37,99,235,0.5)', paddingLeft: '0.75rem' }}>
                              <p style={{ color: '#ef4444', textDecoration: 'line-through', opacity: 0.7, margin: '0 0 0.2rem' }}>{orig.trim()}</p>
                              <p style={{ color: '#4ade80', margin: 0 }}>{improved.trim()}</p>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', opacity: 0.25, textAlign: 'center', padding: '3rem' }}>
                <BrandMark size={48} />
                <p style={{ fontSize: '1rem', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '0.05em', marginTop: '1rem' }}>
                  Improved text appears here
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
                  Paste text on the left, then click <strong>Improve Text</strong> above
                </p>
              </div>
            )}
          </div>

          {/* Alternatives drawer */}
          <AnimatePresence>
            {showAlternatives && alternatives.length > 0 && (
              <motion.div
                initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                style={{ borderTop: '1px solid var(--border-light)', overflow: 'hidden' }}
              >
                <div className="custom-scroll" style={{ maxHeight: '240px', padding: '1rem 1.5rem' }}>
                  <p style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Alternative versions</p>
                  {alternatives.map((alt, i) => (
                    <div key={i} style={{ marginBottom: '0.75rem', padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-md)', cursor: 'pointer' }}
                      onClick={() => { setOutputText(alt); setShowAlternatives(false); }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{alt.replace(/<[^>]+>/g, '').substring(0, 200)}…</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

    </main>
  );
}

// ─── Small sub-components ─────────────────────────────────────────────────────

function OptionSelect({
  label, value, onChange, options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{label}</span>
      <div style={{ position: 'relative' }}>
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          style={{
            appearance: 'none',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-sm)',
            color: '#fff',
            fontSize: '0.75rem',
            fontWeight: 600,
            padding: '0.4rem 2rem 0.4rem 0.75rem',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <ChevronDown size={12} style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', pointerEvents: 'none' }} />
      </div>
    </div>
  );
}

function DiagStat({ label, value, warn = false }: { label: string; value: string; warn?: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
      <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>{label}</span>
      <span style={{ fontSize: '0.72rem', fontWeight: 500, color: warn ? '#f59e0b' : 'var(--text-pure)' }}>
        {warn && <AlertCircle size={11} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'middle' }} />}
        {value}
      </span>
    </div>
  );
}

function ProfileButton({ user, onClick }: { user: ActiveUser | null; onClick: () => void }) {
  // Always labelled "Profile" so the same affordance is used before/after login.
  if (!user) {
    return (
      <button
        onClick={onClick}
        style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.55rem 1.1rem',
          background: 'rgba(255, 255, 255, 0.04)',
          border: '1px solid var(--border-light)',
          borderRadius: '999px',
          color: '#fff',
          fontSize: '0.72rem', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.08em',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          fontFamily: 'var(--font-display)',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.4)'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
        title="Sign in to access your profile"
      >
        <User size={14} /> Profile
      </button>
    );
  }

  const initial = user.name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase() || 'U';
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        padding: '0.35rem 0.9rem 0.35rem 0.35rem',
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid var(--border-light)',
        borderRadius: '999px',
        color: '#fff',
        cursor: 'pointer',
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)'; e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.4)'; }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
      title="Open profile"
    >
      <span style={{
        width: '28px', height: '28px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: '0.75rem', fontWeight: 900,
        fontFamily: 'var(--font-display)',
      }}>{initial}</span>
      <span style={{
        fontSize: '0.7rem', fontWeight: 700,
        maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {user.name}
      </span>
    </button>
  );
}

function BackendStatusDot({ status }: { status: 'checking' | 'online' | 'offline' }) {
  const config = {
    checking: { color: '#f59e0b', label: 'Connecting' },
    online: { color: '#10b981', label: 'AI online' },
    offline: { color: '#ef4444', label: 'AI offline' },
  }[status];
  return (
    <div title={config.label} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
      <span style={{
        width: '6px', height: '6px', borderRadius: '50%',
        background: config.color,
        boxShadow: status === 'online' ? `0 0 6px ${config.color}` : 'none',
        animation: status === 'checking' ? 'pulse 1.5s infinite' : undefined,
      }} />
      <span style={{ fontSize: '0.58rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-dark)' }}>
        {config.label}
      </span>
    </div>
  );
}

function HeaderAction({
  icon, label, onClick, disabled = false, hint,
}: { icon: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; hint?: string }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={disabled && hint ? hint : label}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        padding: '0.55rem 0.9rem',
        background: 'transparent',
        border: '1px solid transparent',
        borderRadius: 'var(--radius-sm)',
        color: disabled ? 'var(--text-dark)' : 'var(--text-muted)',
        fontSize: '0.72rem', fontWeight: 700,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all 0.15s ease',
        fontFamily: 'var(--font-body)',
      }}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'var(--border-light)'; } }}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'transparent'; } }}
    >
      {icon} {label}
    </button>
  );
}

function HumanizationSlider({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const level = value >= 80 ? 'Aggressive' : value >= 50 ? 'Strong' : value >= 25 ? 'Moderate' : value >= 5 ? 'Light' : 'Off';
  const levelColor = value >= 80 ? '#a78bfa' : value >= 50 ? 'var(--accent-blue)' : value >= 25 ? '#60a5fa' : 'var(--text-muted)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', minWidth: '260px', flex: 1, maxWidth: '360px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>
          Humanization
        </span>
        <span style={{ fontSize: '0.7rem', fontWeight: 800, color: levelColor, letterSpacing: '0.05em' }}>
          {value}% · {level}
        </span>
      </div>
      <input
        type="range"
        min={0} max={100} step={5}
        value={value}
        onChange={e => onChange(parseInt(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#2563eb',
          height: '4px',
          cursor: 'pointer',
        }}
      />
      <span style={{ fontSize: '0.72rem', color: 'var(--accent-blue)', fontWeight: 700 }}>
        How aggressively to strip AI-tells, increase burstiness, and add contractions — <span style={{ opacity: 0.75 }}>we recommend ~80%</span>
      </span>
    </div>
  );
}

function AIRiskComparison({ inputRisk, outputRisk }: { inputRisk: number; outputRisk: number | null }) {
  const riskColor = (r: number) => r >= 70 ? '#ef4444' : r >= 40 ? '#f59e0b' : '#10b981';
  const delta = outputRisk !== null ? inputRisk - outputRisk : null;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1.25rem',
      padding: '0.9rem 1.1rem',
      background: 'rgba(37, 99, 235, 0.04)',
      border: '1px solid rgba(37, 99, 235, 0.15)',
      borderRadius: 'var(--radius-md)',
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
          AI Detection Risk
        </span>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-dark)' }}>
          Composite of AI-tells, burstiness, contractions, transitions, nominalizations
        </span>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <RiskBadge label="Input" value={inputRisk} color={riskColor(inputRisk)} />

        {outputRisk !== null && (
          <>
            <TrendingDown size={18} style={{ color: delta !== null && delta > 0 ? '#10b981' : 'var(--text-dark)' }} />
            <RiskBadge label="Improved" value={outputRisk} color={riskColor(outputRisk)} />
            {delta !== null && delta !== 0 && (
              <div style={{
                padding: '0.35rem 0.75rem',
                background: delta > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                border: `1px solid ${delta > 0 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                borderRadius: '999px',
              }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 800, color: delta > 0 ? '#10b981' : '#ef4444' }}>
                  {delta > 0 ? '↓' : '↑'} {Math.abs(delta)} points
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function RiskBadge({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.15rem', minWidth: '70px' }}>
      <span style={{ fontSize: '0.55rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
        {label}
      </span>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
        <span style={{ fontSize: '1.5rem', fontWeight: 900, color, fontFamily: 'var(--font-display)', lineHeight: 1 }}>
          {value}
        </span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/100</span>
      </div>
    </div>
  );
}
