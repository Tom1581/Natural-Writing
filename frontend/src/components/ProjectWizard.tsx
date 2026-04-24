'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Rocket, Shield, Users, Sparkles, Check, ChevronRight, Building2, Layers } from 'lucide-react';

interface ProjectWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onScaffold: (orgName: string) => void;
}

export default function ProjectWizard({ isOpen, onClose, onScaffold }: ProjectWizardProps) {
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState('');
  const [isScaffolding, setIsScaffolding] = useState(false);

  const handleNext = () => {
    if (step === 3) {
       setIsScaffolding(true);
       setTimeout(() => {
          onScaffold(orgName);
          setIsScaffolding(false);
          onClose();
       }, 2500);
    } else {
       setStep(step + 1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 md:p-12">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-[#050505]/95 backdrop-blur-3xl" onClick={onClose} />
          
          <motion.div initial={{ opacity: 0, scale: 0.9, y: 40 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 40 }} className="relative w-full max-w-4xl glass bg-white/[0.02] border border-white/5 rounded-[4rem] overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[600px]">
             {/* Left Panel */}
             <div className="flex-1 bg-blue-600/10 border-r border-white/5 p-16 flex flex-col justify-between">
                <div>
                   <div className="w-16 h-16 bg-blue-500 rounded-[1.5rem] flex items-center justify-center shadow-xl mb-12">
                      <Rocket className="text-white" size={32} />
                   </div>
                   <h2 className="text-4xl font-black uppercase tracking-tighter text-white mb-6 leading-tight">Ecosystem Genesis</h2>
                   <p className="text-sm text-[#444] leading-relaxed italic">The initialization of a new organizational orbit within the Natural Writing Engine. Define your style DNA and team structure.</p>
                </div>
                <div className="flex gap-2">
                   {[1, 2, 3].map(i => (
                      <div key={i} className={`h-1.5 rounded-full transition-all ${step >= i ? 'w-10 bg-blue-500' : 'w-4 bg-white/5'}`} />
                   ))}
                </div>
             </div>

             {/* Right Panel */}
             <div className="flex-[1.5] p-16 flex flex-col justify-center">
                <AnimatePresence mode="wait">
                   {step === 1 && (
                      <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Phase 01</p>
                            <h3 className="text-3xl font-black uppercase text-white">Identity Domain</h3>
                         </div>
                         <div className="flex flex-col gap-6">
                            <label className="text-[10px] font-black uppercase text-[#444] tracking-widest">Enterprise Name</label>
                            <input value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="e.g. Aethel Industries" className="bg-white/5 border border-white/5 rounded-2xl px-8 py-6 text-xl font-black text-white/90 outline-none focus:border-blue-500/30 transition-all shadow-2xl" />
                         </div>
                      </motion.div>
                   )}

                   {step === 2 && (
                      <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Phase 02</p>
                            <h3 className="text-3xl font-black uppercase text-white">Style Presets</h3>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            {[
                               { id: 'academic', label: 'Academic Ivory', icon: <Layers size={18} /> },
                               { id: 'marketing', label: 'Neon Buzz', icon: <Sparkles size={18} /> },
                               { id: 'narrative', label: 'Ethereal Flow', icon: <ChevronRight size={18} /> },
                               { id: 'executive', label: 'Obsidian Clarity', icon: <Shield size={18} /> }
                            ].map(p => (
                               <div key={p.id} className="p-6 bg-white/5 border border-white/5 rounded-3xl flex items-center gap-4 hover:bg-white/10 transition-all cursor-pointer group">
                                  <div className="p-3 bg-white/5 rounded-xl group-hover:text-blue-500 transition-all">{p.icon}</div>
                                  <span className="text-[10px] font-black uppercase tracking-widest text-[#888] group-hover:text-white transition-all">{p.label}</span>
                               </div>
                            ))}
                         </div>
                      </motion.div>
                   )}

                   {step === 3 && (
                      <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="flex flex-col gap-10">
                         <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2">Phase 03</p>
                            <h3 className="text-3xl font-black uppercase text-white">Genesis Ready</h3>
                         </div>
                         <div className="p-10 bg-blue-500/5 border border-blue-500/10 rounded-[2.5rem] flex items-center gap-8 shadow-2xl">
                            <div className="w-16 h-16 bg-blue-500/10 rounded-[1.5rem] flex items-center justify-center text-blue-500"><Building2 size={32} /></div>
                            <div>
                               <p className="text-xs font-black uppercase text-white mb-1">{orgName || 'New Organization'}</p>
                               <p className="text-[10px] font-bold text-[#444]">Ready for ecosystem scaffolding</p>
                            </div>
                         </div>
                      </motion.div>
                   )}
                </AnimatePresence>

                <div className="mt-16 flex justify-between items-center">
                   <button onClick={onClose} className="text-[10px] font-black uppercase text-[#222] hover:text-[#555] transition-all tracking-widest">Abort Genesis</button>
                   <button onClick={handleNext} disabled={isScaffolding || (step === 1 && !orgName)} className={`px-12 py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl flex items-center gap-3 ${isScaffolding ? 'bg-blue-600/50 cursor-not-allowed' : 'bg-blue-600 hover:scale-105 active:scale-95 text-white'}`}>
                      {isScaffolding ? <><Rocket size={16} className="animate-bounce" /> Scaffolding...</> : (step === 3 ? 'Initialize' : 'Pulse Forward')}
                   </button>
                </div>
             </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
