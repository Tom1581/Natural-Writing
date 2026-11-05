import ClassView from '@/components/learning/ClassView';

type Props = { params: Promise<{ classId: string }> };

export default async function ClassPage({ params }: Props) {
  return <ClassView classId={(await params).classId} />;
}
