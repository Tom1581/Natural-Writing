export type GradeBand = 'K-2' | '3-5' | '6-8' | '9-10' | '11-12';
export type FrameworkId = 'us-ccss' | 'ca-on' | 'uk-eng' | 'au-ac9';
export type Levels = { 1: string; 2: string; 3: string; 4: string };

export interface Skill { id: string; family: string; name: string; studentGoal: string }
export interface ReviewInfo { status: 'pilot' | 'approved'; reviewer?: string; date?: string }

export interface FrameworkSummary {
  id: FrameworkId;
  country: string;
  shortName: string;
  name: string;
  version: string;
  gradeWord: 'Grade' | 'Year';
  localGrades: string[];
  localGradeLabels: Record<string, string>;
  /** Local year → a note when alignment is a reference point rather than a national standard. */
  gradeNotes: Record<string, string>;
  localToGrade: Record<string, string>;
}

export interface BandInfo {
  id: GradeBand;
  label: string;
  grades: string[];
  status: 'available' | 'early_access';
  note: string;
}

export interface Statement {
  id: string;
  framework: FrameworkId;
  code: string;
  shortCode: string;
  scope: string;
  title?: string;
  text: string;
  url: string;
}

export interface AlignmentBlock {
  framework: { id: FrameworkId; shortName: string; country: string; version: string };
  grades: { grade: string; label: string; note: string | null; statements: Statement[] }[];
}

export interface Catalog {
  noticeVersion: string;
  supportedGrades: string[];
  bands: BandInfo[];
  frameworks: FrameworkSummary[];
  drills: { id: string; band: GradeBand; skillId: string; title: string; description: string; items: number }[];
  rubrics: { id: string; version: number; band: GradeBand; genre: string; title: string }[];
  examples: { id: string; rubricId: string; band: GradeBand; genre: string; title: string; writer: string }[];
  skills: Skill[];
  prompts: {
    id: string;
    band: GradeBand;
    genre: string;
    title: string;
    task: string | null;
    topics: Topic[];
    targetSkills: string[];
    checkIn: boolean;
    checkpoint: boolean;
    review: ReviewInfo;
  }[];
  lessons: { id: string; band: GradeBand; skillId: string; title: string; minutes: number; objective: string; review: ReviewInfo }[];
}

export interface WritingPrompt {
  id: string;
  version: number;
  band: GradeBand;
  genre: string;
  title: string;
  task: string;
  sources?: { title: string; text: string }[];
  picture?: { id: string; description: string };
  adultGuide?: string;
  successCriteria: string[];
  planningQuestions: string[];
  targetSkills: string[];
  suggestedWords: { min: number; max: number };
  checkIn?: boolean;
  checkpoint?: boolean;
  topics?: Topic[];
  review: ReviewInfo;
  rubric: { id: string; version: number; title: string; dimensions: { skillId: string; name: string; levels: Levels }[] };
}

export interface Lesson {
  id: string;
  band: GradeBand;
  skillId: string;
  title: string;
  minutes: number;
  objective: string;
  explanation: string[];
  model: { text: string; annotations: string[] };
  nonExample: { text: string; whatIsMissing: string };
  guided: { question: string; detail?: string; options: { text: string; correct: boolean; feedback: string }[] };
  practicePrompt: { id: string; title: string; genre: string };
  drills: { id: string; title: string }[];
  alignment: AlignmentBlock[];
  reflection: string;
  exitCheck: string;
  skill?: Skill;
  review: ReviewInfo;
}

export interface Learner {
  id: string;
  displayName: string;
  gradeLevel: string;
  band: GradeBand | null;
  curriculum: FrameworkId;
  gradeLabel: string;
  hasAccessCode: boolean;
  sessionsPerWeek: number;
  interests: Topic[];
  focusSkillId: string | null;
  organizationId: string | null;
  supports: Supports;
  createdAt: string;
}

/** Learning supports (not diagnoses). */
export interface Supports {
  eal?: boolean;
  readAloud?: boolean;
  largerText?: boolean;
  dictation?: boolean;
}

export interface SchoolSummary {
  schools: { id: string; name: string; role: 'admin' | 'teacher' }[];
  invitations: { organizationId: string; name: string; role: 'admin' | 'teacher' }[];
}

