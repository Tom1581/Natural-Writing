import type { Metadata } from 'next';
import QualityBoard from '@/components/learning/QualityBoard';

export const metadata: Metadata = { title: 'Quality', robots: { index: false, follow: false } };

export default function QualityPage() {
  return <QualityBoard />;
}
