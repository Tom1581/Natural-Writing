import type { Genre } from './types';

export type FrameworkId = 'us-ccss' | 'ca-on' | 'uk-eng' | 'au-ac9';

export interface StandardStatement {
  framework: FrameworkId;
  /** Official code (for England: the programme-of-study section heading). */
  code: string;
  shortCode: string;
  /** Grade, year or key stage the statement belongs to, in the framework's own terms. */
  scope: string;
  title?: string;
  /** Verbatim text from the official document; empty when cited by code and title only. */
  text: string;
  url: string;
}

export interface Framework {
  id: FrameworkId;
  country: string;
  name: string;
  shortName: string;
  version: string;
  /** How the student's school year is named locally. */
  gradeWord: 'Grade' | 'Year';
  /**
   * Local year → the internal grade band index used for content (US grade equivalent).
   * England's Year 1 is the year children turn 6, a year ahead of US/Canadian/Australian numbering.
   */
  localToGrade: Record<string, string>;
  /** Spelling and terminology the evaluator and feedback must follow. */
  locale: {
    spelling: string;
    terms: string;
  };
  sources: { title: string; url: string }[];
  /** Where a grade's alignment is a reference point rather than a national writing standard. */
  gradeNotes?: Record<string, string>;
}

export const FRAMEWORKS: Framework[] = [
  {
    id: 'us-ccss',
    country: 'United States',
    name: 'Common Core State Standards for English Language Arts',
    shortName: 'Common Core (US)',
    version: '2010',
    gradeWord: 'Grade',
    localToGrade: {
      K: 'K',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': '11',
      '12': '12',
    },
    locale: {
      spelling: 'American English spelling (color, organize, center)',
      terms:
        'Use US school terms: "period", "quotation marks", "transition words", "paragraph", "opinion piece", "argument", "informative/explanatory".',
    },
    sources: [
      {
        title:
          'Common Core: English Language Arts Standards, Writing (Kindergarten–Grade 12)',
        url: 'https://www.thecorestandards.org/ELA-Literacy/W/',
      },
      {
        title:
          'Common Core: English Language Arts Standards, Language (Kindergarten–Grade 12)',
        url: 'https://www.thecorestandards.org/ELA-Literacy/L/',
      },
    ],
  },
  {
    id: 'ca-on',
    country: 'Canada',
    name: 'The Ontario Curriculum: Language (Grades 1–8) and English (Grades 9–12)',
    shortName: 'Ontario curriculum (Canada)',
    version:
      'Language 2023; English Grade 9 (ENL1W) 2023; English Grades 10–12 2007',
    gradeWord: 'Grade',
    localToGrade: {
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': '11',
      '12': '12',
    },
    locale: {
      spelling:
        'Canadian English spelling (colour, centre, organize); accept American and British spellings without penalty',
      terms:
        'Use Canadian school terms: "period", "quotation marks", "transition words", "paragraph", "persuasive text", "informational text".',
    },
    sources: [
      {
        title:
          'Ontario Language (2023), Strand D: Composition, Expressing Ideas and Creating Texts',
        url: 'https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/71479a73-926e-4145-abed-845c6ad8d954/Expectations_StrandD.pdf',
      },
      {
        title: 'Ontario Language (2023), Strand B: Foundations of Language',
        url: 'https://assets-us-01.kc-usercontent.com/fbd574c4-da36-0066-a0c5-849ffb2de96e/7bae5e4f-2c0f-43d1-b637-8138ef000eb3/Expectations_StrandB.pdf',
      },
      {
        title: 'Ontario Curriculum and Resources: Language',
        url: 'https://www.dcp.edu.gov.on.ca/en/curriculum/elementary-language',
      },
      {
        title: 'English, Grade 9, De-streamed (ENL1W), 2023',
        url: 'https://www.dcp.edu.gov.on.ca/en/curriculum/secondary-english/courses/enl1w',
      },
      {
        title: 'The Ontario Curriculum, Grades 9 and 10: English (2007)',
        url: 'https://www.edu.gov.on.ca/eng/curriculum/secondary/english910currb.pdf',
      },
      {
        title: 'The Ontario Curriculum, Grades 11 and 12: English (2007)',
        url: 'https://www.edu.gov.on.ca/eng/curriculum/secondary/english1112currb.pdf',
      },
    ],
    gradeNotes: {
      '1': 'Ontario’s Kindergarten program is not organized by grade-level writing expectations, so practice starts at Grade 1.',
      '10': 'Grades 10–12 are aligned to the university-preparation courses (ENG2D, ENG3U, ENG4U). The Writing expectations of the other pathways are close, with different examples.',
      '11': 'Aligned to English, Grade 11, University Preparation (ENG3U).',
      '12': 'Aligned to English, Grade 12, University Preparation (ENG4U).',
    },
  },
  {
    id: 'uk-eng',
    country: 'United Kingdom (England)',
    name: 'National Curriculum in England: English programmes of study',
    shortName: 'National Curriculum (England)',
    version:
      '2013 programmes of study (KS4 2014); 2018 KS2 teacher assessment framework',
    gradeNotes: {
      '12': 'England has no national writing curriculum for Years 12–13 (A level specifications are set by exam boards). The key stage 4 statements are shown as the starting point.',
      '13': 'England has no national writing curriculum for Years 12–13 (A level specifications are set by exam boards). The key stage 4 statements are shown as the starting point.',
    },
    gradeWord: 'Year',
    localToGrade: {
      '1': 'K',
      '2': '1',
      '3': '2',
      '4': '3',
      '5': '4',
      '6': '5',
      '7': '6',
      '8': '7',
      '9': '8',
      '10': '9',
      '11': '10',
      '12': '11',
      '13': '12',
    },
    locale: {
      spelling:
        'British English spelling (colour, organise, centre, practise as a verb)',
      terms:
        'Use English school terms: "full stop", "inverted commas" or "speech marks", "fronted adverbials", "cohesive devices", "paragraphs", "persuasive writing", "non-narrative".',
    },
    sources: [
      {
        title:
          'English programmes of study: key stages 1 and 2 (statutory guidance)',
        url: 'https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study',
      },
      {
        title: 'English programme of study: key stage 3 (statutory guidance)',
        url: 'https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study',
      },
      {
        title: 'English programme of study: key stage 4 (statutory guidance)',
        url: 'https://www.gov.uk/government/publications/national-curriculum-in-england-english-programmes-of-study',
      },
      {
        title:
          'Teacher assessment frameworks at the end of key stage 2 (English writing, 2018 onwards)',
        url: 'https://www.gov.uk/government/publications/teacher-assessment-frameworks-at-the-end-of-key-stage-2',
      },
    ],
  },
  {
    id: 'au-ac9',
    country: 'Australia',
    name: 'Australian Curriculum: English',
    shortName: 'Australian Curriculum v9.0',
    version: 'Version 9.0',
    gradeWord: 'Year',
    localToGrade: {
      F: 'K',
      '1': '1',
      '2': '2',
      '3': '3',
      '4': '4',
      '5': '5',
      '6': '6',
      '7': '7',
      '8': '8',
      '9': '9',
      '10': '10',
      '11': '11',
      '12': '12',
    },
    locale: {
      spelling: 'Australian English spelling (colour, organise, centre)',
      terms:
        'Use Australian school terms: "full stop", "quotation marks", "text connectives", "noun groups", "paragraphs", "persuasive text", "informative text", "imaginative text".',
    },
    sources: [
      {
        title:
          'Australian Curriculum: English F–6 Version 9.0 curriculum content',
        url: 'https://v9.australiancurriculum.edu.au/content/dam/en/curriculum/ac-version-9/downloads/english/english-curriculum-content-f-6-v9.docx',
      },
      {
        title:
          'Australian Curriculum: English 7–10 Version 9.0 curriculum content',
        url: 'https://www.australiancurriculum.edu.au/content/dam/en/curriculum/ac-version-9/downloads/english/english-curriculum-content-7-10-v9.docx',
      },
      {
        title: 'Senior Secondary Australian Curriculum: English (Units 1–4)',
        url: 'https://v8.australiancurriculum.edu.au/senior-secondary-curriculum/english/english/',
      },
    ],
    gradeNotes: {
      '11': 'Years 11–12 are aligned to the national Senior Secondary English content descriptions. States and territories teach senior English through their own syllabuses (for example HSC, VCE or WACE), so check your state’s course too.',
      '12': 'Years 11–12 are aligned to the national Senior Secondary English content descriptions. States and territories teach senior English through their own syllabuses (for example HSC, VCE or WACE), so check your state’s course too.',
    },
  },
];

