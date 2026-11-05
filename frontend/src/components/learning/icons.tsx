import Link from 'next/link';
import type { ReactNode } from 'react';
import { BAND_LABELS } from '@/lib/learning/levels';

/**
 * Line icons for skills and features, drawn on a 24px grid in currentColor so they follow
 * the text color in light and dark mode. Decorative: the label next to them carries meaning.
 */
const SKILL_PATHS: Record<string, ReactNode> = {
  // Clear opinion or claim: a flag planted firmly.
  'purpose.claim': (
    <>
      <path d="M6 21V4" />
      <path d="M6 4h11l-2.5 4L17 12H6" />
    </>
  ),
  // Clear topic: a target.
  'purpose.topic': (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  // Story setup: an open book.
  'purpose.story': (
    <>
      <path d="M3 6c3-1.5 6-1.5 9 0v13c-3-1.5-6-1.5-9 0z" />
      <path d="M21 6c-3-1.5-6-1.5-9 0v13c3-1.5 6-1.5 9 0z" />
    </>
  ),
  // Organization: blocks stacked in order.
  'organization.structure': (
    <>
      <rect x="4" y="4" width="10" height="4" rx="1" />
      <rect x="4" y="10" width="16" height="4" rx="1" />
      <rect x="4" y="16" width="13" height="4" rx="1" />
    </>
  ),
  // Reasons and evidence: a magnifying glass.
  'development.evidence': (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5 5" />
      <path d="M8 10.5h5" />
    </>
  ),
  // Facts and explanation: a light bulb.
  'development.information': (
    <>
      <path d="M9 17h6" />
      <path d="M10 20h4" />
      <path d="M8.5 14.5A6 6 0 1 1 15.5 14.5c-.8.7-1 1.4-1 2.5h-5c0-1.1-.2-1.8-1-2.5z" />
    </>
  ),
  // Story details: an eye.
  'development.detail': (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // Counterclaims: balanced scales.
  'development.counterclaim': (
    <>
      <path d="M12 4v16" />
      <path d="M8 20h8" />
      <path d="M5 7h14" />
      <path d="M5 7l-2.5 6h5z" />
      <path d="M19 7l-2.5 6h5z" />
    </>
  ),
  // Sentences: lines of varied length.
  'sentences.control': (
    <>
      <path d="M4 7h16" />
      <path d="M4 12h10" />
      <path d="M4 17h13" />
      <circle cx="18.5" cy="12" r="1" fill="currentColor" />
    </>
  ),
  // Word choice: a pencil tip.
  'word_choice.precision': (
    <>
      <path d="M4 20l1.2-4.6L16 4.6a2 2 0 0 1 2.8 0l.6.6a2 2 0 0 1 0 2.8L8.6 18.8z" />
      <path d="M14 6.6l3.4 3.4" />
    </>
  ),
  // Conventions: a tick beside a full stop.
  'conventions.mechanics': (
    <>
      <path d="M4 12.5l4 4 8-9" />
      <circle cx="19" cy="17" r="1.4" fill="currentColor" />
    </>
  ),
  // Revising: circular arrows.
  revision: (
    <>
      <path d="M20 11a8 8 0 0 0-14.5-4.5L4 8" />
      <path d="M4 4v4h4" />
      <path d="M4 13a8 8 0 0 0 14.5 4.5L20 16" />
      <path d="M20 20v-4h-4" />
    </>
  ),
};

export function SkillIcon({ skillId, size = 20, className }: { skillId: string; size?: number; className?: string }) {
  const paths = SKILL_PATHS[skillId] ?? SKILL_PATHS['sentences.control'];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`lw-icon ${className ?? ''}`}
    >
      {paths}
    </svg>
  );
}

const FEATURE_PATHS: Record<string, ReactNode> = {
  quote: (
    <>
      <path d="M4 5h16v11H9l-5 4z" />
      <path d="M8 9h8M8 12.5h5" />
    </>
  ),
  check: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="3" />
      <path d="M8 12.5l3 3 5-6" />
    </>
  ),
  growth: (
    <>
      <path d="M4 20h16" />
      <path d="M6 16l4-4 3 3 6-7" />
      <path d="M15 8h4v4" />
    </>
  ),
  plan: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="2" />
      <path d="M4 10h16M9 3v4M15 3v4" />
      <path d="M8 14h3M8 17h6" />
    </>
  ),
  report: (
    <>
      <path d="M6 3h9l4 4v14H6z" />
      <path d="M15 3v4h4" />
      <path d="M9 17v-3M12 17v-6M15 17v-4" />
    </>
  ),
  teacher: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 20c.6-3.4 2.8-5.5 5.5-5.5s4.9 2.1 5.5 5.5" />
      <path d="M15 5h6v7h-4" />
    </>
  ),
  reader: (
    <>
      <path d="M4 9v6h3l5 4V5L7 9z" />
      <path d="M16 9a4 4 0 0 1 0 6M18.5 6.5a7.5 7.5 0 0 1 0 11" />
    </>
  ),
  drill: (
    <>
      <path d="M13 3L5 14h6l-1 7 8-11h-6z" />
    </>
  ),
  shield: (
    <>
      <path d="M12 3l7 3v5c0 4.5-3 8-7 10-4-2-7-5.5-7-10V6z" />
      <path d="M9 12l2 2 4-4" />
    </>
  ),
};

