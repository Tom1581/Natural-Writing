'use client';

import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import StarterKit from '@tiptap/starter-kit';
import Highlight from '@tiptap/extension-highlight';
import Typography from '@tiptap/extension-typography';
import Placeholder from '@tiptap/extension-placeholder';
import { Bold, Italic, Heading1, Heading2, MessageSquarePlus } from 'lucide-react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onAddComment?: (selection: { from: number, to: number, text: string }) => void;
  editable?: boolean;
  placeholder?: string;
}

export default function RichTextEditor({
  content,
  onChange,
  onAddComment,
  editable = true,
  placeholder = 'Paste or type the text you want to improve…',
}: RichTextEditorProps) {
  // Ref guards the sync effect: every time the editor emits an update, we
  // record the HTML we just pushed up. The sync effect then skips it — so
  // typing no longer triggers `setContent` resets that eat the cursor.
  const lastEmittedRef = React.useRef<string>('');

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({ multicolor: true }),
      Typography,
      Placeholder.configure({ placeholder, showOnlyWhenEditable: true }),
    ],
    immediatelyRender: false,
    content,
    editable,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedRef.current = html;
      onChange(html);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none min-h-[400px] text-base leading-relaxed font-sans px-8 py-6',
      },
    },
  });

  // Sync content ONLY on external changes (e.g. history selection, clear).
  React.useEffect(() => {
    if (!editor) return;
    // Skip if the content prop is identical to what we just emitted locally.
    if (content === lastEmittedRef.current) return;
    const currentHtml = editor.getHTML();
    if (content === currentHtml) return;
    // Treat empty variants as equivalent so we don't bounce between '' and '<p></p>'.
    const isEmpty = (s: string) => !s || s === '<p></p>';
    if (isEmpty(content) && isEmpty(currentHtml)) return;
    editor.commands.setContent(content || '', { emitUpdate: false });
  }, [content, editor]);

  if (!editor) return null;

  const handleCommentClick = () => {
    const { from, to } = editor.state.selection;
    const text = editor.state.doc.textBetween(from, to);
    if (onAddComment && text) onAddComment({ from, to, text });
  };

  return (
    <div className="relative h-full flex flex-col group">
      <BubbleMenu editor={editor} className="flex gap-1 p-1.5 bg-[#111] border border-white/10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <button
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`p-2.5 rounded-xl transition-all ${editor.isActive('bold') ? 'bg-blue-600 text-white' : 'text-[#888] hover:bg-white/5 hover:text-white'}`}
        >
          <Bold size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`p-2.5 rounded-xl transition-all ${editor.isActive('italic') ? 'bg-blue-600 text-white' : 'text-[#888] hover:bg-white/5 hover:text-white'}`}
        >
          <Italic size={16} />
        </button>
        <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          className={`p-2.5 rounded-xl transition-all ${editor.isActive('heading', { level: 1 }) ? 'bg-blue-600 text-white' : 'text-[#888] hover:bg-white/5 hover:text-white'}`}
        >
          <Heading1 size={16} />
        </button>
        <button
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`p-2.5 rounded-xl transition-all ${editor.isActive('heading', { level: 2 }) ? 'bg-blue-600 text-white' : 'text-[#888] hover:bg-white/5 hover:text-white'}`}
        >
          <Heading2 size={16} />
        </button>
        {onAddComment && (
          <>
            <div className="w-[1px] h-4 bg-white/10 mx-1 self-center" />
            <button
              onClick={handleCommentClick}
              className="p-2.5 rounded-xl text-blue-500 hover:bg-blue-500/10 transition-all"
            >
              <MessageSquarePlus size={16} />
            </button>
          </>
        )}
      </BubbleMenu>

      <div className="flex-1 overflow-y-auto custom-scroll" onClick={() => editor.commands.focus()}>
        <EditorContent editor={editor} />
      </div>

      <style jsx global>{`
        .ProseMirror {
          min-height: 100%;
          outline: none;
          color: #e5e7eb;
          cursor: text;
        }
        .ProseMirror p { margin: 0.75em 0; }
        .ProseMirror h1 { font-size: 1.75em; font-weight: 800; margin: 1em 0 0.5em; }
        .ProseMirror h2 { font-size: 1.35em; font-weight: 700; margin: 0.9em 0 0.4em; }
        .ProseMirror strong { font-weight: 700; color: #fff; }
        .ProseMirror em { font-style: italic; }
        .ProseMirror mark {
          background-color: rgba(59, 130, 246, 0.2);
          color: inherit;
          border-radius: 4px;
          padding: 0 2px;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #555;
          pointer-events: none;
          height: 0;
          font-style: italic;
        }
      `}</style>
    </div>
  );
}
