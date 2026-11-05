'use client';

import { useEffect, useState } from 'react';
import type { FrameworkId } from './types';

const KEY = 'nq-region';
export const REGIONS: { id: FrameworkId; label: string; flag: string }[] = [
  { id: 'us-ccss', label: 'United States', flag: 'US' },
  { id: 'ca-on', label: 'Canada', flag: 'CA' },
  { id: 'uk-eng', label: 'United Kingdom', flag: 'UK' },
  { id: 'au-ac9', label: 'Australia', flag: 'AU' },
];

export function readRegion(): FrameworkId | null {
  try {
    const v = localStorage.getItem(KEY);
    return REGIONS.some((r) => r.id === v) ? (v as FrameworkId) : null;
  } catch {
    return null;
  }
}

export function writeRegion(id: FrameworkId) {
  try {
    localStorage.setItem(KEY, id);
  } catch {
    /* keep for this page only */
  }
  window.dispatchEvent(new Event('nq-region'));
}

/** The visitor's chosen country (spelling, year names, curriculum). Null until chosen. */
export function useRegion(): FrameworkId | null {
  const [region, setRegion] = useState<FrameworkId | null>(null);
  useEffect(() => {
    const sync = () => setRegion(readRegion());
    sync();
    window.addEventListener('nq-region', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('nq-region', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);
  return region;
}
