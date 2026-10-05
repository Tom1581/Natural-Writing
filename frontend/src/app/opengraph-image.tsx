import { ImageResponse } from 'next/og';
import QuillGlyph from '@/components/QuillGlyph';

export const alt = 'Natural Quill: turn AI drafts into natural, human writing';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '72px 80px',
          background: 'linear-gradient(135deg, #07070a 0%, #0d1a3a 100%)',
          color: '#ffffff',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div
            style={{
              width: 88,
              height: 88,
              borderRadius: 20,
              background: '#0d1a3a',
              border: '2px solid rgba(96,165,250,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <QuillGlyph size={60} />
          </div>
          <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: -1 }}>Natural Quill</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2, maxWidth: 980 }}>
            Turn AI drafts into natural, human writing
          </div>
          <div style={{ fontSize: 32, color: '#93c5fd', maxWidth: 980 }}>
            Keeps your citations, numbers, and headings intact. 400 words free.
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
