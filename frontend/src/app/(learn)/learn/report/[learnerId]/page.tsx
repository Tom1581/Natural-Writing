import ReportView from '@/components/learning/ReportView';

type Props = { params: Promise<{ learnerId: string }> };

export default async function ReportPage({ params }: Props) {
  return <ReportView learnerId={(await params).learnerId} />;
}
