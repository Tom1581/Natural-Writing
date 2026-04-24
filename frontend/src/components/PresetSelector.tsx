'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Sparkles, BookOpen, Newspaper, Zap, Globe, Cpu } from 'lucide-react';

export const PRESET_PERSONAS = [
  {
    id: 'economist',
    name: 'The Economist Analytical',
    description: 'Cold, analytical, high-density data flow with sharp wit.',
    icon: Newspaper,
    metrics: { complexity: 0.8, vocabulary: 0.9, tone: 'Formal' }
  },
  {
    id: 'nature',
    name: 'Nature Journal Academic',
    description: 'Precise, dense, and rigorously objective scientific prose.',
    icon: Shield,
    metrics: { complexity: 0.95, vocabulary: 1.0, tone: 'Academic' }
  },
  {
    id: 'vogue',
    name: 'Vogue Descriptive',
    description: 'Lush, evocative, sensory-focused fashion narrative.',
    icon: Sparkles,
    metrics: { complexity: 0.5, vocabulary: 0.85, tone: 'Creative' }
  },
  {
    id: 'quartz',
    name: 'Quartz Global Tech',
    description: 'Punchy, modern, and deeply insightful business analysis.',
    icon: Zap,
    metrics: { complexity: 0.6, vocabulary: 0.7, tone: 'Business' }
  },
  {
    id: 'wired',
    name: 'Wired Speculative',
    description: 'Synthesizing tech, culture, and future-forward optimism.',
    icon: Cpu,
    metrics: { complexity: 0.7, vocabulary: 0.8, tone: 'Tech' }
  }
];

interface PresetSelectorProps {
  onSelect: (presetId: string) => void;
}

export default function PresetSelector({ onSelect }: PresetSelectorProps) {
  return (
    <div className="grid grid-cols-1 gap-4 p-2">
      {PRESET_PERSONAS.map((preset) => {
        const Icon = preset.icon;
        return (
          <motion.button
            key={preset.id}
            whileHover={{ x: 5, scale: 1.01 }}
            onClick={() => onSelect(preset.id)}
            className="w-full text-left p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:border-blue-500/20 hover:bg-blue-500/5 transition-all group"
          >
            <div className="flex items-center gap-6">
              <div className="p-4 bg-white/5 rounded-[1.2rem] group-hover:bg-blue-500/10 group-hover:text-blue-500 transition-all shadow-inner">
                <Icon size={24} />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-bold text-[#888] group-hover:text-white transition-colors">{preset.name}</h3>
                <p className="text-[10px] text-[#333] mt-1 group-hover:text-[#666] leading-relaxed">{preset.description}</p>
                
                <div className="flex gap-4 mt-4">
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-[#222] uppercase tracking-widest">Complexity</span>
                      <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                         <div className="h-full bg-blue-500/30" style={{ width: `${preset.metrics.complexity * 100}%` }} />
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-[#222] uppercase tracking-widest">Vocabulary</span>
                      <div className="w-12 h-1 bg-white/5 rounded-full mt-1 overflow-hidden">
                         <div className="h-full bg-blue-500/30" style={{ width: `${preset.metrics.vocabulary * 100}%` }} />
                      </div>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-[7px] font-black text-[#222] uppercase tracking-widest">Tone</span>
                      <span className="text-[9px] font-black text-blue-500/40 uppercase mt-1">{preset.metrics.tone}</span>
                   </div>
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
