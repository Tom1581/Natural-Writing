import SchoolView from '@/components/learning/SchoolView';

type Props = { params: Promise<{ schoolId: string }> };

export default async function SchoolDetailPage({ params }: Props) {
  return <SchoolView schoolId={(await params).schoolId} />;
}
