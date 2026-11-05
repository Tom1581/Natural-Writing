import { BAND_LABELS } from '@/lib/learning/levels';
import { OG_SIZE, writingStudioCard } from '@/lib/learning/og';
import { getExamplePublic } from '@/lib/learning/public';
import { GENRE_NAMES } from '@/lib/learning/seo';

export const alt = 'Annotated writing example from Natural Quill Writing Studio';
export const size = OG_SIZE;
export const contentType = 'image/png';

export default async function Image({ params }: { params: Promise<{ exampleId: string }> }) {
  const ex = await getExamplePublic((await params).exampleId);
  return writingStudioCard({
    eyebrow: ex ? `${BAND_LABELS[ex.band]} · ${GENRE_NAMES[ex.genre]} example` : 'Writing example',
    title: ex ? `“${ex.title}”` : 'Annotated writing example',
    subtitle: 'A model piece, rated skill by skill, with notes on what works',
  });
}
