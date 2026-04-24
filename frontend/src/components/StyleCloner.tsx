'use client';

import React, { useState } from 'react';
import { User, Check, Sparkles, X, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface StyleProfile {
  name: string;
  adjectiveLevel: number;
  sentenceComplexity: number;
  preferredTransitions: string[];
  toneDescriptors: string[];
  contractionRate: 'high' | 'medium' | 'low';
  vocabularyBand: 'common' | 'sophisticated' | 'academic';
}

interface StyleClonerProps {
  onStyleCreated: (profile: StyleProfile) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function StyleCloner({ onStyleCreated, isOpen, onClose }: StyleClonerProps) {
  const [sampleText, setSampleText] = useState('');
  const [isProfiling, setIsProfiling] = useState(false);
  const [styleName, setStyleName] = useState('');

  const handleProfile = async () => {
    if (!sampleText.trim()) return;
    setIsProfiling(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/profile-style`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: sampleText, name: styleName || 'Custom Style' }),
      });
      const data = await res.json();
      onStyleCreated(data);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProfiling(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-2xl glass p-8 bg-[#0a0a0a] border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,0.5)]"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                  <User className="text-blue-500" size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Stylistic Mirror</h2>
                  <p className="text-[10px] uppercase font-black tracking-widest text-[#555]">Clone your unique writing voice</p>
                </div>
              </div>
              <button onClick={onClose} className="text-[#555] hover:text-white transition-colors">
                 <X size={24} />
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#666] mb-3">Writer Identity</p>
                <input 
                  type="text" 
                  placeholder="e.g., Hemingway, Executive, Academic Ghostwriter" 
                  value={styleName}
                  onChange={(e) => setStyleName(e.target.value)}
                  className="w-full bg-white/[0.03] border border-white/10 rounded-2xl px-5 py-4 focus:border-blue-500 transition-all font-bold text-[#eee] outline-none"
                />
              </div>

              <div>
                <p className="text-[10px] uppercase font-black tracking-[0.2em] text-[#666] mb-3">Author Sample (200-500 words recommended)</p>
                <textarea 
                  placeholder="Paste your original writing here..." 
                  value={sampleText}
                  onChange={(e) => setSampleText(e.target.value)}
                  className="w-full h-64 bg-white/[0.03] border border-white/10 rounded-3xl px-5 py-5 focus:border-blue-500 transition-all font-medium text-[#eee] outline-none resize-none leading-relaxed"
                />
              </div>

              <button 
                onClick={handleProfile}
                disabled={isProfiling || !sampleText}
                className="w-full primary py-4 rounded-2xl font-black uppercase tracking-widest flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(59,130,246,0.2)]"
              >
                {isProfiling ? 'Decoding Stylistic DNA...' : (<><Sparkles size={18} /> Mirror My Style</>)}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
