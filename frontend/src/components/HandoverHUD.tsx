'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Rocket, ShieldCheck, Activity, Globe, Cpu, Layers, Infinity as InfinityIcon } from 'lucide-react';

interface HandoverHUDProps {
  data: {
     status: string;
     completionRate: number;
     verifiedPhases: number;
     landmarks: any[];
     securityHardening: string;
     deploymentReadiness: any;
  };
  onClose: () => void;
}

export default function HandoverHUD({ data, onClose }: HandoverHUDProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12 bg-[#050505]/95 backdrop-blur-3xl">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-6xl glass bg-white/[0.01] border border-white/10 rounded-[4rem] p-16 overflow-hidden flex flex-col gap-12 relative shadow-[0_0_100px_rgba(59,130,246,0.1)]">
         <div className="flex justify-between items-start">
            <div className="flex items-center gap-8">
               <div className="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center shadow-2xl shadow-blue-500/40">
                  <Rocket size={48} className="text-white" />
               </div>
               <div>
                  <div className="flex items-center gap-4 mb-2">
                     <span className="text-[12px] font-black uppercase tracking-[0.5em] text-blue-500">Project Master Handover</span>
                     <div className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 rounded-full text-[8px] font-black uppercase text-blue-500">Audit Verified</div>
                  </div>
                  <h1 className="text-6xl font-black uppercase tracking-tighter text-white">Natural Writing OS</h1>
                  <p className="text-[14px] font-bold text-[#444] mt-2 italic">v50.0 Aethel Release — The Absolute Technical Landmark reached after 60 developmental phases.</p>
               </div>
            </div>
            <button onClick={onClose} className="p-4 bg-white/5 border border-white/10 rounded-full text-[#444] hover:text-white transition-all">
               <Activity size={24} />
            </button>
         </div>

         <div className="grid grid-cols-4 gap-10">
            {[
               { icon: <Cpu />, label: 'Neural Integrity', value: '100%', color: 'text-blue-500' },
               { icon: <ShieldCheck />, label: 'Enterprise Security', value: 'AETHEL', color: 'text-green-500' },
               { icon: <Layers />, label: 'Verified Phases', value: '60', color: 'text-purple-500' },
               { icon: <InfinityIcon />, label: 'Architectural Peak', value: 'ETERNAL', color: 'text-yellow-500' }
            ].map((stat, i) => (
               <div key={i} className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] flex flex-col gap-4">
                  <div className={stat.color}>{stat.icon}</div>
                  <p className="text-[10px] font-black uppercase text-[#444] tracking-widest">{stat.label}</p>
                  <p className="text-3xl font-black text-white">{stat.value}</p>
               </div>
            ))}
         </div>

         <div className="flex-1 overflow-y-auto custom-scroll pr-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-8">Ecosystem Roadmap & Technical Landmarks</h3>
            <div className="grid grid-cols-2 gap-8">
               {data.landmarks.map((l, i) => (
                  <div key={i} className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex items-center justify-between group hover:bg-white/[0.04] transition-all">
                     <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center font-black text-[12px] text-blue-500 group-hover:scale-110 transition-all">{l.phase}</div>
                        <div>
                           <p className="text-[12px] font-black uppercase text-white tracking-widest">{l.name} Release</p>
                           <p className="text-[8px] font-bold text-[#444] uppercase tracking-widest">Ecosystem Component Optimized</p>
                        </div>
                     </div>
                     <CheckCircle2 size={18} className="text-green-500" />
                  </div>
               ))}
               <div className="p-6 bg-blue-600/10 border border-blue-500/20 rounded-3xl flex items-center justify-between border-dashed">
                  <div className="flex items-center gap-6">
                     <div className="w-12 h-12 bg-blue-500 rounded-2xl flex items-center justify-center font-black text-[12px] text-white animate-pulse">60</div>
                     <div>
                        <p className="text-[12px] font-black uppercase text-blue-500 tracking-widest">Aethel Handover</p>
                        <p className="text-[8px] font-bold text-blue-500/60 uppercase tracking-widest">Eternal Sovereignty Confirmed</p>
                     </div>
                  </div>
                  <Globe size={18} className="text-blue-500 animate-spin-slow" />
               </div>
            </div>
         </div>

         <div className="pt-10 border-t border-white/5 flex items-center justify-between">
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-[#222] italic">The construction is complete. The Architecture is Eternal. Natural Writing is live.</p>
            <button onClick={onClose} className="px-12 py-4 bg-blue-600 text-white rounded-2xl text-[12px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-2xl shadow-blue-500/40">Enter Eternal</button>
         </div>
      </motion.div>
    </div>
  );
}
