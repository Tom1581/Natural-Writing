import FeedbackView from '@/components/learning/FeedbackView';

type Props = { params: Promise<{ submissionId: string }> };

export default async function FeedbackPage({ params }: Props) {
  return <FeedbackView submissionId={(await params).submissionId} />;
}