export function FeatureIcon({ name, size = 24 }: { name: keyof typeof FEATURE_PATHS | string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="lw-icon">
      {FEATURE_PATHS[name] ?? FEATURE_PATHS.check}
    </svg>
  );
}

/** A grade-band label with its identity color. The text always names the band; color is a secondary cue. */
export function BandChip({ band, short = false }: { band: string; short?: boolean }) {
  return (
    <span className="lw-band" data-band={band}>
      <span className="lw-band-dot" aria-hidden="true" />
      {short ? band.replace('-', '–') : BAND_LABELS[band]}
    </span>
  );
}

const LADDER = ['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
const bandOf = (g: string) => (['K', '1', '2'].includes(g) ? 'K-2' : Number(g) <= 5 ? '3-5' : Number(g) <= 8 ? '6-8' : Number(g) <= 10 ? '9-10' : '11-12');

/** Kindergarten to grade 12 as a rising staircase; the current grade is raised and labeled. */
export function GradeLadder({ current, slugFor }: { current: string; slugFor: (g: string) => string }) {
  return (
    <nav aria-label="All grades" className="lw-ladder">
      <ol>
        {LADDER.map((g, i) => (
          <li key={g} data-band={bandOf(g)} data-current={g === current || undefined} style={{ ['--step' as string]: i }}>
            <Link href={`/learn/grades/${slugFor(g)}`} aria-current={g === current ? 'page' : undefined} aria-label={g === 'K' ? 'Kindergarten' : `Grade ${g}`}>
              <span className="lw-ladder-bar" aria-hidden="true" />
              <span className="lw-ladder-label">{g}</span>
            </Link>
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Small scene for each band on the home page: what writing looks like at that age. */
export function BandScene({ band }: { band: string }) {
  const scenes: Record<string, ReactNode> = {
    'K-2': (
      <>
        <rect x="8" y="10" width="34" height="26" rx="4" className="lw-scene-paper" />
        <circle cx="25" cy="22" r="6" className="lw-scene-accent" />
        <path d="M18 31h14" className="lw-scene-line" />
        <rect x="48" y="10" width="34" height="26" rx="4" className="lw-scene-paper" />
        <path d="M58 30l7-12 7 12z" className="lw-scene-accent" />
        <rect x="88" y="10" width="34" height="26" rx="4" className="lw-scene-paper" />
        <path d="M105 32v-14M100 22l5-4 5 4" className="lw-scene-line" />
        <path d="M14 48h102" className="lw-scene-line lw-scene-dash" />
      </>
    ),
    '3-5': (
      <>
        <rect x="20" y="6" width="90" height="48" rx="5" className="lw-scene-paper" />
        <path d="M30 18h60M30 26h70M30 34h52M30 42h64" className="lw-scene-line" />
        <rect x="28" y="22" width="44" height="8" rx="2" className="lw-scene-mark" />
      </>
    ),
    '6-8': (
      <>
        <rect x="10" y="8" width="70" height="44" rx="5" className="lw-scene-paper" />
        <path d="M20 20h40M20 28h50M20 36h34" className="lw-scene-line" />
        <circle cx="100" cy="26" r="13" className="lw-scene-ring" />
        <path d="M109 35l9 9" className="lw-scene-line" />
        <path d="M94 26h12" className="lw-scene-line" />
      </>
    ),
    '9-10': (
      <>
        <rect x="8" y="8" width="44" height="30" rx="4" className="lw-scene-paper" />
        <path d="M15 17h28M15 24h22" className="lw-scene-line" />
        <rect x="78" y="8" width="44" height="30" rx="4" className="lw-scene-paper" />
        <path d="M85 17h28M85 24h22" className="lw-scene-line" />
        <path d="M65 22v28M52 50h26M44 30h42" className="lw-scene-line" />
        <path d="M44 30l-6 12h12zM86 30l-6 12h12z" className="lw-scene-accent" />
      </>
    ),
    '11-12': (
      <>
        <rect x="6" y="6" width="34" height="22" rx="4" className="lw-scene-paper" />
        <rect x="6" y="34" width="34" height="22" rx="4" className="lw-scene-paper" />
        <path d="M40 17c18 0 18 14 34 14M40 45c18 0 18-14 34-14" className="lw-scene-line" />
        <rect x="74" y="16" width="50" height="30" rx="5" className="lw-scene-paper" />
        <path d="M82 26h34M82 34h26" className="lw-scene-line" />
        <circle cx="117" cy="40" r="3" className="lw-scene-accent" />
      </>
    ),
  };
  return (
    <svg viewBox="0 0 130 60" className="lw-scene" data-band={band} aria-hidden="true">
      {scenes[band]}
    </svg>
  );
}
