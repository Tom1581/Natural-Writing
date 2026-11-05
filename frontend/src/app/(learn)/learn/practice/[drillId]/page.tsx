import type { Metadata } from 'next';
import Breadcrumbs from '@/components/learning/Breadcrumbs';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import AlignmentPanel from '@/components/learning/AlignmentPanel';
import DrillPlayer from '@/components/learning/DrillPlayer';
import { getCatalog, getDrillPublic } from '@/lib/learning/public';
import { BAND_LABELS } from '@/lib/learning/levels';

type Props = { params: Promise<{ drillId: string }> };

/** Pre-render every drill at build time; new ones render on first request. */
export async function generateStaticParams() {
  const catalog = await getCatalog();
  return (catalog?.drills ?? []).map((x) => ({ drillId: x.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const drill = await getDrillPublic((await params).drillId);
  if (!drill) return { title: 'Practice set not found' };
  return {
    title: `${drill.title}: ${BAND_LABELS[drill.band]} Practice`,
    description: `${drill.description} Free interactive practice for ${BAND_LABELS[drill.band].toLowerCase()}, with instant feedback.`,
    alternates: { canonical: `/learn/practice/${drill.id}` },
  };
}

export default async function DrillPage({ params }: Props) {
  const drill = await getDrillPublic((await params).drillId);
  if (!drill) notFound();
  return (
    <div className="lw-lesson">
      <Breadcrumbs items={[{ name: 'Practice', href: '/learn/practice' }, { name: drill.title, href: `/learn/practice/${drill.id}` }]} />
      <p className="lw-eyebrow">
        {BAND_LABELS[drill.band]} · {drill.skill?.name} · practice set
      </p>
      <h1>{drill.title}</h1>
      <p className="lw-lede">{drill.description}</p>
      <DrillPlayer items={drill.items} drillId={drill.id} />
      {drill.lesson && (
        <p style={{ marginTop: 16 }}>
          Want the full lesson? <Link href={`/learn/lessons/${drill.lesson.id}`}>{drill.lesson.title}</Link>
        </p>
      )}
      <div style={{ marginTop: 24 }}>
        <AlignmentPanel alignment={drill.alignment} />
      </div>
    </div>
  );
}
