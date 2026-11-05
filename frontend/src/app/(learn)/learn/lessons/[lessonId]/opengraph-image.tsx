import { BAND_LABELS } from '@/lib/learning/levels';
import { OG_SIZE, writingStudioCard } from '@/lib/learning/og';
import { getLesson } from '@/lib/learning/public';

export const alt = 'Natural Quill Writing Studio lesson';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ lessonId: string }> }) {
  const lesson = await getLesson((await params).lessonId);
  return writingStudioCard({
    eyebrow: lesson ? `${BAND_LABELS[lesson.band]} writing lesson` : 'Writing lesson',
    title: lesson?.title ?? 'Writing lesson',
    subtitle: lesson ? `${lesson.objective} · about ${lesson.minutes} minutes` : 'Model, practice and a writing task',
  });
}
