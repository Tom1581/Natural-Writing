import { DRILLS as UPPER_ELEMENTARY_DRILLS } from './drills';
import { EXAMPLES } from './examples';
import { MORE_DRILLS } from './more-drills';
import {
  EARLY_DRILLS,
  EARLY_LESSONS,
  EARLY_PROMPTS,
  EARLY_RUBRICS,
} from './early';
import {
  HIGH_SCHOOL_DRILLS,
  HIGH_SCHOOL_LESSONS,
  HIGH_SCHOOL_PROMPTS,
  HIGH_SCHOOL_RUBRICS,
} from './high-school';
import { alignmentIds, FRAMEWORKS, type AlignmentSkill } from './frameworks';
import { LESSONS as GRADE_3_8_LESSONS } from './lessons';
import { PROMPTS as GRADE_3_8_PROMPTS } from './prompts';
import { RUBRICS as GRADE_3_8_RUBRICS, SKILLS } from './rubrics';
import { STANDARD_STATEMENTS } from './standards.data';
import {
  TOPICS,
  type DrillSet,
  type GradeBand,
  type Lesson,
  type Rubric,
  type Skill,
  type WritingPrompt,
} from './types';

export * from './types';
export * from './frameworks';

export const RUBRICS: Rubric[] = [
  ...EARLY_RUBRICS,
  ...GRADE_3_8_RUBRICS,
  ...HIGH_SCHOOL_RUBRICS,
];
export const PROMPTS: WritingPrompt[] = [
  ...EARLY_PROMPTS,
  ...GRADE_3_8_PROMPTS,
  ...HIGH_SCHOOL_PROMPTS,
];
export const LESSONS: Lesson[] = [
  ...EARLY_LESSONS,
  ...GRADE_3_8_LESSONS,
  ...HIGH_SCHOOL_LESSONS,
];
export const DRILLS: DrillSet[] = [
  ...EARLY_DRILLS,
  ...UPPER_ELEMENTARY_DRILLS,
  ...HIGH_SCHOOL_DRILLS,
  ...MORE_DRILLS,
];
export { EXAMPLES, SKILLS, STANDARD_STATEMENTS };
export type { WritingExample } from './examples';

export interface BandInfo {
  id: GradeBand;
  label: string;
  /** US-equivalent grades in the band, in order. */
  grades: string[];
  /**
   * `early_access`: the full learning loop works, but feedback has not yet been checked
   * against teacher-rated samples for this band. Shown to adults on every result.
   */
  status: 'available' | 'early_access';
  /** How the band works differently, for adults. */
  note: string;
}

export const BANDS: BandInfo[] = [
  {
    id: 'K-2',
    label: 'Kindergarten–Grade 2',
    grades: ['K', '1', '2'],
    status: 'early_access',
    note: 'Children talk about pictures first, then write, draw or tell their ideas while an adult types them. Feedback is short, read aloud, and judges ideas and order, not handwriting.',
  },
  {
    id: '3-5',
    label: 'Grades 3–5',
    grades: ['3', '4', '5'],
    status: 'available',
    note: 'Paragraphs, reasons with examples, story order and sentence control.',
  },
  {
    id: '6-8',
    label: 'Grades 6–8',
    grades: ['6', '7', '8'],
    status: 'available',
    note: 'Claims and evidence, explaining significance, cohesion and controlled style.',
  },
  {
    id: '9-10',
    label: 'Grades 9–10',
    grades: ['9', '10'],
    status: 'early_access',
    note: 'Source-based argument with counterclaims, analytical explanation and narrative craft. Sources are supplied with each task.',
  },
  {
    id: '11-12',
    label: 'Grades 11–12',
    grades: ['11', '12'],
    status: 'early_access',
    note: 'Synthesis of sources that disagree, qualified claims, and writing for a specific audience.',
  },
];

/** Grades with a complete learning loop in this release (US-equivalent numbering). */
export const SUPPORTED_GRADES = BANDS.flatMap((b) => b.grades);

export function bandForGrade(grade: string): GradeBand | null {
  return BANDS.find((b) => b.grades.includes(grade))?.id ?? null;
}

export const getBand = (id: string): BandInfo | undefined =>
  BANDS.find((b) => b.id === id);

export const getSkill = (id: string): Skill | undefined =>
  SKILLS.find((s) => s.id === id);
export const getRubric = (id: string): Rubric | undefined =>
  RUBRICS.find((r) => r.id === id);
export const getPrompt = (id: string): WritingPrompt | undefined =>
  PROMPTS.find((p) => p.id === id);
export const getLesson = (id: string): Lesson | undefined =>
  LESSONS.find((l) => l.id === id);
export const getDrill = (id: string): DrillSet | undefined =>
  DRILLS.find((d) => d.id === id);
export const getExample = (id: string) => EXAMPLES.find((e) => e.id === id);

