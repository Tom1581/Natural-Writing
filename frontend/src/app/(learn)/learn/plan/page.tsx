import type { Metadata } from 'next';
import PlanBoard from '@/components/learning/PlanBoard';

export const metadata: Metadata = { title: 'My two-week plan', robots: { index: false, follow: false } };

export default function PlanPage() {
  return <PlanBoard />;
}
