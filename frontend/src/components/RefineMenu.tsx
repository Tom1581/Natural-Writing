'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Feather, Shield, Expand, Sparkles, Check } from 'lucide-react';

interface RefineMenuProps {
  sentence: string;
  context: string;
  onSelect: (variation: string) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export default function RefineMenu({ sentence, context, onSelect, onClose, position }: RefineMenuProps) {
  const [variations, setVariations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<string | null>(null);

  const fetchVariations = async (refineMode: string) => {
    setIsLoading(true);
    setMode(refineMode);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/refine-sentence`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sentence, context, mode: refineMode }),
      });
      const data = await res.json();
      setVariations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-[100]" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{ top: position.y, left: position.x }}
        className="fixed z-[110] w-[320px] glass bg-[#0a0a0a] border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden"
      >
        <div className="p-4 border-b border-white/5 bg-white/[0.02]">
          <p className="text-[10px] font-black uppercase text-[#555] tracking-widest mb-1">Micro-Refining</p>
          <p className="text-[11px] text-[#aaa] line-clamp-2 italic">"{sentence}"</p>
        </div>

        {!mode ? (
           <div className="p-2 grid grid-cols-2 gap-1">
              {[
                { id: 'punchier', label: 'Punchier', icon: Zap, color: 'text-yellow-500' },
                { id: 'more elegant', label: 'Elegant', icon: Feather, color: 'text-blue-500' },
                { id: 'authoritative', label: 'Authored', icon: Shield, color: 'text-purple-500' },
                { id: 'more descriptive', label: 'Expanse', icon: Expand, color: 'text-green-500' }
              ].map(m => (
                <button 
                  key={m.id}
                  onClick={() => fetchVariations(m.id)}
                  className="flex items-center gap-2 p-3 rounded-xl hover:bg-white/5 transition-all text-[11px] font-bold text-[#888] hover:text-white"
                >
                  <m.icon size={14} className={m.color} /> {m.label}
                </button>
              ))}
           </div>
        ) : (
           <div className="p-3 space-y-2">
              {isLoading ? (
                <div className="py-8 flex flex-col items-center gap-3">
                   <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }} className="w-5 h-5 border-2 border-white/10 border-t-blue-500 rounded-full" />
                   <p className="text-[10px] font-black uppercase text-[#444]">Reciting Persona...</p>
                </div>
              ) : (
                <>
                  {variations.map((v, i) => (
                    <button 
                      key={i}
                      onClick={() => onSelect(v)}
                      className="w-full text-left p-3 rounded-xl bg-white/[0.03] border border-white/5 hover:border-blue-500/30 transition-all text-xs leading-relaxed text-[#aaa] hover:text-white group flex items-start gap-3"
                    >
                      <Sparkles size={12} className="mt-1 opacity-0 group-hover:opacity-100 text-blue-500" />
                      {v}
                    </button>
                  ))}
                  <button onClick={() => setMode(null)} className="w-full text-center py-2 text-[10px] font-black uppercase text-[#444] hover:text-[#888]">Back to Modes</button>
                </>
              )}
           </div>
        )}
      </motion.div>
    </>
  );
}
