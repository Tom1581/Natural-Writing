'use client';

import React, { useState, useRef } from 'react';
import RefineMenu from './RefineMenu';

interface InteractiveManuscriptProps {
  text: string;
  onUpdate: (newText: string) => void;
}

export default function InteractiveManuscript({ text, onUpdate }: InteractiveManuscriptProps) {
  const [activeSentence, setActiveSentence] = useState<{ text: string; index: number; pos: { x: number; y: number } } | null>(null);
  
  // Split by sentence boundaries, but keeping delimiters
  const sentences = text.match(/[^.!?]+[.!?]*/g) || [text];

  const handleSentenceClick = (e: React.MouseEvent, s: string, idx: number) => {
    setActiveSentence({
      text: s,
      index: idx,
      pos: { x: Math.min(e.clientX, window.innerWidth - 350), y: Math.min(e.clientY, window.innerHeight - 400) }
    });
  };

  const handleSelectVariation = (newSentence: string) => {
    if (!activeSentence) return;
    const newSentences = [...sentences];
    newSentences[activeSentence.index] = newSentence;
    onUpdate(newSentences.join(''));
    setActiveSentence(null);
  };

  return (
    <div className="p-10 text-xl leading-[2] text-[#e0e0e0] font-medium transition-all relative">
      {sentences.map((s, i) => (
        <span 
          key={i}
          onClick={(e) => handleSentenceClick(e, s, i)}
          className={`cursor-pointer rounded px-1 transition-all duration-300 ${activeSentence?.index === i ? 'bg-blue-500/20 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)]' : 'hover:bg-white/5 hover:text-white'}`}
        >
          {s}
        </span>
      ))}

      {activeSentence && (
        <RefineMenu 
          sentence={activeSentence.text}
          context={text}
          position={activeSentence.pos}
          onSelect={handleSelectVariation}
          onClose={() => setActiveSentence(null)}
        />
      )}
    </div>
  );
}
