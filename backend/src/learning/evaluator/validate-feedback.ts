import type { Rubric } from '../content';
import type {
  AnchoredQuote,
  DimensionResult,
  FeedbackNote,
  NextStep,
  ValidatedFeedback,
} from './feedback.types';

const MAX_MESSAGE = 320;

/** Lowercases and folds curly quotes, dashes and whitespace, keeping a map back to original indexes. */
function normalizeWithMap(text: string): { normalized: string; map: number[] } {
  let normalized = '';
  const map: number[] = [];
  let lastWasSpace = false;
  for (let i = 0; i < text.length; i++) {
    let ch = text[i];
    if (/[‘’‚′`]/.test(ch)) ch = "'";
    else if (/[“”„″]/.test(ch)) ch = '"';
    else if (/[–—]/.test(ch)) ch = '-';
    if (/\s/.test(ch)) {
      if (lastWasSpace) continue;
      ch = ' ';
      lastWasSpace = true;
    } else {
      lastWasSpace = false;
    }
    normalized += ch.toLowerCase();
    map.push(i);
  }
  return { normalized, map };
}

/**
 * Finds a model-supplied quote in the submitted text. Tolerates case, curly quotes,
 * whitespace and surrounding punctuation; for an elided quote ("a ... b") it anchors
 * the longest segment. Returns null when the words are not in the text.
 */
export function anchorQuote(
  text: string,
  rawQuote: unknown,
): AnchoredQuote | null {
  if (typeof rawQuote !== 'string') return null;
  const segments = rawQuote
    .split(/\.{3}|…|\[(?:email address|phone number|street address)\]/)
    .map((s) => s.replace(/^[\s"'“”‘’,;:]+|[\s"'“”‘’,;:]+$/g, ''))
    .filter((s) => s.length > 0)
    .sort((a, b) => b.length - a.length);
  const segment = segments[0];
  if (!segment || segment.length < 3) return null;

  const haystack = normalizeWithMap(text);
  const needle = normalizeWithMap(segment).normalized;
  let at = haystack.normalized.indexOf(needle);
  // Models sometimes add or drop a final period; retry without trailing punctuation.
  let length = needle.length;
  if (at < 0) {
    const trimmed = needle.replace(/[.!?]+$/, '');
    if (trimmed.length >= 3) {
      at = haystack.normalized.indexOf(trimmed);
      length = trimmed.length;
    }
  }
  if (at < 0) return null;
  const start = haystack.map[at];
  const end = haystack.map[at + length - 1] + 1;
  return { quote: text.slice(start, end), start, end };
}

const isNonEmptyString = (v: unknown, max = MAX_MESSAGE): v is string =>
  typeof v === 'string' && v.trim().length > 0 && v.length <= max;

/** The evaluator's wellbeing judgment. Kept apart from the feedback the student sees. */
export interface Wellbeing {
  concern: 'none' | 'possible' | 'urgent';
  category:
    | 'self_harm'
    | 'abuse'
    | 'threat'
    | 'personal_info'
    | 'other'
    | 'none';
  reason: string;
}

/** A missing or malformed wellbeing field never blocks feedback; it reads as "none". */
export function parseWellbeing(raw: unknown): Wellbeing {
  const w = (raw && typeof raw === 'object' ? raw : {}) as Record<
    string,
    unknown
  >;
  const concern = ['possible', 'urgent'].includes(w.concern as string)
    ? (w.concern as Wellbeing['concern'])
    : 'none';
  const category = [
    'self_harm',
    'abuse',
    'threat',
    'personal_info',
    'other',
  ].includes(w.category as string)
    ? (w.category as Wellbeing['category'])
    : concern === 'none'
      ? 'none'
      : 'other';
  const reason =
    typeof w.reason === 'string' ? w.reason.trim().slice(0, 240) : '';
  return { concern, category, reason };
}

export type ValidationResult =
  | { ok: true; feedback: ValidatedFeedback; wellbeing: Wellbeing }
  | { ok: false; problems: string[] };

/**
 * Turns raw model output into feedback that is safe to show, or a list of problems.
 * Every rating must be in range, every skill must belong to the rubric, and every quote
 * must exist in the submitted text, so the student never sees invented evidence.
 */
export function validateFeedback(
  raw: string,
  rubric: Rubric,
  text: string,
): ValidationResult {
  let data: any;
  try {
    data = JSON.parse(raw.trim().replace(/^```(?:json)?\s*|\s*```$/g, ''));
  } catch {
    return { ok: false, problems: ['The response was not valid JSON.'] };
  }
  if (!data || typeof data !== 'object')
    return { ok: false, problems: ['The response was not a JSON object.'] };

  const problems: string[] = [];
  const skillIds = rubric.dimensions.map((d) => d.skillId);

  // Dimensions: exactly one per rubric skill.
  const dimensions: DimensionResult[] = [];
  const rawDimensions: any[] = Array.isArray(data.dimensions)
    ? data.dimensions
    : [];
  if (!Array.isArray(data.dimensions))
    problems.push('"dimensions" must be an array.');
  for (const skillId of skillIds) {
    const matches = rawDimensions.filter((d) => d?.skillId === skillId);
    if (matches.length !== 1) {
      problems.push(`Rate ${skillId} exactly once (found ${matches.length}).`);
      continue;
    }
    const d = matches[0];
    const state = d.evidenceState;
    if (
      !['observed', 'insufficient_evidence', 'not_applicable'].includes(state)
    ) {
      problems.push(
        `${skillId}: evidenceState must be observed, insufficient_evidence or not_applicable.`,
      );
      continue;
    }
    if (!isNonEmptyString(d.reason))
      problems.push(`${skillId}: give a short reason.`);

    if (state !== 'observed') {
      if (d.rating !== null && d.rating !== undefined)
        problems.push(
          `${skillId}: rating must be null when evidenceState is ${state}.`,
        );
      dimensions.push({
        skillId,
        rating: null,
        evidenceState: state,
        reason: String(d.reason ?? ''),
        evidence: [],
      });
      continue;
    }
    if (![1, 2, 3, 4].includes(d.rating)) {
      problems.push(`${skillId}: rating must be an integer from 1 to 4.`);
      continue;
    }
    const quotes: unknown[] = Array.isArray(d.quotes)
      ? d.quotes.slice(0, 2)
      : [];
    const anchored = quotes.map((q) => ({ q, a: anchorQuote(text, q) }));
    for (const { q, a } of anchored)
      if (!a)
        problems.push(
          `${skillId}: the quote ${JSON.stringify(q)} is not in the student's writing.`,
        );
    const evidence = anchored.flatMap(({ a }) => (a ? [a] : []));
    if (evidence.length === 0 && quotes.length === 0)
      problems.push(
        `${skillId}: an observed rating needs at least one exact quote.`,
      );
    dimensions.push({
      skillId,
      rating: d.rating,
      evidenceState: 'observed',
      reason: String(d.reason ?? ''),
      evidence,
    });
  }
  for (const d of rawDimensions) {
    if (d?.skillId && !skillIds.includes(d.skillId))
      problems.push(
        `Unknown skill ${JSON.stringify(d.skillId)}; use only rubric skill ids.`,
      );
  }

  // Strengths: 1–2, each tied to a rubric skill; a quote, if given, must exist.
  const strengths: FeedbackNote[] = [];
  const rawStrengths: any[] = Array.isArray(data.strengths)
    ? data.strengths
    : [];
  if (rawStrengths.length < 1 || rawStrengths.length > 2)
    problems.push('Give 1 or 2 strengths.');
  for (const s of rawStrengths.slice(0, 2)) {
    if (!skillIds.includes(s?.skillId))
      problems.push(
        `Strength uses unknown skill ${JSON.stringify(s?.skillId)}.`,
      );
    if (!isNonEmptyString(s?.message))
      problems.push('Each strength needs a short message.');
    let quote: AnchoredQuote | undefined;
    if (s?.quote) {
      quote = anchorQuote(text, s.quote) ?? undefined;
      if (!quote)
        problems.push(
          `Strength quote ${JSON.stringify(s.quote)} is not in the student's writing.`,
        );
    }
    strengths.push({
      skillId: String(s?.skillId),
      message: String(s?.message ?? ''),
      ...(quote ? { quote } : {}),
    });
  }

  // Next steps: 1–2 actionable targets.
  const nextSteps: NextStep[] = [];
  const rawSteps: any[] = Array.isArray(data.nextSteps) ? data.nextSteps : [];
  if (rawSteps.length < 1 || rawSteps.length > 2)
    problems.push('Give 1 or 2 next steps.');
  for (const n of rawSteps.slice(0, 2)) {
    if (!skillIds.includes(n?.skillId))
      problems.push(
        `Next step uses unknown skill ${JSON.stringify(n?.skillId)}.`,
      );
    if (!isNonEmptyString(n?.message))
      problems.push('Each next step needs a short message.');
    if (!isNonEmptyString(n?.hint))
      problems.push('Each next step needs a short hint or question.');
    nextSteps.push({
      skillId: String(n?.skillId),
      message: String(n?.message ?? ''),
      hint: String(n?.hint ?? ''),
    });
  }

  if (!isNonEmptyString(data.summary, 500))
    problems.push('Give a short summary.');

  if (problems.length > 0) return { ok: false, problems };
  return {
    ok: true,
    feedback: {
      schemaVersion: '1.0',
      summary: String(data.summary).trim(),
      dimensions,
      strengths,
      nextSteps,
    },
    wellbeing: parseWellbeing(data.wellbeing),
  };
}
