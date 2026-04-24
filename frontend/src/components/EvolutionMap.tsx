'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, Cpu, Activity, Zap } from 'lucide-react';

interface EvolutionMapProps {
  data: any[];
}

export default function EvolutionMap({ data }: EvolutionMapProps) {
  return (
    <div className="relative w-full glass bg-white/[0.02] border border-white/5 rounded-[3.5rem] p-12 overflow-hidden shadow-2xl group">
      <div className="flex justify-between items-center mb-12">
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-blue-500 mb-2 flex items-center gap-2 animate-pulse"><Cpu size={14} /> Neural Singularity Engine</p>
            <h3 className="text-3xl font-black uppercase text-white/90">Style Evolution Trajectory</h3>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/20 rounded-full">
               <TrendingUp size={14} className="text-blue-500" />
               <span className="text-[9px] font-black uppercase text-blue-500">Back-propagation Sync</span>
            </div>
         </div>
      </div>

      <div className="h-[300px] w-full">
         <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
               <defs>
                  <linearGradient id="colorHumanity" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorStability" x1="0" y1="0" x2="0" y2="1">
                     <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                     <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
               </defs>
               <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
               <XAxis dataKey="date" hide />
               <YAxis hide />
               <Tooltip 
                  contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1rem', fontSize: '10px', textTransform: 'uppercase', fontWeight: '900' }}
                  itemStyle={{ color: '#fff' }}
               />
               <Area type="monotone" dataKey="humanity" stroke="#3b82f6" fillOpacity={1} fill="url(#colorHumanity)" strokeWidth={4} />
               <Area type="monotone" dataKey="dna_stability" stroke="#10b981" fillOpacity={1} fill="url(#colorStability)" strokeWidth={4} />
            </AreaChart>
         </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-4 gap-8 mt-12 py-8 border-t border-white/5">
         <div>
            <p className="text-[8px] font-black uppercase text-[#444] mb-2 flex items-center gap-2"><Activity size={12} /> Humanity Peak</p>
            <p className="text-xl font-black text-white">0.98</p>
         </div>
         <div>
            <p className="text-[8px] font-black uppercase text-[#444] mb-2 flex items-center gap-2"><Zap size={12} /> Learning Rate</p>
            <p className="text-xl font-black text-white">0.02</p>
         </div>
         <div>
            <p className="text-[8px] font-black uppercase text-[#444] mb-2 flex items-center gap-2"><Cpu size={12} /> Synapses</p>
            <p className="text-xl font-black text-blue-500">14.2k</p>
         </div>
         <div className="flex flex-col justify-center items-end">
            <span className="text-[7px] font-black uppercase text-[#222] tracking-widest italic">v21.0 Singularity Bound</span>
         </div>
      </div>
    </div>
  );
}
