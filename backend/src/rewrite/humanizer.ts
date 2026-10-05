/**
 * Paragraph-level humanizer pipeline.
 *
 * Rewrites AI-drafted text one paragraph at a time with an LLM while keeping
 * the parts of a paper that must not change (title block, headings, tables,
 * captions, reference list, citations, numbers) intact. Every rewritten
 * paragraph is validated and retried once with targeted feedback; a paragraph
 * that still loses content keeps its original wording instead of shipping a
 * broken rewrite.
 */

export type CompleteFn = (
  system: string,
  user: string,
  maxTokens: number,
) => Promise<string>;

export interface HumanizeSettings {
  tone: string;
  strength: string;
  humanization: number; // 0-1
}

export interface Block {
  kind: 'prose' | 'verbatim';
  text: string;
  /** List marker or run-in label ("- ", "Measures: ") kept outside the rewrite. */
  prefix: string;
  /** Separator placed before this block when the document is reassembled. */
  sep: string;
}

export interface CheckResult {
  ok: boolean;
  missing: string[];
  tells: string[];
  lengthRatio: number;
  /** Problems that make a rewrite unusable: lost citations, numbers, or content. */
  hard: string[];
  /** Problems worth a retry but tolerated if they remain: stock phrases, certainty drift. */
  soft: string[];
  problems: string[];
}

export class HumanizerUnavailableError extends Error {
  constructor(message = 'All rewrite providers failed') {
    super(message);
    this.name = 'HumanizerUnavailableError';
  }
}

// ─── Text cleanup ─────────────────────────────────────────────────────────────

