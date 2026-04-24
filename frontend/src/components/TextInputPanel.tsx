'use client';

import React, { useRef, useState } from 'react';
import { Upload, FileText, Loader2, FileUp } from 'lucide-react';
import toast from 'react-hot-toast';

interface TextInputPanelProps {
  value: string;
  onChange: (text: string) => void;
  placeholder?: string;
}

/**
 * Primary text-input panel for the editor. Plain textarea (guaranteed to work)
 * plus file upload for .pdf, .docx, .txt, .md and drag-and-drop support.
 */
export default function TextInputPanel({
  value,
  onChange,
  placeholder = 'Paste or type the AI-generated text you want to humanize…',
}: TextInputPanelProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isReading, setIsReading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const extractTextFromFile = async (file: File): Promise<string> => {
    const ext = file.name.toLowerCase().split('.').pop() || '';

    if (ext === 'txt' || ext === 'md') {
      return await file.text();
    }

    if (ext === 'docx') {
      const mammoth = await import('mammoth');
      const buffer = await file.arrayBuffer();
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      return result.value.trim();
    }

    if (ext === 'pdf') {
      const pdfjs: any = await import('pdfjs-dist');
      // pdf.js needs a worker; load the matching-version one from the public CDN
      pdfjs.GlobalWorkerOptions.workerSrc =
        `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
      const buffer = await file.arrayBuffer();
      const doc = await pdfjs.getDocument({ data: buffer }).promise;
      const pages: string[] = [];
      for (let i = 1; i <= doc.numPages; i++) {
        const page = await doc.getPage(i);
        const content = await page.getTextContent();
        const items = (content.items as any[]).map(it => (it.str || '')).join(' ');
        pages.push(items);
      }
      return pages.join('\n\n').trim();
    }

    throw new Error(`Unsupported file type: .${ext}`);
  };

  const handleFile = async (file: File) => {
    if (file.size > 20 * 1024 * 1024) {
      toast.error('File too large (max 20 MB).');
      return;
    }
    setIsReading(true);
    const toastId = toast.loading(`Reading ${file.name}…`);
    try {
      const text = await extractTextFromFile(file);
      if (!text) throw new Error('No text content found in file.');
      onChange(text);
      toast.success(`Loaded ${file.name} (${formatBytes(file.size)})`, { id: toastId });
      // Focus the textarea after loading
      setTimeout(() => textareaRef.current?.focus(), 50);
    } catch (err: any) {
      toast.error(err.message || 'Failed to read file.', { id: toastId });
    } finally {
      setIsReading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0;
  const charCount = value.length;

  return (
    <div
      style={{ height: '100%', display: 'flex', flexDirection: 'column', position: 'relative' }}
      onDrop={handleDrop}
      onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
    >
      {/* Upload toolbar */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        padding: '0.75rem 1.25rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
        background: 'rgba(255, 255, 255, 0.01)',
        flexShrink: 0,
      }}>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isReading}
          style={uploadButtonStyle}
          onMouseEnter={e => { if (!isReading) { e.currentTarget.style.background = 'rgba(37, 99, 235, 0.15)'; e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.5)'; } }}
          onMouseLeave={e => { if (!isReading) { e.currentTarget.style.background = 'rgba(37, 99, 235, 0.08)'; e.currentTarget.style.borderColor = 'rgba(37, 99, 235, 0.3)'; } }}
        >
          {isReading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          {isReading ? 'Reading…' : 'Upload document'}
        </button>
        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          .pdf · .docx · .txt · .md · or drag-and-drop
        </span>
        <div style={{ marginLeft: 'auto', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {wordCount > 0 && <>{wordCount.toLocaleString()} words · {charCount.toLocaleString()} chars</>}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.md"
          style={{ display: 'none' }}
          onChange={e => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Textarea — the actual input */}
      <div style={{ flex: 1, position: 'relative', minHeight: 0 }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          spellCheck
          style={{
            width: '100%',
            height: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            padding: '1.5rem 2rem',
            color: '#e8e8ed',
            fontSize: '0.95rem',
            lineHeight: 1.75,
            fontFamily: 'var(--font-body), system-ui, sans-serif',
            caretColor: '#2563eb',
          }}
        />

        {/* Drag overlay */}
        {isDragging && (
          <div style={{
            position: 'absolute', inset: '0.5rem',
            background: 'rgba(37, 99, 235, 0.1)',
            border: '2px dashed rgba(37, 99, 235, 0.6)',
            borderRadius: 'var(--radius-md)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '0.75rem',
            color: 'var(--accent-blue)',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
          }}>
            <FileUp size={40} />
            <p style={{ fontSize: '0.95rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Drop to load file
            </p>
            <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              .pdf · .docx · .txt · .md
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

const uploadButtonStyle: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
  padding: '0.45rem 0.9rem',
  background: 'rgba(37, 99, 235, 0.08)',
  border: '1px solid rgba(37, 99, 235, 0.3)',
  borderRadius: 'var(--radius-sm)',
  color: 'var(--accent-blue)',
  fontSize: '0.68rem', fontWeight: 700,
  textTransform: 'uppercase', letterSpacing: '0.08em',
  cursor: 'pointer',
  transition: 'all 0.15s ease',
  fontFamily: 'var(--font-display)',
  whiteSpace: 'nowrap',
};

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