export const getFramework = (id: string) => FRAMEWORKS.find((f) => f.id === id);

export function localGradeLabel(
  frameworkId: FrameworkId,
  grade: string,
): string {
  const fw = getFramework(frameworkId)!;
  const local =
    Object.entries(fw.localToGrade).find(([, g]) => g === grade)?.[0] ?? grade;
  return localYearLabel(fw, local);
}

/** Local years in school order. Object keys alone would put "K" and "F" after the numbers. */
export const localYears = (fw: Framework): string[] =>
  Object.keys(fw.localToGrade).sort(
    (a, b) => (Number(a) || 0) - (Number(b) || 0),
  );

/** "Kindergarten", "Foundation", "Grade 4", "Year 7": a local year as schools name it. */
export function localYearLabel(fw: Framework, local: string): string {
  if (local === 'K') return 'Kindergarten';
  if (local === 'F') return 'Foundation';
  return `${fw.gradeWord} ${local}`;
}

export type AlignmentSkill =
  | 'purpose.claim'
  | 'purpose.story'
  | 'purpose.topic'
  | 'organization.structure'
  | 'development.evidence'
  | 'development.detail'
  | 'development.information'
  | 'development.counterclaim'
  | 'sentences.control'
  | 'word_choice.precision'
  | 'conventions.mechanics'
  | 'revision';