const HTML_TAG =
  /<\/?(?:p|br|div|span|strong|em|b|i|u|a|ul|ol|li|h[1-6]|blockquote|code|pre|sup|sub|mark|s|del|ins|table|thead|tbody|tr|td|th|hr|img|font|section|article)(?:\s+[\w:-]+=(?:"[^"]*"|'[^']*'|[^\s"'<>]+))*\s*\/?>/gi;

/** Removes real HTML tags only. Statistics such as "p < .05 ... n > 300" must survive. */
export function stripHtml(text: string): string {
  return text.replace(HTML_TAG, '');
}

/** Invisible characters and non-breaking hyphens or spaces that chatbots leave behind. */
export function cleanInvisible(text: string): string {
  return text
    .replace(/[\u200B-\u200D\u2060\uFEFF\u00AD]/g, '')
    .replace(/[\u2010\u2011]/g, '-')
    .replace(/[\u00A0\u202F\u2007\u2009\u200A]/g, ' ');
}

export function toPlainText(raw: string): string {
  const marked = raw
    .replace(/\r\n?/g, '\n')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(?:p|div|h[1-6]|blockquote)>/gi, '\n\n')
    .replace(/<li(?:\s[^<>]*)?>/gi, '\n- ');
  return cleanInvisible(stripHtml(marked))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ─── Segmentation ─────────────────────────────────────────────────────────────

const REFERENCE_HEADING =
  /^(?:#+\s*)?(?:\d+(?:\.\d+)*[.)]?\s+)?(?:references|reference list|bibliography|works cited|literature cited|sources|endnotes)\s*:?$/i;
const LIST_MARKER =
  /^(\s*(?:[-*\u2022\u25AA\u25E6\u2023]|\(?\d{1,3}[.)]|\(?[a-z]\))\s+)/;
const NUMBERED_HEADING = /^(?:\d+(?:\.\d+)*[.)]?|[IVX]+\.)\s+\S/;
// Figure and table captions are referenced elsewhere in a paper; keep them as written.
const CAPTION =
  /^(?:fig(?:ure)?\.?|table|chart|exhibit|appendix)\s*[A-Z]?\d+[a-z]?[.:]/i;
const SMALL_WORDS = new Set([
  'a',
  'an',
  'and',
  'as',
  'at',
  'by',
  'for',
  'from',
  'in',
  'of',
  'on',
  'or',
  'the',
  'to',
  'versus',
  'vs',
  'vs.',
  'with',
]);

const wordCount = (s: string) => s.split(/\s+/).filter(Boolean).length;
const isTableRow = (line: string) =>
  (line.match(/\|/g) ?? []).length >= 2 || /\t[^\t]*\t/.test(line);

function isHeading(line: string): boolean {
  const l = line.trim();
  if (/^#{1,6}\s/.test(l)) return true;
  if (l.length > 120 || wordCount(l) > 14) return false;
  if (/[.!?,;]$/.test(l) && !/^(?:\d+(?:\.\d+)*|[IVX]+)\.$/.test(l))
    return false;
  return true;
}

/** A short title-like first line glued to its paragraph by a single newline. */
function isGluedHeading(line: string, next: string): boolean {
  const l = line.trim();
  if (LIST_MARKER.test(l) || /[.!?,;:]$/.test(l)) return false;
  if (/^#{1,6}\s/.test(l) || NUMBERED_HEADING.test(l))
    return wordCount(l) <= 14;
  return wordCount(l) <= 8 && l.length < next.trim().length * 0.6;
}

/** A run-in heading or label at the start of a paragraph: "Research Gaps. ...", "Productivity: ...". */
function runInLabel(text: string): string {
  const m = text.match(/^([^.:!?\n]{2,70}?)([.:])\s+(?=["\u201C(]?[A-Z0-9])/);
  if (!m) return '';
  const words = m[1].trim().split(/\s+/);
  if (words.length > 8) return '';
  const titleCase = words.every(
    (w, i) =>
      /^["\u201C(]?[A-Z0-9]/.test(w) ||
      (i > 0 && SMALL_WORDS.has(w.toLowerCase())),
  );
  // "Dr." or "Fig." only look like a heading.
  const abbreviation =
    m[2] === '.' && words.length === 1 && words[0].length < 5;
  return titleCase && !abbreviation ? m[0] : '';
}

function proseBlock(text: string, sep: string): Block {
  if (CAPTION.test(text)) return { kind: 'verbatim', text, prefix: '', sep };
  const marker = text.match(LIST_MARKER)?.[1] ?? '';
  const prefix = marker + runInLabel(text.slice(marker.length));
  const body = text.slice(prefix.length).trim();
  // Fragments and short list items read the same either way; short items stay
  // as written so a list keeps one consistent form.
  if (wordCount(body) < (marker ? 20 : 6)) {
    return { kind: 'verbatim', text, prefix: '', sep };
  }
  return { kind: 'prose', text: body, prefix, sep };
}

export function segmentDocument(raw: string): Block[] {
  const text = toPlainText(raw);
  if (!text) return [];

  const hasBlankLines = /\n\s*\n/.test(text);
  const chunks = hasBlankLines ? text.split(/\n\s*\n/) : text.split('\n');
  const chunkSep = hasBlankLines ? '\n\n' : '\n';
  const blocks: Block[] = [];
  let inReferences = false;

  for (const chunk of chunks) {
    const lines = chunk
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean);
    if (lines.length === 0) continue;
    const sep = blocks.length === 0 ? '' : chunkSep;
    const verbatim = (t: string, s = sep): Block => ({
      kind: 'verbatim',
      text: t,
      prefix: '',
      sep: s,
    });

    if (inReferences || REFERENCE_HEADING.test(lines[0])) {
      inReferences = true;
      blocks.push(verbatim(lines.join('\n')));
      continue;
    }

    // Tables, and title blocks such as title / author / affiliation lines.
    const headingLines =
      lines.length > 1 &&
      lines.every((l) => isHeading(l) && !LIST_MARKER.test(l));
    if (lines.filter(isTableRow).length >= 2 || headingLines) {
      blocks.push(verbatim(lines.join('\n')));
      continue;
    }

    if (lines.length === 1) {
      blocks.push(
        isHeading(lines[0]) ? verbatim(lines[0]) : proseBlock(lines[0], sep),
      );
      continue;
    }

    let rest = lines;
    let restSep = sep;
    if (isGluedHeading(lines[0], lines[1])) {
      blocks.push(verbatim(lines[0]));
      rest = lines.slice(1);
      restSep = '\n';
    }

    if (rest.filter((l) => LIST_MARKER.test(l)).length >= 2) {
      // A list, possibly with a lead-in line ("Key strategies include:"); keep one block per line.
      rest.forEach((line, i) =>
        blocks.push(proseBlock(line, i === 0 ? restSep : '\n')),
      );
    } else {
      // Hard-wrapped lines (PDF, email) belong to one paragraph.
      blocks.push(proseBlock(rest.join(' '), restSep));
    }
  }

  if (blocks.length > 0) blocks[0].sep = '';
  return blocks;
}

export function joinBlocks(blocks: Block[]): string {
  return blocks.map((b) => b.sep + b.prefix + b.text).join('');
}

// ─── Document context: sections and key terms ─────────────────────────────────

const SECTION_NAME =
  /^(?:abstract|summary|introduction|background|literature review|related work|theoretical framework|methods?|methodology|materials and methods|data and methods|results|findings|discussion|conclusions?|limitations|implications)\b/i;
// Sections where precision matters more than voice get light edits automatically.
const PRECISION_SECTION =
  /^(?:abstract|summary|methods?|methodology|materials and methods|data and methods|results|findings)\b/i;
const PRECISION_SUBHEADING =
  /\b(?:participants?|sample|procedure|measures?|instruments?|materials|design|data collection|statistical|analys[ie]s|descriptive)\b/i;

const STOPWORDS = new Set(
  'about after also among an and are as at be been before being between both but by can could did do does during each for from had has have how however if in into is it its may might more most much must no not of on or our over per such than that the their them then there these they this those through thus to under upon very via was we were what when where whether which while who will with within would you your et al versus vs eg ie'.split(
    ' ',
  ),
);

/** Terms the document leans on; swapping them for synonyms makes a paper inconsistent. */
export function extractKeyTerms(texts: string[], max = 6): string[] {
  type Tally = { n: number; blocks: Set<number> };
  const unigrams = new Map<string, Tally>();
  const bigrams = new Map<string, Tally>();
  const bump = (map: Map<string, Tally>, key: string, i: number) => {
    const t = map.get(key) ?? { n: 0, blocks: new Set<number>() };
    t.n++;
    t.blocks.add(i);
    map.set(key, t);
  };
  texts.forEach((text, i) => {
    const prose = text
      .replace(AUTHOR_YEAR_CITATION, ' ')
      .replace(NUMERIC_CITATION, ' ');
    const words = prose.toLowerCase().match(/[a-z][a-z'-]*[a-z]/g) ?? [];
    words.forEach((w, j) => {
      if (STOPWORDS.has(w)) return;
      if (w.length >= 5) bump(unigrams, w, i);
      const next = words[j + 1];
      if (next && !STOPWORDS.has(next)) bump(bigrams, `${w} ${next}`, i);
    });
  });
  const frequent = (map: Map<string, Tally>, minCount: number) =>
    [...map.entries()]
      .filter(([, t]) => t.n >= minCount && t.blocks.size >= 2)
      .sort((a, b) => b[1].n - a[1].n)
      .map(([term]) => term);
  const pairs = frequent(bigrams, 3).slice(0, Math.ceil(max / 2));
  const singles = frequent(unigrams, 3).filter(
    (u) => !pairs.some((p) => p.split(' ').includes(u)),
  );
  return [...pairs, ...singles].slice(0, max);
}

// ─── Invariants (must survive the rewrite) ────────────────────────────────────

const AUTHOR_YEAR_CITATION =
  /\((?:[A-Z][^()]{0,160}?)?\b(?:1[6-9]\d{2}|20\d{2})[a-z]?\b[^()]{0,60}\)/g;
const NUMERIC_CITATION = /\[\d+(?:\s*[,\u2013-]\s*\d+)*\]/g;
// Includes APA-style decimals without a leading zero (p < .05, r = .42).
const NUMBER = /(?<![\w.])(?:\d+(?:[.,]\d+)*|\.\d+)/g;
const URL_OR_EMAIL =
  /https?:\/\/[^\s<>"')]+|\b[\w.%+-]+@[\w.-]+\.[a-z]{2,}\b/gi;
// Statistical notation such as "SD = 0.62", "t(310) = 4.87", "p < .001", or "\u03B1 = .89".
const STAT =
  /(?<![\w\u00B2])(?:M|SD|SE|SEM|Mdn|IQR|n|N|df|r|R2|R\u00B2|p|d|g|t|F|z|U|OR|RR|HR|CI|\u03B1|\u03B2|\u03B7\u00B2|\u03C7\u00B2|\u03C9\u00B2)\s*(?:\(\d+(?:\.\d+)?(?:,\s*\d+(?:\.\d+)?)?\))?\s*[=<>\u2264\u2265]\s*[-\u2212]?\.?\d[\d.,]*/g;
const PERCENT = /(?<![\w.])\d+(?:\.\d+)?\s?%/g;

const normalizeToken = (t: string) =>
  t.replace(/[.,;]+$/, '').replace(/(\d)\s+%$/, '$1%');

export function extractInvariants(text: string): string[] {
  const found = new Set<string>();
  let rest = text;
  for (const re of [
    AUTHOR_YEAR_CITATION,
    NUMERIC_CITATION,
    URL_OR_EMAIL,
    STAT,
    PERCENT,
  ]) {
    for (const m of rest.matchAll(re)) found.add(normalizeToken(m[0]));
    // Numbers inside a citation, URL, or statistic are covered by it; listing them twice
    // makes models restate the year in prose.
    rest = rest.replace(re, ' ');
  }
  for (const m of rest.matchAll(NUMBER)) found.add(m[0].replace(/[.,]+$/, ''));
  return [...found].filter(Boolean);
}

const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const normalizeAuthors = (s: string) =>
  s.replace(/\s*&\s*/g, ' and ').replace(/\s+/g, ' ');

/**
 * "(Bloom et al., 2015)" also counts as present when written narratively as
 * "Bloom et al. (2015)": APA allows both, and authors and years stay intact.
 */
function citationPresent(output: string, citation: string): boolean {
  if (output.includes(citation)) return true;
  const out = normalizeAuthors(output);
  return citation
    .slice(1, -1)
    .split(/;\s*/)
    .every((part) => {
      const m = part.match(/^(.*?),?\s+((?:1[6-9]|20)\d{2}[a-z]?)(.*)$/);
      if (!m) return out.includes(normalizeAuthors(part.trim()));
      const [, authors, year, rest] = m;
      const pages = rest.replace(/^[,\s]+/, '').trim();
      if (pages && !out.includes(pages)) return false;
      if (!authors.trim()) return out.includes(year);
      const name = normalizeAuthors(authors.trim());
      for (
        let at = out.indexOf(name);
        at >= 0;
        at = out.indexOf(name, at + 1)
      ) {
        if (out.slice(at + name.length, at + name.length + 40).includes(year))
          return true;
      }
      return false;
    });
}

const squash = (s: string) => s.replace(/\s+/g, '');

function containsInvariant(output: string, token: string): boolean {
  if (token.startsWith('(')) return citationPresent(output, token);
  if (token.endsWith('%')) {
    return new RegExp(
      `(?<![\\d.,])${escapeRegex(token.slice(0, -1))}\\s?%`,
    ).test(output);
  }
  if (/[=<>\u2264\u2265]/.test(token))
    return squash(output).includes(squash(token));
  if (/^\d+(?:[.,]\d+)*$/.test(token)) {
    return new RegExp(
      `(?<![\\d.,])${escapeRegex(token)}(?![\\d]|[.,]\\d)`,
    ).test(output);
  }
  return output.includes(token);
}

// ─── Machine-writing tells that trigger a retry ───────────────────────────────

const RETRY_TELLS: RegExp[] = [
  /\bdelv(?:e|es|ed|ing)\b/gi,
  /\btapestry\b/gi,
  /\b(?:a |is a |stands as a |serves as a )?testament to\b/gi,
  /\bin (?:today[\u2019']s|the) (?:digital age|modern world|fast-paced world)\b/gi,
  /\bin today[\u2019']s\b/gi,
  /\bever-(?:evolving|changing)\b/gi,
  /\bplays? (?:a |an )?(?:crucial|vital|pivotal|key|significant|central|important) role\b/gi,
  /\b(?:it is|it[\u2019']s) (?:important|worth|crucial|essential) (?:to note|noting|to remember|to recognize)\b/gi,
  /\bit should be noted\b/gi,
  /\b(?:furthermore|moreover|additionally)\b/gi,
  /\bin (?:conclusion|summary)\b/gi,
  /\bto summarize\b/gi,
  /\bnavigat(?:e|es|ing) (?:the|this|these) (?:complex|digital|ever|evolving|challenges|landscape|world)/gi,
  /\b(?:digital|evolving|changing|complex) landscape\b/gi,
  /\bthe realm of\b/gi,
  /\ba (?:myriad|plethora) of\b/gi,
  /\bvaluable insights?\b/gi,
  /\bembark(?:s|ed|ing)? on\b/gi,
  /\bunlock(?:s|ing)? the (?:full )?potential\b/gi,
  /\bharness(?:es|ing)? the\b/gi,
  /\bfoster(?:s|ed|ing)?\b(?!\s+(?:care|parents?|famil(?:y|ies)|homes?|child(?:ren)?|youth|placements?))/gi,
  /\bunderscor(?:e|es|ed|ing)\b/gi,
  /\bshowcas(?:e|es|ed|ing)\b/gi,
  /\billuminat(?:e|es|ed|ing)\b/gi,
  /\bmultifaceted\b/gi,
  /\butiliz(?:e|es|ed|ing|ation)\b/gi,
  /\bvibrant\b/gi,
  /\bparamount\b/gi,
  /\bnot only\b[^.!?]{1,120}\bbut also\b/gi,
  /,\s(?:highlighting|underscoring|emphasizing|showcasing|reflecting)\s(?:the|its|their|how)\b/gi,
];

export function findTells(text: string): string[] {
  const hits: string[] = [];
  for (const re of RETRY_TELLS) {
    for (const m of text.matchAll(re)) hits.push(m[0].toLowerCase().trim());
  }
  return [...new Set(hits)];
}

// Words that make a claim sound more certain, and hedges that keep it tentative.
const STRONG_CLAIM =
  /\b(?:must|always|never|proves?|proved|proven|clearly|certainly|undoubtedly|definitely|demonstrat(?:e|es|ed)|resolv(?:e|es|ed)|guarantee[sd]?|ensures?|ensured)\b/gi;
// "can elevate stress" is not "often triggers stress".
const FREQUENCY =
  /\b(?:often|frequently|usually|typically|commonly|generally|mostly|routinely)\b/gi;
const HEDGE =
  /\b(?:may|might|could|can|suggests?|suggested|indicates?|indicated|appears?|likely|possibly|potentially|associated|correlat\w*|tends? to)\b/gi;
// "should consider hybrid models" is a softer recommendation than "should adopt" them.
const SOFTENER =
  /\b(?:consider(?:s|ed|ing)?|explor(?:e|es|ed|ing)|examin(?:e|es|ed|ing) whether)\b/gi;

const sentencesOf = (text: string) =>
  text
    .replace(/\bet al\./g, 'et al\uE000')
    .split(/(?<=[.!?])\s+(?=["(]?[A-Z0-9])/)
    .map((s) => s.replace(/\uE000/g, '.'));
const hedged = (sentence: string) =>
  new RegExp(HEDGE.source, 'i').test(sentence);

/** First author and year of each citation: "(Wang et al., 2021)" or "Wang et al. (2021)". */
function citedSources(text: string): { name: string; year: string }[] {
  const found: { name: string; year: string }[] = [];
  for (const m of text.matchAll(
    /\(([A-Z][A-Za-z'-]+)[^()]*?\b((?:1[6-9]|20)\d{2})[a-z]?\b[^()]*\)|\b([A-Z][A-Za-z'-]+)(?: et al\.| (?:and|&) [A-Z][A-Za-z'-]+)? \(((?:1[6-9]|20)\d{2})[a-z]?\)/g,
  )) {
    found.push({ name: m[1] ?? m[3], year: m[2] ?? m[4] });
  }
  return found;
}

/** A cited claim that was tentative ("can erode") must not become a flat finding ("reduced"). */
function citedHedgeLost(original: string, rewritten: string): string | null {
  const before = sentencesOf(original);
  const after = sentencesOf(rewritten);
  for (const { name, year } of citedSources(original)) {
    const was = before.find((s) => s.includes(name) && s.includes(year));
    if (!was || !hedged(was)) continue;
    const now = after.find((s) => s.includes(name) && s.includes(year));
    if (now && !hedged(now)) {
      return `the claim cited to ${name} (${year}) lost its hedge; keep words such as "can" or "may" in that sentence`;
    }
  }
  return null;
}

function certaintyDrift(original: string, rewritten: string): string | null {
  const cited = citedHedgeLost(original, rewritten);
  if (cited) return cited;
  const lowerOriginal = original.toLowerCase();
  // Compare by stem so "demonstrated" in the original covers "demonstrates".
  const added = [
    ...new Set(
      [
        ...(rewritten.match(STRONG_CLAIM) ?? []),
        ...(rewritten.match(FREQUENCY) ?? []),
      ]
        .map((w) => w.toLowerCase())
        .filter(
          (w) => !lowerOriginal.includes(w.slice(0, Math.max(4, w.length - 2))),
        ),
    ),
  ];
  if (added.length) {
    return `claims sound more certain than the original (added "${added.join('", "')}"); keep the original modal verbs and hedges`;
  }
  const softerBefore = (original.match(SOFTENER) ?? []).length;
  if (softerBefore > (rewritten.match(SOFTENER) ?? []).length) {
    return 'a recommendation became more forceful; keep softening verbs such as "consider" and "explore" where the original uses them';
  }
  const before = (original.match(HEDGE) ?? []).length;
  const after = (rewritten.match(HEDGE) ?? []).length;
  if ((before >= 1 && after === 0) || (before >= 2 && after < before / 2)) {
    return 'hedging was removed; keep words such as may, could, and suggests where the original uses them';
  }
  return null;
}

// Methodological terms that a paraphrase easily loosens ("moderate" is not "influence").
const METHOD_TERMS =
  /\b(?:self-report(?:ed|s)?|cross-sectional|longitudinal|(?:quasi-)?experimental|randomi[sz]ed|control group|moderat(?:e|es|ed|ing|or|ors|ion)|mediat(?:e|es|ed|ing|or|ors|ion)|correlat(?:ion|ions|ional|ed)|causal(?:ity)?|effect sizes?|significant(?:ly)?|constructs?|validity|reliability|internal consistency|winsori[sz](?:ed|ation)|outliers?|confidence intervals?|regression|variance|covariates?|meta-analys[ie]s|systematic review|qualitative|quantitative|cohort|placebo|baseline|follow-up|odds ratio|prevalence|incidence|hypothes[ie]s)\b/gi;
const HYPHENATED = /\b[A-Za-z]+(?:-[A-Za-z]+)+\b/g;
const ACRONYM = /\b[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)*\b/g;

/** Precise terms a paragraph uses: methodological terms, hyphenated compounds, acronyms. */
export function precisionTerms(text: string): string[] {
  const prose = text.replace(AUTHOR_YEAR_CITATION, ' ');
  const all = (re: RegExp): string[] => prose.match(re) ?? [];
  const terms = [
    ...all(METHOD_TERMS).map((t) => t.toLowerCase()),
    ...all(HYPHENATED).map((t) => t.toLowerCase()),
    ...all(ACRONYM),
  ];
  return [...new Set(terms)].slice(0, 15);
}

function droppedTerms(original: string, rewritten: string): string[] {
  const out = rewritten.toLowerCase();
  return precisionTerms(original).filter((t) => {
    // Method terms may change form ("moderate" / "moderating"); compounds and acronyms may not.
    const key = /[-A-Z0-9]/.test(t) ? t.toLowerCase() : t.slice(0, 6);
    return !out.includes(key);
  });
}

// "First, ... Second, ... Third," numbers an argument across paragraphs that are
// rewritten separately; dropping one breaks the sequence.
const ORDINAL_OPENER =
  /^(First|Firstly|Second|Secondly|Third|Thirdly|Fourth|Fifth|Finally|Lastly|Next)\b/;

// ─── Output cleanup ───────────────────────────────────────────────────────────

export function cleanModelOutput(output: string, original: string): string {
  let s = output.trim();
  s = s
    .replace(/^```[a-z]*\s*\n?/i, '')
    .replace(/\n?```$/, '')
    .trim();
  s = s.replace(/<\/?paragraph>/gi, '').trim();
  s = s.replace(
    /^(?:sure|okay|ok|certainly|of course|here(?:[\u2019']s| is| are)|rewritten(?: paragraph| version| text)?|revised(?: paragraph| version| text)?)\b[^\n]*:\s*\n+/i,
    '',
  );
  // Some models put a short note after a blank line; the paragraph is the first block.
  if (!/\n\s*\n/.test(original)) s = s.split(/\n\s*\n/)[0];
  if (!/\n/.test(original)) s = s.replace(/\s*\n\s*/g, ' ');
  if (
    /^["\u201C]/.test(s) &&
    /["\u201D]$/.test(s) &&
    !/^["\u201C]/.test(original.trim())
  )
    s = s.slice(1, -1).trim();
  if (!/\*\*|__/.test(original)) s = s.replace(/\*\*|__/g, '');
  return s.trim();
}

/** Normalise typography that gives away model output (non-breaking hyphens, em dashes, curly quotes). */
export function normalizeTypography(text: string, original: string): string {
  let s = cleanInvisible(text);

  if (!/[\u201C\u201D\u2018\u2019]/.test(original)) {
    s = s.replace(/[\u201C\u201D]/g, '"').replace(/[\u2018\u2019]/g, "'");
  }
  if (!/\u2026/.test(original)) s = s.replace(/\u2026/g, '...');
  if (!/\u2013/.test(original)) s = s.replace(/(\d)\s*\u2013\s*(\d)/g, '$1-$2');
  if (!/\u2014|--|\s\u2013\s/.test(original)) {
    s = s.replace(/\s*(?:\u2014|--|\s\u2013\s)\s*/g, ', ');
  }

  // Never touch a decimal point: "p < .001" and "r = .34" keep their spaces.
  return s
    .replace(/,\s*([,;:!?]|\.(?!\d))/g, '$1')
    .replace(/ {2,}/g, ' ')
    .replace(/\s+([,;:!?]|\.(?!\d))/g, '$1')
    .trim();
}

const CONTRACTIONS: [RegExp, string][] = [
  [/\b(it|he|she|that|there|who|what)'s been\b/gi, '$1 has been'],
  [/\bwon't\b/gi, 'will not'],
  [/\bcan't\b/gi, 'cannot'],
  [/\bshan't\b/gi, 'shall not'],
  [/\blet's\b/gi, 'let us'],
  [
    /\b(do|does|did|is|are|was|were|has|have|had|would|could|should|must|need)n't\b/gi,
    '$1 not',
  ],
  [/\b(it|that|there|here|what|who|he|she)'s\b/gi, '$1 is'],
  [/\b(they|we|you)'re\b/gi, '$1 are'],
  [/\b(they|we|you|I)'ve\b/gi, '$1 have'],
  [/\b(they|we|you|I|he|she|it)'ll\b/gi, '$1 will'],
  [/\b(they|we|you|I|he|she)'d\b/gi, '$1 would'],
  [/\bI'm\b/g, 'I am'],
];

export function expandContractions(text: string): string {
  let s = text;
  for (const [re, rep] of CONTRACTIONS) {
    s = s.replace(re, (match, ...groups) => {
      const out = rep.replace(
        /\$1/g,
        typeof groups[0] === 'string' ? groups[0] : '',
      );
      return /^[A-Z]/.test(match) ? out[0].toUpperCase() + out.slice(1) : out;
    });
  }
  return s;
}

const hasContractions = (s: string) =>
  /\b\w+n't\b|\b(?:it|that|there|they|we|you|I)'(?:s|re|ve|ll|d|m)\b/i.test(s);

/** Deterministic, meaning-preserving cleanup applied to every rewritten paragraph. */
// Sentence openers that carry no content. Models are told to drop them but some keep
// them; deleting them never changes meaning.
const EMPTY_OPENER =
  /(^|[.!?]\s+)(?:(?:it is|it's) (?:important|worth) (?:to note|noting) that|furthermore,|moreover,|additionally,|in conclusion,|in summary,|to summarize,|overall,|in today[\u2019']s (?:fast-paced |digital |modern |ever-changing |rapidly changing )?(?:world|age|era|society|landscape),)\s+(\w)/gi;

export function polish(text: string, original: string, tone: string): string {
  let s = normalizeTypography(text, original);
  s = s
    .replace(/\bin order to\b/gi, 'to')
    .replace(/\bdue to the fact that\b/gi, 'because')
    .replace(
      EMPTY_OPENER,
      (_, lead: string, c: string) => lead + c.toUpperCase(),
    );
  if (
    (tone === 'academic' || tone === 'formal') &&
    !hasContractions(original)
  ) {
    s = expandContractions(s);
  }
  return s;
}

// ─── Validation ───────────────────────────────────────────────────────────────

const LENGTH_BOUNDS: Record<string, [number, number]> = {
  light: [0.75, 1.25],
  medium: [0.65, 1.3],
  strong: [0.55, 1.45],
};

export function checkRewrite(
  original: string,
  rewritten: string,
  strength: string,
): CheckResult {
  const origWords = wordCount(original);
  const lengthRatio = origWords > 0 ? wordCount(rewritten) / origWords : 1;
  const [lo, hi] = LENGTH_BOUNDS[strength] ?? LENGTH_BOUNDS.medium;
  // Short paragraphs legitimately swing more in relative length.
  const slack = origWords < 30 ? 0.25 : 0;

  const missing = extractInvariants(original).filter(
    (t) => !containsInvariant(rewritten, t),
  );
  const tells = findTells(rewritten);

  const hard: string[] = [];
  if (!rewritten.trim()) hard.push('empty output');
  if (missing.length) hard.push(`missing: ${missing.join(', ')}`);
  if (lengthRatio < lo - slack) hard.push('too short: content was dropped');
  if (lengthRatio > hi + slack) hard.push('too long: content was added');
  if (/^(?:#|[-*\u2022]\s)/.test(rewritten.trim()))
    hard.push('added formatting');

  const soft: string[] = [];
  if (tells.length) soft.push(`machine-sounding phrases: ${tells.join(', ')}`);
  const dropped = droppedTerms(original, rewritten);
  if (dropped.length) {
    soft.push(
      `dropped precise terms: ${dropped.map((t) => `"${t}"`).join(', ')}; keep them as written`,
    );
  }
  const ordinal = original.trim().match(ORDINAL_OPENER)?.[1];
  if (ordinal && !rewritten.trim().startsWith(ordinal)) {
    soft.push(
      `start with "${ordinal}" as the original does; it numbers the document's argument`,
    );
  }
  if (origWords >= 30 && lengthRatio > 1.15) {
    soft.push(
      'wordier than the original; say the same thing in about the same number of words',
    );
  }
  const drift = certaintyDrift(original, rewritten);
  if (drift) soft.push(drift);

  const problems = [...hard, ...soft];
  return {
    ok: problems.length === 0,
    missing,
    tells,
    lengthRatio,
    hard,
    soft,
    problems,
  };
}

// ─── Prompts ──────────────────────────────────────────────────────────────────

const FORMAL_TONES = new Set(['academic', 'formal']);

const TONE_GUIDE: Record<string, string> = {
  academic:
    'Academic register for a university paper or journal article, written the way a skilled academic author writes: precise, plain, and direct. Formal does not mean wordy or stiff, so avoid inflated phrasing such as "warrant consideration", "commit resources to", "in the context of", or "serves to". No contractions. No first person unless the original uses it. No rhetorical questions, slang, or exclamation marks.',
  formal:
    'Professional, formal register: plain, precise, and confident. No contractions. Avoid inflated or bureaucratic phrasing.',
  natural:
    'Clear, plain, neutral English, the way a thoughtful person writes. Contractions are fine where they sound natural.',
  conversational:
    'Relaxed and friendly, like a knowledgeable person explaining something to a peer. Use contractions. Address the reader as "you" only if the original does.',
  blog: 'Readable blog style with a confident, personable voice. Use contractions. Lively but never hyped.',
};

const STRENGTH_GUIDE: Record<string, string> = {
  light:
    'LIGHT EDIT. Keep the sentence order and most sentence structures. Change only the wording and constructions that sound machine-generated. Roughly a third of the sentences should change.',
  medium:
    'REWRITE. Put every sentence in your own words. You may merge, split, or reorder clauses inside the paragraph, but keep the overall order of ideas.',
  strong:
    'DEEP REWRITE. Rebuild the paragraph from its ideas: reorder sentences where the logic allows, combine and split sentences, and rephrase everything, while keeping every claim.',
};

const RHYTHM_HINTS = [
  'Open with a short, direct sentence.',
  'Avoid opening consecutive sentences with their grammatical subject.',
  'Let one long sentence carry the main line of reasoning and keep the others brief.',
  'Close on a specific point from the paragraph rather than a general summary.',
  'Give the most important point its own short sentence.',
];

export function buildSystemPrompt(settings: HumanizeSettings): string {
  const tone = TONE_GUIDE[settings.tone] ?? TONE_GUIDE.natural;
  const strength = STRENGTH_GUIDE[settings.strength] ?? STRENGTH_GUIDE.medium;
  const formal = FORMAL_TONES.has(settings.tone);
  const h = settings.humanization;
  const intensity =
    h >= 0.7
      ? formal
        ? 'Vary sentence length clearly: mix shorter sentences with longer ones that carry a full line of reasoning, and never start two consecutive sentences with the same word. This is formal prose, so no fragments or punchy one-liners. Build shorter sentences by splitting existing content, never by trimming details.'
        : 'Push sentence rhythm hard: pair short sentences with long ones and never start two consecutive sentences with the same word. Build short sentences by splitting existing content, never by trimming details.'
      : h < 0.3
        ? 'Be conservative. Where the original already reads naturally, keep its phrasing.'
        : 'Vary sentence length and openings noticeably, the way an attentive writer does.';

  return `You are an experienced human editor. You revise drafts written by AI models so they read as if a careful, knowledgeable person wrote them. The goal is better writing, not merely different writing: clearer, more specific, and more natural, with the uneven rhythm of real prose.

REGISTER
${tone}

HOW MUCH TO CHANGE
${strength}
${intensity}

WHAT MAKES A DRAFT SOUND MACHINE-WRITTEN, AND WHAT TO DO INSTEAD
1. Even rhythm. AI sentences tend to share one medium length and one subject-verb-object shape. Mix lengths on purpose and vary how sentences open.
2. Signposting. Do not use "Furthermore", "Moreover", "Additionally", "In conclusion", "In summary", "Overall", "Ultimately", "Notably", or "Importantly". Let the logic connect the sentences, or use plain connectors (but, so, yet, because, still, also) sparingly. Keep words that signal real contrast or cause (however, but, because, therefore) where the logic needs them.
3. Stock vocabulary. Never use: delve, utilize, tapestry, testament, landscape (figurative), realm, pivotal, crucial, vital, paramount, foster, navigate (figurative), leverage, harness, underscore, showcase, illuminate, multifaceted, intricate, nuanced, seamless, holistic, vibrant, ever-evolving, unlock, empower, embark, bolster, "plays a crucial/vital/key role", "in today's digital age", "a wide range of", "it is important to note", "it is worth noting", "valuable insights", "serves as". Choose plain, specific words instead.
4. Formulas. Avoid "not only X but also Y", trailing participle clauses (", highlighting ...", ", ensuring ...", ", underscoring ..."), and automatic lists of three. If the last sentence only restates the paragraph, fold any claim it makes into an earlier sentence.
5. Abstraction. Prefer verbs to nominalizations ("the implementation of" becomes "implementing"; "has an impact on" becomes "affects").
6. Punctuation. No em dashes or en dashes as punctuation; use commas, colons, parentheses, or a new sentence. Straight quotes and ordinary hyphens only.
7. Precision and economy. Never replace a precise term with a looser paraphrase: a statistical "moderate" is not "influence", "self-reported productivity" is not "productivity", and "organizational identification" is not "a sense of belonging". When two wordings say the same thing, choose the shorter one; never make a sentence longer just to vary rhythm.

NON-NEGOTIABLE
- Keep every claim, fact, finding, example, and qualification, including who or what is compared and with what effect. Add no new facts, examples, statistics, anecdotes, opinions, or imagery.
- Do not add specifics, reasons, metaphors, or concluding remarks the original does not contain. If the original is general ("the right strategies"), stay general. Never borrow content from the context paragraph.
- Keep the original's level of certainty: "should" stays "should" (never "must"), "should consider" never becomes "should adopt", "may" stays "may", "can" never becomes "often", "can lead to" never becomes "leads to", "suggests" never becomes "demonstrates", "addresses" never becomes "resolves", and "is associated with" never becomes "causes".
- Keep each sentence's tense and time frame. Finished work stays in the past or present tense, never the future.
- Copy citations exactly as written, for example "(Smith et al., 2020)" or "[3]", and keep each one attached to the claim it supports.
- Copy numbers, units, percentages, statistics (such as "p < .001" or "r = .34"), dates, names, abbreviations, and technical terms exactly as written. If the original says "3 hours", write "3 hours". Keep statistical notation as symbols (M, SD, N, n, p, r, t, d, %, and Greek letters) rather than spelling it out, and keep enumerations such as (1), (2) or (a), (b) in front of the items they label.
- Return one paragraph of plain text: no headings, bullet points, bold, quotation marks around the whole answer, or commentary.`;
}

export function buildUserPrompt(
  block: Block,
  index: number,
  ctx: {
    title: string | null;
    previous: string | null;
    settings: HumanizeSettings;
    feedback: string[];
    section?: string | null;
    keyTerms?: string[];
  },
): string {
  const parts: string[] = [];
  if (ctx.title)
    parts.push(`This paragraph comes from a document titled "${ctx.title}".`);
  if (ctx.section) parts.push(`It belongs to the "${ctx.section}" section.`);
  if (ctx.previous) {
    const prev =
      ctx.previous.length > 700
        ? `${ctx.previous.slice(0, 700)}...`
        : ctx.previous;
    parts.push(
      `For continuity only (do not rewrite it), the paragraph before it reads:\n"${prev}"`,
    );
  }
  parts.push(
    block.prefix
      ? 'Rewrite the text inside <paragraph> tags. It follows a label or list marker, so do not add one.'
      : 'Rewrite the paragraph inside <paragraph> tags.',
  );
  if (ctx.settings.strength !== 'light') {
    parts.push(
      `Structural suggestion, only if it fits naturally: ${RHYTHM_HINTS[index % RHYTHM_HINTS.length]}`,
    );
  }
  const ordinal = block.text.trim().match(ORDINAL_OPENER)?.[1];
  if (ordinal) {
    parts.push(
      `The paragraph opens with "${ordinal}", which numbers the document's argument. Keep "${ordinal}" as its first word.`,
    );
  }
  const lower = block.text.toLowerCase();
  const terms = (ctx.keyTerms ?? []).filter((t) => lower.includes(t));
  if (terms.length) {
    parts.push(
      `Key terms used throughout the document. Keep them as written instead of switching to synonyms: ${terms.map((t) => `"${t}"`).join(', ')}.`,
    );
  }
  const precise = precisionTerms(block.text).filter((t) => !terms.includes(t));
  if (precise.length) {
    parts.push(
      `Precise terms to keep as written: ${precise.map((t) => `"${t}"`).join(', ')}.`,
    );
  }
  const invariants = extractInvariants(block.text);
  if (invariants.length) {
    parts.push(
      `These must appear exactly as written: ${invariants.map((t) => `"${t}"`).join(', ')}.`,
    );
  }
  if (ctx.feedback.length) {
    parts.push(
      `Your previous attempt was rejected. Fix these problems:\n${ctx.feedback.map((f) => `- ${f}`).join('\n')}`,
    );
  }
  parts.push(`<paragraph>\n${block.text}\n</paragraph>`);
  return parts.join('\n\n');
}

// ─── Orchestration ────────────────────────────────────────────────────────────

async function mapPool<T, R>(
  items: T[],
  limit: number,
  fn: (item: T, i: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const worker = async () => {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i], i);
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(limit, items.length) }, worker),
  );
  return results;
}

interface BlockOutcome {
  text: string;
  status: 'rewritten' | 'kept' | 'error';
}

export interface AttemptInfo {
  block: number;
  attempt: number;
  problems: string[];
  error?: string;
}

interface BlockContext {
  title: string | null;
  previous: string | null;
  settings: HumanizeSettings;
  section: string | null;
  keyTerms: string[];
}

interface BlockOptions {
  maxAttempts: number;
  onAttempt?: (info: AttemptInfo) => void;
  deadline?: number;
}

async function rewriteBlock(
  block: Block,
  index: number,
  ctx: BlockContext,
  complete: CompleteFn,
  opts: BlockOptions,
): Promise<BlockOutcome> {
  const { maxAttempts, onAttempt, deadline } = opts;
  const system = buildSystemPrompt(ctx.settings);
  const maxTokens = Math.min(
    8192,
    Math.ceil(wordCount(block.text) * 3.5) + 1500,
  );
  let best: { text: string; check: CheckResult } | null = null;
  let feedback: string[] = [];
  let anyResponse = false;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Past the time budget, settle for what we have instead of retrying.
    if (attempt > 0 && deadline !== undefined && Date.now() > deadline) break;
    let raw: string;
    try {
      raw = await complete(
        system,
        buildUserPrompt(block, index, { ...ctx, feedback }),
        maxTokens,
      );
    } catch (err) {
      onAttempt?.({
        block: index,
        attempt,
        problems: [],
        error: err instanceof Error ? err.message : String(err),
      });
      continue;
    }
    anyResponse = true;
    const text = polish(
      cleanModelOutput(raw, block.text),
      block.text,
      ctx.settings.tone,
    );
    const check = checkRewrite(block.text, text, ctx.settings.strength);
    onAttempt?.({ block: index, attempt, problems: check.problems });
    if (check.ok) return { text, status: 'rewritten' };

    const rank = (c: CheckResult) =>
      c.missing.length * 100 + c.hard.length * 10 + c.soft.length;
    if (!best || rank(check) < rank(best.check)) best = { text, check };
    feedback = check.problems;
  }

  // Leftover stock phrases or certainty drift are tolerable; lost content is not.
  if (best && best.check.hard.length === 0) {
    return { text: best.text, status: 'rewritten' };
  }
  return { text: block.text, status: anyResponse ? 'kept' : 'error' };
}

/** Section and subheading in force for every block, from the headings seen so far. */
function sectionContext(blocks: Block[]) {
  let section: string | null = null;
  let subheading: string | null = null;
  return blocks.map((b) => {
    if (b.kind === 'verbatim' && !b.text.includes('\n') && isHeading(b.text)) {
      const name = b.text
        .replace(/^#+\s*/, '')
        .replace(/^\d+(?:\.\d+)*[.)]?\s+/, '')
        .trim();
      if (SECTION_NAME.test(name)) {
        section = name;
        subheading = null;
      } else {
        subheading = name;
      }
    }
    return { section, subheading };
  });
}

/** Papers: a reference list, two or more standard section headings, or several citations. */
export function looksAcademic(blocks: Block[]): boolean {
  const lines = blocks
    .filter((b) => b.kind === 'verbatim')
    .flatMap((b) => b.text.split('\n').map((l) => l.trim()));
  if (lines.some((l) => REFERENCE_HEADING.test(l))) return true;
  const sections = lines.filter(
    (l) =>
      isHeading(l) &&
      SECTION_NAME.test(
        l
          .replace(/^#+\s*/, '')
          .replace(/^\d+(?:\.\d+)*[.)]?\s+/, '')
          .trim(),
      ),
  ).length;
  if (sections >= 2) return true;
  const prose = blocks
    .filter((b) => b.kind === 'prose')
    .map((b) => b.text)
    .join(' ');
  const citations =
    (prose.match(AUTHOR_YEAR_CITATION) ?? []).length +
    (prose.match(NUMERIC_CITATION) ?? []).length;
  return citations >= 3;
}

function needsPrecision(
  block: Block,
  where: { section: string | null; subheading: string | null },
): boolean {
  if (where.section && PRECISION_SECTION.test(where.section)) return true;
  if (where.subheading && PRECISION_SUBHEADING.test(where.subheading))
    return true;
  const numbers = (block.text.match(NUMBER) ?? []).length;
  return numbers >= 6 && numbers / Math.max(wordCount(block.text), 1) >= 0.05;
}

export async function humanizeDocument(
  raw: string,
  settings: HumanizeSettings,
  complete: CompleteFn,
  opts: {
    concurrency?: number;
    maxAttempts?: number;
    onAttempt?: (info: AttemptInfo) => void;
    /** Epoch ms after which no new attempts (first tries or retries) start. */
    deadline?: number;
  } = {},
): Promise<{
  text: string;
  rewritten: number;
  kept: number;
  total: number;
  academicStyle: boolean;
}> {
  const blocks = segmentDocument(raw);
  // The default "natural" tone would give a paper contractions and a casual register.
  const academicStyle = settings.tone === 'natural' && looksAcademic(blocks);
  const base: HumanizeSettings = academicStyle
    ? { ...settings, tone: 'academic' }
    : settings;
  const firstProse = blocks.findIndex((b) => b.kind === 'prose');
  const title =
    firstProse > 0 && blocks[0].kind === 'verbatim'
      ? blocks[0].text.split('\n')[0].replace(/^#+\s*/, '')
      : null;
  const where = sectionContext(blocks);

  const proseIdx = blocks
    .map((b, i) => (b.kind === 'prose' ? i : -1))
    .filter((i) => i >= 0);
  const keyTerms = extractKeyTerms(proseIdx.map((i) => blocks[i].text));

  const outcomes = await mapPool(proseIdx, opts.concurrency ?? 5, (bi, n) => {
    // Out of time: leave the remaining paragraphs as written rather than time out.
    if (opts.deadline !== undefined && Date.now() > opts.deadline) {
      return Promise.resolve<BlockOutcome>({
        text: blocks[bi].text,
        status: 'error',
      });
    }
    const prev = blocks
      .slice(0, bi)
      .reverse()
      .find((b) => b.kind === 'prose');
    const { section, subheading } = where[bi];
    const precise =
      base.strength !== 'light' && needsPrecision(blocks[bi], where[bi]);
    const ctx: BlockContext = {
      title,
      previous: prev?.text ?? null,
      settings: precise ? { ...base, strength: 'light' } : base,
      section:
        subheading && section
          ? `${section}: ${subheading}`
          : (subheading ?? section),
      keyTerms,
    };
    return rewriteBlock(blocks[bi], n, ctx, complete, {
      maxAttempts: opts.maxAttempts ?? 2,
      onAttempt: opts.onAttempt,
      deadline: opts.deadline,
    });
  });

  if (proseIdx.length > 0 && outcomes.every((o) => o.status === 'error')) {
    throw new HumanizerUnavailableError();
  }

  proseIdx.forEach((bi, n) => {
    blocks[bi] = { ...blocks[bi], text: outcomes[n].text };
  });

  return {
    text: joinBlocks(blocks),
    rewritten: outcomes.filter((o) => o.status === 'rewritten').length,
    kept: outcomes.filter((o) => o.status !== 'rewritten').length,
    total: proseIdx.length,
    academicStyle,
  };
}
