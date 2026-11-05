import { ImageResponse } from 'next/og';
import QuillGlyph from '@/components/QuillGlyph';

export const OG_SIZE = { width: 1200, height: 630 };

/** Shared social card for Writing Studio pages: brand, an eyebrow, a title and a short line. */
export function writingStudioCard({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  const titleSize = title.length > 60 ? 54 : title.length > 36 ? 62 : 72;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 80px',
          background: 'linear-gradient(135deg, #faf8f4 0%, #e2f1f5 100%)',
          color: '#1d2430',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: '#0f6a86', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QuillGlyph size={44} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 34, fontWeight: 700 }}>Natural Quill</div>
            <div style={{ fontSize: 24, color: '#0f6a86' }}>Writing Studio</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 28, color: '#2f7a4b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 2 }}>{eyebrow}</div>
          <div style={{ fontSize: titleSize, fontWeight: 800, lineHeight: 1.08 }}>{title}</div>
          <div style={{ fontSize: 28, color: '#4a5363' }}>{subtitle}</div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 22, color: '#4a5363' }}>
          <span>Common Core</span>
          <span>·</span>
          <span>Ontario</span>
          <span>·</span>
          <span>England</span>
          <span>·</span>
          <span>Australian Curriculum</span>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
