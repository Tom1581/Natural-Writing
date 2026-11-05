import type { Metadata } from 'next';
import ContentReviewBoard from '@/components/learning/ContentReviewBoard';

export const metadata: Metadata = { title: 'Content review', robots: { index: false, follow: false } };

export default function ContentReviewPage() {
  return <ContentReviewBoard />;
}