/**
 * Which official statements a skill is assessed against, for one framework, grade (US
 * equivalent, "K".."12") and genre. Returns statement ids into STANDARD_STATEMENTS.
 * Each mapping was chosen by matching the rubric descriptor to the statement wording.
 */
export function alignmentIds(
  framework: FrameworkId,
  grade: string,
  genre: Genre,
  skill: AlignmentSkill,
): string[] {
  const g = grade === 'K' ? 0 : Number(grade);
  switch (framework) {
    case 'us-ccss':
      return ccss(g, genre, skill).map((c) => `us-ccss:${c}`);
    case 'ca-on':
      if (g === 0) return [];
      return (g <= 9 ? ontario(g, skill) : ontarioSecondary(skill)).map(
        (c) => `ca-on:${g}:${c}`,
      );
    case 'uk-eng':
      return england(g, genre, skill).map((c) => `uk-eng:${c}`);
    case 'au-ac9':
      return g >= 11
        ? australiaSenior(g, skill).map((c) => `au-ac9:${c}`)
        : australia(g, skill).map((c) => `au-ac9:AC9E${g === 0 ? 'F' : g}${c}`);
  }
}

/** Common Core W.1 = opinion/argument, W.2 = informative/explanatory, W.3 = narrative. */
function ccss(g: number, genre: Genre, skill: AlignmentSkill): string[] {
  const w = genre === 'opinion' ? 1 : genre === 'informative' ? 2 : 3;
  // Kindergarten to grade 2: each text-type standard is one statement with no lettered parts.
  if (g <= 2) {
    const k = g === 0 ? 'K' : String(g);
    return {
      'purpose.claim': [`W.${k}.1`],
      'purpose.topic': [`W.${k}.2`],
      'purpose.story': [`W.${k}.3`],
      'organization.structure': [`W.${k}.${w}`],
      'development.evidence': [`W.${k}.1`],
      'development.information': [`W.${k}.2`],
      'development.detail': [`W.${k}.3`],
      'development.counterclaim': [],
      'sentences.control': [{ 0: 'L.K.1.f', 1: 'L.1.1.j', 2: 'L.2.1.f' }[g]!],
      'word_choice.precision': [`L.${k}.6`],
      'conventions.mechanics': [`L.${k}.1`, `L.${k}.2`],
      revision: [`W.${k}.5`],
    }[skill];
  }
  // Grades 9–12 are written as two-year spans.
  if (g >= 9) {
    const s = g <= 10 ? '9-10' : '11-12';
    const conclusion = genre === 'informative' ? 'f' : 'e';
    return {
      'purpose.claim': [`W.${s}.1`, `W.${s}.1.a`],
      'purpose.topic': [`W.${s}.2`, `W.${s}.2.a`],
      'purpose.story': [`W.${s}.3`, `W.${s}.3.a`],
      'organization.structure': [
        `W.${s}.${w}.a`,
        `W.${s}.${w}.c`,
        `W.${s}.${w}.${conclusion}`,
        `W.${s}.4`,
      ],
      'development.evidence': [`W.${s}.1.b`, `W.${s}.8`],
      'development.information': [`W.${s}.2.b`, `W.${s}.8`],
      'development.detail': [`W.${s}.3.b`, `W.${s}.3.d`],
      'development.counterclaim': [`W.${s}.1.a`, `W.${s}.1.b`],
      'sentences.control':
        s === '9-10'
          ? ['L.9-10.1', 'L.9-10.1.b']
          : ['L.11-12.1', 'L.11-12.3.a'],
      'word_choice.precision': [
        `L.${s}.6`,
        genre === 'opinion'
          ? `W.${s}.1.d`
          : genre === 'informative'
            ? `W.${s}.2.d`
            : `W.${s}.3.d`,
      ],
      'conventions.mechanics': [`L.${s}.1`, `L.${s}.2`],
      revision: [`W.${s}.5`],
    }[skill];
  }
  const conclusion =
    genre === 'opinion'
      ? g >= 6
        ? 'e'
        : 'd'
      : genre === 'informative'
        ? g === 3
          ? 'd'
          : g <= 5
            ? 'e'
            : 'f'
        : g === 3
          ? 'd'
          : 'e';
  switch (skill) {
    case 'purpose.claim':
      return [`W.${g}.1`, `W.${g}.1.a`];
    case 'purpose.topic':
      return [`W.${g}.2`, `W.${g}.2.a`];
    case 'purpose.story':
      return [`W.${g}.3`, `W.${g}.3.a`];
    case 'organization.structure':
      return [
        `W.${g}.${w}.a`,
        `W.${g}.${w}.c`,
        `W.${g}.${w}.${conclusion}`,
        `W.${g}.4`,
      ];
    case 'development.evidence':
      return [`W.${g}.1.b`];
    case 'development.information':
      return [`W.${g}.2.b`];
    case 'development.detail':
      return [`W.${g}.3.b`];
    case 'development.counterclaim':
      return g >= 6 ? [`W.${g}.1.a`, `W.${g}.1.b`] : [];
    case 'sentences.control':
      return {
        3: ['L.3.1.i', 'L.3.1.h'],
        4: ['L.4.1.f'],
        5: ['L.5.3.a'],
        6: ['L.6.3.a'],
        7: ['L.7.1.b'],
        8: ['L.8.1', 'L.8.3.a'],
      }[g]!;
    case 'word_choice.precision': {
      const lang = {
        3: 'L.3.3.a',
        4: 'L.4.3.a',
        5: 'L.5.6',
        6: 'L.6.6',
        7: 'L.7.3.a',
        8: 'L.8.6',
      }[g]!;
      const genreSpecific =
        genre === 'narrative' && g >= 4
          ? [`W.${g}.3.d`]
          : genre === 'informative' && g >= 4
            ? [`W.${g}.2.d`]
            : genre === 'opinion' && g >= 6
              ? [`W.${g}.1.d`]
              : [];
      return [lang, ...genreSpecific];
    }
    case 'conventions.mechanics':
      return [`L.${g}.1`, `L.${g}.2`];
    case 'revision':
      return [`W.${g}.5`];
  }
}

