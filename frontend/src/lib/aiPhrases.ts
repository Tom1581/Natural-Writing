/**
 * Words and phrases that language models overuse, with plainer alternatives.
 * Shared by the free AI Phrase Checker and the "AI words to avoid" guide.
 *
 * `pattern` is a case-insensitive regex source without boundaries; letters are
 * not allowed directly before or after a match.
 * `strong` entries rarely appear in natural writing; `mild` ones are fine in
 * moderation and only stand out when they pile up.
 */

export type PhraseCategory = 'word' | 'phrase' | 'transition' | 'chatbot';

export interface AiPhrase {
  label: string;
  pattern: string;
  level: 'strong' | 'mild';
  category: PhraseCategory;
  instead: string;
}

export const CATEGORY_LABELS: Record<PhraseCategory, string> = {
  word: 'Overused words',
  phrase: 'Stock phrases',
  transition: 'Signposts and transitions',
  chatbot: 'Chatbot leftovers',
};

export const AI_PHRASES: AiPhrase[] = [
  // ── Overused words ──────────────────────────────────────────────────────────
  { label: 'delve (into)', pattern: 'delv(?:e|es|ed|ing)(?: (?:deeper )?into)?', level: 'strong', category: 'word', instead: 'look at, explore, examine' },
  { label: 'tapestry', pattern: '(?:rich |intricate |vibrant )?tapestr(?:y|ies)', level: 'strong', category: 'word', instead: 'mix, range, or cut the metaphor' },
  { label: 'testament (to)', pattern: '(?:a |is a |stands as a |serves as a )?testament to', level: 'strong', category: 'word', instead: 'shows, proves' },
  { label: 'realm', pattern: 'realms?', level: 'strong', category: 'word', instead: 'area, field' },
  { label: 'landscape (figurative)', pattern: '(?:digital |evolving |changing |competitive |business |educational |complex )landscapes?', level: 'strong', category: 'word', instead: 'field, market, situation' },
  { label: 'underscore', pattern: 'underscor(?:e|es|ed|ing)', level: 'strong', category: 'word', instead: 'shows, stresses' },
  { label: 'showcase', pattern: 'showcas(?:e|es|ed|ing)', level: 'mild', category: 'word', instead: 'shows, displays' },
  { label: 'pivotal', pattern: 'pivotal', level: 'mild', category: 'word', instead: 'key, central, or say why it matters' },
  { label: 'crucial', pattern: 'crucial(?:ly)?', level: 'mild', category: 'word', instead: 'important, key, or say what depends on it' },
  { label: 'vital', pattern: 'vital(?:ly)?', level: 'mild', category: 'word', instead: 'important, needed' },
  { label: 'paramount', pattern: 'paramount', level: 'strong', category: 'word', instead: 'most important, top priority' },
  { label: 'multifaceted', pattern: 'multi-?faceted', level: 'strong', category: 'word', instead: 'complex, many-sided' },
  { label: 'intricate', pattern: 'intricate(?:ly)?|intricacies', level: 'mild', category: 'word', instead: 'complex, detailed, details' },
  { label: 'nuanced', pattern: 'nuanced', level: 'mild', category: 'word', instead: 'subtle, careful, or name the nuance' },
  { label: 'foster', pattern: 'foster(?:s|ed|ing)?(?! (?:care|parents?|famil(?:y|ies)|homes?|child(?:ren)?|youth|placements?))', level: 'mild', category: 'word', instead: 'encourage, build, support' },
  { label: 'leverage (verb)', pattern: 'leverag(?:e|es|ed|ing)(?= (?:the|our|their|its|this|these|existing|AI|data|technology|tools?))', level: 'mild', category: 'word', instead: 'use, draw on' },
  { label: 'harness', pattern: 'harness(?:es|ed|ing)? the', level: 'strong', category: 'word', instead: 'use, put to work' },
  { label: 'navigate (figurative)', pattern: 'navigat(?:e|es|ed|ing) (?:the |these |this |through )?(?:complexities|complex|challenges|intricacies|uncertain|ever|evolving|digital|world|landscape|nuances)', level: 'strong', category: 'word', instead: 'handle, deal with, work through' },
  { label: 'embark (on)', pattern: 'embark(?:s|ed|ing)? (?:on|upon)', level: 'strong', category: 'word', instead: 'start, begin' },
  { label: 'unlock', pattern: 'unlock(?:s|ed|ing)? (?:the |your |its |their )?(?:full )?(?:potential|power|secrets?|possibilities)', level: 'strong', category: 'word', instead: 'make the most of, open up' },
  { label: 'empower', pattern: 'empower(?:s|ed|ing|ment)?', level: 'mild', category: 'word', instead: 'let, help, enable' },
  { label: 'elevate', pattern: 'elevat(?:e|es|ed|ing) (?:your|the|our|their)', level: 'mild', category: 'word', instead: 'improve, raise' },
  { label: 'streamline', pattern: 'streamlin(?:e|es|ed|ing)', level: 'mild', category: 'word', instead: 'simplify, speed up' },
  { label: 'seamless', pattern: 'seamless(?:ly)?', level: 'mild', category: 'word', instead: 'smooth, easy' },
  { label: 'holistic', pattern: 'holistic(?:ally)?', level: 'mild', category: 'word', instead: 'complete, whole, overall' },
  { label: 'vibrant', pattern: 'vibrant', level: 'mild', category: 'word', instead: 'lively, busy, colorful' },
  { label: 'bustling', pattern: 'bustling', level: 'strong', category: 'word', instead: 'busy, crowded' },
  { label: 'ever-evolving / ever-changing', pattern: 'ever-(?:evolving|changing|growing|expanding)', level: 'strong', category: 'word', instead: 'changing, growing' },
  { label: 'game-changer', pattern: 'game-?chang(?:er|ers|ing)', level: 'strong', category: 'word', instead: 'say what actually changed' },
  { label: 'groundbreaking', pattern: 'groundbreaking', level: 'mild', category: 'word', instead: 'new, first, or say what is new' },
  { label: 'cutting-edge', pattern: 'cutting-edge', level: 'mild', category: 'word', instead: 'latest, advanced' },
  { label: 'transformative', pattern: 'transformative', level: 'mild', category: 'word', instead: 'major, far-reaching' },
  { label: 'revolutionize', pattern: 'revolutioniz(?:e|es|ed|ing)', level: 'mild', category: 'word', instead: 'change, overhaul' },
  { label: 'paradigm (shift)', pattern: 'paradigm(?: shift)?', level: 'mild', category: 'word', instead: 'model, change in thinking' },
  { label: 'synergy', pattern: 'synerg(?:y|ies|istic)', level: 'strong', category: 'word', instead: 'cooperation, combined effect' },
  { label: 'plethora', pattern: '(?:a )?plethora(?: of)?', level: 'strong', category: 'word', instead: 'many, plenty of' },
  { label: 'myriad', pattern: '(?:a )?myriad(?: of)?', level: 'strong', category: 'word', instead: 'many, countless' },
  { label: 'a multitude of', pattern: 'a multitude of', level: 'strong', category: 'word', instead: 'many' },
  { label: 'resonate (with)', pattern: 'resonat(?:e|es|ed|ing) with', level: 'mild', category: 'word', instead: 'appeal to, connect with' },
  { label: 'garner', pattern: 'garner(?:s|ed|ing)?', level: 'mild', category: 'word', instead: 'get, earn, attract' },
  { label: 'bolster', pattern: 'bolster(?:s|ed|ing)?', level: 'mild', category: 'word', instead: 'strengthen, support' },
  { label: 'spearhead', pattern: 'spearhead(?:s|ed|ing)?', level: 'mild', category: 'word', instead: 'lead' },
  { label: 'meticulous', pattern: 'meticulous(?:ly)?', level: 'mild', category: 'word', instead: 'careful, thorough' },
  { label: 'commendable', pattern: 'commendable', level: 'strong', category: 'word', instead: 'good, impressive' },
  { label: 'enigmatic', pattern: 'enigmatic', level: 'strong', category: 'word', instead: 'puzzling, mysterious' },
  { label: 'captivating', pattern: 'captivating', level: 'mild', category: 'word', instead: 'gripping, interesting' },
  { label: 'profound', pattern: 'profound(?:ly)?', level: 'mild', category: 'word', instead: 'deep, major' },
  { label: 'noteworthy', pattern: 'noteworthy', level: 'mild', category: 'word', instead: 'notable, worth mentioning' },
  { label: 'comprehensive', pattern: 'comprehensive(?:ly)?', level: 'mild', category: 'word', instead: 'full, complete, thorough' },
  { label: 'robust (non-technical)', pattern: 'robust(?! (?:standard errors?|regression|to|estimat))', level: 'mild', category: 'word', instead: 'strong, reliable' },
  { label: 'utilize', pattern: 'utiliz(?:e|es|ed|ing|ation)', level: 'mild', category: 'word', instead: 'use' },
  { label: 'facilitate', pattern: 'facilitat(?:e|es|ed|ing)', level: 'mild', category: 'word', instead: 'help, make easier, run' },
  { label: 'commence', pattern: 'commenc(?:e|es|ed|ing)', level: 'mild', category: 'word', instead: 'start, begin' },
  { label: 'endeavor', pattern: 'endeavou?rs?', level: 'mild', category: 'word', instead: 'effort, attempt, project' },
  { label: 'quintessential', pattern: 'quintessential(?:ly)?', level: 'strong', category: 'word', instead: 'typical, classic' },
  { label: 'unparalleled', pattern: 'unparalleled', level: 'mild', category: 'word', instead: 'unmatched, or give the comparison' },
  { label: 'invaluable', pattern: 'invaluable', level: 'mild', category: 'word', instead: 'very useful, essential' },
  { label: 'insightful', pattern: 'insightful', level: 'mild', category: 'word', instead: 'useful, sharp, or say what you learned' },

  // ── Stock phrases ───────────────────────────────────────────────────────────
  { label: 'plays a crucial / vital / key role', pattern: 'plays? (?:a |an )?(?:crucial|vital|pivotal|key|significant|central|critical|important|major|instrumental) role', level: 'strong', category: 'phrase', instead: 'matters for, drives, shapes' },
  { label: "in today's digital age / fast-paced world", pattern: "in (?:today[’']s|the|this|our) (?:digital age|digital era|modern world|modern era|fast-paced world|ever-changing world|rapidly changing world|digital world)", level: 'strong', category: 'phrase', instead: 'today, now, or cut it' },
  { label: "in today's world", pattern: "in today[’']s (?:world|society)", level: 'strong', category: 'phrase', instead: 'today, or cut it' },
  { label: 'it is important to note (that)', pattern: "(?:it is|it[’']s) (?:important|crucial|essential|vital) to (?:note|remember|recognize|understand|consider)(?: that)?", level: 'strong', category: 'phrase', instead: 'cut it and state the point' },
  { label: 'it is worth noting (that)', pattern: "(?:it is|it[’']s) worth (?:noting|mentioning|highlighting)(?: that)?", level: 'strong', category: 'phrase', instead: 'cut it, or "Note that"' },
  { label: 'it should be noted (that)', pattern: 'it should be noted(?: that)?', level: 'strong', category: 'phrase', instead: 'cut it' },
  { label: 'a wide range of', pattern: 'a (?:wide|broad|diverse|vast) (?:range|array|variety|spectrum) of', level: 'mild', category: 'phrase', instead: 'many, various, or list them' },
  { label: 'valuable insights', pattern: '(?:valuable|key|unique|deep|meaningful) insights?', level: 'strong', category: 'phrase', instead: 'say what was learned' },
  { label: 'the complexities of', pattern: 'the complexities of', level: 'mild', category: 'phrase', instead: 'the details of, the problems of' },
  { label: 'serves as a', pattern: 'serv(?:e|es|ed|ing) as (?:a|an|the) (?:powerful |vital |crucial |key |stark |poignant )?(?:reminder|testament|catalyst|cornerstone|foundation|beacon|bridge|tool|example)', level: 'strong', category: 'phrase', instead: 'is, shows, reminds us' },
  { label: 'stands as', pattern: 'stands as (?:a|an|the)', level: 'strong', category: 'phrase', instead: 'is' },
  { label: 'a stark reminder', pattern: 'a (?:stark|poignant|powerful|sobering) reminder', level: 'strong', category: 'phrase', instead: 'a reminder, or cut it' },
  { label: 'the power of', pattern: 'the (?:transformative )?power of', level: 'mild', category: 'phrase', instead: 'say what it does' },
  { label: 'in the realm of', pattern: 'in the (?:realm|world|sphere|arena) of', level: 'strong', category: 'phrase', instead: 'in' },
  { label: 'unlock the full potential', pattern: '(?:full|true) potential', level: 'mild', category: 'phrase', instead: 'make the most of it' },
  { label: 'pave the way (for)', pattern: 'pav(?:e|es|ed|ing) the way', level: 'mild', category: 'phrase', instead: 'lead to, make possible' },
  { label: 'shed light on', pattern: 'sh(?:ed|eds|edding) (?:new )?light on', level: 'mild', category: 'phrase', instead: 'explain, clarify' },
  { label: 'at the forefront of', pattern: 'at the forefront of', level: 'mild', category: 'phrase', instead: 'leading' },
  { label: 'a key component / factor', pattern: 'a (?:key|crucial|critical|vital|essential) (?:component|factor|aspect|element|part)', level: 'mild', category: 'phrase', instead: 'name the thing directly' },
  { label: 'in order to', pattern: 'in order to', level: 'mild', category: 'phrase', instead: 'to' },
  { label: 'due to the fact that', pattern: 'due to the fact that', level: 'mild', category: 'phrase', instead: 'because' },
  { label: 'when it comes to', pattern: 'when it comes to', level: 'mild', category: 'phrase', instead: 'for, with, in' },
  { label: 'it goes without saying', pattern: 'it goes without saying(?: that)?', level: 'strong', category: 'phrase', instead: 'cut it' },
  { label: 'not only … but also', pattern: "not only [^.!?]{1,80}? but (?:also)?", level: 'mild', category: 'phrase', instead: 'and, or split into two sentences' },
  { label: 'whether you are a … or a …', pattern: "whether you(?:'re| are) (?:a|an) [^.!?,]{1,40}? or (?:a|an|just)", level: 'strong', category: 'phrase', instead: 'speak to one reader' },
  { label: "it's not just … it's …", pattern: "(?:it|this)(?:'s| is) not just (?:about )?[^.!?]{1,60}?[,;—-]+ (?:it|this)(?:'s| is)", level: 'strong', category: 'phrase', instead: 'state the real point directly' },
  { label: 'a journey of / to', pattern: '(?:a|this|your) journey (?:of|to|through|towards?)', level: 'mild', category: 'phrase', instead: 'process, path, or cut it' },
  { label: 'dive into / deep dive', pattern: "(?:let[’']s )?dive (?:deep )?into|deep dive", level: 'mild', category: 'phrase', instead: 'look at' },

  // ── Signposts and transitions ───────────────────────────────────────────────
  { label: 'Furthermore,', pattern: 'furthermore', level: 'mild', category: 'transition', instead: 'Also, or cut it' },
  { label: 'Moreover,', pattern: 'moreover', level: 'mild', category: 'transition', instead: 'Also, Besides, or cut it' },
  { label: 'Additionally,', pattern: 'additionally', level: 'mild', category: 'transition', instead: 'Also, or cut it' },
  { label: 'In conclusion,', pattern: 'in conclusion', level: 'mild', category: 'transition', instead: 'cut it; your last paragraph already concludes' },
  { label: 'In summary, / To summarize,', pattern: 'in summary|to summarize|to sum up', level: 'mild', category: 'transition', instead: 'cut it' },
  { label: 'Overall,', pattern: '(?<=^|[.!?]\\s)overall,', level: 'mild', category: 'transition', instead: 'cut it' },
  { label: 'Ultimately,', pattern: 'ultimately,', level: 'mild', category: 'transition', instead: 'In the end, or cut it' },
  { label: 'Notably,', pattern: 'notably,', level: 'mild', category: 'transition', instead: 'cut it, or "In particular,"' },
  { label: 'Importantly,', pattern: 'importantly,', level: 'mild', category: 'transition', instead: 'cut it' },
  { label: 'Consequently,', pattern: 'consequently,', level: 'mild', category: 'transition', instead: 'So, As a result,' },
  { label: 'That being said,', pattern: 'that being said|having said that', level: 'mild', category: 'transition', instead: 'Still, But' },
  { label: 'In essence,', pattern: 'in essence|at its core', level: 'strong', category: 'transition', instead: 'cut it' },
  { label: 'As we move forward', pattern: 'as we (?:move forward|look ahead|look to the future)', level: 'strong', category: 'transition', instead: 'cut it' },
  { label: 'At the end of the day,', pattern: 'at the end of the day', level: 'mild', category: 'transition', instead: 'cut it' },

  // ── Chatbot leftovers ───────────────────────────────────────────────────────
  { label: 'Certainly! / Absolutely!', pattern: '(?<=^|[.!?]\\s)(?:certainly|absolutely|of course)!', level: 'strong', category: 'chatbot', instead: 'delete it' },
  { label: 'Great question', pattern: "(?:that[’']s a )?great question", level: 'strong', category: 'chatbot', instead: 'delete it' },
  { label: 'I hope this helps', pattern: 'i hope (?:this|that) helps', level: 'strong', category: 'chatbot', instead: 'delete it' },
  { label: 'I hope this email finds you well', pattern: 'i hope (?:this|my) (?:email|message|note) finds you well', level: 'strong', category: 'chatbot', instead: 'open with your point' },
  { label: 'As an AI language model', pattern: 'as an ai(?: language model)?', level: 'strong', category: 'chatbot', instead: 'delete it' },
  { label: "Here's a / Here is a … :", pattern: "(?<=^|\\n)(?:here[’']s|here is|here are) (?:a|an|the|some)[^\\n]{0,60}:", level: 'strong', category: 'chatbot', instead: 'delete the preamble' },
  { label: 'Feel free to', pattern: 'feel free to', level: 'mild', category: 'chatbot', instead: 'cut it, or just ask' },
  { label: "Let me know if you'd like", pattern: "let me know if you(?:[’']d| would) like", level: 'strong', category: 'chatbot', instead: 'delete it' },
  { label: 'In this article, we will', pattern: 'in this (?:article|essay|post|guide), (?:we|i) will', level: 'mild', category: 'chatbot', instead: 'start with the content' },
];

