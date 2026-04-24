'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, Send, User, Sparkles, Wand2, MessageCircle, X, ChevronRight, CornerDownLeft } from 'lucide-react';
import toast from 'react-hot-toast';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface SidecarChatProps {
  isOpen: boolean;
  onClose: () => void;
  manuscriptContent: string;
  onApplyChange: (newContent: string) => void;
}

export default function SidecarChat({ isOpen, onClose, manuscriptContent, onApplyChange }: SidecarChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: "I'm your stylistic sidecar. How can I transform your manuscript today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/rewrite/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: input, content: manuscriptContent })
      });
      const data = await res.text();
      
      const assistantMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: data, 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      toast.error('AI Link Severed');
    } finally {
      setIsLoading(false);
    }
  };

  const isHtml = (str: string) => /<[a-z][\s\S]*>/i.test(str);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
          className="fixed right-0 top-0 bottom-0 w-[420px] bg-[#0c0c0c] border-l border-white/5 z-[160] shadow-[-60px_0_150px_rgba(0,0,0,1)] flex flex-col"
        >
          <div className="p-8 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-blue-500/10 rounded-2xl shadow-inner"><Bot className="text-blue-500" size={24} /></div>
               <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em]">Sidecar Assistant</h3>
                  <p className="text-[10px] text-[#444] font-black uppercase mt-1">Contextual Stylist</p>
               </div>
            </div>
            <button onClick={onClose} className="text-[#333] hover:text-white transition-colors"><X size={24} /></button>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scroll bg-white/[0.01]">
            {messages.map((m) => (
              <motion.div 
                key={m.id} 
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div className={`max-w-[85%] rounded-[2rem] p-6 text-sm leading-relaxed ${m.role === 'user' ? 'bg-blue-600 text-white shadow-2xl' : 'bg-white/5 border border-white/10 text-white/80'}`}>
                   {m.content}
                </div>
                
                {m.role === 'assistant' && isHtml(m.content) && (
                   <motion.button 
                     whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                     onClick={() => onApplyChange(m.content)}
                     className="mt-4 flex items-center gap-2 px-6 py-2 bg-blue-500/10 border border-blue-500/20 text-blue-500 text-[10px] font-black uppercase rounded-full shadow-lg"
                   >
                      <Sparkles size={12} /> Apply Reflection
                   </motion.button>
                )}
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex items-center gap-3 opacity-20">
                 <Bot className="animate-bounce" size={20} />
                 <span className="text-[10px] font-black uppercase tracking-widest italic">Analyzing Context...</span>
              </div>
            )}
          </div>

          <div className="p-8 border-t border-white/5 bg-white/[0.01]">
             <div className="relative group">
                <textarea 
                  rows={2} placeholder="E.g., 'Make the last paragraph more aggressive'..."
                  value={input} onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), handleSend())}
                  className="w-full bg-[#050505] border border-white/5 rounded-3xl p-6 pr-16 text-xs text-white/80 focus:outline-none focus:border-blue-500 transition-all font-sans resize-none shadow-inner"
                />
                <button 
                  onClick={handleSend} disabled={isLoading}
                  className="absolute right-4 bottom-4 p-3 bg-blue-600 text-white rounded-2xl shadow-2xl hover:bg-blue-500 transition-all active:scale-90 disabled:opacity-30"
                >
                   <CornerDownLeft size={20} />
                </button>
             </div>
             <div className="mt-4 flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                <button onClick={() => setInput("Critique my tone continuity")} className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-[#444] hover:text-white transition-all">Tone Analysis</button>
                <button onClick={() => setInput("Rewrite introduction as teaser")} className="whitespace-nowrap px-4 py-2 bg-white/5 border border-white/10 rounded-full text-[9px] font-black uppercase text-[#444] hover:text-white transition-all">Teaser Mode</button>
             </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