/**
 * Ontario Language 2023 (Grades 1–8) and English Grade 9 (ENL1W, 2023) share the same codes:
 * Strand D (composition) for ideas, organization and revision; Strand B for language conventions.
 */
function ontario(g: number, skill: AlignmentSkill): string[] {
  switch (skill) {
    case 'purpose.claim':
      return ['D1.1', 'D2.3'];
    case 'purpose.topic':
      return ['D1.1', 'D2.1'];
    case 'purpose.story':
      return ['D1.1', 'D2.4'];
    case 'organization.structure':
      return ['D1.4'];
    case 'development.evidence':
    case 'development.information':
      return ['D1.2', 'D1.3'];
    case 'development.detail':
      return ['D1.2', 'D2.3'];
    case 'development.counterclaim':
      return g === 9 ? ['D2.4', 'D1.3'] : ['D2.4'];
    case 'sentences.control':
      return ['B3.1'];
    case 'word_choice.precision':
      return g === 9 ? ['D2.3'] : ['D2.3', 'B2-vocabulary'];
    case 'conventions.mechanics':
      return ['B3.2', 'B3.3', 'D2.6'];
    case 'revision':
      return ['D2.5'];
  }
}

/** Ontario English 2007, Grades 10–12, Writing strand (overall expectations 1–4). */
function ontarioSecondary(skill: AlignmentSkill): string[] {
  return {
    'purpose.claim': ['W1.1', 'W2.1'],
    'purpose.topic': ['W1.1', 'W2.1'],
    'purpose.story': ['W2.1', 'W2.2'],
    'organization.structure': ['W1.4'],
    'development.evidence': ['W1.3', 'W1.5'],
    'development.information': ['W1.3', 'W1.5'],
    'development.detail': ['W2.3'],
    // The 2007 Writing strand has no counterclaim statement; exploring and testing ideas is the closest.
    'development.counterclaim': ['W1.2', 'W1.5'],
    'sentences.control': ['W2.4'],
    'word_choice.precision': ['W2.3', 'W2.2'],
    'conventions.mechanics': ['W3.1', 'W3.3', 'W3.4', 'W3.5'],
    revision: ['W2.6', 'W4.1'],
  }[skill];
}

