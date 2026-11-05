import { ImageResponse } from 'next/og';
import QuillGlyph from '@/components/QuillGlyph';

export const alt = 'Natural Quill Writing Studio: writing practice with specific feedback from kindergarten to grade 12';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function LearnOpenGraphImage() {
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
          background: 'linear-gradient(135deg, #faf8f4 0%, #e2f1f5 100%)',
          color: '#1d2430',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 84, height: 84, borderRadius: 20, background: '#0f6a86', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <QuillGlyph size={52} color="#ffffff" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: 40, fontWeight: 700 }}>Natural Quill</div>
            <div style={{ fontSize: 28, color: '#0f6a86' }}>Writing Studio</div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div style={{ fontSize: 66, fontWeight: 800, lineHeight: 1.08 }}>Build real writing skills, one draft at a time.</div>
          <div style={{ fontSize: 30, color: '#4a5363' }}>Lessons, prompts and feedback that quotes the student’s own words. Kindergarten to Grade 12.</div>
        </div>
        <div style={{ display: 'flex', gap: 14, fontSize: 24, color: '#2f7a4b' }}>
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
    size,
  );
}
