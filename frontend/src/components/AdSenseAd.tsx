'use client';

import { useEffect } from 'react';

const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || 'ca-pub-9080556102094416';
const DEFAULT_SLOT = process.env.NEXT_PUBLIC_ADSENSE_ARTICLE_SLOT || '';

interface AdSenseAdProps {
  slot?: string;
  minHeight?: number;
}

export default function AdSenseAd({ slot = DEFAULT_SLOT, minHeight = 120 }: AdSenseAdProps) {
  useEffect(() => {
    if (!slot) return;

    try {
      const adsWindow = window as Window & { adsbygoogle?: unknown[] };
      adsWindow.adsbygoogle = adsWindow.adsbygoogle || [];
      adsWindow.adsbygoogle.push({});
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn('AdSense ad slot failed to initialize', error);
      }
    }
  }, [slot]);

  if (!ADSENSE_CLIENT_ID) return null;

  return (
    <aside
      aria-label="Advertisement"
      style={{
        width: '100%',
        margin: '2.5rem 0',
        padding: '0.65rem',
        borderRadius: '0.875rem',
        border: '1px solid rgba(255,255,255,0.08)',
        background: 'rgba(255,255,255,0.025)',
      }}
    >
      <div
        style={{
          marginBottom: '0.45rem',
          color: '#77798a',
          fontSize: '0.65rem',
          fontWeight: 700,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
        }}
      >
        Advertisement
      </div>

      {slot ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'block', minHeight }}
          data-ad-client={ADSENSE_CLIENT_ID}
          data-ad-slot={slot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      ) : (
        <div
          style={{
            minHeight,
            borderRadius: '0.625rem',
            border: '1px dashed rgba(255,255,255,0.12)',
            background: 'linear-gradient(135deg, rgba(37,99,235,0.08), rgba(255,255,255,0.018))',
          }}
        />
      )}
    </aside>
  );
}