/**
 * England: US grade g is England Year g+1 (kindergarten = Year 1). Years 1–2 = key stage 1,
 * Years 3–4 = lower KS2, Years 5–6 = upper KS2 (+ TAF at Year 6), Years 7–9 = KS3,
 * Years 10–11 = KS4. Years 12–13 have no national curriculum, so KS4 is the reference point.
 */
function england(g: number, genre: Genre, skill: AlignmentSkill): string[] {
  const year = g + 1;
  if (year === 1) {
    return {
      'purpose.claim': ['y1.say-aloud'],
      'purpose.topic': ['y1.say-aloud'],
      'purpose.story': ['y1.sequence'],
      'organization.structure': ['y1.sequence'],
      'development.evidence': ['y1.compose-orally'],
      'development.information': ['y1.compose-orally'],
      'development.detail': ['y1.compose-orally', 'y1.sequence'],
      'development.counterclaim': [],
      'sentences.control': ['y1.compose-orally', 'y1.and'],
      'word_choice.precision': ['y1.compose-orally'],
      'conventions.mechanics': ['y1.punctuate', 'y1.capitals'],
      revision: ['y1.reread', 'y1.discuss'],
    }[skill];
  }
  if (year === 2) {
    return {
      'purpose.claim': ['y2.purposes'],
      'purpose.topic': ['y2.real-events', 'y2.purposes'],
      'purpose.story': ['y2.narratives'],
      'organization.structure': ['y2.plan', 'y2.sentence-by-sentence'],
      'development.evidence': ['y2.ideas'],
      'development.information': ['y2.real-events', 'y2.ideas'],
      'development.detail': ['y2.narratives', 'y2.noun-phrases'],
      'development.counterclaim': [],
      'sentences.control': ['y2.subordination'],
      'word_choice.precision': ['y2.noun-phrases', 'y2.ideas'],
      'conventions.mechanics': ['y2.punctuation', 'y2.proofread'],
      revision: ['y2.evaluate'],
    }[skill];
  }
  if (year === 3 || year === 4) {
    return {
      'purpose.claim': ['lks2.plan-ideas'],
      'purpose.topic': ['lks2.plan-ideas', 'lks2.non-narrative'],
      'purpose.story': ['lks2.narrative'],
      'organization.structure':
        genre === 'informative'
          ? ['lks2.paragraphs', 'lks2.non-narrative', 'lks2.time-cause']
          : ['lks2.paragraphs', 'lks2.time-cause'],
      'development.evidence': ['lks2.plan-ideas'],
      'development.information': ['lks2.plan-ideas', 'lks2.non-narrative'],
      'development.detail': ['lks2.narrative'],
      'development.counterclaim': [],
      'sentences.control': [
        'lks2.vocab-sentences',
        'lks2.conjunctions',
        'lks2.fronted-adverbials',
      ],
      'word_choice.precision': ['lks2.vocab-sentences', 'lks2.nouns-pronouns'],
      'conventions.mechanics': ['lks2.punctuation', 'lks2.proofread'],
      revision: ['lks2.evaluate'],
    }[skill];
  }
  if (year === 5 || year === 6) {
    const taf = (ids: string[]) => (year === 6 ? ids : []);
    return {
      'purpose.claim': ['uks2.audience-purpose', ...taf(['taf.exs.purpose'])],
      'purpose.topic': ['uks2.audience-purpose', ...taf(['taf.exs.purpose'])],
      'purpose.story': [
        'uks2.audience-purpose',
        'uks2.narrative',
        ...taf(['taf.exs.narrative']),
      ],
      'organization.structure': [
        'uks2.cohesion',
        ...(genre === 'informative' ? ['uks2.organisational'] : []),
        ...taf(['taf.exs.cohesion']),
      ],
      'development.evidence': ['uks2.ideas', 'uks2.modal'],
      'development.information': ['uks2.ideas'],
      'development.detail': [
        'uks2.narrative',
        ...taf(['taf.exs.narrative', 'taf.exs.dialogue']),
      ],
      'development.counterclaim': [],
      'sentences.control': [
        'uks2.grammar-vocab',
        'uks2.relative-clauses',
        ...taf(['taf.exs.vocab-grammar']),
      ],
      'word_choice.precision': [
        'uks2.grammar-vocab',
        'uks2.agreement-register',
        ...taf(['taf.exs.vocab-grammar', 'taf.gds.register']),
      ],
      'conventions.mechanics': [
        'uks2.tense',
        'uks2.commas',
        'uks2.proofread',
        ...taf(['taf.exs.tense', 'taf.exs.punctuation', 'taf.exs.spelling']),
      ],
      revision: ['uks2.evaluate'],
    }[skill];
  }
  if (year <= 9) {
    return {
      'purpose.claim': ['ks3.forms', 'ks3.audience'],
      'purpose.topic': ['ks3.forms', 'ks3.audience'],
      'purpose.story': ['ks3.forms', 'ks3.audience'],
      'organization.structure': ['ks3.summarising', 'ks3.knowledge'],
      'development.evidence': ['ks3.summarising'],
      'development.information': ['ks3.summarising'],
      'development.detail': ['ks3.devices'],
      'development.counterclaim': ['ks3.forms', 'ks3.summarising'],
      'sentences.control': ['ks3.knowledge', 'ks3.new-vocab'],
      'word_choice.precision': ['ks3.new-vocab', 'ks3.registers'],
      'conventions.mechanics': ['ks3.accuracy', 'ks3.standard-english'],
      revision: ['ks3.amending'],
    }[skill];
  }
  return {
    'purpose.claim': ['ks4.purposes'],
    'purpose.topic': ['ks4.purposes'],
    'purpose.story': ['ks4.purposes', 'ks4.choices'],
    'organization.structure': ['ks4.evidence', 'ks4.choices'],
    'development.evidence': ['ks4.evidence', 'ks4.notes'],
    'development.information': ['ks4.evidence', 'ks4.notes'],
    'development.detail': ['ks4.choices'],
    'development.counterclaim': ['ks4.purposes', 'ks4.evidence'],
    'sentences.control': ['ks4.choices', 'ks4.new-vocab'],
    'word_choice.precision': ['ks4.choices', 'ks4.new-vocab'],
    'conventions.mechanics': ['ks4.accuracy'],
    revision: ['ks4.impact', 'ks4.restructuring'],
  }[skill];
}

