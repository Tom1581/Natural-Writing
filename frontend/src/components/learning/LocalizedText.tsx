'use client';

import { localize } from '@/lib/learning/localize';
import { useRegion } from '@/lib/learning/region';
import type { FrameworkId } from '@/lib/learning/types';

/**
 * Renders content text in the reader's regional spelling. The server renders US spelling
 * (also what search engines index); the swap happens after the page loads.
 */
export default function LocalizedText({ text, framework }: { text: string; framework?: FrameworkId | null }) {
  const region = useRegion();
  return <>{localize(text, framework ?? region)}</>;
}
