import { getReviewStatus } from '@/lib/learning/public';

/** Educator sign-off for a catalog item, shown on its public page. Names are never shown, only roles. */
export default async function ReviewBadge({ itemId }: { itemId: string }) {
  const status = await getReviewStatus(itemId);
  if (!status) return null;
  if (!status.approvals)
    return <p className="lw-small lw-muted">Written for our pilot; not yet reviewed by a classroom educator.</p>;
  const when = status.lastReviewed ? new Date(status.lastReviewed).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : '';
  return (
    <p className="lw-small">
      <span className="lw-pill lw-pill-good">Educator reviewed</span> Approved by {status.approvals === 1 ? 'a' : status.approvals}{' '}
      {status.roles.join('; ')}
      {when && `, ${when}`}.
    </p>
  );
}