/** Australian Curriculum v9 (Foundation–Year 10): LY06 (creating texts) every year, plus that year's Language strand. */
function australia(g: number, skill: AlignmentSkill): string[] {
  const vocab = {
    0: 'LA08',
    1: 'LA09',
    2: 'LA09',
    3: 'LA10',
    4: 'LA11',
    5: 'LA08',
    6: 'LA08',
    7: 'LA08',
    8: 'LA08',
    9: 'LA08',
    10: 'LA08',
  }[g]!;
  const sentences = {
    0: 'LA05',
    1: 'LA06',
    2: 'LA06',
    3: 'LA06',
    4: 'LA06',
    5: 'LA05',
    6: 'LA05',
    7: 'LA05',
    8: 'LA05',
    9: 'LA05',
    10: 'LA05',
  }[g]!;
  const punctuation = {
    0: ['LA09'],
    1: ['LA10'],
    2: ['LA10'],
    3: ['LA11', 'LA08'],
    4: ['LA12', 'LA09'],
    5: ['LA09'],
    6: ['LA09'],
    7: ['LA09', 'LA06'],
    8: ['LA09'],
    9: ['LA09'],
    10: [],
  }[g]!;
  const spelling = {
    0: ['LY13'],
    1: ['LY13'],
    2: ['LY12'],
    3: ['LY11', 'LY12'],
    4: ['LY10', 'LY11'],
    5: ['LY09'],
    6: ['LY09'],
    7: ['LY08'],
    8: ['LY08'],
    9: ['LY08'],
    10: ['LY08'],
  }[g]!;
  const structure = g === 0 ? [] : g <= 2 ? ['LA03'] : ['LA03', 'LA04'];
  switch (skill) {
    case 'purpose.claim':
    case 'purpose.topic':
    case 'purpose.story':
      return g === 0 ? ['LY06'] : ['LY06', 'LA03'];
    case 'organization.structure':
      return ['LY06', ...structure];
    case 'development.evidence':
      return g === 8 ? ['LY06', 'LA04'] : ['LY06'];
    case 'development.information':
      return g === 5 ? ['LY06', 'LA06'] : ['LY06'];
    case 'development.detail':
      return g === 5 || g === 6 ? ['LY06', 'LA06'] : ['LY06'];
    case 'development.counterclaim':
      return g >= 7 ? ['LY06'] : [];
    case 'sentences.control':
      return ['LY06', sentences];
    case 'word_choice.precision':
      return ['LY06', vocab];
    case 'conventions.mechanics':
      return ['LY06', ...punctuation, ...spelling];
    case 'revision':
      return ['LY06'];
  }
}