export interface SchoolDetail {
  id: string;
  name: string;
  curriculum: FrameworkId;
  myRole: 'admin' | 'teacher';
  students: number;
  classes: { id: string; name: string; mine: boolean }[];
  members: { id: string; email: string; role: 'admin' | 'teacher'; status: 'invited' | 'active'; joinedAt: string | null; isMe: boolean }[];
}

export interface RosterResult {
  created: { learnerId: string; displayName: string; gradeLabel: string; code: string | null }[];
  codesEnabled: boolean;
}

export interface AuditEntry {
  action: string;
  actor: string;
  targetType: string | null;
  detail: string | null;
  createdAt: string;
}

export const TOPICS = ['animals', 'nature', 'science', 'sports', 'arts', 'technology', 'school', 'community', 'adventure', 'food'] as const;
export type Topic = (typeof TOPICS)[number];

export interface PlanItem {
  key: string;
  kind: 'check_in' | 'lesson' | 'prompt' | 'drill' | 'checkpoint';
  week: 1 | 2;
  title: string;
  minutes: number;
  skillId: string | null;
  promptId: string | null;
  lessonId: string | null;
  drillId: string | null;
  reason: string;
  done: boolean;
  alternative: { promptId: string; title: string } | null;
}

export interface Plan {
  status: 'check_in' | 'active' | 'complete';
  startedAt: string | null;
  endsAt: string | null;
  sessionsPerWeek: number;
  mainGoal: { skillId: string; name: string; latestRating: number | null } | null;
  maintenance: { skillId: string; name: string } | null;
  focusSetByAdult: boolean;
  items: PlanItem[];
  next: PlanItem | null;
}

export interface PlanView {
  learner: Learner;
  preferences: { sessionsPerWeek: number; interests: Topic[]; focusSkillId: string | null };
  plan: Plan;
}

export interface SafetyFlag {
  id: string;
  submissionId: string;
  source: 'screen' | 'ai';
  level: 'possible' | 'urgent';
  category: 'self_harm' | 'abuse' | 'threat' | 'personal_info' | 'other';
  reason: string;
  status: 'open' | 'resolved';
  resolutionNote: string | null;
  createdAt: string;
}

export interface Support {
  wellbeing: boolean;
  personalInfo: boolean;
  helplines: { name: string; contact: string; url: string }[];
  emergency: string;
}

export interface AgreementStats {
  n: number;
  exact: number | null;
  adjacent: number | null;
  meanBias: number | null;
  qwk: number | null;
  confusion: number[][];
}

export interface QualitySummary {
  reviewedPieces: number;
  agreement: { overall: AgreementStats; bySkill: (AgreementStats & { skillId: string; name: string })[] };
  submissions: number;
  jobs: Record<string, number>;
  feedbackReports: number;
  safetyFlags: { open: number; byCategory: Record<string, number>; bySource: Record<string, number> };
  note: string;
}

export type JobState = 'queued' | 'running' | 'complete' | 'not_scored' | 'needs_review' | 'failed';
export interface JobStatus { jobId: string; submissionId: string; state: JobState; failureCode: string | null; retryInSeconds: number | null }

export interface Draft {
  id: string;
  learnerId: string;
  promptId: string;
  content: string;
  planning: Record<string, string>;
  revision: number;
  coachUsedSinceSubmit: boolean;
  updatedAt: string;
}

export interface CoachResult {
  criteria: { criterion: string; status: 'met' | 'partly' | 'not_yet'; tip: string }[];
  encouragement: string;
  remaining: number;
  revision: number;
}

export interface AnchoredQuote { quote: string; start: number; end: number }
export interface Feedback {
  summary: string;
  dimensions: { skillId: string; rating: 1 | 2 | 3 | 4 | null; evidenceState: string; reason: string; evidence: AnchoredQuote[] }[];
  strengths: { skillId: string; message: string; quote?: AnchoredQuote }[];
  nextSteps: { skillId: string; message: string; hint: string }[];
  model: string;
  rubricId: string;
  rubricVersion: number;
  createdAt: string;
}

/** Feedback without an account: returned directly, never stored. */
export type GuestFeedbackResult =
  | { kind: 'not_scored'; code: string }
  | {
      kind: 'complete';
      grade: string;
      band: GradeBand;
      feedback: Pick<Feedback, 'summary' | 'dimensions' | 'strengths' | 'nextSteps'>;
      skillNames: Record<string, string>;
      suggestedLesson: { id: string; title: string } | null;
      support: Support | null;
    };

