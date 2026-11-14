'use client';

import type { ReactNode } from 'react';
import { useSession } from '@/lib/learning/session';

/**
 * Wraps links that leave Writing Studio for the humanizer side of the site (which carries ads).
 * Students signed in with a code never see them; visitors and signed-in adults do.
 */
export default function AdultOnly({ children }: { children: ReactNode }) {
  const { kind } = useSession();
  return kind === 'student' ? null : <>{children}</>;
}
