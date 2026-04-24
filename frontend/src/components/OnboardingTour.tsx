'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Compass, ArrowRight, Check, X, Sparkles, Brain, Shield, Globe2 } from 'lucide-react';

interface OnboardingTourProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OnboardingTour({ isOpen, onClose }: OnboardingTourProps) {
  const [step, setStep] = useState(0);

  const steps = [
    {
      title: 'Welcome to the Masterpiece',
      description: 'You are now entering Natural Writing v9.0. A world-grade ecosystem where stylistic DNA and global reach converge.',
      icon: <Sparkles className="text-yellow-400" size={40} />,
      btnText: 'Begin Grand Tour'
    },
    {
      title: 'The DNA Mirror',
      description: 'Clone the stylistic fingerprints of any author. Use the Mirror to transform raw drafts into polished manuscripts instantly.',
      icon: <Brain className="text-blue-500" size={40} />,
      btnText: 'Next: Global Nexus'
    },
    {
      title: 'The Global Nexus',
      description: 'Reach a universal audience. Localize your manuscripts across 100+ cultures while maintaining your core stylistic identity.',
      icon: <Globe2 className="text-green-500" size={40} />,
      btnText: 'Next: The Flight Deck'
    },
    {
      title: 'The Flight Deck',
      description: 'Your strategic HUD. Monitor neural throughput, token consumption, and cluster integrity in real-time.',
      icon: <Shield className="text-purple-500" size={40} />,
      btnText: 'Enter Workspace'
    }
  ];

  const currentStep = steps[step];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[500]">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/80 backdrop-blur-3xl" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
            className="w-[600px] bg-[#0c0c0c] border border-white/5 p-16 rounded-[4rem] shadow-[0_0_200px_rgba(0,0,0,1)] relative overflow-hidden"
          >
             <div className="absolute -top-20 -right-20 w-80 h-80 bg-yellow-500/5 blur-[120px]" />
             
             <div className="relative text-center space-y-10">
                <div className="flex justify-center">
                   <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 shadow-inner">
                      {currentStep.icon}
                   </div>
                </div>
                
                <div className="space-y-4">
                   <h2 className="text-4xl font-black uppercase tracking-tighter italic text-white">{currentStep.title}</h2>
                   <p className="text-xs text-[#555] font-black uppercase tracking-widest leading-relaxed px-10">{currentStep.description}</p>
                </div>

                <div className="flex flex-col items-center gap-6 pt-10">
                   <button 
                     onClick={() => step < steps.length - 1 ? setStep(step + 1) : onClose()}
                     className="px-16 py-5 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_80px_rgba(255,255,255,0.2)] hover:scale-105 transition-all flex items-center gap-3"
                   >
                      {currentStep.btnText} <ArrowRight size={18} />
                   </button>
                   
                   <div className="flex gap-2">
                      {steps.map((_, i) => (
                         <div key={i} className={`h-1.5 rounded-full transition-all ${i === step ? 'w-8 bg-yellow-400' : 'w-2 bg-white/10'}`} />
                      ))}
                   </div>
                </div>
             </div>

             <button onClick={onClose} className="absolute top-8 right-8 text-[#222] hover:text-white transition-all"><X size={24} /></button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
