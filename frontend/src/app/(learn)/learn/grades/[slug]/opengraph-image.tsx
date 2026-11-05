import { OG_SIZE, writingStudioCard } from '@/lib/learning/og';
import { gradeFromSlug, usGradeName } from '@/lib/learning/public';

export const alt = 'Writing practice by grade, from Natural Quill Writing Studio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const grade = gradeFromSlug((await params).slug) ?? '5';
  return writingStudioCard({
    eyebrow: 'Writing practice by grade',
    title: `${usGradeName(grade)} writing: prompts, lessons and rubrics`,
    subtitle: 'Matched to US, Canadian, UK and Australian writing standards',
  });
}
