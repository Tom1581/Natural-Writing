/**
 * The writing skills the AI Humanizer edits for, each paired with the Writing Studio lesson and
 * practice set that teach it. This is the one place the two products meet in content: the
 * humanizer's results panel, its page copy, the Phrase Checker and the blog all read from here,
 * so a link never points at a lesson that was renamed in only one of them.
 *
 * Lesson and practice ids come from the learning catalog (backend/src/learning/content).
 */

export type BridgeSkillId = 'rhythm' | 'word-choice' | 'concision' | 'transitions' | 'certainty' | 'sources';

export interface BridgeLink {
  href: string;
  title: string;
  /** Shown before the title, e.g. "Lesson · 12 min". */
  kind: string;
}

export interface BridgeSkill {
  id: BridgeSkillId;
  /** The skill's everyday name. */
  skill: string;
  /** What the humanizer changes, in one plain sentence. */
  edit: string;
  /** How a writer does the same thing by hand. */
  byHand: string;
  lesson: BridgeLink;
  practice?: BridgeLink;
}

export const BRIDGE_SKILLS: BridgeSkill[] = [
  {
    id: 'rhythm',
    skill: 'Sentence variety',
    edit: 'Breaks up runs of same-length sentences so the rhythm changes.',
    byHand: 'Follow a long sentence with a short one, and join two related sentences with a clause.',
    lesson: { href: '/learn/lessons/g910-sentence-variety', title: 'Phrases, clauses and pace', kind: 'Lesson · 12 min' },
    practice: { href: '/learn/practice/d68-combine-sentences', title: 'Combine sentences to show relationships', kind: 'Practice set · 5 min' },
  },
  {
    id: 'word-choice',
    skill: 'Precise word choice',
    edit: 'Swaps stock phrases such as “delve into” and “plays a crucial role” for plain, specific words.',
    byHand: 'Ask what the phrase actually claims, then say that with the most exact word you have.',
    lesson: { href: '/learn/lessons/g910-audience-style', title: 'Words that fit the reader', kind: 'Lesson · 12 min' },
    practice: { href: '/learn/practice/d68-precise-language', title: 'Precise and formal language', kind: 'Practice set · 5 min' },
  },
  {
    id: 'concision',
    skill: 'Concision',
    edit: 'Turns noun-heavy phrases (“the implementation of”) back into direct verbs (“implementing”).',
    byHand: 'Find the action hiding inside a noun and make it the verb of the sentence.',
    lesson: { href: '/learn/practice/d1112-concision', title: 'Cut the padding', kind: 'Practice set · 5 min' },
  },
  {
    id: 'transitions',
    skill: 'Transitions',
    edit: 'Cuts signposts such as “Furthermore” and “Moreover” where the link between ideas is already clear.',
    byHand: 'Keep a transition only when it names the real relationship: cause, contrast or example.',
    lesson: { href: '/learn/lessons/g68-transitions', title: 'Transitions that show connections', kind: 'Lesson · 12 min' },
    practice: { href: '/learn/practice/d68-transitions', title: 'Transitions that show relationships', kind: 'Practice set · 5 min' },
  },
  {
    id: 'certainty',
    skill: 'Claim strength',
    edit: 'Can drop cautious words. “May be associated with” must not become “causes”.',
    byHand: 'Match each claim to its evidence, and keep “may”, “suggests” or “in this sample” where the evidence is limited.',
    lesson: { href: '/learn/lessons/g1112-nuance', title: 'Words that carry the right certainty', kind: 'Lesson · 12 min' },
    practice: { href: '/learn/practice/d1112-qualify-claims', title: 'Qualify a claim', kind: 'Practice set · 5 min' },
  },
  {
    id: 'sources',
    skill: 'Citations and numbers',
    edit: 'Checks common citation and number patterns after rewriting. It cannot check every format.',
    byHand: 'Compare every citation, figure and date with your original before you use a rewrite.',
    lesson: { href: '/learn/lessons/g1112-cite-consistently', title: 'Clean, consistent citation', kind: 'Lesson · 12 min' },
    practice: { href: '/learn/practice/d910-integrate-quotes', title: 'Introduce, quote, explain', kind: 'Practice set · 5 min' },
  },
];

export const bridgeSkill = (id: BridgeSkillId) => BRIDGE_SKILLS.find((s) => s.id === id)!;

/** The numbers the humanizer already reports for a text, before and after a rewrite. */
export interface BridgeMetrics {
  burstiness: number;
  transitionOveruse: number;
  nominalizationDensity: number;
  hedgeDensity: number;
  sentenceCount: number;
  aiTells: { phrase: string; count: number }[];
}

export interface BridgeChange {
  skill: BridgeSkill;
  /** What moved in this rewrite, with the before and after figures. */
  change: string;
  /** True for things the writer must check by hand, as opposed to edits that were made. */
  check?: boolean;
}

const tellCount = (m: BridgeMetrics) => m.aiTells.reduce((n, t) => n + t.count, 0);
const pct1 = (n: number) => `${(n * 100).toFixed(1)}%`;

/**
 * Names the skill behind each measurable difference between a draft and its rewrite. Only real
 * movements are listed; the two "check it yourself" items are always included because a rewrite
 * can weaken a claim's caution or disturb a citation without any metric showing it.
 */
export function describeChanges(before: BridgeMetrics, after: BridgeMetrics): BridgeChange[] {
  const changes: BridgeChange[] = [];

  if (after.burstiness - before.burstiness >= 0.03) {
    changes.push({
      skill: bridgeSkill('rhythm'),
      change: `Sentence lengths vary more: ${before.burstiness.toFixed(2)} → ${after.burstiness.toFixed(2)} (higher means a less even rhythm).`,
    });
  }

  const tellsBefore = tellCount(before);
  const tellsAfter = tellCount(after);
  if (tellsBefore > 0 && tellsAfter < tellsBefore) {
    changes.push({
      skill: bridgeSkill('word-choice'),
      change: `Stock phrases: ${tellsBefore} → ${tellsAfter}.`,
    });
  }

  if (before.nominalizationDensity > 0 && after.nominalizationDensity <= before.nominalizationDensity * 0.9) {
    changes.push({
      skill: bridgeSkill('concision'),
      change: `Noun-heavy words (-tion, -ment, -ness): ${pct1(before.nominalizationDensity)} → ${pct1(after.nominalizationDensity)} of the text.`,
    });
  }

  const transitionsBefore = Math.round(before.transitionOveruse * before.sentenceCount);
  const transitionsAfter = Math.round(after.transitionOveruse * after.sentenceCount);
  if (transitionsBefore > 0 && transitionsAfter < transitionsBefore) {
    changes.push({
      skill: bridgeSkill('transitions'),
      change: `Signpost transitions: ${transitionsBefore} → ${transitionsAfter}.`,
    });
  }

  const hedgesDropped = before.hedgeDensity > 0 && after.hedgeDensity <= before.hedgeDensity * 0.7;
  changes.push({
    skill: bridgeSkill('certainty'),
    change: hedgesDropped
      ? 'Some cautious wording was removed. Check that no “may” or “suggests” turned into a firmer claim.'
      : 'Check that no cautious claim became a firmer one.',
    check: true,
  });
  changes.push({
    skill: bridgeSkill('sources'),
    change: 'Compare every citation, number and date with your original.',
    check: true,
  });

  return changes;
}
