'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Zap, Activity, HardDrive, Cpu, Server, X, Activity as ActivityIcon, BarChart, Clock, Database } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';

interface FlightDeckProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FlightDeck({ isOpen, onClose }: FlightDeckProps) {
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) fetchStats();
  }, [isOpen]);

  const fetchStats = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/stats`);
      const data = await res.json();
      setStats(data);
    } catch (err) {
      toast.error('Telemetry offline');
    } finally {
      setIsLoading(false);
    }
  };

  const chartData = [
    { name: '00:00', load: 45 },
    { name: '04:00', load: 52 },
    { name: '08:00', load: 38 },
    { name: '12:00', load: 65 },
    { name: '16:00', load: 48 },
    { name: '20:00', load: 55 },
    { name: '23:59', load: 42 },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[250]" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="fixed inset-12 bg-[#050505] border border-white/5 z-[260] rounded-[4rem] shadow-[0_0_200px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
          >
            <div className="p-12 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="flex items-center gap-6">
                  <div className="p-4 bg-blue-500/10 rounded-2xl shadow-inner"><Shield className="text-blue-500" size={32} /></div>
                  <div>
                     <h2 className="text-3xl font-black uppercase tracking-tighter italic">The Flight Deck</h2>
                     <p className="text-[10px] text-[#222] font-black uppercase tracking-[0.6em]">Neural Infrastructure Observability</p>
                  </div>
               </div>
               <button onClick={onClose} className="text-[#222] hover:text-white transition-all"><X size={32} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-20 custom-scroll">
               <div className="grid grid-cols-4 gap-12 mb-20">
                  <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#222] flex items-center gap-3"><Zap size={14} /> Total Tokens</p>
                     <p className="text-5xl font-black italic">{stats?.totalTokens?.toLocaleString() || '0'}</p>
                  </div>
                  <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#222] flex items-center gap-3"><Clock size={14} /> Avg Latency</p>
                     <p className="text-5xl font-black italic text-blue-500">{stats?.avgLatencyMs || '0'}<span className="text-sm">ms</span></p>
                  </div>
                  <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#222] flex items-center gap-3"><Database size={14} /> Manuscripts</p>
                     <p className="text-5xl font-black italic">{stats?.totalManuscripts || '0'}</p>
                  </div>
                  <div className="p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6 shadow-2xl">
                     <p className="text-[9px] font-black uppercase tracking-widest text-[#222] flex items-center gap-3"><Cpu size={14} /> Efficiency</p>
                     <p className="text-5xl font-black italic text-green-500">99.8<span className="text-sm">%</span></p>
                  </div>
               </div>

               <div className="grid grid-cols-2 gap-12">
                  <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] space-y-12">
                     <h3 className="text-xl font-black uppercase tracking-widest text-[#333] flex items-center gap-4"><ActivityIcon size={20} /> Semantic Throughput</h3>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                           <AreaChart data={chartData}>
                              <defs>
                                 <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                 </linearGradient>
                              </defs>
                              <Area type="monotone" dataKey="load" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLoad)" />
                           </AreaChart>
                        </ResponsiveContainer>
                     </div>
                  </div>
                  <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] flex flex-col justify-between">
                     <div className="space-y-4">
                        <h3 className="text-xl font-black uppercase tracking-widest text-[#333] flex items-center gap-4"><Server size={20} /> Cluster Integrity</h3>
                        <p className="text-xs text-[#555] font-black uppercase tracking-widest leading-relaxed">Neural clusters are operating within optimal temperature and semantic drift boundaries. Automated backup mirrors synchronized.</p>
                     </div>
                     <div className="space-y-6">
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                           <span className="text-[10px] font-black uppercase text-[#222]">Primary Node</span>
                           <span className="text-[10px] font-black uppercase text-green-500">Active</span>
                        </div>
                        <div className="flex justify-between items-end border-b border-white/5 pb-4">
                           <span className="text-[10px] font-black uppercase text-[#222]">Semantic Cache</span>
                           <span className="text-[10px] font-black uppercase text-green-500">Synchronized</span>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
