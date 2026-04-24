'use client';

import React, { useState, useEffect } from 'react';
import { History, ChevronRight, RotateCcw, Copy, Trash2, Check, Clock, Eye, Layers } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export interface ManuscriptVersion {
  id: string;
  content: string;
  metrics: any;
  label: string;
  createdAt: string;
}

interface VersionSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptId: string;
  onSelect: (version: ManuscriptVersion) => void;
  onCompare: (v1: ManuscriptVersion, v2: ManuscriptVersion) => void;
}

export default function VersionSidebar({ isOpen, onClose, manuscriptId, onSelect, onCompare }: VersionSidebarProps) {
  const [versions, setVersions] = useState<ManuscriptVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);

  useEffect(() => {
    if (isOpen && manuscriptId) {
      fetchVersions();
    }
  }, [isOpen, manuscriptId]);

  const fetchVersions = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/versions/${manuscriptId}`);
      const data = await res.json();
      setVersions(data);
    } catch (err) {
      console.error('Failed to fetch versions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompareClick = (id: string) => {
    if (selectedForCompare.includes(id)) {
      setSelectedForCompare(selectedForCompare.filter(i => i !== id));
    } else if (selectedForCompare.length < 2) {
      const newList = [...selectedForCompare, id];
      setSelectedForCompare(newList);
      if (newList.length === 2) {
        const v1 = versions.find(v => v.id === newList[0]);
        const v2 = versions.find(v => v.id === newList[1]);
        if (v1 && v2) onCompare(v1, v2);
      }
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80]"
          />
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed right-0 top-0 bottom-0 w-[400px] bg-[#0c0c0c] border-l border-white/5 z-[90] flex flex-col shadow-[-40px_0_100px_rgba(0,0,0,0.8)]"
          >
            <div className="p-8 border-b border-white/10 bg-white/[0.02]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
                   <div className="p-2 bg-blue-500/10 rounded-xl">
                      <Clock className="text-blue-500" size={20} />
                   </div>
                   <div>
                      <h3 className="text-sm font-black uppercase tracking-[0.2em]">Version Control</h3>
                      <p className="text-[10px] text-[#444] font-black uppercase tracking-widest mt-0.5">Manuscript snapshots</p>
                   </div>
                </div>
                <button onClick={onClose} className="text-[#444] hover:text-white transition-colors">
                  <div className="p-2 hover:bg-white/5 rounded-full"><ChevronRight size={20} /></div>
                </button>
              </div>
              
              <div className="flex gap-2 text-[8px] font-black uppercase text-[#333]">
                 <Layers size={12} /> {selectedForCompare.length} / 2 Select to differential compare
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scroll">
              {isLoading && (
                 <div className="flex flex-col items-center justify-center h-40 gap-4 opacity-20">
                    <History className="animate-spin text-blue-500" size={32} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Accessing Time Stream...</span>
                 </div>
              )}
              
              {!isLoading && versions.length === 0 && (
                <div className="text-center p-12 opacity-5 italic text-sm">No snapshots recorded for this manuscript.</div>
              )}

              {versions.map((v) => (
                <motion.div
                  key={v.id}
                  whileHover={{ x: -4 }}
                  className={`p-6 rounded-[1.8rem] border transition-all cursor-pointer relative group ${selectedForCompare.includes(v.id) ? 'bg-blue-500/10 border-blue-500/40' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-4">
                     <div>
                        <span className="text-[9px] font-black uppercase text-blue-500/50 block mb-1">
                          {new Date(v.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                        <h4 className="text-sm font-bold text-[#aaa] group-hover:text-white transition-colors">{v.label}</h4>
                     </div>
                     <div className="flex gap-2">
                        <button 
                          onClick={() => handleCompareClick(v.id)}
                          className={`p-2 rounded-lg transition-all ${selectedForCompare.includes(v.id) ? 'bg-blue-500 text-white' : 'bg-white/5 text-[#444] hover:text-white'}`}
                        >
                           <Eye size={14} />
                        </button>
                        <button 
                          onClick={() => onSelect(v)}
                          className="p-2 bg-white/5 text-[#444] hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all"
                        >
                           <RotateCcw size={14} />
                        </button>
                     </div>
                  </div>
                  <div className="flex gap-3 text-[8px] font-black uppercase text-[#222]">
                     <span className="px-2 py-1 bg-white/5 rounded-inner">Score: {Math.round(v.metrics?.humanityScore * 100 || 0)}%</span>
                     <span className="px-2 py-1 bg-white/5 rounded-inner">Len: {v.content.length} ch</span>
                  </div>
                </motion.div>
              ))}
            </div>
            
            <div className="p-8 border-t border-white/5 bg-white/[0.01] text-center">
               <span className="text-[9px] font-black uppercase tracking-[0.3em] text-[#111]">End-to-End Encryption Active</span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
