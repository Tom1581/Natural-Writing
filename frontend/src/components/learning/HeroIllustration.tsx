/** Decorative: a draft with a highlighted sentence, a feedback note and a level meter. */
export default function HeroIllustration() {
  return (
    <svg viewBox="0 0 480 400" className="lw-hero-art" role="img" aria-label="A student draft with a highlighted sentence, a feedback note and a skill level">
      <defs>
        <linearGradient id="lw-paper" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="var(--lw-surface)" />
          <stop offset="1" stopColor="var(--lw-surface-2)" />
        </linearGradient>
      </defs>
      <rect x="40" y="36" width="300" height="330" rx="18" fill="url(#lw-paper)" stroke="var(--lw-line)" strokeWidth="2" />
      <rect x="40" y="36" width="300" height="46" rx="18" fill="var(--lw-accent-soft)" />
      <rect x="40" y="64" width="300" height="18" fill="var(--lw-accent-soft)" />
      <circle cx="66" cy="59" r="7" fill="var(--lw-accent)" opacity="0.8" />
      <rect x="82" y="54" width="120" height="10" rx="5" fill="var(--lw-accent)" opacity="0.45" />
      {[110, 140, 200, 230, 260, 290, 320].map((y, i) => (
        <rect key={y} x="66" y={y} width={[230, 190, 240, 210, 170, 225, 150][i]} height="10" rx="5" fill="var(--lw-ink-3)" opacity="0.28" />
      ))}
      <rect x="60" y="163" width="252" height="22" rx="6" fill="var(--lw-mark)" />
      <rect x="66" y="169" width="236" height="10" rx="5" fill="var(--lw-ink-2)" opacity="0.55" />
      <g className="lw-hero-note">
        <rect x="250" y="190" width="200" height="118" rx="16" fill="var(--lw-surface)" stroke="var(--lw-next)" strokeWidth="2" />
        <rect x="250" y="190" width="8" height="118" rx="4" fill="var(--lw-next)" />
        <rect x="272" y="210" width="80" height="10" rx="5" fill="var(--lw-next)" opacity="0.8" />
        <rect x="272" y="232" width="160" height="8" rx="4" fill="var(--lw-ink-3)" opacity="0.35" />
        <rect x="272" y="248" width="140" height="8" rx="4" fill="var(--lw-ink-3)" opacity="0.35" />
        <rect x="266" y="266" width="168" height="28" rx="8" fill="var(--lw-next-soft)" />
        <text x="278" y="285" fontSize="13" fill="var(--lw-ink)" fontFamily="var(--lw-font-body)">What could you add here?</text>
      </g>
      <g>
        <rect x="290" y="58" width="168" height="92" rx="16" fill="var(--lw-surface)" stroke="var(--lw-line)" strokeWidth="2" />
        <text x="308" y="84" fontSize="13" fontWeight="600" fill="var(--lw-ink-2)" fontFamily="var(--lw-font-body)">Reasons and evidence</text>
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={308 + i * 34} y="98" width="28" height="12" rx="3" fill={i < 3 ? 'var(--lw-accent)' : 'var(--lw-surface-2)'} stroke="var(--lw-line)" />
        ))}
        <text x="308" y="134" fontSize="12" fill="var(--lw-good)" fontWeight="700" fontFamily="var(--lw-font-body)">↑ up from 2 · Meets the goal</text>
      </g>
      <path d="M78 372 C 150 340, 210 390, 300 360" stroke="var(--lw-accent)" strokeWidth="3" fill="none" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}
