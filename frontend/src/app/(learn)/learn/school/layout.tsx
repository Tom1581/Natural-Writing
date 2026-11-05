import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'School', robots: { index: false, follow: false } };

export default function SchoolLayout({ children }: { children: React.ReactNode }) {
  return children;
}
