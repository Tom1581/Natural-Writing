import { LESSONS, PROMPTS, RUBRICS, getSkill, type GradeBand } from './content';

export interface EvidenceRow {
  skillId: string;
  promptId: string;
  rating: number;
  independent: boolean;
  createdAt: Date;
}

/**
 * not_observed → practicing → demonstrated → check_due. "check_due" means the skill was
 * shown, but not recently: a fresh, independent checkpoint keeps it current.
 */
export type SkillState =
  | 'not_observed'
  | 'practicing'
  | 'demonstrated'
  | 'check_due';

/** How long a demonstrated skill stays current before a check is due. */
export const CHECK_DUE_DAYS = 28;

export interface SkillProgress {
  skillId: string;
  name: string;
  state: SkillState;
  /** Most recent independent rating, or the most recent rating of any kind if none is independent. */
  latestRating: number | null;
  /** Distinct prompts where an independent first attempt reached level 3 or 4. */
  demonstratedOn: number;
}

const dayKey = (d: Date) => d.toISOString().slice(0, 10);

/**
 * Pilot mastery rule: a skill is "demonstrated" after level 3+ on two different
 * prompts, on two different days, from independent first attempts. Revisions of
 * the same draft show revision progress but never count toward this.
 */
export function skillProgress(
  band: GradeBand,
  rows: EvidenceRow[],
  now: Date = new Date(),
): SkillProgress[] {
  const skillIds = [
    ...new Set(
      RUBRICS.filter((r) => r.band === band).flatMap((r) =>
        r.dimensions.map((d) => d.skillId),
      ),
    ),
  ];
  return skillIds.map((skillId) => {
    const forSkill = rows
      .filter((r) => r.skillId === skillId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    const independent = forSkill.filter((r) => r.independent);
    const latest = (independent.length ? independent : forSkill).at(-1);

    const strong = independent.filter((r) => r.rating >= 3);
    const prompts = new Set(strong.map((r) => r.promptId));
    const days = new Set(strong.map((r) => dayKey(r.createdAt)));
    const demonstrated = prompts.size >= 2 && days.size >= 2;
    const lastStrong = strong.at(-1)?.createdAt;
    const stale =
      !!lastStrong &&
      now.getTime() - lastStrong.getTime() > CHECK_DUE_DAYS * 86_400_000;

    return {
      skillId,
      name: getSkill(skillId)?.name ?? skillId,
      state:
        forSkill.length === 0
          ? 'not_observed'
          : demonstrated
            ? stale
              ? 'check_due'
              : 'demonstrated'
            : 'practicing',
      latestRating: latest?.rating ?? null,
      demonstratedOn: prompts.size,
    };
  });
}

export interface Recommendation {
  kind: 'check_in' | 'lesson' | 'prompt' | 'done';
  promptId: string | null;
  lessonId: string | null;
  skillId: string | null;
  reason: string;
}

/**
 * Deterministic next-step rule. It only picks from the reviewed catalog, so the AI
 * never invents curriculum or decides a student's level.
 */
export function recommendNext(
  band: GradeBand,
  rows: EvidenceRow[],
  attemptedPromptIds: string[],
): Recommendation {
  const attempted = new Set(attemptedPromptIds);
  const bandPrompts = PROMPTS.filter((p) => p.band === band);

  // Writing check-in: every check-in prompt for the band (one opinion/argument, one narrative)
  // before any lesson, so the first plan rests on more than one piece of writing.
  const checkIns = bandPrompts.filter((p) => p.checkIn);
  const nextCheckIn = checkIns.find((p) => !attempted.has(p.id));
  if (nextCheckIn) {
    const done =
      checkIns.length - checkIns.filter((p) => !attempted.has(p.id)).length;
    return {
      kind: 'check_in',
      promptId: nextCheckIn.id,
      lessonId: null,
      skillId: null,
      reason:
        done === 0
          ? `Start with a writing check-in (${checkIns.length} short pieces). It shows what you already do well and what to practice first.`
          : `Check-in ${done + 1} of ${checkIns.length}: a different kind of writing, so your plan is based on more than one piece.`,
    };
  }
  if (rows.length === 0) {
    return {
      kind: 'prompt',
      promptId:
        bandPrompts.find((p) => !p.checkIn && !attempted.has(p.id))?.id ?? null,
      lessonId: null,
      skillId: null,
      reason:
        'Your check-in feedback is still on its way. Meanwhile, try a new prompt.',
    };
  }

  const progress = skillProgress(band, rows);
  const lessonSkills = new Set(
    LESSONS.filter((l) => l.band === band).map((l) => l.skillId),
  );
  const order = progress.map((p) => p.skillId);
  const candidates = progress
    .filter(
      (p) =>
        p.state !== 'demonstrated' &&
        p.latestRating !== null &&
        lessonSkills.has(p.skillId),
    )
    .sort(
      (a, b) =>
        a.latestRating! - b.latestRating! ||
        a.demonstratedOn - b.demonstratedOn ||
        order.indexOf(a.skillId) - order.indexOf(b.skillId),
    );

  const target = candidates[0];
  if (target) {
    const lesson = LESSONS.find(
      (l) => l.band === band && l.skillId === target.skillId,
    )!;
    const reason = `Your recent writing showed level ${target.latestRating} of 4 for ${target.name.toLowerCase()}. This lesson practices exactly that.`;
    if (!attempted.has(lesson.practicePromptId)) {
      return {
        kind: 'lesson',
        promptId: lesson.practicePromptId,
        lessonId: lesson.id,
        skillId: target.skillId,
        reason,
      };
    }
    // Lesson already practiced: transfer the skill to a fresh prompt that scores it.
    const fresh =
      bandPrompts.find(
        (p) => !attempted.has(p.id) && p.targetSkills.includes(target.skillId),
      ) ??
      bandPrompts.find(
        (p) =>
          !attempted.has(p.id) &&
          RUBRICS.find((r) => r.id === p.rubricId)?.dimensions.some(
            (d) => d.skillId === target.skillId,
          ),
      );
    if (fresh) {
      return {
        kind: 'prompt',
        promptId: fresh.id,
        lessonId: lesson.id,
        skillId: target.skillId,
        reason: `Try ${target.name.toLowerCase()} on a new topic. Showing it on a fresh prompt is how you know you've got it.`,
      };
    }
  }

  const next = bandPrompts.find((p) => !attempted.has(p.id));
  if (next) {
    return {
      kind: 'prompt',
      promptId: next.id,
      lessonId: null,
      skillId: null,
      reason: 'Keep your skills sharp with a new prompt.',
    };
  }
  return {
    kind: 'done',
    promptId: null,
    lessonId: null,
    skillId: null,
    reason:
      'You have tried every prompt for your grade band. Revise a favorite piece, or check back for new prompts.',
  };
}