export interface PhraseMatch {
  start: number;
  end: number;
  text: string;
  phrase: AiPhrase;
}

const BOUNDARY_BEFORE = '(?<![A-Za-z])';
const BOUNDARY_AFTER = '(?![A-Za-z])';

// Longer patterns first so "a testament to" wins over shorter overlaps.
const ORDERED = [...AI_PHRASES].sort((a, b) => b.pattern.length - a.pattern.length);
const COMBINED = new RegExp(ORDERED.map((p) => `${BOUNDARY_BEFORE}(?:${p.pattern})${BOUNDARY_AFTER}`).join('|'), 'gi');
const SINGLE = ORDERED.map((p) => ({ phrase: p, re: new RegExp(`^(?:${p.pattern})$`, 'i') }));

export function findAiPhrases(text: string): PhraseMatch[] {
  const matches: PhraseMatch[] = [];
  for (const m of text.matchAll(COMBINED)) {
    const found = SINGLE.find((s) => s.re.test(m[0]));
    if (found && m.index !== undefined) {
      matches.push({ start: m.index, end: m.index + m[0].length, text: m[0], phrase: found.phrase });
    }
  }
  return matches;
}

export interface RhythmStats {
  words: number;
  sentences: number;
  meanLength: number;
  variation: number; // standard deviation / mean of sentence lengths
  shortest: number;
  longest: number;
  emDashes: number;
  repeatedOpeners: { word: string; count: number }[];
}

