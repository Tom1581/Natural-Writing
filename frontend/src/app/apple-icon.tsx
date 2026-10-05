import { ImageResponse } from 'next/og';
import QuillGlyph from '@/components/QuillGlyph';

// Also serves as the Organization logo in structured data (Google needs at least 112px).
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: '#0d1a3a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <QuillGlyph size={124} />
      </div>
    ),
    { ...size }
  );
}
