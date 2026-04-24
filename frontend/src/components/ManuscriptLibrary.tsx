'use client';

import React, { useState, useEffect } from 'react';
import { 
  Library, 
  Search, 
  Trash2, 
  RotateCcw, 
  BookText, 
  X, 
  FileText, 
  Clock, 
  SearchCode, 
  AlertCircle, 
  ChevronRight, 
  Plus, 
  FolderPlus, 
  Folder,
  LayoutGrid,
  List,
  Filter,
  CheckCircle2,
  MoreVertical,
  Zap,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export interface ManuscriptHistory {
  id: string;
  sourceText: string;
  optimizedText: string;
  metrics: any;
  tone: string;
  strength: string;
  targetGradeLevel: number;
  createdAt: string;
  project?: Project;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  manuscripts?: ManuscriptHistory[];
}

interface ManuscriptLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  history: ManuscriptHistory[];
  onSelect: (item: ManuscriptHistory) => void;
  onSearch: (query: string) => void;
  isSearching: boolean;
}

export default function ManuscriptLibrary({ isOpen, onClose, history, onSelect, onSearch, isSearching }: ManuscriptLibraryProps) {
  const [activeProject, setActiveProject] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/projects`);
      const data = await res.json();
      setProjects(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
  };

  const handleCreateProject = async () => {
     const name = prompt('Workspace Name (e.g., "AI Research Book"):');
     if (!name) return;
     try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/projects`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ name })
        });
        const newProject = await res.json();
        setProjects([...projects, newProject]);
        toast.success('Workspace Initialized');
     } catch (err) { toast.error('Creation failed'); }
  };

  const handleBulkBatchMirror = () => {
     if (selectedIds.length === 0) return;
     toast.success(`Broadcasting Mirror to ${selectedIds.length} vessels...`);
     // Implementation in Page.tsx via callback usually, but here for UI demo
  };

  const filteredHistory = activeProject 
    ? history.filter(item => item.project?.id === activeProject)
    : history;

  const toggleSelect = (id: string) => {
     setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 bg-black/80 backdrop-blur-2xl z-[180]" />
          <motion.div 
            initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
            className="fixed left-0 top-0 bottom-0 w-[900px] bg-[#080808] border-r border-white/5 z-[190] shadow-[100px_0_200px_rgba(0,0,0,1)] flex"
          >
            {/* Project Navigation Sidebar */}
            <div className="w-[280px] bg-white/[0.01] border-r border-white/5 flex flex-col">
               <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-[#333]">Vault Navigator</span>
                  <button onClick={handleCreateProject} className="text-[#333] hover:text-blue-500 transition-all"><FolderPlus size={18} /></button>
               </div>
               <div className="flex-1 overflow-y-auto custom-scroll p-6 space-y-4">
                  <button 
                    onClick={() => setActiveProject(null)}
                    className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${!activeProject ? 'bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-2xl' : 'text-[#444] hover:bg-white/5 hover:text-[#888]'}`}
                  >
                     <div className="flex items-center gap-3"><Layers size={16} /><span className="text-[10px] font-black uppercase tracking-widest">Global Index</span></div>
                     <span className="text-[9px] font-black">{history.length}</span>
                  </button>
                  {projects.map(p => (
                    <button 
                      key={p.id} 
                      onClick={() => setActiveProject(p.id)}
                      className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all ${activeProject === p.id ? 'bg-blue-600/10 border border-blue-500/20 text-blue-500 shadow-2xl' : 'text-[#444] hover:bg-white/5 hover:text-[#888]'}`}
                    >
                       <div className="flex items-center gap-3"><Folder size={16} /><span className="text-[10px] font-black uppercase tracking-widest">{p.name}</span></div>
                       <ChevronRight size={14} className="opacity-20" />
                    </button>
                  ))}
               </div>
            </div>

            {/* Content Main Area */}
            <div className="flex-1 flex flex-col">
              <div className="p-10 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
                <div className="flex items-center gap-8">
                  <div className="p-4 bg-blue-500/10 rounded-2xl shadow-inner"><BookText className="text-blue-500" size={28} /></div>
                  <div className="flex flex-col gap-1">
                     <h2 className="text-2xl font-black uppercase tracking-tighter italic">Manuscript Vault</h2>
                     <p className="text-[10px] text-[#222] font-black uppercase tracking-[0.4em]">{activeProject ? projects.find(p => p.id === activeProject)?.name : 'Primary Archival Index'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                   <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                      <button onClick={() => setViewMode('grid')} className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg' : 'text-[#333] hover:text-white'}`}><LayoutGrid size={16} /></button>
                      <button onClick={() => setViewMode('list')} className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg' : 'text-[#333] hover:text-white'}`}><List size={16} /></button>
                   </div>
                   <button onClick={onClose} className="text-[#333] hover:text-white transition-all"><X size={24} /></button>
                </div>
              </div>

              <div className="p-10 border-b border-white/5 flex gap-6 sticky top-0 bg-[#080808] z-10 items-center">
                 <div className="flex-1 relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-[#222] group-focus-within:text-blue-500 transition-colors" size={20} />
                    <input 
                      type="text" placeholder="Discover manuscripts by semantic intent..." 
                      className="w-full bg-white/[0.01] border border-white/5 rounded-[1.5rem] py-5 pl-16 pr-6 text-sm focus:outline-none focus:border-blue-500/50 transition-all font-sans"
                      onChange={(e) => onSearch(e.target.value)}
                    />
                    {isSearching && <div className="absolute right-6 top-1/2 -translate-y-1/2"><SearchCode className="text-blue-500 animate-pulse" size={18} /></div>}
                 </div>
                 {selectedIds.length > 0 && (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex items-center gap-4 bg-blue-600/10 border border-blue-500/20 px-6 py-3 rounded-2xl shadow-2xl">
                       <span className="text-[10px] font-black uppercase text-blue-500">{selectedIds.length} Targeted</span>
                       <button onClick={handleBulkBatchMirror} className="bg-blue-600 text-white px-5 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2"><Zap size={14} /> Batch Mirror</button>
                    </motion.div>
                 )}
              </div>

              <div className="flex-1 overflow-y-auto p-10 custom-scroll space-y-6">
                {filteredHistory.map((item) => (
                  <motion.div 
                    key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`group p-8 bg-white/[0.01] border border-white/5 rounded-[2.5rem] hover:bg-white/[0.03] hover:border-blue-500/10 transition-all shadow-xl flex items-center gap-10 cursor-pointer relative overflow-hidden ${selectedIds.includes(item.id) ? 'border-blue-500/30 bg-blue-500/5' : ''}`}
                    onClick={() => onSelect(item)}
                  >
                    <div className="absolute top-8 right-8 flex gap-4 opacity-0 group-hover:opacity-100 transition-all">
                       <button className="p-3 bg-white/5 text-[#444] hover:text-white rounded-xl border border-white/5"><RotateCcw size={16} /></button>
                       <button className="p-3 bg-white/5 text-[#444] hover:text-red-500 rounded-xl border border-white/5"><Trash2 size={16} /></button>
                    </div>

                    <div className="flex items-center gap-6">
                       <button 
                         onClick={(e) => { e.stopPropagation(); toggleSelect(item.id); }}
                         className={`w-8 h-8 rounded-xl border transition-all flex items-center justify-center ${selectedIds.includes(item.id) ? 'bg-blue-600 border-blue-500' : 'bg-white/5 border-white/10'}`}
                       >
                          {selectedIds.includes(item.id) && <CheckCircle2 size={16} className="text-white" />}
                       </button>
                       <div className="w-16 h-16 bg-[#111] border border-white/5 rounded-2xl flex items-center justify-center text-blue-500/40 font-black shadow-inner">
                          {item.metrics?.humanityScore ? Math.round(item.metrics.humanityScore * 100) : '—'}%
                       </div>
                    </div>

                    <div className="flex-1 flex flex-col gap-3 min-w-0">
                      <div className="flex items-center gap-4">
                        <span className="text-[10px] font-black uppercase text-blue-500/40 tracking-widest">{item.tone} mirror</span>
                        <div className="w-1 h-1 rounded-full bg-white/10" />
                        <span className="text-[10px] text-[#222] font-black italic">{new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm font-bold text-[#888] truncate group-hover:text-white transition-colors">{item.sourceText.replace(/<[^>]*>/g, '').substring(0, 180)}...</p>
                      
                      <div className="flex gap-4 items-center">
                         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#222] bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5"><AlertCircle size={12} /> Grade {item.targetGradeLevel}</div>
                         <div className="flex items-center gap-2 text-[9px] font-black uppercase text-[#222] bg-white/[0.02] px-3 py-1.5 rounded-lg border border-white/5"><Zap size={12} /> {item.strength} focus</div>
                      </div>
                    </div>
                    
                    <ChevronRight size={24} className="text-[#111] group-hover:text-blue-500 transition-all translate-x-2 group-hover:translate-x-0" />
                  </motion.div>
                ))}
                {filteredHistory.length === 0 && (
                   <div className="h-full flex flex-col items-center justify-center text-center p-20 gap-4">
                      <div className="p-6 bg-blue-500/10 rounded-full border border-blue-500/20">
                        <Layers size={40} className="text-blue-400" />
                      </div>
                      <p className="text-xl font-bold text-white mt-2">No saved rewrites yet</p>
                      <p className="text-sm text-[#888] max-w-md leading-relaxed">
                        Every time you click <span className="text-blue-400 font-semibold">Improve Text</span>, the original and improved versions are saved here. Close this panel, paste some text, and try your first rewrite.
                      </p>
                      <button
                        onClick={onClose}
                        className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-xl transition-colors"
                      >
                        Back to editor
                      </button>
                   </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar { width: 3px; }
        .custom-scroll::-webkit-scrollbar-thumb { background: rgba(59, 130, 246, 0.2); border-radius: 10px; }
      `}</style>
    </AnimatePresence>
  );
}
