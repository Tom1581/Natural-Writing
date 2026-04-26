'use client';

import React, { useState, useEffect } from 'react';
import {
  Search, Trash2, SearchCode, X,
  Plus, Folder, Layers, ChevronRight,
  Copy, Clock, BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export interface ManuscriptHistory {
  id: string;
  sourceText: string;
  optimizedText: string;
  metrics: any;
  tone: string;
  strength: string;
  targetGradeLevel: number;
  createdAt: string;
  project?: Project;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  manuscripts?: ManuscriptHistory[];
}

interface ManuscriptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  history: ManuscriptHistory[];
  onSelect: (item: ManuscriptHistory) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

function scoreColor(score: number): string {
  if (score >= 0.75) return '#4ade80';
  if (score >= 0.5)  return '#f59e0b';
  return '#ef4444';
}

function ScoreBadge({ score }: { score: number | undefined }) {
  const pct = score != null ? Math.round(score * 100) : null;
  const color = pct != null ? scoreColor(score!) : '#333';
  return (
    <div style={{
      width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
      border: `2px solid ${pct != null ? color + '55' : 'rgba(255,255,255,0.06)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: pct != null ? color + '10' : 'transparent',
    }}>
      <span style={{ fontSize: '0.6rem', fontWeight: 900, color: pct != null ? color : '#333', letterSpacing: '-0.02em' }}>
        {pct != null ? `${pct}%` : '—'}
      </span>
    </div>
  );
}

function Pill({ children, color = '#2a2a2a' }: { children: React.ReactNode; color?: string }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '0.2rem',
      padding: '0.2rem 0.55rem',
      background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
      borderRadius: 999,
      fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
      color,
      whiteSpace: 'nowrap',
    }}>
      {children}
    </span>
  );
}

export default function ManuscriptLibrary({ isOpen, onClose, history, onSelect, onSearch, isSearching }: ManuscriptLibraryProps) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [projects, setProjects]           = useState<Project[]>([]);
  const [searchValue, setSearchValue]     = useState('');

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/projects`);
      if (!res.ok) return;
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch { /* backend offline — silently skip */ }
  };

  const handleCreateProject = async () => {
    const name = prompt('Workspace name:');
    if (!name) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      const newProject = await res.json();
      setProjects(prev => [...prev, newProject]);
      toast.success('Workspace created');
    } catch { toast.error('Creation failed'); }
  };

  const filteredHistory = activeProject
    ? history.filter(item => item.project?.id === activeProject)
    : history;

  const handleSearch = (q: string) => {
    setSearchValue(q);
    onSearch(q);
  };

  const NAV_ITEM: React.CSSProperties = {
    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.6rem 0.75rem', borderRadius: 9, border: 'none',
    background: 'none', cursor: 'pointer', transition: 'background 0.15s',
    textAlign: 'left',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(12px)', zIndex: 180 }}
          />

          {/* Panel — slides from left */}
          <motion.div
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            style={{
              position: 'fixed', left: 0, top: 0, bottom: 0, width: 860,
              background: '#060606',
              borderRight: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '80px 0 180px rgba(0,0,0,1)',
              zIndex: 190,
              display: 'flex', overflow: 'hidden',
            }}
          >
            {/* ── Left nav: workspaces ── */}
            <div style={{
              width: 220, flexShrink: 0,
              borderRight: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', flexDirection: 'column',
            }}>
              {/* Nav header */}
              <div style={{
                padding: '1.25rem 1rem 1rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span style={{ fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.45em', color: '#242424' }}>
                  Workspaces
                </span>
                <button
                  onClick={handleCreateProject}
                  style={{ background: 'none', border: 'none', color: '#333', cursor: 'pointer', display: 'flex', padding: '0.1rem' }}
                  title="New workspace"
                >
                  <Plus size={15} />
                </button>
              </div>

              {/* Nav list */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.75rem' }}>
                {/* All */}
                <button
                  onClick={() => setActiveProject(null)}
                  style={{
                    ...NAV_ITEM,
                    background: !activeProject ? 'rgba(37,99,235,0.1)' : 'none',
                    color: !activeProject ? '#60a5fa' : '#3a3a3a',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Layers size={13} />
                    <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>All</span>
                  </div>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, opacity: 0.6 }}>{history.length}</span>
                </button>

                {projects.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setActiveProject(p.id)}
                    style={{
                      ...NAV_ITEM,
                      background: activeProject === p.id ? 'rgba(37,99,235,0.1)' : 'none',
                      color: activeProject === p.id ? '#60a5fa' : '#3a3a3a',
                      marginTop: '0.15rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                      <Folder size={13} style={{ flexShrink: 0 }} />
                      <span style={{ fontSize: '0.62rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {p.name}
                      </span>
                    </div>
                    <ChevronRight size={11} style={{ opacity: 0.2, flexShrink: 0 }} />
                  </button>
                ))}
              </div>
            </div>

            {/* ── Main content ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

              {/* Header */}
              <div style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid rgba(255,255,255,0.05)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9,
                    background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.18)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BookOpen size={16} style={{ color: '#3b82f6' }} />
                  </div>
                  <div>
                    <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', fontStyle: 'italic' }}>
                      Manuscript Vault
                    </h2>
                    <p style={{ margin: 0, fontSize: '0.55rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.4em', color: '#242424' }}>
                      {activeProject ? projects.find(p => p.id === activeProject)?.name : 'Primary Archival Index'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', display: 'flex', padding: '0.25rem' }}
                >
                  <X size={19} />
                </button>
              </div>

              {/* Search */}
              <div style={{ padding: '0.85rem 1.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                <div style={{ position: 'relative' }}>
                  <Search size={14} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#2e2e2e', pointerEvents: 'none' }} />
                  <input
                    type="text"
                    placeholder="Search manuscripts…"
                    value={searchValue}
                    onChange={e => handleSearch(e.target.value)}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                      borderRadius: 9, padding: '0.65rem 0.9rem 0.65rem 2.4rem',
                      fontSize: '0.8rem', color: '#ccc', outline: 'none', fontFamily: 'inherit',
                    }}
                    onFocus={e  => (e.target.style.borderColor = 'rgba(59,130,246,0.4)')}
                    onBlur={e   => (e.target.style.borderColor = 'rgba(255,255,255,0.06)')}
                  />
                  {isSearching && (
                    <SearchCode size={14} style={{ position: 'absolute', right: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#3b82f6', animation: 'scPulse 1s ease-in-out infinite' }} />
                  )}
                </div>
              </div>

              {/* List */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '0.5rem 0' }}>
                {filteredHistory.length === 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '3rem', textAlign: 'center' }}>
                    <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                      <Layers size={22} style={{ color: '#3b82f6' }} />
                    </div>
                    <p style={{ fontSize: '0.95rem', fontWeight: 700, color: '#ddd', margin: '0 0 0.5rem' }}>No saved rewrites yet</p>
                    <p style={{ fontSize: '0.75rem', color: '#333', lineHeight: 1.7, maxWidth: 320, margin: '0 0 1.25rem' }}>
                      Every time you click <strong style={{ color: '#60a5fa' }}>Improve Text</strong>, the result is saved here automatically.
                    </p>
                    <button
                      onClick={onClose}
                      style={{
                        padding: '0.55rem 1.25rem',
                        background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 8,
                        color: '#60a5fa', fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      Back to editor
                    </button>
                  </div>
                ) : (
                  filteredHistory.map((item, idx) => {
                    const humanityScore = item.metrics?.humanityScore as number | undefined;
                    const dateStr = new Date(item.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                    const preview = item.sourceText.replace(/<[^>]*>/g, '').trim().slice(0, 160);

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => onSelect(item)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '1rem',
                          padding: '0.9rem 1.5rem',
                          borderBottom: '1px solid rgba(255,255,255,0.04)',
                          cursor: 'pointer',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.02)')}
                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                      >
                        {/* Score ring */}
                        <ScoreBadge score={humanityScore} />

                        {/* Content */}
                        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                          {/* Meta row */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <Pill color="#3b82f6">{item.tone}</Pill>
                            <Pill>{item.strength}</Pill>
                            <Pill>Gr. {item.targetGradeLevel}</Pill>
                            <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.57rem', fontWeight: 700, color: '#2a2a2a' }}>
                              <Clock size={10} />{dateStr}
                            </span>
                          </div>
                          {/* Preview */}
                          <p style={{ margin: 0, fontSize: '0.78rem', color: '#555', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {preview}{preview.length < item.sourceText.replace(/<[^>]*>/g, '').trim().length && '…'}
                          </p>
                        </div>

                        {/* Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexShrink: 0 }}>
                          <button
                            onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(item.optimizedText.replace(/<[^>]*>/g, '')); toast.success('Copied'); }}
                            style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, border-color 0.15s' }}
                            title="Copy improved text"
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#60a5fa'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(59,130,246,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
                          >
                            <Copy size={11} />
                          </button>
                          <button
                            onClick={e => { e.stopPropagation(); toast('Delete coming soon'); }}
                            style={{ width: 28, height: 28, borderRadius: 7, background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)', color: '#333', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'color 0.15s, border-color 0.15s' }}
                            title="Delete"
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = '#ef4444'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(239,68,68,0.3)'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = '#333'; (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.05)'; }}
                          >
                            <Trash2 size={11} />
                          </button>
                        </div>

                        <ChevronRight size={14} style={{ color: '#1e1e1e', flexShrink: 0 }} />
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Footer count */}
              {filteredHistory.length > 0 && (
                <div style={{ padding: '0.65rem 1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#222', textTransform: 'uppercase', letterSpacing: '0.2em' }}>
                    {filteredHistory.length} manuscript{filteredHistory.length !== 1 ? 's' : ''}
                  </span>
                </div>
              )}
            </div>
          </motion.div>

          <style>{`@keyframes scPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }`}</style>
        </>
      )}
    </AnimatePresence>
  );
}