/** Senior Secondary Australian Curriculum: English. Year 11 = Units 1–2, Year 12 = Unit 4. */
function australiaSenior(g: number, skill: AlignmentSkill): string[] {
  if (g === 11) {
    return {
      'purpose.claim': ['ACEEN011', 'ACEEN032'],
      'purpose.topic': ['ACEEN011'],
      'purpose.story': ['ACEEN011', 'ACEEN032'],
      'organization.structure': ['ACEEN033'],
      'development.evidence': ['ACEEN014', 'ACEEN035'],
      'development.information': ['ACEEN011', 'ACEEN015'],
      'development.detail': ['ACEEN032', 'ACEEN034'],
      'development.counterclaim': ['ACEEN014'],
      'sentences.control': ['ACEEN017'],
      'word_choice.precision': ['ACEEN034'],
      'conventions.mechanics': ['ACEEN017'],
      revision: ['ACEEN016'],
    }[skill];
  }
  return {
    'purpose.claim': ['ACEEN069'],
    'purpose.topic': ['ACEEN069'],
    'purpose.story': ['ACEEN069'],
    'organization.structure': ['ACEEN071', 'ACEEN074'],
    'development.evidence': ['ACEEN072', 'ACEEN073'],
    'development.information': ['ACEEN072', 'ACEEN073'],
    'development.detail': ['ACEEN069'],
    'development.counterclaim': ['ACEEN071'],
    'sentences.control': ['ACEEN075'],
    'word_choice.precision': ['ACEEN070'],
    'conventions.mechanics': ['ACEEN075'],
    revision: ['ACEEN074'],
  }[skill];
}
