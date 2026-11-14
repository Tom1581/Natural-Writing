import { SITE_URL } from './public';

/** JSON for a <script type="application/ld+json">, with "<" escaped so text can't close the tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export const PUBLISHER = {
  '@type': 'Organization',
  name: 'Natural Quill',
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
} as const;

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.href}` })),
  };
}

export function itemListLd(name: string, items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: `${SITE_URL}${it.href}` })),
  };
}

export const GENRE_NAMES: Record<string, string> = {
  opinion: 'Opinion and argument',
  informative: 'Informative and explanatory',
  narrative: 'Narrative',
};

/*
 * Page titles. Search results show roughly the first 60 characters of a title, so the words a
 * person searched for have to come first and the brand suffix has to be short. Search Console
 * (Oct–Nov 2026) shows teachers searching by spoken grade ("3rd grade opinion writing rubric",
 * "rubrics for first grade"), while our bands are named "Grades 3–5"; these helpers put both in.
 */

/** A band's grades the way US teachers and parents say them. */
export const BAND_GRADE_WORDS: Record<string, string> = {
  'K-2': 'Kindergarten, 1st and 2nd Grade',
  '3-5': '3rd, 4th and 5th Grade',
  '6-8': '6th, 7th and 8th Grade',
  '9-10': '9th and 10th Grade',
  '11-12': '11th and 12th Grade',
};

/** The same age group in Australia, which numbers years like the US after Foundation. */
export const AU_YEARS_BY_BAND: Record<string, string> = {
  'K-2': 'Foundation to Year 2',
  '3-5': 'Years 3–5',
  '6-8': 'Years 6–8',
  '9-10': 'Years 9–10',
  '11-12': 'Years 11–12',
};

/** One word for a genre: US schools say "opinion" up to grade 5 and "argument" from grade 6. */
export const genreWord = (genre: string, band: string) =>
  genre === 'opinion' ? (band === 'K-2' || band === '3-5' ? 'Opinion' : 'Argument') : genre === 'informative' ? 'Informative' : 'Narrative';

/** "8th Grade" for grade "8"; kindergarten has no ordinal. */
export function ordinalGrade(grade: string) {
  if (grade === 'K') return 'Kindergarten';
  const n = Number(grade);
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return `${n}${suffix} Grade`;
}

/** Typical ages during a US grade year (kindergarten is 5–6). Cut-off dates vary, so this is a guide. */
export function gradeAges(grade: string) {
  const start = grade === 'K' ? 5 : Number(grade) + 5;
  return `ages ${start}–${start + 1}`;
}
