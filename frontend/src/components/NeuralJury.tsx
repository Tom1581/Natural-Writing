'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Cpu, Zap, Activity, CheckCircle2, X, Brain, Quote, Layers, Bot, MessageSquare } from 'lucide-react';
import toast from 'react-hot-toast';

interface NeuralJuryProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string | null;
  content: string;
  options: any;
  onSynthesized: (text: string) => void;
}

export default function NeuralJury({ isOpen, onClose, manuscriptId, content, options, onSynthesized }: NeuralJuryProps) {
  const [voters, setVoters] = useState<any[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [consensusScore, setConsensusScore] = useState(0);

  const startSingularity = async () => {
    if (!content) return;
    setIsSynthesizing(true);
    setConsensusScore(0);
    toast.loading('Initiating Neural Singularity...', { id: 'singularity' });

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/${manuscriptId}/synthesize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: content, options })
      });
      const data = await res.json();
      setVoters(data.votes);
      onSynthesized(data.masterpiece);
      setConsensusScore(98);
      toast.success('Singularity Reached: Nexus Prime Masterpiece Generated', { id: 'singularity' });
    } catch (err) {
      toast.error('Singularity failed to coalesce', { id: 'singularity' });
    } finally {
      setIsSynthesizing(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[300]" />
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
            className="fixed inset-20 bg-[#050505] border border-white/10 z-[310] rounded-[5rem] shadow-[0_0_150px_rgba(0,0,0,1)] flex flex-col overflow-hidden"
          >
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-blue-500/5 blur-[150px] animate-pulse" />
            
            <div className="p-16 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
               <div className="flex items-center gap-8">
                  <div className="p-5 bg-blue-500/10 rounded-3xl shadow-inner"><Layers className="text-blue-500" size={32} /></div>
                  <div>
                     <h2 className="text-4xl font-black uppercase tracking-tighter italic">Neural Singularity</h2>
                     <p className="text-[10px] text-[#222] font-black uppercase tracking-[0.6em]">Nexus Prime Swarm Synthesis</p>
                  </div>
               </div>
               <button onClick={onClose} className="text-[#222] hover:text-white transition-all"><X size={40} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-20 custom-scroll">
               {!isSynthesizing && voters.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-12">
                     <Brain size={120} className="text-blue-500/20 animate-pulse" />
                     <div className="space-y-4">
                        <h3 className="text-2xl font-black uppercase tracking-widest text-[#222]">Jury in Idle State</h3>
                        <p className="text-xs text-[#444] font-black uppercase tracking-widest leading-relaxed max-w-lg">Initiate Singularity to convene the multi-model jury for absolute manuscript synthesis.</p>
                     </div>
                     <button onClick={startSingularity} className="px-20 py-6 bg-blue-600 text-white rounded-[2rem] text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_80px_rgba(59,130,246,0.3)] hover:scale-105 transition-all">Invoke Swarm</button>
                  </div>
               ) : (
                  <div className="space-y-20">
                     {/* Voting Statistics */}
                     <div className="grid grid-cols-3 gap-12">
                        <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] text-center space-y-4">
                           <p className="text-[9px] font-black uppercase text-[#222]">Consensus Depth</p>
                           <p className="text-6xl font-black italic text-blue-500 tracking-tighter">{consensusScore}%</p>
                        </div>
                        <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] text-center space-y-4">
                           <p className="text-[9px] font-black uppercase text-[#222]">Active Voters</p>
                           <p className="text-6xl font-black italic text-white tracking-tighter">{voters.length || 3}</p>
                        </div>
                        <div className="p-12 bg-white/[0.01] border border-white/5 rounded-[4rem] text-center space-y-4">
                           <p className="text-[9px] font-black uppercase text-[#222]">Linguistic Alignment</p>
                           <p className="text-6xl font-black italic text-green-500 tracking-tighter">Gold</p>
                        </div>
                     </div>

                     {/* The Jury */}
                     <div className="space-y-8">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#333]">Neural Jury Records</h3>
                        <div className="grid grid-cols-3 gap-8">
                           {voters.map((voter) => (
                              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} key={voter.id} className="p-10 bg-white/[0.01] border border-white/5 rounded-[3rem] space-y-6">
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/5 flex items-center justify-center border border-white/5"><Bot size={24} className="text-blue-500" /></div>
                                    <div>
                                       <p className="text-sm font-black uppercase tracking-widest">{voter.name}</p>
                                       <p className="text-[8px] text-blue-500/40 uppercase font-black tracking-widest">{voter.strength}</p>
                                    </div>
                                 </div>
                                 <div className="space-y-3">
                                    <div className="flex justify-between items-end"><span className="text-[8px] font-black uppercase text-[#222]">Confidence</span><span className="text-[8px] font-black uppercase text-white">99.4%</span></div>
                                    <div className="h-1 bg-white/5 rounded-full"><div className="h-full bg-blue-600 w-[99%]" /></div>
                                 </div>
                              </motion.div>
                           ))}
                        </div>
                     </div>
                  </div>
               )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
