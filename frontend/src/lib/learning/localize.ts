import type { FrameworkId } from './types';

/**
 * Content is written in US spelling. For students in Canada, the UK and Australia we swap
 * whole words to the local spelling so lessons match what their teachers expect.
 * Only unambiguous whole words are listed (e.g. not "tire", which is also a verb).
 */
const COMMONWEALTH: Record<string, string> = {
  color: 'colour', colors: 'colours', colorful: 'colourful', favorite: 'favourite', favorites: 'favourites',
  behavior: 'behaviour', neighbor: 'neighbour', neighbors: 'neighbours', honor: 'honour', humor: 'humour',
  labor: 'labour', flavor: 'flavour', center: 'centre', centers: 'centres', theater: 'theatre', meter: 'metre',
  meters: 'metres', liter: 'litre', gray: 'grey', traveled: 'travelled', traveling: 'travelling', pedaled: 'pedalled',
  canceled: 'cancelled', labeled: 'labelled', modeled: 'modelled', jewelry: 'jewellery', mold: 'mould',
  counselor: 'counsellor', counselors: 'counsellors', neighborhood: 'neighbourhood', neighborhoods: 'neighbourhoods',
  neighboring: 'neighbouring', kilometer: 'kilometre', kilometers: 'kilometres', millimeter: 'millimetre',
  millimeters: 'millimetres', fibers: 'fibres', colored: 'coloured', favor: 'favour', vapor: 'vapour',
};

/** UK and Australia also use -ise. Canada keeps -ize. */
const ISE: Record<string, string> = {
  organize: 'organise', organized: 'organised', organizing: 'organising', organizes: 'organises',
  organization: 'organisation', organizational: 'organisational', organizer: 'organiser', organizers: 'organisers',
  realize: 'realise', realized: 'realised', recognize: 'recognise', recognized: 'recognised', summarize: 'summarise',
  summarizes: 'summarises', summarizing: 'summarising', emphasize: 'emphasise', apologize: 'apologise',
  memorize: 'memorise', categorize: 'categorise', analyze: 'analyse', analyzes: 'analyses', analyzing: 'analysing',
  criticize: 'criticise', prioritize: 'prioritise', practicing: 'practising', synthesize: 'synthesise',
  synthesizes: 'synthesises', synthesizing: 'synthesising',
};

function tableFor(framework: FrameworkId | null): Record<string, string> | null {
  if (!framework || framework === 'us-ccss') return null;
  if (framework === 'ca-on') return COMMONWEALTH;
  // UK and Australia. ("period" is not swapped: content already says "period (full stop)", and
  // "period" also means a class period.)
  return { ...COMMONWEALTH, ...ISE };
}

const cache = new Map<string, RegExp>();

export function localize(text: string, framework: FrameworkId | null): string {
  const table = tableFor(framework);
  if (!table || !text) return text;
  const key = framework!;
  let re = cache.get(key);
  if (!re) {
    re = new RegExp(`\\b(${Object.keys(table).join('|')})\\b`, 'gi');
    cache.set(key, re);
  }
  return text.replace(re, (word) => {
    const local = table[word.toLowerCase()];
    if (!local) return word;
    // Keep the original capitalization.
    if (word === word.toUpperCase() && word.length > 1) return local.toUpperCase();
    if (word[0] === word[0].toUpperCase()) return local[0].toUpperCase() + local.slice(1);
    return local;
  });
}
