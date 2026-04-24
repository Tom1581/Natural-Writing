'use client';

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, Cell } from 'recharts';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Clock, Users, Globe, PieChart, ShieldCheck, Trophy, Target, Zap } from 'lucide-react';

interface ROIDashboardProps {
  metrics: {
     totalManuscripts: number;
     timeSavedHours: number;
     costSavings: number;
     avgHumanity: number;
     projectedReach: number;
  };
  projectionData: any[];
  benchmarkData?: {
     domains: any[];
     globalAverage: number;
     historicalTrend: any[];
  }
}

export default function ROIDashboard({ metrics, projectionData, benchmarkData }: ROIDashboardProps) {
  return (
    <div className="relative w-full glass bg-white/[0.02] border border-white/5 rounded-[4rem] p-16 overflow-hidden shadow-2xl group flex flex-col gap-16">
      <div className="flex justify-between items-center">
         <div>
            <p className="text-[10px] font-black uppercase tracking-[0.6em] text-blue-500 mb-4 flex items-center gap-2"><Trophy size={16} /> Elysium Intelligence Hub</p>
            <h3 className="text-4xl font-black uppercase text-white tracking-tighter leading-tight">Collective ROI & Benchmarking</h3>
         </div>
         <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 px-6 py-3 bg-purple-500/10 border border-purple-500/20 rounded-full shadow-2xl">
               <Globe size={18} className="text-purple-500" />
               <span className="text-[10px] font-black uppercase text-purple-500">Industry Excellence Validated</span>
            </div>
         </div>
      </div>

      <div className="grid grid-cols-4 gap-10">
         {[
            { label: 'Total Economy Saved', value: `$${metrics.costSavings.toLocaleString()}`, icon: <DollarSign />, color: 'text-green-500' },
            { label: 'Industry Delta', value: benchmarkData ? `+${Math.round((metrics.avgHumanity - benchmarkData.globalAverage) * 100)}%` : 'Elite', icon: <Target />, color: 'text-blue-500' },
            { label: 'Global Reach', value: metrics.projectedReach.toLocaleString(), icon: <Globe />, color: 'text-purple-500' },
            { label: 'Intelligence Sync', value: 'Active', icon: <Zap />, color: 'text-yellow-500' }
         ].map((stat, i) => (
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} key={i} className="p-8 bg-white/[0.03] border border-white/5 rounded-[2.5rem] shadow-xl hover:bg-white/5 transition-all">
               <div className={`mb-6 ${stat.color}`}>{stat.icon}</div>
               <p className="text-[10px] font-black uppercase text-[#444] mb-2">{stat.label}</p>
               <h4 className="text-3xl font-black text-white">{stat.value}</h4>
            </motion.div>
         ))}
      </div>

      <div className="flex-1 grid grid-cols-2 gap-12 min-h-0">
         <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 flex flex-col gap-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#444]">Global Excellence Benchmarks</h5>
            <div className="flex-1">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={benchmarkData?.domains || []}>
                     <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                     <XAxis dataKey="name" hide />
                     <YAxis hide domain={[0, 1]} />
                     <Tooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                        contentStyle={{ backgroundColor: '#0c0c0c', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '1.5rem' }}
                     />
                     <Bar dataKey="score" radius={[10, 10, 0, 0]}>
                        { (benchmarkData?.domains || []).map((entry, index) => (
                           <Cell key={`cell-${index}`} fill={index === 0 ? '#3b82f6' : '#ffffff10'} />
                        ))}
                     </Bar>
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>
         <div className="bg-white/[0.02] border border-white/5 rounded-[3rem] p-10 flex flex-col gap-8">
            <h5 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#444]">Intelligence Distribution</h5>
            <div className="flex-1 flex items-center justify-center">
               <div className="relative w-48 h-48 rounded-full border-[1.5rem] border-blue-500/20 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-[1.5rem] border-blue-500 border-t-transparent animate-spin-slow" />
                  <Trophy size={40} className="text-blue-500" />
               </div>
            </div>
         </div>
      </div>

      <div className="flex justify-between items-center py-10 border-t border-white/5">
         <div className="flex gap-10">
            <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-blue-500" /> <span className="text-[8px] font-black uppercase text-[#444]">Elite Organization</span></div>
            <div className="flex items-center gap-3"><div className="w-3 h-3 rounded-full bg-purple-500" /> <span className="text-[8px] font-black uppercase text-[#444]">Industry Median</span></div>
         </div>
         <span className="text-[8px] font-black uppercase text-[#222] italic tracking-[0.3em]">v26.0 Elysium Persistence Engine</span>
      </div>
    </div>
  );
}
