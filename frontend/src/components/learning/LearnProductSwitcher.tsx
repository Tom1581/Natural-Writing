'use client';

import ProductSwitcher from '@/components/ProductSwitcher';
import { useSession } from '@/lib/learning/session';

/** Students signed in with a code never see the converter; adults and visitors see both products. */
export default function LearnProductSwitcher() {
  const { kind } = useSession();
  return <ProductSwitcher current="studio" variant="studio" hide={kind === 'student' ? ['converter'] : []} />;
}