export interface SubmissionView {
  id: string;
  learnerId: string;
  draftId: string;
  prompt: { id: string; title: string; task: string; band: GradeBand; genre: string; picture: { id: string; description: string } | null } | null;
  text: string;
  attemptNumber: number;
  assistanceMode: 'independent' | 'coached' | string;
  createdAt: string;
  reflection: string | null;
  learner: Learner;
  overrides: { skillId: string; originalRating: number | null; rating: number | null; comment: string; createdAt: string }[];
  alignment: { skillId: string; statements: Statement[] }[];
  reviewedByAdult: boolean;
  helpfulness: 'yes' | 'somewhat' | 'no' | null;
  inPortfolio: boolean;
  inputMode: 'typed' | 'dictation' | 'scribed' | string;
  checks: string[];
  support: Support | null;
  safetyFlags: SafetyFlag[];
  feedbackReported: boolean;
  draftChangedSinceSubmission: boolean;
  job: JobStatus | null;
  feedback: Feedback | null;
  previousRatings: Record<string, number | null> | null;
  suggestedLesson: { id: string; title: string } | null;
  skillNames: Record<string, string>;
}

export interface Dashboard {
  learner: Learner;
  checkIn: { done: number; total: number };
  assignments: {
    id: string;
    promptId: string;
    promptTitle: string;
    lessonId: string | null;
    lessonTitle: string | null;
    note: string | null;
    dueDate: string | null;
    submitted: boolean;
  }[];
  drills: { id: string; title: string; skillId: string }[];
  plan: Plan;
  safetyFlags: SafetyFlag[];
  recommendation: {
    kind: 'check_in' | 'lesson' | 'prompt' | 'done';
    promptId: string | null;
    lessonId: string | null;
    skillId: string | null;
    reason: string;
    promptTitle: string | null;
    lessonTitle: string | null;
  };
  skills: { skillId: string; name: string; state: 'not_observed' | 'practicing' | 'demonstrated' | 'check_due'; latestRating: number | null; demonstratedOn: number }[];
  drafts: { id: string; promptId: string; promptTitle: string; words: number; updatedAt: string; hasUnsubmittedChanges: boolean; latestSubmissionId: string | null }[];
  submissions: { id: string; promptId: string; promptTitle: string; attemptNumber: number; createdAt: string; state: JobState }[];
}

export type DrillItem =
  | { kind: 'choice'; prompt: string; detail?: string; options: { text: string; correct: boolean; feedback: string }[] }
  | { kind: 'rewrite'; prompt: string; original: string; samples: string[]; checklist: string[] };

export interface Drill {
  id: string;
  band: GradeBand;
  skillId: string;
  title: string;
  description: string;
  items: DrillItem[];
  skill?: Skill;
  lesson: { id: string; title: string } | null;
  alignment: AlignmentBlock[];
  review: ReviewInfo;
}

export interface CurriculumView {
  framework: FrameworkSummary & { sources: { title: string; url: string }[]; locale: { spelling: string; terms: string } };
  grades: {
    grade: string;
    local: string;
    label: string;
    note: string | null;
    band: GradeBand;
    genres: {
      genre: string;
      rubricTitle: string;
      skills: { skillId: string; name: string; lessons: { id: string; title: string }[]; statements: Statement[] }[];
    }[];
  }[];
}

export interface ClassSummary { id: string; name: string; students: number; createdAt: string }

export interface ClassDetail {
  id: string;
  name: string;
  students: { learner: Learner; skills: Dashboard['skills'] }[];
  distribution: { skillId: string; name: string; counts: { 1: number; 2: number; 3: number; 4: number; notYet: number } }[];
  assignments: {
    id: string;
    promptId: string;
    promptTitle: string;
    band: GradeBand | null;
    lessonId: string | null;
    lessonTitle: string | null;
    note: string | null;
    dueDate: string | null;
    submittedCount: number;
    createdAt: string;
  }[];
}

export interface ReviewItem {
  submissionId: string;
  learner: { id: string; displayName: string };
  promptTitle: string;
  attemptNumber: number;
  assistanceMode: string;
  createdAt: string;
  state: JobState;
  ratings: Record<string, number | null> | null;
  reviewed: boolean;
  needsAttention: string[];
  wellbeing: boolean;
}

