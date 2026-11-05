/**
 * Curriculum records. Published content is immutable: a change ships as a new
 * `version`, and every draft, submission and evaluation stores the version it used.
 */

export type GradeBand = 'K-2' | '3-5' | '6-8' | '9-10' | '11-12';
/** opinion = opinion (grades 3–5) / argument (6–8); informative = informative/explanatory. */
export type Genre = 'opinion' | 'narrative' | 'informative';

/**
 * `pilot` = written for the pilot and not yet signed off by a named educator.
 * `approved` requires `review.reviewer` and `review.date`.
 */
export type ReviewStatus = 'pilot' | 'approved';

export interface ReviewInfo {
  status: ReviewStatus;
  reviewer?: string;
  date?: string;
}

export interface Skill {
  id: string;
  family:
    | 'purpose'
    | 'organization'
    | 'development'
    | 'sentences'
    | 'word_choice'
    | 'conventions';
  name: string;
  /** Student-facing "I can" statement. */
  studentGoal: string;
}

/** One rubric row. Levels are ordinal categories 1–4, never averaged into a percentage. */
export interface RubricDimension {
  skillId: string;
  levels: { 1: string; 2: string; 3: string; 4: string };
}

export interface Rubric {
  id: string;
  version: number;
  band: GradeBand;
  genre: Genre;
  title: string;
  dimensions: RubricDimension[];
  /** Short scored examples that anchor the evaluator to this rubric. */
  anchors: { text: string; ratings: Record<string, number>; note: string }[];
  review: ReviewInfo;
}

export interface WritingPrompt {
  id: string;
  version: number;
  band: GradeBand;
  genre: Genre;
  rubricId: string;
  title: string;
  task: string;
  /** Fictional source texts the student may use (written for this site, so no rights issues). */
  sources?: { title: string; text: string }[];
  /**
   * K–2: a picture set the task is about. `description` tells the evaluator (and screen-reader
   * users) what the pictures show; the frontend draws the panels from `id`.
   */
  picture?: { id: string; description: string };
  /** K–2: guidance for the adult who helps, shown above the writing box. */
  adultGuide?: string;
  successCriteria: string[];
  planningQuestions: string[];
  targetSkills: string[];
  /** Guidance shown to the student, not a pass criterion. */
  suggestedWords: { min: number; max: number };
  /** Used as a first writing check-in when a learner has no evidence yet. */
  checkIn?: boolean;
  /**
   * Reserved for independent transfer checks at the end of a plan. Like check-ins, never
   * used as lesson practice and written without the coach.
   */
  checkpoint?: boolean;
  /** Interest tags used to offer prompts a student cares about. */
  topics?: Topic[];
  review: ReviewInfo;
}

export const TOPICS = [
  'animals',
  'nature',
  'science',
  'sports',
  'arts',
  'technology',
  'school',
  'community',
  'adventure',
  'food',
] as const;
export type Topic = (typeof TOPICS)[number];

export interface Lesson {
  id: string;
  version: number;
  band: GradeBand;
  skillId: string;
  title: string;
  minutes: number;
  objective: string;
  explanation: string[];
  model: { text: string; annotations: string[] };
  nonExample: { text: string; whatIsMissing: string };
  guided: {
    question: string;
    detail?: string;
    options: { text: string; correct: boolean; feedback: string }[];
  };
  practicePromptId: string;
  reflection: string;
  exitCheck: string;
  review: ReviewInfo;
}

export type DrillItem =
  | {
      kind: 'choice';
      prompt: string;
      detail?: string;
      options: { text: string; correct: boolean; feedback: string }[];
    }
  | {
      /** Open rewrite: the student writes, then compares with sample answers and a checklist. Not scored. */
      kind: 'rewrite';
      prompt: string;
      original: string;
      samples: string[];
      checklist: string[];
    };

/** Short practice sets for sentence-level skills. Checked in the browser; no AI involved. */
export interface DrillSet {
  id: string;
  version: number;
  band: GradeBand;
  skillId: string;
  title: string;
  description: string;
  items: DrillItem[];
  review: ReviewInfo;
}
