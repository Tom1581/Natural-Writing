'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Users, ChevronDown, Check, Globe, Shield, Sparkles, Plus } from 'lucide-react';

interface OrgSwitchProps {
  currentOrg: string;
  onSwitch: (org: string) => void;
}

export default function OrgSwitch({ currentOrg, onSwitch }: OrgSwitchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const organizations = [
    { id: 'personal', name: 'Personal Studio', type: 'Solo', icon: <Sparkles size={16} /> },
    { id: 'acme', name: 'Acme Global Corp', type: 'Enterprise', icon: <Building2 size={16} /> },
    { id: 'desi', name: 'Desi Global Hub', type: 'Team', icon: <Users size={16} /> }
  ];

  const activeOrg = organizations.find(o => o.id === currentOrg) || organizations[0];

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-4 bg-white/5 border border-white/5 rounded-2xl px-6 py-3 hover:bg-white/10 transition-all shadow-xl group"
      >
        <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-all">
           {activeOrg.icon}
        </div>
        <div className="text-left pr-2">
           <p className="text-[10px] font-black uppercase tracking-widest text-white/90">{activeOrg.name}</p>
           <p className="text-[8px] font-black uppercase tracking-[0.2em] text-[#333]">{activeOrg.type} Workspace</p>
        </div>
        <ChevronDown size={14} className={`text-[#333] transition-all ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute top-full left-0 mt-4 w-72 bg-[#0c0c0c] border border-white/10 rounded-3xl shadow-[0_0_100px_rgba(0,0,0,1)] py-4 z-[100] overflow-hidden"
          >
             <div className="px-6 py-3 border-b border-white/5 mb-2">
                <p className="text-[8px] font-black uppercase tracking-widest text-[#222]">Select Workspace</p>
             </div>
             
             <div className="px-2 space-y-1">
                {organizations.map((org) => (
                   <button 
                     key={org.id} 
                     onClick={() => { onSwitch(org.id); setIsOpen(false); }}
                     className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${org.id === currentOrg ? 'bg-blue-600/10 text-blue-400' : 'hover:bg-white/5 text-[#444] hover:text-white'}`}
                   >
                      <div className="flex items-center gap-4">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${org.id === currentOrg ? 'border-blue-500/20 bg-blue-500/10' : 'border-white/5 bg-white/5'}`}>
                            {org.icon}
                         </div>
                         <div className="text-left">
                            <p className="text-[9px] font-black uppercase tracking-widest">{org.name}</p>
                            <p className="text-[7px] font-black uppercase tracking-[0.2em] text-[#222]">{org.type}</p>
                         </div>
                      </div>
                      {org.id === currentOrg && <Check size={14} className="text-blue-500" />}
                   </button>
                ))}
             </div>

             <div className="mt-4 px-2 pt-4 border-t border-white/5">
                <button className="w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 text-[#333] hover:text-blue-500 transition-all font-black uppercase text-[8px] tracking-widest">
                   <Plus size={16} /> New Organization
                </button>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
