import type { AnchoredQuote } from './types';

export interface Highlight extends AnchoredQuote {
  noteId: string;
  kind: 'strength' | 'next' | 'skill';
}

type FeedbackQuotes = {
  dimensions: { skillId: string; evidence: AnchoredQuote[] }[];
  strengths: { quote?: AnchoredQuote }[];
  nextSteps: { skillId: string }[];
};

/**
 * Keeps the page readable: strengths and the next-step evidence, plus whichever skill the
 * student asked to see. Highlighting every rating's quote would cover the essay.
 */
export function feedbackHighlights(f: FeedbackQuotes, activeNote: string | null): Highlight[] {
  const nextSkills = new Set(f.nextSteps.map((n) => n.skillId));
  return [
    ...(activeNote?.startsWith('skill-')
      ? f.dimensions.filter((d) => `skill-${d.skillId}` === activeNote).flatMap((d) => d.evidence.slice(0, 1).map((q) => ({ ...q, noteId: `skill-${d.skillId}`, kind: 'skill' as const })))
      : []),
    ...f.strengths.flatMap((s, i) => (s.quote ? [{ ...s.quote, noteId: `strength-${i}`, kind: 'strength' as const }] : [])),
    ...f.dimensions
      .filter((d) => nextSkills.has(d.skillId))
      .flatMap((d) => d.evidence.slice(0, 1).map((q) => ({ ...q, noteId: `skill-${d.skillId}`, kind: 'next' as const }))),
  ];
}

/** Splits the submitted text into plain and highlighted runs. Overlapping quotes keep the earlier one. */
export function segments(text: string, highlights: Highlight[]) {
  const sorted = [...highlights].sort((a, b) => a.start - b.start || b.end - a.end);
  const out: { text: string; noteId?: string; kind?: Highlight['kind'] }[] = [];
  let at = 0;
  for (const h of sorted) {
    if (h.start < at || h.end > text.length) continue;
    if (h.start > at) out.push({ text: text.slice(at, h.start) });
    out.push({ text: text.slice(h.start, h.end), noteId: h.noteId, kind: h.kind });
    at = h.end;
  }
  if (at < text.length) out.push({ text: text.slice(at) });
  return out;
}
