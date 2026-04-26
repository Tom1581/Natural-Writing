import React from 'react';

interface BrandMarkProps {
  size?: number;
  className?: string;
}

export default function BrandMark({ size = 28, className }: BrandMarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
    >
      <style>{`
        @keyframes bm-stroke-1 {
          0%        { stroke-dashoffset: 22; opacity: 0.2; }
          35%, 60%  { stroke-dashoffset: 0;  opacity: 1;   }
          100%      { stroke-dashoffset: 22; opacity: 0.2; }
        }
        @keyframes bm-stroke-2 {
          0%        { stroke-dashoffset: 15; opacity: 0.1; }
          35%, 60%  { stroke-dashoffset: 0;  opacity: 0.85; }
          100%      { stroke-dashoffset: 15; opacity: 0.1; }
        }
        @keyframes bm-nib {
          0%, 100%  { opacity: 0.3; }
          40%, 55%  { opacity: 1; }
        }
        @keyframes bm-write-1 {
          0%, 28%   { stroke-dashoffset: 13; opacity: 0; }
          52%, 68%  { stroke-dashoffset: 0;  opacity: 0.9; }
          88%, 100% { stroke-dashoffset: 13; opacity: 0; }
        }
        @keyframes bm-write-2 {
          0%, 38%   { stroke-dashoffset: 13; opacity: 0; }
          60%, 72%  { stroke-dashoffset: 0;  opacity: 0.75; }
          90%, 100% { stroke-dashoffset: 13; opacity: 0; }
        }
        @keyframes bm-write-3 {
          0%, 48%   { stroke-dashoffset: 8;  opacity: 0; }
          68%, 76%  { stroke-dashoffset: 0;  opacity: 0.55; }
          92%, 100% { stroke-dashoffset: 8;  opacity: 0; }
        }
      `}</style>

      {/* Main quill body */}
      <path
        d="M47.6 11.2C42.5 11.4 37.7 13.7 34.2 17.5L21.2 31.6C19.2 33.8 18 36.7 17.9 39.7C17.8 43.5 20.1 46.6 23.6 47.6C26.7 48.5 30.3 47.8 32.8 45.6L46.9 32.9C51.3 28.9 53.4 23.2 52.6 17.6L52 13.5C51.8 12.1 49.9 11.1 47.6 11.2Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Nib strokes */}
      <path d="M26.2 43.8L15.8 54.2" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M21.3 48.7L14.1 41.5" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />
      <path d="M15.7 54.3L19.6 50.4" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" />

      {/* Top quill detail */}
      <path d="M47.8 11.2C49.6 12.8 50.7 14.9 51.1 17.3" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" opacity="0.9" />

      {/* Inner vein 1 — draw animation */}
      <path
        d="M29.6 22.8C34 26.2 37.8 30 41.2 34.4"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeDasharray="22"
        style={{ animation: 'bm-stroke-1 2.4s ease-in-out infinite' }}
      />

      {/* Inner vein 2 — draw animation (delayed) */}
      <path
        d="M24.8 28C27.9 30.3 30.6 33 32.9 36.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeDasharray="15"
        style={{ animation: 'bm-stroke-2 2.4s ease-in-out 0.35s infinite' }}
      />

      {/* Ink dot at nib tip */}
      <circle
        cx="15.8"
        cy="54.2"
        r="1.8"
        fill="currentColor"
        style={{ animation: 'bm-nib 2.4s ease-in-out infinite' }}
      />

      {/* Writing curves at nib tip — hump 1 (nearest tip) */}
      <path
        d="M13.5 55.5 C11.8 53.2 10.2 58.0 8.4 55.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="13"
        style={{ animation: 'bm-write-1 2.4s ease-in-out infinite' }}
      />

      {/* Writing curves at nib tip — hump 2 */}
      <path
        d="M8.4 55.5 C6.6 53.2 5.0 58.0 3.2 55.5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="13"
        style={{ animation: 'bm-write-2 2.4s ease-in-out infinite' }}
      />

      {/* Writing curves at nib tip — small tail curl */}
      <path
        d="M3.2 55.5 C2.0 54.2 1.4 56.5 0.8 55.8"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
        strokeDasharray="8"
        style={{ animation: 'bm-write-3 2.4s ease-in-out infinite' }}
      />
    </svg>
  );
}
