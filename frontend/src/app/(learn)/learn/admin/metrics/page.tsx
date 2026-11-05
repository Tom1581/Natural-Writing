import type { Metadata } from 'next';
import MetricsBoard from '@/components/learning/MetricsBoard';

export const metadata: Metadata = { title: 'Usage and learning metrics', robots: { index: false, follow: false } };

export default function MetricsPage() {
  return <MetricsBoard />;
}
