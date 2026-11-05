import { LEVEL_LABELS } from '@/lib/learning/levels';

export default function LevelMeter({ rating, compact = false, notRated = false }: { rating: number | null; compact?: boolean; notRated?: boolean }) {
  if (rating === null) return <span className="lw-meter-label lw-muted">{compact ? '–' : notRated ? 'Not rated for this piece' : 'Not enough to tell yet'}</span>;
  return (
    <span className="lw-meter" role="img" aria-label={`Level ${rating} of 4: ${LEVEL_LABELS[rating]}`}>
      <span className="lw-meter-bars">
        {[1, 2, 3, 4].map((n) => (
          <span key={n} data-on={n <= rating} />
        ))}
      </span>
      {!compact && (
        <span className="lw-meter-label" aria-hidden="true">
          {rating} of 4 · {LEVEL_LABELS[rating]}
        </span>
      )}
    </span>
  );
}
