'use client';

import { REGIONS, useRegion, writeRegion } from '@/lib/learning/region';
import type { FrameworkId } from '@/lib/learning/types';

export default function RegionPicker({ compact = false }: { compact?: boolean }) {
  const region = useRegion();
  return (
    <label className="lw-region">
      <span className={compact ? 'lw-visually-hidden' : 'lw-small lw-muted'}>Country</span>
      <select
        className="lw-select lw-select-small"
        value={region ?? ''}
        onChange={(e) => writeRegion(e.target.value as FrameworkId)}
        aria-label="Country and curriculum"
      >
        <option value="" disabled>
          Choose country
        </option>
        {REGIONS.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
    </label>
  );
}
