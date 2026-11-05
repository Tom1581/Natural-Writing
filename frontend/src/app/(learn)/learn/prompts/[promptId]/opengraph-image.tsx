import { BAND_LABELS } from '@/lib/learning/levels';
import { OG_SIZE, writingStudioCard } from '@/lib/learning/og';
import { getPromptPublic } from '@/lib/learning/public';
import { GENRE_NAMES } from '@/lib/learning/seo';

export const alt = 'Writing prompt from Natural Quill Writing Studio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ promptId: string }> }) {
  const prompt = await getPromptPublic((await params).promptId);
  const visible = prompt && !prompt.checkIn && !prompt.checkpoint;
  return writingStudioCard({
    eyebrow: visible ? `${BAND_LABELS[prompt.band]} · ${GENRE_NAMES[prompt.genre]}` : 'Writing prompt',
    title: visible ? prompt.title : 'Writing prompt',
    subtitle: 'With a success checklist, planning questions and a rubric',
  });
}
