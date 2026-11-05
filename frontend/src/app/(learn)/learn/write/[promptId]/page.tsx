import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import PracticeEditor from '@/components/learning/PracticeEditor';
import { getPromptPublic } from '@/lib/learning/public';

type Props = { params: Promise<{ promptId: string }>; searchParams: Promise<{ lesson?: string; grade?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const prompt = await getPromptPublic((await params).promptId);
  return { title: prompt ? `Write: ${prompt.title}` : 'Write', robots: { index: false, follow: false } };
}

export default async function WritePage({ params, searchParams }: Props) {
  const prompt = await getPromptPublic((await params).promptId);
  if (!prompt) notFound();
  const { lesson, grade } = await searchParams;
  return (
    <PracticeEditor
      prompt={prompt}
      lessonId={typeof lesson === 'string' ? lesson : null}
      initialGrade={typeof grade === 'string' ? grade.toUpperCase() : null}
    />
  );
}
