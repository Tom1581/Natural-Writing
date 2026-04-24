'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, MessageSquare, AlertTriangle, CheckCircle2, TrendingUp, X, Sparkles, Brain, Quote, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface PredictiveReaderProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string | null;
  content: string;
}

export default function PredictiveReader({ isOpen, onClose, manuscriptId, content }: PredictiveReaderProps) {
  const [readers, setReaders] = useState<any[]>([]);
  const [engagement, setEngagement] = useState<any>(null);
  const [isSpawning, setIsSpawning] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const spawnReaders = async () => {
    if (!content) return;
    setIsSpawning(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/${manuscriptId}/spawn-readers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      const data = await res.json();
      setReaders(data);
    } catch (err) {
      toast.error('Spawning failed');
    } finally {
      setIsSpawning(false);
    }
  };

  const analyzeEngagement = async () => {
    if (!content) return;
    setIsAnalyzing(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/${manuscriptId}/predict-engagement`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content })
      });
      const data = await res.json();
      setEngagement(data);
      toast.success(`Engagement Score: ${data.overallScore}/100`);
    } catch (err) {
      toast.error('Engagement analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/90 backdrop-blur-3xl z-[250]" />
          <motion.div 
            initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
            className="fixed top-0 right-0 bottom-0 w-[500px] bg-[#050505] border-l border-white/5 z-[260] shadow-[0_0_100px_rgba(0,0,0,1)] flex flex-col"
          >
            <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="flex items-center gap-5">
                  <div className="p-3 bg-blue-500/10 rounded-2xl"><Brain className="text-blue-500" size={24} /></div>
                  <div>
                     <h2 className="text-xl font-black uppercase tracking-tighter italic">Predictive Reader</h2>
                     <p className="text-[10px] text-[#333] font-black uppercase tracking-widest leading-none">Simulated Audience Psychology</p>
                  </div>
               </div>
               <button onClick={onClose} className="text-[#333] hover:text-white transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 custom-scroll space-y-12">
               {/* Engagement Summary */}
               <div className="p-8 bg-blue-600/5 border border-blue-500/10 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-30 transition-all"><TrendingUp size={80} /></div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-400 mb-6 flex items-center gap-2"><Sparkles size={14} /> Engagement Forecast</p>
                  <div className="flex items-end gap-3">
                     <span className="text-6xl font-black italic tracking-tighter">{engagement?.overallScore || '--'}</span>
                     <span className="text-xs font-black uppercase text-[#444] mb-2">Impact Index</span>
                  </div>
                  <button onClick={analyzeEngagement} disabled={isAnalyzing} className="mt-8 w-full py-4 bg-blue-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 transition-all">
                     {isAnalyzing ? <RefreshCw className="animate-spin" size={16} /> : <Brain size={16} />} Refresh Forecast
                  </button>
               </div>

               {/* Reader Circle */}
               <div className="space-y-6">
                  <div className="flex justify-between items-center px-2">
                     <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#333]">Audience Circle</h3>
                     <button onClick={spawnReaders} disabled={isSpawning} className="text-[9px] font-black uppercase text-blue-500 hover:opacity-70 transition-all flex items-center gap-2">
                        {isSpawning ? 'Spawning...' : 'Summon Readers'}
                     </button>
                  </div>

                  <div className="space-y-4">
                     {readers.length > 0 ? readers.map((reader) => (
                        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={reader.id} className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-4">
                           <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-full bg-[#111] flex items-center justify-center border border-white/5"><UserCircle size={20} className="text-[#333]" /></div>
                              <div>
                                 <p className="text-[10px] font-black uppercase tracking-widest italic">{reader.name}</p>
                                 <p className="text-[8px] text-[#444] uppercase font-black tracking-widest">{reader.tray}</p>
                              </div>
                           </div>
                           <div className="p-5 bg-black/40 rounded-2xl border border-white/5 relative">
                              <Quote className="absolute top-2 right-4 opacity-5" size={24} />
                              <p className="text-[11px] text-[#666] leading-relaxed italic">{reader.feedback}</p>
                           </div>
                        </motion.div>
                     )) : (
                        <div className="p-20 text-center space-y-4 border border-dashed border-white/5 rounded-[3rem]">
                           <UserCircle size={48} className="mx-auto text-[#111]" />
                           <p className="text-[9px] font-black uppercase tracking-widest text-[#222]">The Reader Circle is Empty</p>
                        </div>
                     )}
                  </div>
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
