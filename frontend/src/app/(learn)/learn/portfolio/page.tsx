import type { Metadata } from 'next';
import PortfolioView from '@/components/learning/PortfolioView';

export const metadata: Metadata = { title: 'My portfolio', robots: { index: false, follow: false } };

export default function PortfolioPage() {
  return <PortfolioView />;
}
