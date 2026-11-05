import {
  DRILLS,
  getRubric,
  getSkill,
  LESSONS,
  PROMPTS,
  type GradeBand,
  type Topic,
  type WritingPrompt,
} from './content';
import {
  skillProgress,
  type EvidenceRow,
  type SkillProgress,
} from './progress';

export const PLAN_DAYS = 14;

export interface PlanAttempt {
  promptId: string;
  attemptNumber: number;
  createdAt: Date;
}

export interface PlanInput {
  band: GradeBand;
  rows: EvidenceRow[];
  attempts: PlanAttempt[];
  sessionsPerWeek: number;
  interests: Topic[];
  /** Set by a parent or teacher to override the automatic goal. */
  focusSkillId: string | null;
  planStartedAt: Date | null;
  drillCompletions: Record<string, string>;
  now: Date;
}

export type PlanItemKind =
  | 'check_in'
  | 'lesson'
  | 'prompt'
  | 'drill'
  | 'checkpoint';

export interface PlanItem {
  key: string;
  kind: PlanItemKind;
  week: 1 | 2;
  title: string;
  minutes: number;
  skillId: string | null;
  promptId: string | null;
  lessonId: string | null;
  drillId: string | null;
  reason: string;
  done: boolean;
  /** For free-choice prompts: an equivalent option the student can pick instead. */
  alternative: { promptId: string; title: string } | null;
}

export interface Plan {
  status: 'check_in' | 'active' | 'complete';
  startedAt: Date | null;
  endsAt: Date | null;
  sessionsPerWeek: number;
  mainGoal: {
    skillId: string;
    name: string;
    latestRating: number | null;
  } | null;
  maintenance: { skillId: string; name: string } | null;
  focusSetByAdult: boolean;
  items: PlanItem[];
  next: PlanItem | null;
}

const PROMPT_MINUTES: Record<GradeBand, number> = {
  'K-2': 10,
  '3-5': 20,
  '6-8': 25,
  '9-10': 35,
  '11-12': 40,
};
const promptMinutes = (p: WritingPrompt) => PROMPT_MINUTES[p.band];
const scores = (p: WritingPrompt, skillId: string) =>
  !!getRubric(p.rubricId)?.dimensions.some((d) => d.skillId === skillId);
const topicMatch = (p: WritingPrompt, interests: Topic[]) =>
  (p.topics ?? []).filter((t) => interests.includes(t)).length;

/**
 * The two-week practice plan. Deterministic and built only from the reviewed catalog:
 * one main goal (the weakest skill with a lesson, or an adult's chosen focus), one
 * maintenance goal (a skill already going well), and an independent checkpoint at the end.
 *
 * Choices use the evidence and prompts from before the plan started, so the plan stays
 * stable while the student works through it; work done since then only ticks items off.
 */
