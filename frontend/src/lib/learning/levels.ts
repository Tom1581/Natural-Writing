/** Student-facing names for rubric levels. Levels are categories, not a percentage. */
export const LEVEL_LABELS: Record<number, string> = {
  1: 'Getting started',
  2: 'Developing',
  3: 'Meets the goal',
  4: 'Beyond the goal',
};

export const BAND_LABELS: Record<string, string> = {
  'K-2': 'Kindergarten–Grade 2',
  '3-5': 'Grades 3–5',
  '6-8': 'Grades 6–8',
  '9-10': 'Grades 9–10',
  '11-12': 'Grades 11–12',
};

export const BAND_ORDER = ['K-2', '3-5', '6-8', '9-10', '11-12'] as const;

/** The same age group in England, which counts one year ahead (Year 1 is the year children turn six). */
export const UK_YEARS_BY_BAND: Record<string, string> = {
  'K-2': 'Years 1–3',
  '3-5': 'Years 4–6',
  '6-8': 'Years 7–9',
  '9-10': 'Years 10–11',
  '11-12': 'Years 12–13',
};