export function analyzeRhythm(text: string): RhythmStats {
  const words = text.split(/\s+/).filter(Boolean).length;
  const sentences = text
    .replace(/\s+/g, ' ')
    .split(/(?<=[.!?])\s+(?=["“(]?[A-Z0-9])/)
    .map((s) => s.trim())
    .filter((s) => s.split(' ').length >= 2);
  const lengths = sentences.map((s) => s.split(/\s+/).filter(Boolean).length);
  const mean = lengths.length ? lengths.reduce((a, b) => a + b, 0) / lengths.length : 0;
  const sd = lengths.length ? Math.sqrt(lengths.reduce((a, b) => a + (b - mean) ** 2, 0) / lengths.length) : 0;

  const openers = new Map<string, number>();
  for (const s of sentences) {
    const first = s.replace(/^["“(]+/, '').split(/[\s,]+/)[0]?.toLowerCase();
    if (first) openers.set(first, (openers.get(first) ?? 0) + 1);
  }
  const repeatedOpeners = [...openers.entries()]
    .filter(([, count]) => count >= 3 && count / Math.max(sentences.length, 1) >= 0.25)
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count);

  return {
    words,
    sentences: sentences.length,
    meanLength: mean,
    variation: mean ? sd / mean : 0,
    shortest: lengths.length ? Math.min(...lengths) : 0,
    longest: lengths.length ? Math.max(...lengths) : 0,
    emDashes: (text.match(/\u2014|\s--\s/g) ?? []).length,
    repeatedOpeners,
  };
}
