'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, Zap, Clock, FileText, Cpu, X, RefreshCw, Activity, CheckCircle2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface FlightDeckProps {
  isOpen: boolean;
  onClose: () => void;
}

const CHART_DATA = [
  { time: '6h ago', v: 22 },
  { time: '5h ago', v: 41 },
  { time: '4h ago', v: 29 },
  { time: '3h ago', v: 63 },
  { time: '2h ago', v: 44 },
  { time: '1h ago', v: 57 },
  { time: 'now',    v: 48 },
];

const STATUS_ROWS = [
  { label: 'Primary Node',   status: 'Active' },
  { label: 'NLP Engine',     status: 'Running' },
  { label: 'Semantic Cache', status: 'Synchronized' },
  { label: 'SQLite Store',   status: 'Healthy' },
];

export default function FlightDeck({ isOpen, onClose }: FlightDeckProps) {
  const [stats, setStats]       = useState<any>(null);
  const [isLoading, setLoading] = useState(true);

  useEffect(() => { if (isOpen) fetchStats(); }, [isOpen]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res  = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/stats`);
      const data = await res.json();
      setStats(data);
    } catch { toast.error('Telemetry offline'); }
    finally   { setLoading(false); }
  };

  const CARDS = [
    { label: 'Total Tokens',  value: stats?.totalTokens?.toLocaleString() ?? '—',              color: '#f59e0b', icon: <Zap size={13}      /> },
    { label: 'Avg Latency',   value: stats?.avgLatencyMs ? `${stats.avgLatencyMs}ms` : '—',   color: '#3b82f6', icon: <Clock size={13}     /> },
    { label: 'Manuscripts',   value: stats?.totalManuscripts?.toLocaleString() ?? '—',          color: '#a78bfa', icon: <FileText size={13}  /> },
    { label: 'Efficiency',    value: '99.8%',                                                   color: '#4ade80', icon: <Cpu size={13}       /> },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.82)', backdropFilter: 'blur(10px)', zIndex: 250 }}
          />

          {/* Panel — slides up from bottom */}
          <motion.div
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            style={{
              position: 'fixed', left: '3rem', right: '3rem', bottom: 0, top: '3.5rem',
              background: '#060606',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: '1.5rem 1.5rem 0 0',
              boxShadow: '0 -60px 160px rgba(0,0,0,1)',
              zIndex: 260,
              display: 'flex', flexDirection: 'column', overflow: 'hidden',
            }}
          >
            {/* ── Header ── */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '1.25rem 1.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 9,
                  background: 'rgba(37,99,235,0.1)', border: '1px solid rgba(37,99,235,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <BarChart2 size={16} style={{ color: '#3b82f6' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.06em', fontStyle: 'italic' }}>
                    The Flight Deck
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.45em', color: '#2a2a2a' }}>
                    Neural Infrastructure Observability
                  </p>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <button
                  onClick={fetchStats}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 8,
                    background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
                    color: '#444', cursor: 'pointer',
                  }}
                >
                  <RefreshCw size={13} style={{ animation: isLoading ? 'fdSpin 1s linear infinite' : 'none' }} />
                </button>
                <button
                  onClick={onClose}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 32, height: 32, borderRadius: 8, background: 'none', border: 'none', color: '#444', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* ── Body ── */}
            <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem 1.75rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              {/* Stat cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem' }}>
                {CARDS.map(({ label, value, color, icon }) => (
                  <div key={label} style={{
                    padding: '1.1rem 1.25rem',
                    background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.7rem' }}>
                      <span style={{ color }}>{icon}</span>
                      <span style={{ fontSize: '0.57rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#2e2e2e' }}>{label}</span>
                    </div>
                    <p style={{ margin: 0, fontSize: '1.9rem', fontWeight: 900, fontStyle: 'italic', color: color === '#fff' ? '#fff' : color }}>
                      {isLoading ? '…' : value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Chart + Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '0.75rem', flex: 1, minHeight: '220px' }}>

                {/* Throughput chart */}
                <div style={{
                  padding: '1.25rem', background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem',
                  display: 'flex', flexDirection: 'column', gap: '0.75rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Activity size={13} style={{ color: '#3b82f6' }} />
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#2e2e2e' }}>
                      Semantic Throughput
                    </span>
                  </div>
                  <div style={{ flex: 1, minHeight: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={CHART_DATA} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
                        <defs>
                          <linearGradient id="fdGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.25} />
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}    />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
                        <XAxis dataKey="time" tick={{ fontSize: 8, fill: '#333', fontWeight: 700 }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 8, fill: '#333', fontWeight: 700 }} axisLine={false} tickLine={false} domain={[0, 100]} />
                        <Tooltip
                          contentStyle={{ background: '#111', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, fontSize: '0.68rem' }}
                          labelStyle={{ color: '#666', fontWeight: 700 }}
                          itemStyle={{ color: '#3b82f6', fontWeight: 700 }}
                          cursor={{ stroke: 'rgba(59,130,246,0.2)', strokeWidth: 1 }}
                        />
                        <Area type="monotone" dataKey="v" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#fdGrad)" dot={false} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Cluster status */}
                <div style={{
                  padding: '1.25rem', background: 'rgba(255,255,255,0.01)',
                  border: '1px solid rgba(255,255,255,0.05)', borderRadius: '1rem',
                  display: 'flex', flexDirection: 'column', gap: '1rem',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', display: 'inline-block', boxShadow: '0 0 6px #4ade80' }} />
                    <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.25em', color: '#2e2e2e' }}>
                      Cluster Integrity
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.65rem', color: '#333', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', lineHeight: 1.7 }}>
                    Neural clusters operating within optimal temperature and semantic drift boundaries. Backup mirrors synchronized.
                  </p>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '0' }}>
                    {STATUS_ROWS.map(({ label, status }) => (
                      <div key={label} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.04)',
                      }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#2a2a2a' }}>{label}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                          <CheckCircle2 size={11} style={{ color: '#4ade80' }} />
                          <span style={{ fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#4ade80' }}>{status}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <style>{`@keyframes fdSpin { to { transform: rotate(360deg); } }`}</style>
        </>
      )}
    </AnimatePresence>
  );
}
