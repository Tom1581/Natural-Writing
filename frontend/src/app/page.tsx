'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles, RotateCcw, Copy, Check, BookOpen,
  History, AlertCircle, Loader2, TrendingDown,
  Type, FolderOpen, MessageSquare,
  Server, FileText, ChevronDown, X, BarChart2, User,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import StyleCloner, { StyleProfile } from '@/components/StyleCloner';
import ManuscriptLibrary, { ManuscriptHistory } from '@/components/ManuscriptLibrary';
import TextInputPanel from '@/components/TextInputPanel';
import SidecarChat from '@/components/SidecarChat';
import FlightDeck from '@/components/FlightDeck';
import LoginModal from '@/components/LoginModal';
import ProfileDrawer from '@/components/ProfileDrawer';
import AIGeneratorPanel from '@/components/AIGeneratorPanel';
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

interface ActiveUser {
  name: string;
  email: string;
  role?: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

  // Library & history
  const [history, setHistory] = useState<ManuscriptHistory[]>([]);
  const [currentManuscriptId, setCurrentManuscriptId] = useState<string | null>(null);

  // Panel visibility
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isClonerOpen, setIsClonerOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showDiagnostics, setShowDiagnostics] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [activeUser, setActiveUser] = useState<ActiveUser | null>(null);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'online' | 'offline'>('checking');

  useEffect(() => {
    fetchHistory();
    let isMounted = true;

    // Resolve existing session or cached user without forcing the login modal.
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
          try { window.localStorage.setItem('nw_active_user', JSON.stringify(nextUser)); } catch { /* ignore */ }
          return;
        }
      } catch { /* offline / supabase unreachable */ }

      // Fall back to cached local user — still no auto-opened modal.
      try {
        const raw = window.localStorage.getItem('nw_active_user');
        if (raw && isMounted) setActiveUser(JSON.parse(raw));
      } catch { /* ignore */ }
    };

    resolveUser();

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
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
        try { window.localStorage.setItem('nw_active_user', JSON.stringify(nextUser)); } catch { /* ignore */ }
      } else {
        setActiveUser(null);
        try { window.localStorage.removeItem('nw_active_user'); } catch { /* ignore */ }
      }
    });

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

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
    setIsRewriting(true);
    setShowDiagnostics(false);
    try {
      const res = await fetch(`${API}/rewrite/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          options: {
            tone,
            strength,
            sectionType,
            humanization: humanization / 100,
            styleProfile: selectedProfile ?? undefined,
          },
        }),
      });

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

  return (
    <main className="main-wrapper">
      <Toaster position="bottom-right" toastOptions={{ style: { background: '#1a1a1f', color: '#fff', border: '1px solid rgba(255,255,255,0.08)' } }} />
      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLogin={handleLogin} />

      {/* Modals / Drawers */}
      <StyleCloner
        isOpen={isClonerOpen}
        onClose={() => setIsClonerOpen(false)}
        onStyleCreated={(p) => { setSelectedProfile(p); setIsClonerOpen(false); }}
      />
      <ManuscriptLibrary
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        history={history}
        onSelect={handleSelectHistory}
        onSearch={() => {}}
        isSearching={false}
      />
      <SidecarChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        manuscriptContent={inputText}
        onApplyChange={setInputText}
      />
      <FlightDeck isOpen={isStatsOpen} onClose={() => setIsStatsOpen(false)} />
      <ProfileDrawer
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={activeUser}
        onSignOut={handleSignOut}
        onOpenLogin={() => { setIsProfileOpen(false); setIsLoginOpen(true); }}
      />

      {/* ── Header ── */}
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '1.5rem', padding: '0.75rem 1.5rem',
        borderBottom: '1px solid var(--border-light)', marginBottom: '0.5rem',
      }}>
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="icon-container-core" style={{ width: '40px', height: '40px' }}>
            <BrandMark size={20} />
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
          <HeaderAction icon={<BookOpen size={14} />} label="Style Profile" onClick={() => setIsClonerOpen(true)} />
          <HeaderAction icon={<MessageSquare size={14} />} label="AI Chat" onClick={() => setIsChatOpen(true)} disabled={!inputText.trim()} hint="Paste text first" />
          <HeaderAction icon={<Server size={14} />} label="Stats" onClick={() => setIsStatsOpen(true)} />
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

          <button
            onClick={handleRewrite}
            disabled={isRewriting || !inputText.trim() || backendStatus === 'offline'}
            className="btn btn-primary"
            style={{ padding: '0.6rem 1.4rem', minWidth: '150px' }}
            title={backendStatus === 'offline' ? 'Backend is offline — start the API server' : !inputText.trim() ? 'Enter some text first' : 'Improve the text'}
          >
            {isRewriting ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
            {isRewriting ? 'Improving…' : 'Improve Text'}
          </button>
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
            {/* Textarea gets all remaining space */}
            <div style={{ flex: 1, minHeight: 0, overflow: 'hidden' }}>
              <TextInputPanel
                value={inputText}
                onChange={setInputText}
                placeholder="Paste or type the AI-generated text you want to humanize — or upload a .pdf / .docx file above."
              />
            </div>
            <AIGeneratorPanel onGenerate={(text) => { setInputText(text); }} />

            {/* ── Inline process button ── */}
            <div style={{
              padding: '1rem 1.25rem 1.25rem',
              borderTop: '1px solid rgba(37,99,235,0.15)',
              background: 'rgba(37,99,235,0.04)',
              flexShrink: 0,
              position: 'relative',
            }}>
              {/* Ambient glow layer behind the button */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'radial-gradient(ellipse 80% 60% at 50% 100%, rgba(37,99,235,0.18) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              <button
                onClick={handleRewrite}
                disabled={isRewriting || !inputText.trim() || backendStatus === 'offline'}
                title={
                  backendStatus === 'offline' ? 'Backend is offline — start the API server'
                  : !inputText.trim() ? 'Enter or generate some text first'
                  : 'Convert to natural writing'
                }
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.65rem',
                  width: '100%',
                  padding: '1rem 1rem',
                  background: isRewriting || !inputText.trim() || backendStatus === 'offline'
                    ? 'rgba(37,99,235,0.2)'
                    : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)',
                  border: inputText.trim() && !isRewriting && backendStatus !== 'offline'
                    ? '1px solid rgba(96,165,250,0.5)'
                    : '1px solid rgba(37,99,235,0.2)',
                  borderRadius: '14px',
                  color: '#fff',
                  fontSize: '0.88rem', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  cursor: isRewriting || !inputText.trim() || backendStatus === 'offline' ? 'not-allowed' : 'pointer',
                  opacity: !inputText.trim() || backendStatus === 'offline' ? 0.45 : 1,
                  boxShadow: inputText.trim() && !isRewriting && backendStatus !== 'offline'
                    ? '0 0 0 1px rgba(59,130,246,0.3), 0 4px 20px rgba(37,99,235,0.5), 0 8px 40px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15)'
                    : 'none',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-display)',
                  animation: inputText.trim() && !isRewriting && backendStatus !== 'offline'
                    ? 'btnPulse 2.5s ease-in-out infinite' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isRewriting && inputText.trim() && backendStatus !== 'offline') {
                    e.currentTarget.style.transform = 'translateY(-2px) scale(1.01)';
                    e.currentTarget.style.boxShadow = '0 0 0 2px rgba(96,165,250,0.5), 0 8px 32px rgba(37,99,235,0.7), 0 16px 60px rgba(37,99,235,0.4), inset 0 1px 0 rgba(255,255,255,0.2)';
                    e.currentTarget.style.animation = 'none';
                  }
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                  if (inputText.trim() && backendStatus !== 'offline') {
                    e.currentTarget.style.boxShadow = '0 0 0 1px rgba(59,130,246,0.3), 0 4px 20px rgba(37,99,235,0.5), 0 8px 40px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15)';
                    e.currentTarget.style.animation = 'btnPulse 2.5s ease-in-out infinite';
                  }
                }}
              >
                {isRewriting
                  ? <><Loader2 size={18} className="animate-spin" /> Converting to natural writing…</>
                  : <><Sparkles size={18} /> Convert to Natural Writing</>
                }
              </button>

              <style>{`
                @keyframes btnPulse {
                  0%, 100% { box-shadow: 0 0 0 1px rgba(59,130,246,0.3), 0 4px 20px rgba(37,99,235,0.5), 0 8px 40px rgba(37,99,235,0.3), inset 0 1px 0 rgba(255,255,255,0.15); }
                  50%       { box-shadow: 0 0 0 3px rgba(59,130,246,0.2), 0 4px 28px rgba(37,99,235,0.75), 0 12px 60px rgba(37,99,235,0.45), inset 0 1px 0 rgba(255,255,255,0.2); }
                }
              `}</style>
              {backendStatus === 'offline' && (
                <p style={{ fontSize: '0.6rem', color: '#ef4444', textAlign: 'center', marginTop: '0.4rem' }}>
                  API offline — start the backend server first
                </p>
              )}
            </div>
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

          <div className="custom-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', position: 'relative' }}>
            {outputText ? (
              <div style={{ padding: '1.75rem 2rem' }}>
                {/* Improved text — always readable */}
                <p style={{
                  fontSize: '0.95rem',
                  lineHeight: 1.8,
                  color: '#e8e8ed',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'var(--font-body), system-ui, sans-serif',
                  margin: 0,
                }}>
                  {outputText.replace(/<[^>]+>/g, '')}
                </p>

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
                  Paste text on the left, then click Convert to Natural Writing
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

      {/* ── Diagnostics panel ── */}
      <AnimatePresence>
        {showDiagnostics && metrics && (
          <motion.div
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
            className="glass-panel"
            style={{ padding: '1.25rem 1.75rem' }}
          >
            <div className="flex-between" style={{ marginBottom: '1rem' }}>
              <div className="flex-row">
                <BarChart2 size={15} style={{ color: 'var(--text-muted)' }} />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)' }}>
                  Text Diagnostics
                </span>
                {metrics.detectedLanguage && metrics.detectedLanguage !== 'en' && (
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-dark)', textTransform: 'uppercase' }}>· Language: {metrics.detectedLanguage}</span>
                )}
              </div>
              <button onClick={() => setShowDiagnostics(false)} className="btn btn-glass" style={{ padding: '0.25rem 0.5rem' }}><X size={14} /></button>
            </div>

            {/* AI Detection Risk — before / after */}
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
              {metrics.passiveVoice.count > 0 && (
                <DiagStat label="Passive voice" value={`${metrics.passiveVoice.count} sentences`} warn />
              )}
              {metrics.roboticMarkers.length > 0 && (
                <DiagStat label="AI-like phrases" value={metrics.roboticMarkers.slice(0, 3).join(', ')} warn />
              )}
            </div>

            {metrics.aiTells.length > 0 && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>AI-tell phrases in input: </span>
                {metrics.aiTells.slice(0, 8).map(t => (
                  <span key={t.phrase} style={{ fontSize: '0.7rem', color: '#ef4444', marginRight: '0.75rem', fontWeight: 500 }}>
                    "{t.phrase}"{t.count > 1 && ` ×${t.count}`}
                  </span>
                ))}
                {outputMetrics && outputMetrics.aiTells.length === 0 && (
                  <span style={{ fontSize: '0.7rem', color: 'var(--accent-blue)', marginLeft: '0.5rem', fontWeight: 600 }}>
                    → all removed in improved version
                  </span>
                )}
              </div>
            )}

            {(metrics.repeatedNGrams.length > 0 || metrics.sentenceStarterRepetition.length > 0) && (
              <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border-light)' }}>
                {metrics.repeatedNGrams.length > 0 && (
                  <div style={{ marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Repeated phrases: </span>
                    {metrics.repeatedNGrams.slice(0, 5).map(n => (
                      <span key={n.ngram} style={{ fontSize: '0.7rem', color: '#f59e0b', marginRight: '0.75rem' }}>
                        "{n.ngram}" ×{n.count}
                      </span>
                    ))}
                  </div>
                )}
                {metrics.sentenceStarterRepetition.length > 0 && (
                  <div>
                    <span style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-muted)' }}>Repeated openers: </span>
                    {metrics.sentenceStarterRepetition.slice(0, 3).map(s => (
                      <span key={s.starter} style={{ fontSize: '0.7rem', color: '#f59e0b', marginRight: '0.75rem' }}>
                        "{s.starter}…" ×{s.count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
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
    online: { color: '#10b981', label: 'API online' },
    offline: { color: '#ef4444', label: 'API offline' },
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
      <span style={{ fontSize: '0.6rem', color: 'var(--text-dark)' }}>
        How aggressively to strip AI-tells, increase burstiness, and add contractions
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