export function buildPlan(input: PlanInput): Plan {
  const { band, sessionsPerWeek, interests, now } = input;
  const bandPrompts = PROMPTS.filter((p) => p.band === band);
  const checkIns = bandPrompts.filter((p) => p.checkIn);
  const attemptedEver = new Set(input.attempts.map((a) => a.promptId));

  const base = {
    sessionsPerWeek,
    focusSetByAdult: false,
    mainGoal: null,
    maintenance: null,
  };

  // 1. Writing check-in comes first.
  if (checkIns.some((p) => !attemptedEver.has(p.id))) {
    const items: PlanItem[] = checkIns.map((p, i) => ({
      key: `check-in:${p.id}`,
      kind: 'check_in',
      week: 1,
      title: `Writing check-in ${i + 1} of ${checkIns.length}: ${p.title}`,
      minutes: promptMinutes(p),
      skillId: null,
      promptId: p.id,
      lessonId: null,
      drillId: null,
      reason:
        'Short independent pieces that show what you already do well. No hints, no timer.',
      done: attemptedEver.has(p.id),
      alternative: null,
    }));
    return {
      ...base,
      status: 'check_in',
      startedAt: null,
      endsAt: null,
      items,
      next: items.find((i) => !i.done) ?? null,
    };
  }

  const startedAt = input.planStartedAt ?? now;
  const endsAt = new Date(startedAt.getTime() + PLAN_DAYS * 86_400_000);
  // Compare at whole-second precision: some databases store creation times to the second,
  // so work done in the same second the plan started must count as part of the plan.
  const startSecond = Math.floor(startedAt.getTime() / 1000) * 1000;
  const before = (d: Date) => d.getTime() < startSecond;
  const attemptedBefore = new Set(
    input.attempts.filter((a) => before(a.createdAt)).map((a) => a.promptId),
  );
  const doneSince = new Set(
    input.attempts
      .filter((a) => !before(a.createdAt) && a.attemptNumber === 1)
      .map((a) => a.promptId),
  );
  // If the plan start is "now", every check-in piece counts as earlier evidence.
  const rowsBefore = input.rows.filter(
    (r) => before(r.createdAt) || !input.planStartedAt,
  );
  const progress = skillProgress(
    band,
    rowsBefore.length ? rowsBefore : input.rows,
    startedAt,
  );

  const lessonSkills = new Set(
    LESSONS.filter((l) => l.band === band).map((l) => l.skillId),
  );
  const order = progress.map((p) => p.skillId);
  const byNeed = progress
    .filter((p) => lessonSkills.has(p.skillId) && p.latestRating !== null)
    .sort(
      (a, b) =>
        Number(a.state === 'demonstrated') -
          Number(b.state === 'demonstrated') ||
        a.latestRating! - b.latestRating! ||
        a.demonstratedOn - b.demonstratedOn ||
        order.indexOf(a.skillId) - order.indexOf(b.skillId),
    );

  const focus =
    input.focusSkillId && lessonSkills.has(input.focusSkillId)
      ? progress.find((p) => p.skillId === input.focusSkillId)
      : undefined;
  const main: SkillProgress | undefined = focus ?? byNeed[0];
  const maintenance = progress
    .filter((p) => p.skillId !== main?.skillId && p.latestRating !== null)
    .sort(
      (a, b) =>
        (b.latestRating ?? 0) - (a.latestRating ?? 0) ||
        order.indexOf(a.skillId) - order.indexOf(b.skillId),
    )[0];

  if (!main) {
    return {
      ...base,
      status: 'complete',
      startedAt,
      endsAt,
      items: [],
      next: null,
    };
  }

  const used = new Set<string>();
  const freshPrompts = (skillId: string, exclude: Set<string>) =>
    bandPrompts
      .filter(
        (p) =>
          !p.checkIn &&
          !p.checkpoint &&
          !attemptedBefore.has(p.id) &&
          !exclude.has(p.id) &&
          scores(p, skillId),
      )
      .sort(
        (a, b) =>
          Number(b.targetSkills.includes(skillId)) -
            Number(a.targetSkills.includes(skillId)) ||
          topicMatch(b, interests) - topicMatch(a, interests) ||
          bandPrompts.indexOf(a) - bandPrompts.indexOf(b),
      );

  const promptItem = (
    skillId: string,
    reason: string,
    key: string,
  ): PlanItem | null => {
    const [first, second] = freshPrompts(skillId, used);
    if (!first) return null;
    used.add(first.id);
    // The alternative is reserved too, so it never reappears as a later item.
    if (second) used.add(second.id);
    return {
      key,
      kind: 'prompt',
      week: 1,
      title: first.title,
      minutes: promptMinutes(first),
      skillId,
      promptId: first.id,
      lessonId: null,
      drillId: null,
      reason,
      done:
        doneSince.has(first.id) || (second ? doneSince.has(second.id) : false),
      alternative: second ? { promptId: second.id, title: second.title } : null,
    };
  };

  const mainName = (getSkill(main.skillId)?.name ?? main.skillId).toLowerCase();
  const candidates: (PlanItem | null)[] = [];

  // Lesson for the main goal, with its own practice prompt.
  const lesson =
    LESSONS.find(
      (l) =>
        l.band === band &&
        l.skillId === main.skillId &&
        !attemptedBefore.has(l.practicePromptId),
    ) ?? LESSONS.find((l) => l.band === band && l.skillId === main.skillId);
  if (lesson) {
    used.add(lesson.practicePromptId);
    candidates.push({
      key: `lesson:${lesson.id}`,
      kind: 'lesson',
      week: 1,
      title: `Lesson: ${lesson.title}`,
      minutes: lesson.minutes + 15,
      skillId: main.skillId,
      promptId: lesson.practicePromptId,
      lessonId: lesson.id,
      drillId: null,
      reason: focus
        ? `Your teacher or parent chose ${mainName} as your focus.`
        : `Your recent writing showed level ${main.latestRating} of 4 for ${mainName}, so this is your main goal.`,
      done: doneSince.has(lesson.practicePromptId),
      alternative: null,
    });
  }

  const drillFor = (skillId: string, key: string): PlanItem | null => {
    const drill = DRILLS.find((d) => d.band === band && d.skillId === skillId);
    if (!drill) return null;
    const completed = input.drillCompletions[drill.id];
    return {
      key,
      kind: 'drill',
      week: 1,
      title: `Quick practice: ${drill.title}`,
      minutes: 5,
      skillId,
      promptId: null,
      lessonId: null,
      drillId: drill.id,
      reason: 'Five minutes of sentence-level practice for this skill.',
      done: !!completed && !before(new Date(completed)),
      alternative: null,
    };
  };

  candidates.push(drillFor(main.skillId, 'drill:main'));
  candidates.push(
    promptItem(
      main.skillId,
      `Use ${mainName} on a new topic.`,
      'prompt:main-1',
    ),
  );
  if (maintenance) {
    candidates.push(
      promptItem(
        maintenance.skillId,
        `Keep ${(getSkill(maintenance.skillId)?.name ?? maintenance.skillId).toLowerCase()} strong (your maintenance goal) while you work on ${mainName}.`,
        'prompt:maintenance',
      ),
    );
  }
  candidates.push(
    promptItem(
      main.skillId,
      `One more try at ${mainName}, with a different kind of writing if you can.`,
      'prompt:main-2',
    ),
  );
  if (maintenance)
    candidates.push(drillFor(maintenance.skillId, 'drill:maintenance'));
  candidates.push(
    promptItem(
      main.skillId,
      `Extra practice for ${mainName}.`,
      'prompt:main-3',
    ),
  );

  // The plan always ends with an unseen, independent checkpoint for the main goal.
  const checkpoint =
    bandPrompts.find(
      (p) =>
        p.checkpoint &&
        !attemptedBefore.has(p.id) &&
        p.targetSkills.includes(main.skillId),
    ) ??
    bandPrompts.find(
      (p) =>
        p.checkpoint && !attemptedBefore.has(p.id) && scores(p, main.skillId),
    );

  const total = Math.max(4, Math.min(8, sessionsPerWeek * 2));
  const items = candidates
    .filter((c): c is PlanItem => !!c)
    .slice(0, checkpoint ? total - 1 : total);
  if (checkpoint) {
    items.push({
      key: `checkpoint:${checkpoint.id}`,
      kind: 'checkpoint',
      week: 2,
      title: `Checkpoint: ${checkpoint.title}`,
      minutes: promptMinutes(checkpoint),
      skillId: main.skillId,
      promptId: checkpoint.id,
      lessonId: null,
      drillId: null,
      reason: `Write this one on your own (no hints) to show ${mainName} on a brand-new prompt.`,
      done: doneSince.has(checkpoint.id),
      alternative: null,
    });
  }
  const half = Math.ceil(items.length / 2);
  items.forEach((item, i) => (item.week = i < half ? 1 : 2));

  const allDone = items.length > 0 && items.every((i) => i.done);
  const expired = now.getTime() > endsAt.getTime();
  return {
    ...base,
    status: allDone || expired ? 'complete' : 'active',
    startedAt,
    endsAt,
    mainGoal: {
      skillId: main.skillId,
      name: getSkill(main.skillId)?.name ?? main.skillId,
      latestRating: main.latestRating,
    },
    maintenance: maintenance
      ? {
          skillId: maintenance.skillId,
          name: getSkill(maintenance.skillId)?.name ?? maintenance.skillId,
        }
      : null,
    focusSetByAdult: !!focus,
    items,
    next: items.find((i) => !i.done) ?? null,
  };
}
