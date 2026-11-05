import { OG_SIZE, writingStudioCard } from '@/lib/learning/og';
import { getRubricPublic } from '@/lib/learning/public';

export const alt = 'Free writing rubric from Natural Quill Writing Studio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ rubricId: string }> }) {
  const rubric = await getRubricPublic((await params).rubricId);
  return writingStudioCard({
    eyebrow: 'Free printable rubric',
    title: rubric ? `${rubric.title} rubric` : 'Writing rubric',
    subtitle: rubric ? `Four levels for ${rubric.dimensions.map((d) => d.name.toLowerCase()).join(', ')}` : 'Four levels with scored examples',
  });
}
