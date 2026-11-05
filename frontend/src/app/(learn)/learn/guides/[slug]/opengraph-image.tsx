import { getGuide } from '@/lib/learning/guides';
import { OG_SIZE, writingStudioCard } from '@/lib/learning/og';

export const alt = 'Natural Quill Writing Studio guide';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const guide = getGuide((await params).slug);
  return writingStudioCard({ eyebrow: `Guide for ${guide?.audience.toLowerCase() ?? 'families'}`, title: guide?.title ?? 'Writing guide', subtitle: 'Practical help for writing from kindergarten to grade 12' });
}