export const GRADES_IN_BAND = Object.fromEntries(
  BANDS.map((b) => [b.id, b.grades]),
) as Record<GradeBand, string[]>;

/**
 * Checks every cross-reference in the catalog. Returns a list of problems (empty when valid);
 * the spec suite fails on any problem so broken content cannot ship.
 */
export function validateCatalog(): string[] {
  const problems: string[] = [];
  const unique = (label: string, ids: string[]) => {
    const seen = new Set<string>();
    for (const id of ids) {
      if (seen.has(id)) problems.push(`Duplicate ${label} id: ${id}`);
      seen.add(id);
    }
  };
  unique(
    'skill',
    SKILLS.map((s) => s.id),
  );
  unique(
    'rubric',
    RUBRICS.map((r) => r.id),
  );
  unique(
    'prompt',
    PROMPTS.map((p) => p.id),
  );
  unique(
    'lesson',
    LESSONS.map((l) => l.id),
  );

  const approvedNeedsReviewer = (
    label: string,
    review: { status: string; reviewer?: string; date?: string },
  ) => {
    if (review.status === 'approved' && (!review.reviewer || !review.date))
      problems.push(`${label} is approved without a named reviewer and date`);
  };

  for (const rubric of RUBRICS) {
    approvedNeedsReviewer(`Rubric ${rubric.id}`, rubric.review);
    const skillIds = rubric.dimensions.map((d) => d.skillId);
    for (const id of skillIds)
      if (!getSkill(id))
        problems.push(`Rubric ${rubric.id} uses unknown skill ${id}`);
    for (const anchor of rubric.anchors) {
      for (const [skillId, rating] of Object.entries(anchor.ratings)) {
        if (!skillIds.includes(skillId))
          problems.push(
            `Rubric ${rubric.id} anchor rates skill ${skillId} outside the rubric`,
          );
        if (![1, 2, 3, 4].includes(rating))
          problems.push(`Rubric ${rubric.id} anchor has rating ${rating}`);
      }
    }
  }

  for (const prompt of PROMPTS) {
    approvedNeedsReviewer(`Prompt ${prompt.id}`, prompt.review);
    const rubric = getRubric(prompt.rubricId);
    if (!rubric) {
      problems.push(
        `Prompt ${prompt.id} uses unknown rubric ${prompt.rubricId}`,
      );
      continue;
    }
    if (rubric.band !== prompt.band || rubric.genre !== prompt.genre)
      problems.push(
        `Prompt ${prompt.id} band/genre does not match rubric ${rubric.id}`,
      );
    for (const id of prompt.targetSkills) {
      if (!rubric.dimensions.some((d) => d.skillId === id))
        problems.push(
          `Prompt ${prompt.id} targets ${id}, which rubric ${rubric.id} does not score`,
        );
    }
    if (prompt.suggestedWords.min >= prompt.suggestedWords.max)
      problems.push(`Prompt ${prompt.id} has an invalid word range`);
    if (prompt.checkIn && prompt.checkpoint)
      problems.push(
        `Prompt ${prompt.id} cannot be both a check-in and a checkpoint`,
      );
    if (
      !prompt.successCriteria.length ||
      prompt.successCriteria.some((c) => !c)
    )
      problems.push(`Prompt ${prompt.id} has an empty success criterion`);
    if (prompt.band === 'K-2' && !prompt.picture && !prompt.checkIn)
      problems.push(`K–2 prompt ${prompt.id} needs a picture set`);
    if (prompt.band === 'K-2' && !prompt.adultGuide)
      problems.push(`K–2 prompt ${prompt.id} needs guidance for the adult`);
    for (const t of prompt.topics ?? [])
      if (!(TOPICS as readonly string[]).includes(t))
        problems.push(`Prompt ${prompt.id} has unknown topic ${t}`);
  }

  for (const lesson of LESSONS) {
    approvedNeedsReviewer(`Lesson ${lesson.id}`, lesson.review);
    if (!getSkill(lesson.skillId))
      problems.push(`Lesson ${lesson.id} uses unknown skill ${lesson.skillId}`);
    const prompt = getPrompt(lesson.practicePromptId);
    if (!prompt)
      problems.push(
        `Lesson ${lesson.id} practices unknown prompt ${lesson.practicePromptId}`,
      );
    else {
      if (prompt.band !== lesson.band)
        problems.push(
          `Lesson ${lesson.id} practice prompt is for a different band`,
        );
      if (prompt.checkpoint)
        problems.push(
          `Lesson ${lesson.id} practices checkpoint prompt ${prompt.id}; checkpoints stay unseen`,
        );
      if (prompt.checkIn)
        problems.push(
          `Lesson ${lesson.id} practices check-in prompt ${prompt.id}; check-ins stay independent`,
        );
      const rubric = getRubric(prompt.rubricId);
      if (
        rubric &&
        !rubric.dimensions.some((d) => d.skillId === lesson.skillId)
      ) {
        problems.push(
          `Lesson ${lesson.id} practice prompt does not score skill ${lesson.skillId}`,
        );
      }
    }
    if (lesson.guided.options.filter((o) => o.correct).length !== 1)
      problems.push(
        `Lesson ${lesson.id} guided question needs exactly one correct option`,
      );
  }

  unique(
    'drill',
    DRILLS.map((d) => d.id),
  );
  for (const drill of DRILLS) {
    approvedNeedsReviewer(`Drill ${drill.id}`, drill.review);
    if (!getSkill(drill.skillId))
      problems.push(`Drill ${drill.id} uses unknown skill ${drill.skillId}`);
    drill.items.forEach((item, i) => {
      if (
        item.kind === 'choice' &&
        item.options.filter((o) => o.correct).length !== 1
      )
        problems.push(
          `Drill ${drill.id} item ${i + 1} needs exactly one correct option`,
        );
      if (
        item.kind === 'rewrite' &&
        (item.samples.length === 0 || item.checklist.length === 0)
      )
        problems.push(
          `Drill ${drill.id} item ${i + 1} needs samples and a checklist`,
        );
    });
  }

  unique(
    'example',
    EXAMPLES.map((e) => e.id),
  );
  for (const ex of EXAMPLES) {
    approvedNeedsReviewer(`Example ${ex.id}`, ex.review);
    const rubric = getRubric(ex.rubricId);
    const prompt = getPrompt(ex.promptId);
    if (!rubric) {
      problems.push(`Example ${ex.id} uses unknown rubric ${ex.rubricId}`);
      continue;
    }
    if (rubric.band !== ex.band || rubric.genre !== ex.genre)
      problems.push(`Example ${ex.id} band/genre does not match its rubric`);
    if (!prompt || prompt.rubricId !== ex.rubricId)
      problems.push(
        `Example ${ex.id} prompt ${ex.promptId} does not use its rubric`,
      );
    else if (prompt.checkIn || prompt.checkpoint)
      problems.push(`Example ${ex.id} answers reserved prompt ${prompt.id}`);
    for (const d of rubric.dimensions) {
      const rating = ex.ratings[d.skillId];
      const exempt = ex.scribed && d.skillId === 'conventions.mechanics';
      if (!exempt && ![1, 2, 3, 4].includes(rating))
        problems.push(`Example ${ex.id} has no rating for ${d.skillId}`);
    }
    for (const skillId of Object.keys(ex.ratings))
      if (!rubric.dimensions.some((d) => d.skillId === skillId))
        problems.push(`Example ${ex.id} rates ${skillId} outside its rubric`);
    for (const n of ex.notes) {
      if (!ex.text.includes(n.quote))
        problems.push(
          `Example ${ex.id} note quotes words not in the text: "${n.quote}"`,
        );
      if (!rubric.dimensions.some((d) => d.skillId === n.skillId))
        problems.push(
          `Example ${ex.id} note uses skill ${n.skillId} outside its rubric`,
        );
    }
  }

  for (const band of BANDS.map((b) => b.id)) {
    if (PROMPTS.filter((p) => p.band === band && p.checkIn).length < 2)
      problems.push(`Band ${band} needs at least two check-in prompts`);
    for (const genre of ['opinion', 'informative', 'narrative'] as const) {
      if (
        PROMPTS.filter(
          (p) => p.band === band && p.genre === genre && p.checkpoint,
        ).length < 2
      )
        problems.push(
          `Band ${band} needs at least two ${genre} checkpoint prompts`,
        );
    }
    const scored = new Set(
      RUBRICS.filter((r) => r.band === band).flatMap((r) =>
        r.dimensions.map((d) => d.skillId),
      ),
    );
    for (const skillId of scored) {
      if (!LESSONS.some((l) => l.band === band && l.skillId === skillId))
        problems.push(
          `Band ${band} scores ${skillId} but has no lesson for it`,
        );
    }
    // Every scored skill, in every genre and grade, must cite real statements in all four frameworks.
    for (const fw of FRAMEWORKS) {
      const fwGrades = Object.values(fw.localToGrade);
      for (const grade of GRADES_IN_BAND[band].filter((g) =>
        fwGrades.includes(g),
      )) {
        for (const rubric of RUBRICS.filter((r) => r.band === band)) {
          const skills: AlignmentSkill[] = [
            ...rubric.dimensions.map((d) => d.skillId as AlignmentSkill),
            'revision',
          ];
          for (const skill of skills) {
            const ids = alignmentIds(fw.id, grade, rubric.genre, skill);
            if (!ids.length)
              problems.push(
                `${fw.id} grade ${grade} ${rubric.genre} ${skill} has no aligned statements`,
              );
            for (const id of ids)
              if (!STANDARD_STATEMENTS[id])
                problems.push(
                  `${fw.id} grade ${grade} ${skill} cites missing statement ${id}`,
                );
          }
        }
      }
    }
  }
  return problems;
}
