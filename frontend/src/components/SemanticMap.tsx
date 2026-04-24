'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Network, Zap, Target, BookOpen } from 'lucide-react';

interface SemanticMapProps {
  nodes: any[];
}

export default function SemanticMap({ nodes }: SemanticMapProps) {
  return (
    <div className="relative w-full h-[400px] bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden group shadow-2xl">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
         <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, rgba(255,255,255,0.05) 1px, transparent 0)', backgroundSize: '40px 40px' }} />
      </div>

      <div className="absolute top-8 left-8">
         <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2 flex items-center gap-2 animate-pulse"><Network size={14} /> Apotheosis Neural Index</p>
         <h3 className="text-xl font-black uppercase text-white/90">Semantic Style Map</h3>
      </div>

      <div className="absolute inset-0 flex items-center justify-center">
         {nodes.map((node, i) => (
            <motion.div 
               key={node.id}
               initial={{ scale: 0, opacity: 0 }}
               animate={{ scale: 1, opacity: 1, x: node.x, y: node.y }}
               whileHover={{ scale: 1.2, zIndex: 10 }}
               transition={{ delay: i * 0.1, type: 'spring' }}
               className={`absolute w-4 h-4 rounded-full cursor-help group/node`}
               style={{ 
                  background: node.group === 'Style' ? '#3b82f6' : (node.group === 'Narrative' ? '#8b5cf6' : '#10b981'),
                  boxShadow: `0 0 20px ${node.group === 'Style' ? '#3b82f644' : (node.group === 'Narrative' ? '#8b5cf644' : '#10b98144')}`
               }}
            >
               <div className="absolute top-full mt-3 left-1/2 -translate-x-1/2 hidden group-hover/node:block z-50">
                  <div className="bg-[#0c0c0c] border border-white/10 rounded-2xl px-4 py-3 shadow-2xl min-w-[180px] backdrop-blur-2xl">
                     <p className="text-[8px] font-black uppercase text-[#444] mb-1">{node.group} Cluster</p>
                     <p className="text-[10px] font-black uppercase text-white tracking-widest">{node.title}</p>
                     <div className="mt-2 flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[7px] font-bold text-blue-400"><Target size={10} /> Neural DNA Bound</div>
                     </div>
                  </div>
               </div>
            </motion.div>
         ))}
      </div>

      <div className="absolute bottom-8 left-8 right-8 flex justify-between items-center px-4">
         <div className="flex gap-6">
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500" /> <span className="text-[7px] font-black uppercase text-[#444]">Style</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-purple-500" /> <span className="text-[7px] font-black uppercase text-[#444]">Narrative</span></div>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-green-500" /> <span className="text-[7px] font-black uppercase text-[#444]">Data</span></div>
         </div>
         <div className="flex items-center gap-2 text-[8px] font-black uppercase text-blue-500/50 italic">v18.0 Apotheosis Synchronized</div>
      </div>
    </div>
  );
}
