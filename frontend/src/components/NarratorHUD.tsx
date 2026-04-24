'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Music, BarChart, Activity, Volume2, Mic2 } from 'lucide-react';

interface RhythmNode {
  id: number;
  length: number;
  type: 'staccato' | 'lyrical' | 'standard';
  text: string;
}

interface NarratorHUDProps {
  pulseMap: RhythmNode[];
  metrics: {
     averageLength: number;
     rhythmicVariety: number;
     status: string;
  };
}

export default function NarratorHUD({ pulseMap, metrics }: NarratorHUDProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(-1);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isPlaying && pulseMap.length > 0) {
       let idx = 0;
       const playNext = () => {
          if (idx >= pulseMap.length) {
             setIsPlaying(false);
             setCurrentIndex(-1);
             return;
          }
          setCurrentIndex(idx);
          const delay = pulseMap[idx].length * 100; // Simulated playback speed
          idx++;
          timer = setTimeout(playNext, delay);
       };
       playNext();
    }
    return () => clearTimeout(timer);
  }, [isPlaying, pulseMap]);

  return (
    <div className="relative w-full glass bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 overflow-hidden shadow-2xl group">
      <div className="flex justify-between items-center mb-10">
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2 flex items-center gap-2 animate-pulse"><Music size={14} /> Ascension Rhythm Analyzer</p>
            <h3 className="text-2xl font-black uppercase text-white/90">Manuscript Cadence</h3>
         </div>
         <div className="flex items-center gap-6">
            <div className="text-right">
               <p className="text-[10px] font-black uppercase text-[#444] mb-1">Rhythmic Status</p>
               <p className={`text-xs font-black uppercase tracking-widest ${metrics.status === 'Dynamic' ? 'text-green-500' : 'text-yellow-500'}`}>{metrics.status}</p>
            </div>
            <button onClick={() => setIsPlaying(!isPlaying)} className={`w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${isPlaying ? 'bg-red-500/20 text-red-500 border border-red-500/30' : 'bg-blue-600 text-white shadow-blue-500/30'}`}>
               {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
         </div>
      </div>

      <div className="h-40 flex items-end gap-2 px-4 mb-10">
         {pulseMap.map((node, i) => (
            <motion.div 
               key={node.id}
               initial={{ height: 0 }}
               animate={{ 
                  height: `${Math.min(node.length * 4, 150)}px`,
                  backgroundColor: currentIndex === i ? '#3b82f6' : (node.type === 'staccato' ? '#ef444466' : (node.type === 'lyrical' ? '#10b98166' : '#ffffff11')),
                  boxShadow: currentIndex === i ? '0 0 20px #3b82f6aa' : 'none'
               }}
               className="flex-1 rounded-t-lg transition-all cursor-help relative group/bar"
            >
               <div className="absolute bottom-full mb-4 left-1/2 -translate-x-1/2 hidden group-hover/bar:block z-50">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl min-w-[150px] backdrop-blur-2xl">
                     <p className="text-[8px] font-black uppercase text-[#444] mb-1">{node.type} cadence</p>
                     <p className="text-[10px] font-medium text-white italic">"{node.text}"</p>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="grid grid-cols-3 gap-8 py-8 border-t border-white/5">
         <div>
            <p className="text-[8px] font-black uppercase text-[#444] mb-2 flex items-center gap-2"><Volume2 size={12} /> Avg Cadence</p>
            <p className="text-xl font-black text-white">{metrics.averageLength} words</p>
         </div>
         <div>
            <p className="text-[8px] font-black uppercase text-[#444] mb-2 flex items-center gap-2"><BarChart size={12} /> Variety Score</p>
            <p className="text-xl font-black text-white">{metrics.rhythmicVariety}</p>
         </div>
         <div>
            <p className="text-[8px] font-black uppercase text-[#444] mb-2 flex items-center gap-2"><Mic2 size={12} /> Transcription</p>
            <p className="text-xl font-black text-blue-500 uppercase tracking-widest">{currentIndex >= 0 ? `${currentIndex + 1} / ${pulseMap.length}` : 'Ready'}</p>
         </div>
      </div>
    </div>
  );
}
