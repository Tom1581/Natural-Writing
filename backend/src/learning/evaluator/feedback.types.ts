/** A quote that was found verbatim in the submitted text. Offsets are UTF-16 indexes into that text. */
export interface AnchoredQuote {
  quote: string;
  start: number;
  end: number;
}

export type EvidenceState =
  | 'observed'
  | 'insufficient_evidence'
  | 'not_applicable';

export interface DimensionResult {
  skillId: string;
  /** Ordinal level 1–4, or null when the skill could not be judged from this text. */
  rating: 1 | 2 | 3 | 4 | null;
  evidenceState: EvidenceState;
  reason: string;
  evidence: AnchoredQuote[];
}

export interface FeedbackNote {
  skillId: string;
  message: string;
  quote?: AnchoredQuote;
}

export interface NextStep {
  skillId: string;
  message: string;
  /** A question or hint that helps the student make the change themselves. */
  hint: string;
}

/** Feedback that passed every check in validateFeedback(). Only this shape is ever shown to students. */
export interface ValidatedFeedback {
  schemaVersion: '1.0';
  summary: string;
  dimensions: DimensionResult[];
  strengths: FeedbackNote[];
  nextSteps: NextStep[];
}
