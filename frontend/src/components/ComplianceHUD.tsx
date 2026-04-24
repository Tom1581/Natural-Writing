'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, ShieldCheck, Lock, AlertCircle, FileText, CheckCircle2, Scale } from 'lucide-react';

interface ComplianceHUDProps {
  data: {
     metrics: {
        brandAlignmentScore: number;
        legalRiskLevel: 'low' | 'medium' | 'high';
        ipSecrecyScore: number;
     };
     risks: any[];
     aeternumLockStatus: string;
  }
}

export default function ComplianceHUD({ data }: ComplianceHUDProps) {
  return (
    <div className="flex flex-col gap-8 glass bg-white/[0.01] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl relative">
      <div className="flex justify-between items-center">
         <div className="flex items-center gap-4">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 shadow-2xl">
               <Scale size={20} />
            </div>
            <div>
               <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[#444] mb-1 italic">Legal & Brand Audit</p>
               <h4 className="text-xl font-black uppercase text-white tracking-tighter">Aeternum Compliance</h4>
            </div>
         </div>
         <div className="flex items-center gap-3 px-6 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
            <Lock size={12} className="text-blue-500" />
            <span className="text-[8px] font-black uppercase text-blue-500">Gold Master Sync Active</span>
         </div>
      </div>

      <div className="grid grid-cols-2 gap-8">
         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-black uppercase text-[#444] tracking-widest">Brand Alignment</span>
               <CheckCircle2 size={14} className="text-green-500" />
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-white">{Math.round(data.metrics.brandAlignmentScore * 100)}%</span>
               <span className="text-[8px] font-bold text-green-500">OPTIMAL</span>
            </div>
         </div>
         <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl flex flex-col gap-4 shadow-xl">
            <div className="flex justify-between items-center">
               <span className="text-[8px] font-black uppercase text-[#444] tracking-widest">Legal Risk Level</span>
               <ShieldAlert size={14} className={data.metrics.legalRiskLevel === 'low' ? 'text-green-500' : 'text-yellow-500'} />
            </div>
            <div className="flex items-baseline gap-2">
               <span className="text-3xl font-black text-white uppercase">{data.metrics.legalRiskLevel}</span>
               <span className="text-[8px] font-bold text-[#444]">CALCULATED</span>
            </div>
         </div>
      </div>

      <div className="flex flex-col gap-4 flex-1">
         <h5 className="text-[8px] font-black uppercase tracking-widest text-[#444] mb-2">Detected Integrity Issues</h5>
         {data.risks.length > 0 ? (
            data.risks.map((risk, i) => (
               <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-5 bg-red-500/[0.03] border border-red-500/10 rounded-2xl flex items-center justify-between group hover:bg-red-500/5 transition-all">
                  <div className="flex items-center gap-4">
                     <AlertCircle size={14} className="text-red-500" />
                     <span className="text-[9px] font-bold text-[#aaa]">{risk.message}</span>
                  </div>
                  <span className="text-[7px] font-black uppercase text-red-500/50 group-hover:text-red-500 transition-all">CRITICAL</span>
               </motion.div>
            ))
         ) : (
            <div className="flex-1 flex flex-col items-center justify-center opacity-10">
               <ShieldCheck size={60} className="mb-4 text-green-500" />
               <p className="text-[10px] font-black uppercase tracking-[0.4em]">Zero Infringements</p>
            </div>
         )}
      </div>

      <div className="pt-6 border-t border-white/5 flex justify-between items-center">
         <p className="text-[7px] font-bold text-[#222] italic">Aeternum Vault Status: Immutable Record Sealed</p>
         <button className="flex items-center gap-2 text-[7px] font-black uppercase text-blue-500 hover:scale-105 transition-all">
            <ShieldCheck size={10} /> LOCK DNA MASTER
         </button>
      </div>
    </div>
  );
}