export interface Report {
  learner: Learner;
  framework: FrameworkSummary & { sources: { title: string; url: string }[] };
  generatedAt: string;
  totals: { pieces: number; revisions: number; words: number; reflections: number; firstActivity: string | null };
  skills: (Dashboard['skills'][number] & {
    history: { rating: number; independent: boolean; date: string; promptTitle: string }[];
    standards: Statement[];
  })[];
  pieces: {
    submissionId: string;
    promptTitle: string;
    genre: string | null;
    attemptNumber: number;
    assistanceMode: string;
    words: number;
    date: string;
    summary: string | null;
    nextStep: { skillId: string; message: string; hint: string } | null;
    reflection: string | null;
  }[];
  note: string;
}

export interface GradeView {
  grade: string;
  band: BandInfo;
  rubrics: {
    id: string;
    genre: string;
    title: string;
    goals: { skillId: string; name: string; meets: string; beyond: string }[];
    words: { min: number; max: number } | null;
  }[];
  lessons: { id: string; title: string; skillId: string; minutes: number; objective: string }[];
  prompts: { id: string; title: string; genre: string; task: string }[];
  drills: { id: string; title: string; description: string }[];
  examples: { id: string; title: string; genre: string }[];
  frameworks: {
    id: FrameworkId;
    country: string;
    shortName: string;
    name: string;
    local: string;
    label: string;
    note: string | null;
    genres: { genre: string; skills: { skillId: string; name: string; statements: Statement[] }[] }[];
  }[];
}

export interface RubricView {
  id: string;
  version: number;
  band: GradeBand;
  genre: string;
  title: string;
  bandInfo: BandInfo;
  dimensions: { skillId: string; name: string; studentGoal: string; levels: Levels }[];
  anchors: { text: string; ratings: Record<string, number>; note: string }[];
  prompts: { id: string; title: string }[];
  lessons: { id: string; title: string; skillId: string }[];
  examples: { id: string; title: string }[];
  review: ReviewInfo;
}

export interface OperatorMetrics {
  generatedAt: string;
  ai: {
    budget: number;
    tokensToday: number;
    remainingToday: number;
    tokensLast7Days: number;
    tokensPerFeedbackLast7Days: number | null;
    byPurposeLast7Days: Record<string, { calls: number; tokens: number }>;
    rateLimitedLast7Days: number;
    daily: { date: string; tokens: number; calls: number; rateLimited: number; byPurpose: Record<string, number> }[];
  };
  learning: {
    learners: number;
    learnersByBand: Record<string, number>;
    activeLearners30: number;
    submissions30: number;
    feedback30: number;
    evaluationsByBand30: Record<string, number>;
    completedLoops30: number;
    returningLearners30: number;
    adultCorrections30: number;
    adultConfirmations30: number;
    correctionRate30: number | null;
    helpfulness30: { yes: number; somewhat: number; no: number };
    jobStates: Record<string, number>;
  };
}

export interface PortfolioView {
  learner: Learner;
  pieces: {
    submissionId: string;
    createdAt: string;
    attemptNumber: number;
    prompt: { id: string; title: string; genre: string } | null;
    text: string;
    reflection: string | null;
    summary: string | null;
    levels: { skillId: string; name: string; rating: number | null }[];
  }[];
}

export interface ContentQueue {
  items: {
    itemType: 'lesson' | 'prompt' | 'rubric' | 'drill';
    id: string;
    version: number;
    band: GradeBand;
    title: string;
    reserved?: boolean;
    approvals: number;
    changesRequested: number;
    latestDecision: 'approve' | 'changes' | 'comment' | null;
    reviews: { id: string; reviewerName: string; reviewerRole: string; decision: string; notes: string; createdAt: string }[];
  }[];
}

export interface ReviewStatus {
  approvals: number;
  roles: string[];
  lastReviewed: string | null;
}

export interface ExampleView {
  id: string;
  rubricId: string;
  band: GradeBand;
  genre: string;
  promptId: string;
  title: string;
  writer: string;
  text: string;
  ratings: Record<string, number>;
  scribed?: boolean;
  notes: { quote: string; skillId: string; comment: string }[];
  whyItWorks: string;
  nextStep: string;
  review: ReviewInfo;
  prompt: { id: string; title: string; task: string; sources: { title: string; text: string }[]; picture: { id: string; description: string } | null };
  rubric: { id: string; title: string; dimensions: { skillId: string; name: string; levels: Levels }[] };
  others: { id: string; title: string; genre: string }[];
}
