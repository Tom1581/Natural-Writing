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
      <path
        d="M47.6 11.2C42.5 11.4 37.7 13.7 34.2 17.5L21.2 31.6C19.2 33.8 18 36.7 17.9 39.7C17.8 43.5 20.1 46.6 23.6 47.6C26.7 48.5 30.3 47.8 32.8 45.6L46.9 32.9C51.3 28.9 53.4 23.2 52.6 17.6L52 13.5C51.8 12.1 49.9 11.1 47.6 11.2Z"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M26.2 43.8L15.8 54.2"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M21.3 48.7L14.1 41.5"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      <path
        d="M29.6 22.8C34 26.2 37.8 30 41.2 34.4"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      <path
        d="M24.8 28C27.9 30.3 30.6 33 32.9 36.1"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      <path
        d="M47.8 11.2C49.6 12.8 50.7 14.9 51.1 17.3"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M15.7 54.3L19.6 50.4"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
