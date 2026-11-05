import type {
  DrillSet,
  Genre,
  Rubric,
  RubricDimension,
  Topic,
  WritingPrompt,
} from './types';
import { HIGH_SCHOOL_LESSONS } from './high-school-lessons';

/**
 * Grades 9–12. Argument and informative tasks are source-based: every source is written for
 * this site (fictional organizations and people, simplified facts), so students never need
 * outside reading and there are no rights questions.
 */

type HighBand = '9-10' | '11-12';
const PILOT = { status: 'pilot' as const };

const conventions = (four: string): RubricDimension => ({
  skillId: 'conventions.mechanics',
  levels: {
    1: 'Errors are frequent enough to interfere with meaning.',
    2: 'Noticeable errors in grammar, punctuation or spelling that sometimes distract the reader.',
    3: 'Few errors in grammar, usage, punctuation and spelling; quotations are punctuated and attributed correctly.',
    4: four,
  },
});

export const HIGH_SCHOOL_RUBRICS: Rubric[] = [
  // ─── Grades 9–10 ────────────────────────────────────────────────────────
  {
    id: 'g9-10-argument',
    version: 1,
    band: '9-10',
    genre: 'opinion',
    title: 'Grades 9–10 argument writing (source-based)',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.claim',
        levels: {
          1: 'No identifiable claim, or the response does not address the task.',
          2: 'A claim is present but broad, a statement of fact, or it shifts during the essay.',
          3: 'A precise, arguable claim that answers the task and is maintained throughout.',
          4: 'A precise claim that signals the line of reasoning and is clearly distinguished from other positions.',
        },
      },
      {
        skillId: 'development.evidence',
        levels: {
          1: 'Little relevant support; the sources are not used or are misread.',
          2: 'Uses relevant evidence, but mostly summarizes the sources or drops in quotations without explaining them.',
          3: 'Selects relevant evidence, says which source it comes from, and explains how each piece supports the claim.',
          4: 'Evidence is well chosen and explained, and the essay weighs how strong or limited a piece of evidence is.',
        },
      },
      {
        skillId: 'development.counterclaim',
        levels: {
          1: 'No opposing view, or one that is dismissed without a reason.',
          2: 'Mentions an opposing view but misstates it or answers it with assertion only ("but that is wrong").',
          3: 'Presents a reasonable opposing view fairly and responds to it with reasoning or evidence.',
          4: 'Presents the strongest opposing view fairly, concedes what is valid in it, and shows why the claim still holds.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'No clear introduction, body or conclusion; ideas are not grouped.',
          2: 'Paragraphs exist, but the order is loose or transitions are mechanical ("First", "Second", "Finally").',
          3: 'Logical progression from introduction to conclusion; transitions show how claim, reasons, evidence and counterclaim relate; the conclusion follows from the argument.',
          4: 'Each paragraph advances the argument, and transitions make the logic explicit (concession, contrast, consequence).',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Sentence errors frequently obscure meaning.',
          2: 'Generally clear, with repeated sentence patterns or errors in longer sentences.',
          3: 'Controlled sentences that use varied phrases and clauses to show how ideas relate.',
          4: 'Sentence structure is varied deliberately for clarity and emphasis.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Language is vague or inappropriate for the task.',
          2: 'Mostly general language, or a tone that shifts between casual and formal.',
          3: 'Precise language with a consistent formal style and objective tone.',
          4: 'Precise, economical language, with subject terms used accurately.',
        },
      },
      conventions(
        'Nearly error-free, including semicolons, colons and smoothly integrated quotations.',
      ),
    ],
    anchors: [
      {
        text: 'Schools should start later. Teenagers are tired and that is bad. Source 1 says "teenagers\' sleep cycles shift later during puberty." Some people think buses would be a problem but that is not a big deal. In conclusion, school should start later because students are tired.',
        ratings: {
          'purpose.claim': 2,
          'development.evidence': 2,
          'development.counterclaim': 2,
          'organization.structure': 2,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'The claim is broad, the quotation is dropped in without explanation, and the bus concern is dismissed rather than answered.',
      },
      {
        text: "Ridgeview should move its start time to 8:45, not 9:00. The sleep researcher notes that teenagers' sleep cycles shift later during puberty, so an 8:00 start asks students to learn at the time their bodies are least alert. The bus coordinator's concern is real: a 9:00 start would mean buses finish the elementary routes after 4:30. A 45-minute shift, however, keeps the bus schedule workable while still giving most students the extra sleep the research describes.",
        ratings: {
          'purpose.claim': 4,
          'development.evidence': 3,
          'development.counterclaim': 4,
          'organization.structure': 3,
          'sentences.control': 4,
          'word_choice.precision': 3,
          'conventions.mechanics': 4,
        },
        note: 'A precise claim shaped by the counterclaim; evidence is attributed and explained; the concession refines the claim instead of ignoring it.',
      },
    ],
  },
  {
    id: 'g9-10-informative',
    version: 1,
    band: '9-10',
    genre: 'informative',
    title: 'Grades 9–10 informative and explanatory writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.topic',
        levels: {
          1: 'No clear topic, or the writing does not respond to the task.',
          2: 'The topic is named, but there is no controlling idea, or the piece drifts into opinion.',
          3: 'Introduces the topic with a clear controlling idea that previews what will be explained.',
          4: 'The controlling idea shows why the topic matters or how its parts relate.',
        },
      },
      {
        skillId: 'development.information',
        levels: {
          1: 'Little relevant information, or information that is inaccurate.',
          2: 'Lists facts with little explanation, or copies long stretches of the sources.',
          3: 'Develops the topic with well-chosen facts, definitions, details and examples from the sources, explaining what each shows.',
          4: 'Explains the significance of the information and how the pieces connect, including what is still uncertain.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Information is not grouped; no introduction or conclusion.',
          2: 'Some grouping, but sections overlap or transitions are missing; the conclusion only repeats.',
          3: 'Related information is grouped into sections, transitions link the sections, and the conclusion states an implication or the significance of the topic.',
          4: 'Each section builds on the one before so that a complex idea becomes clear step by step.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Sentence errors frequently obscure meaning.',
          2: 'Generally clear, with repeated sentence patterns or errors in longer sentences.',
          3: 'Controlled sentences that use varied phrases and clauses to show how ideas relate.',
          4: 'Sentence structure is varied deliberately so complex information stays clear.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or inaccurate word choice obscures meaning.',
          2: 'General language; subject terms are missing or misused; tone is sometimes casual.',
          3: 'Precise language and subject vocabulary in a formal, objective style.',
          4: 'Precise vocabulary throughout, with technical terms explained for the reader where needed.',
        },
      },
      conventions(
        'Nearly error-free, including punctuation of quotations, lists and nonessential elements.',
      ),
    ],
    anchors: [
      {
        text: 'Bees are important. There are lots of problems for bees like pesticides and diseases and losing places to live. Bees are dying and this is really bad. We need to help the bees.',
        ratings: {
          'purpose.topic': 2,
          'development.information': 2,
          'organization.structure': 1,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Names causes but does not explain any of them, and ends with opinion instead of an explanation.',
      },
      {
        text: 'Honeybee colonies are not disappearing for a single reason; several pressures add up. The extension office fact sheet explains that varroa mites feed on bees and spread viruses, which weakens a colony before winter. At the same time, fields planted with one crop flower for only a few weeks, so bees can go hungry for the rest of the season. Because a colony that is already weakened by mites copes poorly with a food shortage, the two problems make each other worse.',
        ratings: {
          'purpose.topic': 4,
          'development.information': 4,
          'organization.structure': 3,
          'sentences.control': 4,
          'word_choice.precision': 3,
          'conventions.mechanics': 4,
        },
        note: 'A controlling idea (pressures add up), sourced facts that are explained, and a link that shows how causes interact.',
      },
    ],
  },
  {
    id: 'g9-10-narrative',
    version: 1,
    band: '9-10',
    genre: 'narrative',
    title: 'Grades 9–10 narrative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.story',
        levels: {
          1: 'No clear situation, character or problem.',
          2: 'A situation is introduced, but the point of view or the problem is unclear.',
          3: 'Engages the reader by establishing a problem or situation and a clear point of view.',
          4: 'The opening establishes tension and a distinct narrative voice.',
        },
      },
      {
        skillId: 'development.detail',
        levels: {
          1: 'Events are told with few details.',
          2: 'Some dialogue or description, but most of the story is summarized.',
          3: 'Uses dialogue, pacing, description and reflection to develop events and characters.',
          4: 'Chooses telling details and sensory language selectively; the pace slows at the moment that matters most.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Events are hard to follow; no clear ending.',
          2: 'Events are in order, but they do not build, or the ending is sudden.',
          3: 'Events build toward a particular outcome, and the conclusion reflects on what was experienced or resolved.',
          4: 'The structure is crafted (for example, a turning point, withheld information or a flashback) so that the ending carries meaning.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Sentence errors frequently obscure meaning.',
          2: 'Generally clear, with repeated sentence patterns or errors in longer sentences.',
          3: 'Controlled sentences with varied structure that fits the pace of the story.',
          4: 'Sentence length and structure are varied for effect, such as short sentences at moments of tension.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or confusing word choice.',
          2: 'Mostly general words; few specific details.',
          3: 'Precise words, telling details and sensory language that create a clear picture.',
          4: 'Word choice creates a consistent tone or mood and reveals character.',
        },
      },
      conventions(
        'Nearly error-free, including punctuation of dialogue and of varied sentence structures.',
      ),
    ],
    anchors: [
      {
        text: 'It was the first day at the new school. I was nervous. I went to my classes and they were fine. At lunch I sat with some people. They were nice. Then I went home and it was a good day.',
        ratings: {
          'purpose.story': 2,
          'development.detail': 1,
          'organization.structure': 2,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'The situation is clear, but every event is summarized and nothing builds.',
      },
      {
        text: 'The sign-up sheet had one empty line left, right under the name of the girl who had laughed at my accent in September. I held the pen above the paper long enough for the ink to bead. "You signing or not?" Coach asked. I wrote my name in letters so small they almost apologized, and walked out before anyone could read them.',
        ratings: {
          'purpose.story': 4,
          'development.detail': 4,
          'organization.structure': 3,
          'sentences.control': 4,
          'word_choice.precision': 4,
          'conventions.mechanics': 4,
        },
        note: 'Tension and voice in the first line; one slowed-down moment told through action, dialogue and a telling detail.',
      },
    ],
  },

  // ─── Grades 11–12 ───────────────────────────────────────────────────────
  {
    id: 'g11-12-argument',
    version: 1,
    band: '11-12',
    genre: 'opinion',
    title: 'Grades 11–12 argument writing (synthesis)',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.claim',
        levels: {
          1: 'No identifiable claim, or the response does not address the task.',
          2: 'A claim is present but broad or obvious, or it shifts during the essay.',
          3: 'A precise, knowledgeable claim that establishes why the issue matters and is maintained throughout.',
          4: 'The claim is qualified where the evidence demands it (scope, conditions or exceptions) and sets up a logical sequence.',
        },
      },
      {
        skillId: 'development.evidence',
        levels: {
          1: 'Little relevant support; the sources are not used or are misread.',
          2: 'Uses evidence from the sources one at a time, mostly summarizing them.',
          3: 'Draws on more than one source, connects them, and explains how the combined evidence supports the claim.',
          4: 'Synthesizes sources that disagree, explains why one is more persuasive, and notes the limits of the evidence.',
        },
      },
      {
        skillId: 'development.counterclaim',
        levels: {
          1: 'No opposing view, or one that is dismissed without a reason.',
          2: 'Names an opposing view but answers it with assertion, or misstates it.',
          3: 'Develops the strongest opposing view fairly, with its evidence, and answers it with reasoning.',
          4: "Anticipates the audience's concerns, weighs the strengths and limitations of both sides, and refines the claim in response.",
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'No clear introduction, body or conclusion; ideas are not grouped.',
          2: 'Paragraphs exist, but the order is loose or transitions are mechanical.',
          3: 'Each section builds on the one before; transitions express precise relationships (concession, contrast, consequence); the conclusion follows from the argument.',
          4: 'The structure is designed for this argument and audience, and the conclusion extends the reasoning (implications or significance).',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Sentence errors frequently obscure meaning.',
          2: 'Generally clear, with repeated sentence patterns or errors in longer sentences.',
          3: 'Controlled, varied syntax that keeps complex ideas clear.',
          4: 'Syntax is varied for effect, including emphasis and parallel structure.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Language is vague or inappropriate for the task.',
          2: 'General language, or a tone that does not suit the audience.',
          3: 'Precise, knowledgeable language and a consistent tone suited to the audience.',
          4: 'Nuanced word choice (degrees of certainty, connotation) that sharpens the argument.',
        },
      },
      conventions(
        'Nearly error-free, with sources cited consistently and quotations integrated smoothly.',
      ),
    ],
    anchors: [
      {
        text: "Free transit for students is a good idea. The council report says ridership would go up. The bus drivers' union says the buses are already full. Both sources have good points. In the end free transit is good because it helps students.",
        ratings: {
          'purpose.claim': 2,
          'development.evidence': 2,
          'development.counterclaim': 2,
          'organization.structure': 2,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Summarizes each source in turn and acknowledges disagreement without resolving it; the claim is never refined.',
      },
      {
        text: "The city should make buses free for students, but only on routes that run below capacity during school hours. The council report projects a 30 percent rise in student ridership, and the union's data shows that the two crowded routes are already at capacity at 7:45 a.m. Read together, the sources point to the same conclusion: demand is real, but the system can absorb it only where there is space. A route-by-route pilot tests the council's projection without overloading the drivers who raised the concern.",
        ratings: {
          'purpose.claim': 4,
          'development.evidence': 4,
          'development.counterclaim': 3,
          'organization.structure': 3,
          'sentences.control': 4,
          'word_choice.precision': 4,
          'conventions.mechanics': 4,
        },
        note: 'A qualified claim that comes from reading the disagreeing sources together; the counterclaim shapes the recommendation.',
      },
    ],
  },
  {
    id: 'g11-12-informative',
    version: 1,
    band: '11-12',
    genre: 'informative',
    title: 'Grades 11–12 informative and explanatory writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.topic',
        levels: {
          1: 'No clear topic, or the writing does not respond to the task.',
          2: 'The topic is named, but there is no controlling idea, or the piece drifts into opinion.',
          3: 'Introduces a complex topic with a controlling idea and organizes it so each part builds on the last.',
          4: 'The controlling idea frames the topic for the intended audience and signals why it matters to them.',
        },
      },
      {
        skillId: 'development.information',
        levels: {
          1: 'Little relevant information, or information that is inaccurate.',
          2: 'Facts from the sources are listed one at a time, with little explanation.',
          3: 'Integrates information from more than one source accurately and explains it for the audience.',
          4: 'Explains how the sources agree or differ, and what that means for the reader.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Information is not grouped; no introduction or conclusion.',
          2: 'Some grouping, but sections overlap or transitions are missing; the conclusion only repeats.',
          3: 'Sections build on each other, transitions clarify complex relationships, and the conclusion states implications or significance.',
          4: 'The organization is designed for the audience (for example, problem then mechanism then consequence), so a complex topic stays easy to follow.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Sentence errors frequently obscure meaning.',
          2: 'Generally clear, with repeated sentence patterns or errors in longer sentences.',
          3: 'Controlled, varied syntax that keeps complex information clear.',
          4: 'Syntax is varied for effect, including parallel structure to compare ideas.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or inaccurate word choice obscures meaning.',
          2: 'General language; subject terms are missing, misused or unexplained for the audience.',
          3: 'Precise, subject-specific language suited to the audience, in a formal, objective style.',
          4: 'Uses precise terms and techniques such as analogy to manage complexity for the audience.',
        },
      },
      conventions(
        'Nearly error-free, with sources cited consistently and quotations integrated smoothly.',
      ),
    ],
    anchors: [
      {
        text: 'Misinformation is false information. It spreads online. There are many reasons it spreads like algorithms and people sharing things. It is a big problem in society today and people should be careful.',
        ratings: {
          'purpose.topic': 2,
          'development.information': 1,
          'organization.structure': 2,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Defines the topic but explains nothing, and ends in advice rather than explanation.',
      },
      {
        text: "A false post spreads fastest in its first few hours, before anyone has checked it. The media lab's study found that posts which provoke surprise are shared about twice as often as neutral ones, and the platform summary explains that its feed ranks posts partly by how quickly they are shared. Together these findings describe a loop: surprise drives early sharing, and early sharing earns a wider audience. Corrections usually arrive after that loop has run.",
        ratings: {
          'purpose.topic': 4,
          'development.information': 4,
          'organization.structure': 4,
          'sentences.control': 4,
          'word_choice.precision': 3,
          'conventions.mechanics': 4,
        },
        note: 'Integrates two sources into one mechanism (the loop) and explains why timing matters.',
      },
    ],
  },
  {
    id: 'g11-12-narrative',
    version: 1,
    band: '11-12',
    genre: 'narrative',
    title: 'Grades 11–12 narrative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.story',
        levels: {
          1: 'No clear situation, character or problem.',
          2: 'A situation is introduced, but the point of view or significance is unclear.',
          3: 'Establishes a problem or situation, its significance, and a point of view.',
          4: 'The opening establishes a sustained voice and raises a question the story answers.',
        },
      },
      {
        skillId: 'development.detail',
        levels: {
          1: 'Events are told with few details.',
          2: 'Some dialogue or description, but most of the story is summarized.',
          3: 'Uses dialogue, pacing, description, reflection and more than one plot line or perspective where it helps.',
          4: 'Details are selected so that character and theme are revealed indirectly; the reader infers more than is stated.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Events are hard to follow; no clear ending.',
          2: 'Events are in order, but they do not build, or the ending is sudden.',
          3: 'Events are sequenced to build a coherent whole toward an outcome, and the conclusion reflects on what was resolved.',
          4: 'The structure creates a particular effect (for example, suspense, growth or resolution), and the ending changes how earlier events read.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Sentence errors frequently obscure meaning.',
          2: 'Generally clear, with repeated sentence patterns or errors in longer sentences.',
          3: 'Controlled, varied syntax that suits the voice and pace.',
          4: 'Syntax is crafted for effect, including rhythm and deliberate fragments.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or confusing word choice.',
          2: 'Mostly general words; few specific details.',
          3: 'Precise words, telling details and sensory language that create a vivid picture.',
          4: 'Word choice sustains tone and voice, and images carry meaning beyond description.',
        },
      },
      conventions(
        'Nearly error-free, including punctuation of dialogue and of crafted sentence structures.',
      ),
    ],
    anchors: [
      {
        text: 'I went back to my old town after five years. A lot had changed. The park was different and the store was gone. I felt sad but also happy. I realized that things change and that is okay.',
        ratings: {
          'purpose.story': 2,
          'development.detail': 1,
          'organization.structure': 2,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'The reflection is stated rather than earned; no scene is developed.',
      },
      {
        text: 'The bakery was a phone shop now, but the door still stuck in the same place, two-thirds of the way open, the way it had every Saturday when Dad and I came for the end-of-day bread. The clerk looked up. "Help you?" I pushed the door the rest of the way, the old shove, and for a second the shop smelled of nothing at all.',
        ratings: {
          'purpose.story': 4,
          'development.detail': 4,
          'organization.structure': 3,
          'sentences.control': 4,
          'word_choice.precision': 4,
          'conventions.mechanics': 4,
        },
        note: 'Change is shown through one persistent detail (the stuck door); the feeling is implied, not stated.',
      },
    ],
  },
];

const RUBRIC_ID: Record<HighBand, Record<Genre, string>> = {
  '9-10': {
    opinion: 'g9-10-argument',
    informative: 'g9-10-informative',
    narrative: 'g9-10-narrative',
  },
  '11-12': {
    opinion: 'g11-12-argument',
    informative: 'g11-12-informative',
    narrative: 'g11-12-narrative',
  },
};

const WORDS: Record<HighBand, Record<Genre, { min: number; max: number }>> = {
  '9-10': {
    opinion: { min: 250, max: 700 },
    informative: { min: 250, max: 700 },
    narrative: { min: 300, max: 800 },
  },
  '11-12': {
    opinion: { min: 300, max: 900 },
    informative: { min: 300, max: 900 },
    narrative: { min: 350, max: 900 },
  },
};

const SKILL_CRITERIA: Record<HighBand, Record<string, string>> = {
  '9-10': {
    'purpose.claim':
      'My claim is precise and arguable, and I keep to it all the way through.',
    'development.evidence':
      'I name the source for each piece of evidence and explain how it supports my claim.',
    'development.counterclaim':
      'I explain the strongest opposing view fairly, then answer it with reasons or evidence.',
    'organization.structure':
      'Each paragraph has one job, and my transitions show how the ideas connect.',
    'purpose.topic':
      'My introduction gives a controlling idea that previews my explanation.',
    'development.information':
      'I explain what each fact shows, instead of only listing facts.',
    'purpose.story':
      'My opening sets up the situation, the point of view and the tension.',
    'development.detail':
      'I slow down the most important moment with dialogue, action and detail.',
    'sentences.control':
      'I vary my sentences to show how ideas relate and to emphasize key points.',
    'word_choice.precision':
      'I use precise words and keep a style and tone that fit my reader.',
    'conventions.mechanics':
      'I proofread grammar, punctuation and spelling, and I punctuate quotations correctly.',
  },
  '11-12': {
    'purpose.claim':
      'My claim is precise, explains why the issue matters, and is qualified where the evidence requires.',
    'development.evidence':
      'I connect evidence from more than one source and explain what it shows together.',
    'development.counterclaim':
      'I weigh the strongest opposing view and let it sharpen my claim.',
    'organization.structure':
      'Each section builds on the one before, and my conclusion explains the implications.',
    'purpose.topic':
      'My controlling idea frames the topic for this audience and says why it matters to them.',
    'development.information':
      'I integrate information from the sources and explain where they agree or differ.',
    'purpose.story':
      'My opening sets up a voice and a question the story will answer.',
    'development.detail':
      'I choose details that let the reader infer character and meaning.',
    'sentences.control':
      'I vary my syntax for effect, including emphasis and parallel structure.',
    'word_choice.precision':
      'My words are exact, including how certain I am ("suggests", "shows", "proves").',
    'conventions.mechanics':
      'I proofread carefully and cite each source consistently.',
  },
};

const PLANNING: Record<HighBand, Record<Genre, string[]>> = {
  '9-10': {
    opinion: [
      'Your claim, in one precise sentence:',
      'Reason 1, with evidence (which source?):',
      'Reason 2, with evidence (which source?):',
      'The strongest opposing view, and your response:',
    ],
    informative: [
      'Your controlling idea:',
      'Section 1: the point and the facts that explain it (which source?):',
      'Section 2: the point and the facts that explain it (which source?):',
      'The implication or significance for your conclusion:',
    ],
    narrative: [
      'Point of view and narrator:',
      'What does the character want, and what stands in the way?',
      'The moment you will slow down:',
      'What has changed or been understood by the end?',
    ],
  },
  '11-12': {
    opinion: [
      'Your qualified claim (when, where or for whom does it hold?):',
      'Where do the sources agree, and where do they disagree?',
      'Which source is more persuasive on the key point, and why?',
      'The strongest objection, and how it changes your claim:',
    ],
    informative: [
      'Your audience, and what they already know:',
      'Your controlling idea, framed for that audience:',
      'How the sources fit together (agree, differ, add detail):',
      'The implication for your audience:',
    ],
    narrative: [
      'Voice and point of view:',
      'The question your story raises at the start:',
      'The details that will reveal character without stating it:',
      'How the ending changes the meaning of what came before:',
    ],
  },
};

interface Spec {
  id: string;
  band: HighBand;
  genre: Genre;
  title: string;
  task: string;
  targetSkills: string[];
  topics: Topic[];
  sources?: { title: string; text: string }[];
  checkIn?: boolean;
  checkpoint?: boolean;
  criteria?: string[];
}

function make(spec: Spec): WritingPrompt {
  const criteria = [
    ...(spec.criteria ?? []),
    ...spec.targetSkills.map((s) => SKILL_CRITERIA[spec.band][s]),
  ];
  return {
    id: spec.id,
    version: 1,
    band: spec.band,
    genre: spec.genre,
    rubricId: RUBRIC_ID[spec.band][spec.genre],
    title: spec.title,
    task: spec.task,
    ...(spec.sources ? { sources: spec.sources } : {}),
    successCriteria: [...new Set(criteria)].slice(0, 4),
    planningQuestions: PLANNING[spec.band][spec.genre],
    targetSkills: spec.targetSkills,
    suggestedWords: WORDS[spec.band][spec.genre],
    ...(spec.checkIn ? { checkIn: true } : {}),
    ...(spec.checkpoint ? { checkpoint: true } : {}),
    topics: spec.topics,
    review: PILOT,
  };
}

const USE_SOURCES =
  'I use evidence from both sources and say which one I am using.';

const SPECS: Spec[] = [
  // ─── Grades 9–10 · check-ins ────────────────────────────────────────────
  {
    id: 'g910-checkin-start-time',
    band: '9-10',
    genre: 'opinion',
    title: 'Check-in: a later start time',
    task: 'Ridgeview High School is deciding whether to move the start of classes from 8:00 to 9:00. Read both sources. Write an argument for the school board: should Ridgeview change its start time? Use evidence from both sources and respond to the strongest opposing view.',
    targetSkills: ['purpose.claim', 'development.evidence'],
    topics: ['school', 'science'],
    checkIn: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Summary of a sleep researcher’s talk to parents (fictional)',
        text: 'Dr. Lena Ortiz explained that teenagers’ sleep cycles shift later during puberty, so many teens do not feel sleepy until about 11 p.m. Health organizations recommend 8 to 10 hours of sleep for 13- to 18-year-olds. In a district she studied, moving the start time from 7:50 to 8:40 increased students’ average sleep by about 34 minutes a night, and first-period attendance rose slightly. She cautioned that later start times help most when students do not also stay up later.',
      },
      {
        title:
          'Source 2: Letter from the district transportation coordinator (fictional)',
        text: 'Our buses run three routes each morning: high school first, then middle school, then elementary. If the high school starts at 9:00, either the elementary schools must start earlier, which means young children waiting at bus stops before sunrise in winter, or we must hire nine more drivers, costing about $480,000 a year. A later dismissal would also end after-school practices after dark for part of the year. A smaller shift, of 30 to 45 minutes, could be managed with route changes.',
      },
    ],
  },
  {
    id: 'g910-checkin-plan-goes-wrong',
    band: '9-10',
    genre: 'narrative',
    title: 'Check-in: when the plan goes wrong',
    task: 'Write a narrative about a character whose carefully made plan falls apart at the worst possible moment. Show how the character responds and what they understand by the end. The story can be realistic or imagined.',
    targetSkills: ['purpose.story', 'organization.structure'],
    topics: ['adventure', 'school'],
    checkIn: true,
  },

  // ─── Grades 9–10 · argument ─────────────────────────────────────────────
  {
    id: 'g910-plaza-design',
    band: '9-10',
    genre: 'opinion',
    title: 'Parking or plaza?',
    task: 'The town of Bell Harbor must decide what to do with the parking lot beside its main street. Read both sources. Write a letter to the town council arguing for one option. Use evidence from both sources and consider a competing view.',
    targetSkills: ['purpose.claim', 'development.counterclaim'],
    topics: ['community'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Main Street Business Association survey (fictional)',
        text: 'Of 42 shop owners surveyed, 31 said customers already complain about parking. Owners estimate that about 40 percent of weekend customers drive in from nearby towns. The lot has 60 spaces and is full most Saturdays by 10 a.m. Several owners said they would support a plaza only if replacement parking were built within a five-minute walk.',
      },
      {
        title: 'Source 2: Summary of a city planning study (fictional)',
        text: 'Planners counted visitors in three towns that turned a central parking lot into a public plaza. In two of the towns, foot traffic on the main street rose by 15 to 25 percent within two years, and cafés added outdoor seating. In the third town, the nearest replacement parking was a 12-minute walk away, and two shops closed. The study concludes that plazas work best when people can still reach the area easily.',
      },
    ],
  },
  {
    id: 'g910-esports-varsity',
    band: '9-10',
    genre: 'opinion',
    title: 'Should esports be a school sport?',
    task: 'Your school is deciding whether to recognize esports as an official varsity team, with a coach, a budget and letters for players. Read both sources. Write an editorial for the school newspaper taking a position. Use evidence from both sources.',
    targetSkills: ['development.evidence', 'development.counterclaim'],
    topics: ['sports', 'technology'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Notes from a teacher who coaches an esports club (fictional)',
        text: 'Our club has 28 members; 19 of them do not play any other school sport. Players review game footage, plan strategy and practice communication under pressure, much as other teams do. Since we started requiring a minimum grade to compete, members’ average attendance has improved. A varsity team would need about $3,000 a year for computers and league fees.',
      },
      {
        title: 'Source 2: Letter from a parent to the school board (fictional)',
        text: 'Most students already spend several hours a day on screens. School sports should get young people moving. If esports becomes a varsity sport, it will compete for the same limited budget as the track and swim teams, which already share old equipment. I would support an esports club, but not a varsity team.',
      },
    ],
  },
  {
    id: 'g910-cafeteria-waste',
    band: '9-10',
    genre: 'opinion',
    title: 'Cutting cafeteria food waste',
    task: 'Students at your school throw away a large amount of food at lunch. Read both sources. Write a proposal to the principal recommending one solution. Explain how your recommendation would work and why it is better than the alternative.',
    targetSkills: ['purpose.claim', 'organization.structure'],
    topics: ['food', 'school'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Student council food-waste audit (fictional)',
        text: 'Over five school days, the council weighed food left on trays: an average of 38 kilograms a day. Fruit and vegetables made up more than half. In a survey, 62 percent of students said they took items they did not want because the meal deal required them. When asked, 70 percent said they would use a “share table” where unopened items could be left for others.',
      },
      {
        title: 'Source 2: Note from the cafeteria manager (fictional)',
        text: 'Federal meal rules require us to offer fruit and vegetables, but students may decline some items. Many students do not know this. A share table would need a staff member to check that items are unopened and kept at a safe temperature, which we do not have time for at lunch. Letting students choose a smaller portion would be easier to run.',
      },
    ],
  },
  {
    id: 'g910-ai-art-contest',
    band: '9-10',
    genre: 'opinion',
    title: 'AI images in the art contest',
    task: 'The regional youth art contest is deciding whether to accept work made with AI image tools. Read both sources. Write an argument to the contest organizers. Address the strongest opposing view and keep a formal, objective tone.',
    targetSkills: ['development.counterclaim', 'word_choice.precision'],
    topics: ['arts', 'technology'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Statement from the contest’s past judges (fictional)',
        text: 'The contest rewards skill developed through practice: composition, control of materials and an original idea. When an image is generated from a written prompt, judges cannot tell how much of the result reflects the entrant’s own decisions. Two other regional contests now ask entrants to describe their process and show sketches.',
      },
      {
        title: 'Source 2: Interview with a student digital artist (fictional)',
        text: 'I use an AI tool to try out color schemes, then paint the final piece myself on a tablet. For me it is like using reference photos. Banning every use of AI would rule out my work, but I agree that a piece made entirely from a prompt is different. A separate category or a process statement would be fairer than a ban.',
      },
    ],
  },

  // ─── Grades 9–10 · informative ──────────────────────────────────────────
  {
    id: 'g910-bee-decline',
    band: '9-10',
    genre: 'informative',
    title: 'Why honeybee colonies struggle',
    task: 'Read both sources. Write an explanation for a community garden newsletter of why honeybee colonies struggle to survive and how the causes are connected. Use information from both sources.',
    targetSkills: ['development.information', 'organization.structure'],
    topics: ['nature', 'science', 'animals'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Extension office fact sheet (simplified for this task)',
        text: 'Varroa mites are tiny parasites that feed on honeybees and spread viruses inside the hive. A colony with many mites in late summer is less likely to survive the winter. Beekeepers check mite levels by sampling about 300 bees from a frame. Some pesticides, even at levels that do not kill bees, can affect how well bees find their way back to the hive.',
      },
      {
        title: 'Source 2: Article from a gardening magazine (fictional)',
        text: 'Large fields planted with a single crop provide a burst of flowers for a few weeks, then very little. Bees need a steady supply of pollen and nectar from spring to autumn. Gardens, roadsides and hedges with a mix of plants that flower at different times can fill those gaps. Researchers describe colony losses as the result of several stresses acting together rather than one cause.',
      },
    ],
  },
  {
    id: 'g910-town-budget',
    band: '9-10',
    genre: 'informative',
    title: 'How a town budget gets made',
    task: 'Read both sources. Explain to students in your grade how the town of Bell Harbor decides how to spend its money each year, and where residents can have a say. Use information from both sources.',
    targetSkills: ['purpose.topic', 'development.information'],
    topics: ['community'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Bell Harbor “Budget Basics” page (fictional)',
        text: 'Each autumn, town departments (roads, parks, library, police and fire) send requests to the town manager. The manager combines them into a draft budget that must balance: spending cannot be more than expected income from property taxes, fees and state grants. The council holds two public hearings in March, then votes in April. The budget year starts on July 1.',
      },
      {
        title: 'Source 2: Local news report on last year’s budget (fictional)',
        text: 'At the March hearing, 46 residents spoke, many asking to keep the library open on Sundays. The council moved $38,000 from a planned parking upgrade to library hours. Council member Ray Duong said public comments “changed the final budget more than in any year I can remember.” Residents can also submit written comments online up to a week before the vote.',
      },
    ],
  },
  {
    id: 'g910-instructions-revise',
    band: '9-10',
    genre: 'informative',
    title: 'Instructions for a younger reader',
    task: 'Read the confusing instructions in the source. Rewrite them as a clear explanation for a ten-year-old who has never done this before. Then add a short paragraph explaining two changes you made and why they help that reader.',
    targetSkills: ['word_choice.precision', 'organization.structure'],
    topics: ['science', 'school'],
    criteria: [
      'My instructions are in the right order and each step is one action.',
      'I explain two changes I made and why they help a young reader.',
    ],
    sources: [
      {
        title: 'Source: Instructions from a science kit (fictional)',
        text: 'Before activation ensure solution is room temperature, having first combined crystals (sachet B) with the warm water previously measured in the beaker, stirring until dissolution, then suspend the string from the pencil, which should rest across the rim, though not before adding sachet A. Crystals will form over several days provided disturbance is avoided.',
      },
    ],
  },

  // ─── Grades 9–10 · narrative ────────────────────────────────────────────
  {
    id: 'g910-new-team',
    band: '9-10',
    genre: 'narrative',
    title: 'The new team',
    task: 'Write a narrative about a character who joins a team, club or group partway through the season and has to earn a place in it. Focus on one scene that changes how the others see them.',
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['sports', 'school'],
  },
  {
    id: 'g910-museum-night',
    band: '9-10',
    genre: 'narrative',
    title: 'After the museum closed',
    task: 'Write a narrative in which a character is accidentally locked inside a museum after closing time. Build the events toward a turning point, and end with what the character understands or decides.',
    targetSkills: ['organization.structure', 'development.detail'],
    topics: ['arts', 'adventure'],
  },
  {
    id: 'g910-repair-shop',
    band: '9-10',
    genre: 'narrative',
    title: 'The repair',
    task: 'Write a narrative about a character who is asked to repair an old object (a radio, a bicycle, a music box, or something else) for a stranger, and discovers something unexpected about it. Vary your sentences to control the pace.',
    targetSkills: ['sentences.control', 'word_choice.precision'],
    topics: ['technology', 'community'],
  },

  // ─── Grades 9–10 · checkpoints ──────────────────────────────────────────
  {
    id: 'g910-cp-phone-lockers',
    band: '9-10',
    genre: 'opinion',
    title: 'Checkpoint: phones in lockers',
    task: 'Your school is considering a rule that phones must stay in lockers during the school day. Read both sources. Write an argument for the principal. Use evidence from both sources and respond to the strongest opposing view.',
    targetSkills: [
      'purpose.claim',
      'development.evidence',
      'development.counterclaim',
    ],
    topics: ['school', 'technology'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Teachers’ survey results (fictional)',
        text: 'Of 54 teachers surveyed, 44 said phone notifications interrupt lessons at least once a day. Teachers at a nearby school that introduced locker storage last year reported fewer interruptions, and its library reported more students reading at lunch. Teachers there also said the rule took about six weeks to become routine.',
      },
      {
        title: 'Source 2: Student council statement (fictional)',
        text: 'Many students use phones to check bus changes, contact parents about pickups and track medical needs such as blood sugar. A blanket rule would affect these students most. We would support phones being silenced and put away in class, with clear exceptions, instead of a full-day locker rule.',
      },
    ],
  },
  {
    id: 'g910-cp-library-hours',
    band: '9-10',
    genre: 'opinion',
    title: 'Checkpoint: library or makerspace?',
    task: 'The public library has money to either extend its evening hours or convert a reading room into a makerspace with 3D printers and tools. Read both sources. Write a letter to the library board arguing for one choice. Use evidence from both sources.',
    targetSkills: ['development.evidence', 'organization.structure'],
    topics: ['community', 'technology'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Library visitor data (fictional)',
        text: 'The library closes at 6 p.m. on weekdays. A survey of 300 visitors found that 41 percent work or attend classes until 5:30 or later. Libraries in two similar towns that stayed open until 8 p.m. saw evening study-room bookings fill within a month. The extra hours would cost about $52,000 a year in staff time.',
      },
      {
        title: 'Source 2: Proposal from the teen advisory group (fictional)',
        text: 'Teenagers in town have nowhere to learn hands-on skills outside school. A makerspace in a neighboring city runs free weekly workshops that are booked weeks ahead. Our group has found a grant that would cover the equipment, but the library would need to pay for a part-time staff member, about $30,000 a year.',
      },
    ],
  },
  {
    id: 'g910-cp-microplastics',
    band: '9-10',
    genre: 'informative',
    title: 'Checkpoint: where microplastics come from',
    task: 'Read both sources. Write an explanation for a science club newsletter of what microplastics are, how they reach rivers and oceans, and what is still uncertain. Use information from both sources.',
    targetSkills: ['purpose.topic', 'development.information'],
    topics: ['science', 'nature'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Fact sheet from an environmental agency (simplified for this task)',
        text: 'Microplastics are plastic pieces smaller than 5 millimeters. Some are made small, such as beads once used in face scrubs. Most come from larger items breaking down, from tyres wearing on roads and from synthetic fabrics shedding fibers in the wash. Wastewater treatment removes most, but not all, of the particles that reach it.',
      },
      {
        title: 'Source 2: Summary of a university study (fictional)',
        text: 'Researchers sampled a river at ten points from its source to the sea. Particle counts were lowest upstream and highest below two towns and a highway. The team found microplastics in the stomachs of small fish but noted that scientists are still studying what effects, if any, these particles have on the health of fish and people.',
      },
    ],
  },
  {
    id: 'g910-cp-urban-heat',
    band: '9-10',
    genre: 'informative',
    title: 'Checkpoint: why cities get hotter',
    task: 'Read both sources. Explain to residents of your town why some neighborhoods get much hotter than others in summer, and what can reduce the difference. Use information from both sources.',
    targetSkills: ['development.information', 'organization.structure'],
    topics: ['science', 'community'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Weather service explainer (simplified for this task)',
        text: 'Dark surfaces such as asphalt and roofs absorb sunlight and release the heat slowly, especially at night. Areas with many buildings and few trees can be several degrees warmer than nearby parks. This is called the urban heat island effect. Trees cool the air by shading surfaces and by releasing water vapour from their leaves.',
      },
      {
        title: 'Source 2: City sustainability report (fictional)',
        text: 'Volunteers measured afternoon temperatures in 12 neighborhoods on the same July day. The hottest, near the bus depot, was 6 °C warmer than the coolest, beside the river park. Tree cover in the hottest areas was below 10 percent. The city plans to plant 2,000 trees and to test light-colored coatings on two school roofs.',
      },
    ],
  },
  {
    id: 'g910-cp-storm-shift',
    band: '9-10',
    genre: 'narrative',
    title: 'Checkpoint: the storm shift',
    task: 'Write a narrative about a character working or volunteering somewhere (a shop, an animal shelter, a café or another place) when a sudden storm cuts the power. Establish the situation quickly, slow down the key moment, and end with a reflection on what was experienced.',
    targetSkills: [
      'purpose.story',
      'development.detail',
      'organization.structure',
    ],
    topics: ['adventure', 'community'],
    checkpoint: true,
  },
  {
    id: 'g910-cp-old-recording',
    band: '9-10',
    genre: 'narrative',
    title: 'Checkpoint: the old recording',
    task: 'Write a narrative in which a character finds an old recording (a cassette, a voice memo or a video) made by someone they have never met. Build toward a turning point and show what the character decides to do.',
    targetSkills: ['organization.structure', 'sentences.control'],
    topics: ['technology', 'arts'],
    checkpoint: true,
  },

  // ─── Grades 11–12 · check-ins ───────────────────────────────────────────
  {
    id: 'g1112-checkin-free-transit',
    band: '11-12',
    genre: 'opinion',
    title: 'Check-in: free transit for students',
    task: 'The city council is debating whether to make public buses free for secondary students. The two sources disagree. Write an argument for the council that makes a clear recommendation, draws on both sources, and responds to the strongest objection.',
    targetSkills: ['purpose.claim', 'development.evidence'],
    topics: ['community'],
    checkIn: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: City council staff report (fictional)',
        text: 'Staff project that free fares would raise student ridership by about 30 percent, take roughly 1,200 car trips off the roads each school day, and cost $1.1 million a year in lost fares. Cities that introduced free student fares reported better attendance among students from low-income households, though staff note that those studies did not control for other changes at the same time.',
      },
      {
        title: 'Source 2: Statement from the bus drivers’ union (fictional)',
        text: 'Routes 4 and 9 are already at capacity between 7:30 and 8:15 a.m., and drivers regularly pass stops because buses are full. Without more buses, free fares would mean more students left at stops, not fewer. We support free fares if the city funds at least six extra morning buses, which would cost about $900,000 a year.',
      },
    ],
  },
  {
    id: 'g1112-checkin-return',
    band: '11-12',
    genre: 'narrative',
    title: 'Check-in: going back',
    task: 'Write a narrative about a character who returns to a place that has changed since they last saw it. Let the reader understand what the change means to the character without stating it directly.',
    targetSkills: ['purpose.story', 'organization.structure'],
    topics: ['community'],
    checkIn: true,
  },

  // ─── Grades 11–12 · argument ────────────────────────────────────────────
  {
    id: 'g1112-ai-tutors',
    band: '11-12',
    genre: 'opinion',
    title: 'AI tutors in study hall',
    task: 'Your school district is considering giving every secondary student access to an AI tutoring tool during study hall. Read both sources. Write a recommendation to the school board. Qualify your claim: say for whom, when or under what conditions it holds.',
    targetSkills: ['purpose.claim', 'word_choice.precision'],
    topics: ['technology', 'school'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Pilot results from a neighboring district (fictional)',
        text: 'In a one-semester pilot with 400 students, those who used an AI tutor for at least two sessions a week improved their maths test scores more than a comparison group. The gains were largest for students who were already completing homework regularly. Teachers reported that some students used the tool to get answers rather than explanations.',
      },
      {
        title: 'Source 2: Letter from a teachers’ association (fictional)',
        text: 'Tutoring works because a tutor knows the student and notices confusion. A tool that always produces an answer can make it easy to skip the struggle that learning requires. We are not against the technology, but any rollout should include training, settings that require students to show their thinking, and a review after one term.',
      },
    ],
  },
  {
    id: 'g1112-dam-removal',
    band: '11-12',
    genre: 'opinion',
    title: 'Should the old dam come down?',
    task: 'The 90-year-old Mill Creek dam no longer produces power. Read both sources, which disagree. Write an argument for the county board that synthesizes the sources and explains which is more persuasive on the key point.',
    targetSkills: ['development.evidence', 'development.counterclaim'],
    topics: ['nature', 'community'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: River conservation group report (fictional)',
        text: 'Since the dam was built, salmon have been unable to reach 40 kilometers of upstream spawning habitat. Where similar small dams were removed in the region, fish returned within three to five years. Removal would cost about $4 million, much of it covered by state grants. Repairing the dam to meet safety standards would cost about $2.5 million, with no grant available.',
      },
      {
        title:
          'Source 2: Letter from the Mill Pond Residents’ Association (fictional)',
        text: 'The pond behind the dam is used for swimming, skating and fishing, and 60 homes look out over it. Removing the dam would drain the pond to a narrow stream and expose mud flats for several years. A county survey found that 58 percent of nearby residents oppose removal. We ask the board to consider a fish ladder, which engineers estimate at $1.8 million.',
      },
    ],
  },
  {
    id: 'g1112-service-hours',
    band: '11-12',
    genre: 'opinion',
    title: 'Required service hours',
    task: 'Your province or state is considering requiring 40 hours of community service to graduate. Read both sources. Write an argument for an education committee that weighs the strongest objection and lets it shape your recommendation.',
    targetSkills: ['development.counterclaim', 'organization.structure'],
    topics: ['community', 'school'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Summary of a youth volunteering study (fictional)',
        text: 'A study of 2,000 young adults found that those who volunteered in secondary school were more likely to volunteer and vote five years later. However, the effect was much smaller for students who said they had volunteered only because it was required. Students who chose their own placement reported the most benefit.',
      },
      {
        title:
          'Source 2: Opinion piece by a student who works part-time (fictional)',
        text: 'I work 15 hours a week at a grocery store to help my family, and I care for my younger brother after school. Forty hours of unpaid service would come out of the little time I have for homework and sleep. Students like me already contribute to our communities; a requirement would treat that work as if it did not count.',
      },
    ],
  },
  {
    id: 'g1112-stadium-funding',
    band: '11-12',
    genre: 'opinion',
    title: 'Public money for a stadium',
    task: 'A professional team wants the city to pay half the cost of a new stadium. Read both sources. Write an argument for a city newsletter. Structure it so each section builds on the one before, and end by explaining the implications of your position.',
    targetSkills: ['organization.structure', 'purpose.claim'],
    topics: ['sports', 'community'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Team-commissioned economic report (fictional)',
        text: 'The stadium would host 70 events a year and create 1,500 construction jobs and 400 permanent jobs. The report estimates $60 million a year in new spending near the stadium. Without public support, the team says it may move to a city that has offered a full subsidy.',
      },
      {
        title:
          'Source 2: Summary of independent economists’ research (fictional)',
        text: 'Studies of stadium projects over 30 years generally find little or no increase in total local spending, because residents shift money from other entertainment rather than spending more. Benefits concentrate near the stadium, while costs are spread across all taxpayers. Economists note that reports paid for by teams tend to count shifted spending as new spending.',
      },
    ],
  },

  // ─── Grades 11–12 · informative ─────────────────────────────────────────
  {
    id: 'g1112-misinformation',
    band: '11-12',
    genre: 'informative',
    title: 'How false information spreads',
    task: 'Read both sources. Write an explanation for students in the grade below you of how false posts spread online and why corrections often arrive too late. Integrate information from both sources rather than summarizing each one.',
    targetSkills: ['development.information', 'organization.structure'],
    topics: ['technology'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Summary of a media-lab study (fictional)',
        text: 'Researchers tracked 10,000 posts on a large platform. Posts later rated false were shared, on average, faster than accurate posts in their first six hours. Posts that provoked surprise or anger were shared about twice as often as neutral posts, whether or not they were true. Most sharing happened in the first day.',
      },
      {
        title:
          'Source 2: A platform’s published explanation of its feed (fictional)',
        text: 'Our feed ranks posts partly by early engagement: how quickly people like, comment on and share them. Fact-checks are added to posts once a partner organization has reviewed them, which usually takes one to three days. Posts with a fact-check label are shown to fewer people afterwards.',
      },
    ],
  },
  {
    id: 'g1112-deep-sea-mining',
    band: '11-12',
    genre: 'informative',
    title: 'Mining the deep sea floor',
    task: 'Read both sources. Explain to a general adult audience what deep-sea mining is, why companies want to do it, and what scientists do and do not yet know about its effects. Frame your controlling idea for that audience.',
    targetSkills: ['purpose.topic', 'development.information'],
    topics: ['science', 'nature'],
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Science magazine explainer (simplified for this task)',
        text: 'Parts of the deep ocean floor, about 4,000 to 6,000 meters down, are covered with potato-sized lumps called nodules. They contain metals such as nickel, cobalt and manganese that are used in batteries. Collecting them would involve machines that move across the sea floor and pump nodules to a ship.',
      },
      {
        title: 'Source 2: Statement from marine biologists (fictional)',
        text: 'Many animals that live on the nodules are found nowhere else, and most deep-sea species have not yet been named. Test mining in the 1980s left tracks that were still visible decades later, with fewer animals than nearby untouched areas. We do not yet know how far sediment plumes from mining would spread, or how long recovery would take.',
      },
    ],
  },
  {
    id: 'g1112-two-audiences',
    band: '11-12',
    genre: 'informative',
    title: 'One idea, two audiences',
    task: 'Read the source. Explain how a heat pump keeps a house warm in winter, first in a paragraph for a ten-year-old and then in a paragraph for a city council deciding whether to offer rebates. Finish with a short paragraph explaining what you changed between the two versions and what you kept accurate in both.',
    targetSkills: ['word_choice.precision', 'purpose.topic'],
    topics: ['science', 'technology'],
    criteria: [
      'Each version suits its audience in vocabulary and detail.',
      'I explain what I changed and what stayed accurate.',
    ],
    sources: [
      {
        title: 'Source: Energy office fact sheet (simplified for this task)',
        text: 'A heat pump moves heat instead of making it. Even cold outdoor air contains some heat. A fluid called a refrigerant absorbs that heat outside, a compressor squeezes the refrigerant so it gets hotter, and the heat is released indoors. Because moving heat takes less energy than creating it, a heat pump can deliver two to four units of heat for each unit of electricity it uses. Efficiency drops in very cold weather.',
      },
    ],
  },

  // ─── Grades 11–12 · narrative ───────────────────────────────────────────
  {
    id: 'g1112-interpreter',
    band: '11-12',
    genre: 'narrative',
    title: 'The interpreter',
    task: 'Write a narrative about a character who has to translate or explain something important for someone else (at a clinic, a store, a meeting or another place). Develop the story through more than one perspective or a revealing detail, and let the ending carry meaning.',
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['community'],
  },
  {
    id: 'g1112-final-match',
    band: '11-12',
    genre: 'narrative',
    title: 'The last minute',
    task: 'Write a narrative set in the final minute of a game, performance or competition. Slow time down. Choose details that reveal what the moment means to the character without stating it.',
    targetSkills: ['development.detail', 'sentences.control'],
    topics: ['sports', 'arts'],
  },
  {
    id: 'g1112-archive-letters',
    band: '11-12',
    genre: 'narrative',
    title: 'The archive box',
    task: 'Write a narrative about a character who volunteers at a local archive and finds a box of letters that changes how they see their town. Craft your sentences to control rhythm and pace.',
    targetSkills: ['sentences.control', 'organization.structure'],
    topics: ['arts', 'community'],
  },

  // ─── Grades 11–12 · checkpoints ─────────────────────────────────────────
  {
    id: 'g1112-cp-homework-policy',
    band: '11-12',
    genre: 'opinion',
    title: 'Checkpoint: a homework limit',
    task: 'Your district is considering a limit of 90 minutes of homework a night for secondary students. The sources disagree. Write a qualified recommendation for the school board that synthesizes both sources and answers the strongest objection.',
    targetSkills: [
      'purpose.claim',
      'development.evidence',
      'development.counterclaim',
    ],
    topics: ['school'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Summary of education research (fictional)',
        text: 'For secondary students, studies generally find that homework is linked to higher achievement up to about 90 minutes to two hours a night, with little added benefit beyond that. The quality of the assignment matters more than the time spent. Students in advanced courses reported spending the most time and the most stress.',
      },
      {
        title:
          'Source 2: Letter from a group of senior-course teachers (fictional)',
        text: 'Advanced and exam-preparation courses cover material that cannot fit into class time alone. A strict district-wide limit would force us to cut reading and practice that students need for external exams. We support coordinating due dates across courses so that students do not face several major assignments on the same night.',
      },
    ],
  },
  {
    id: 'g1112-cp-wind-farm',
    band: '11-12',
    genre: 'opinion',
    title: 'Checkpoint: the wind farm',
    task: 'An energy company wants to build 12 wind turbines on farmland near your town. Read both sources. Write an argument for a public hearing that weighs both sources and refines your claim in response to the strongest objection.',
    targetSkills: ['development.counterclaim', 'organization.structure'],
    topics: ['community', 'nature', 'technology'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Energy company project summary (fictional)',
        text: 'The turbines would produce enough electricity for about 18,000 homes. Farmers leasing land would receive about $8,000 per turbine each year, and the county would receive $600,000 a year in taxes. The company would fund a study of bird and bat movements before final siting.',
      },
      {
        title: 'Source 2: Neighbors’ petition (fictional)',
        text: 'The proposed site is on a ridge visible from most of town and from the state trail. Some residents near existing turbines in another county report sleep disturbance from noise at night. We ask that turbines be at least 1.5 kilometers from homes, which would remove four of the twelve proposed sites.',
      },
    ],
  },
  {
    id: 'g1112-cp-coral',
    band: '11-12',
    genre: 'informative',
    title: 'Checkpoint: coral bleaching',
    task: 'Read both sources. Write an explanation for a general audience of what coral bleaching is, why it happens, and why some reefs recover while others do not. Integrate information from both sources.',
    targetSkills: ['purpose.topic', 'development.information'],
    topics: ['science', 'nature', 'animals'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title: 'Source 1: Marine science fact sheet (simplified for this task)',
        text: 'Corals get much of their food from tiny algae living in their tissues, which also give them their color. When water stays unusually warm for weeks, corals expel the algae and turn white: this is bleaching. Bleached corals are not dead, but they are starving. If temperatures return to normal soon enough, algae can return.',
      },
      {
        title: 'Source 2: Reef monitoring report (fictional)',
        text: 'After a marine heatwave, two reefs 30 kilometers apart bleached at similar rates. A year later, 70 percent of coral cover had recovered at the reef far from the coast, but only 25 percent at the reef near a river mouth, where runoff makes the water cloudy and full of nutrients. Researchers think repeated heatwaves leave less time for recovery between events.',
      },
    ],
  },
  {
    id: 'g1112-cp-food-recall',
    band: '11-12',
    genre: 'informative',
    title: 'Checkpoint: how a food recall works',
    task: 'Read both sources. Explain to a general adult audience how a food recall works, from the first reports of illness to products being removed from shelves, and why recalls can take time. Organize your explanation so each step builds on the last.',
    targetSkills: ['organization.structure', 'word_choice.precision'],
    topics: ['food', 'science'],
    checkpoint: true,
    criteria: [USE_SOURCES],
    sources: [
      {
        title:
          'Source 1: Public health agency explainer (simplified for this task)',
        text: 'Doctors and laboratories report certain illnesses to health departments. When several people become sick with the same strain of bacteria, investigators interview them about what they ate and compare the bacteria’s genetic fingerprints. If a common food is found, the agency works with the company to issue a recall and alerts the public.',
      },
      {
        title:
          'Source 2: Interview with a food-safety investigator (fictional)',
        text: 'People often cannot remember what they ate two weeks ago, so interviews are slow. Lab results take several days. Once we suspect a product, we trace it back through distributors to the farm or factory, which can involve dozens of companies. We try to act quickly without naming the wrong product, because a mistaken recall hurts businesses and makes people ignore the next warning.',
      },
    ],
  },
  {
    id: 'g1112-cp-night-train',
    band: '11-12',
    genre: 'narrative',
    title: 'Checkpoint: the night train',
    task: 'Write a narrative about two strangers who share a long overnight journey. Establish a voice and a question at the start, reveal character through details and dialogue, and end in a way that changes how earlier moments read.',
    targetSkills: [
      'purpose.story',
      'development.detail',
      'organization.structure',
    ],
    topics: ['adventure'],
    checkpoint: true,
  },
  {
    id: 'g1112-cp-understudy',
    band: '11-12',
    genre: 'narrative',
    title: 'Checkpoint: the understudy',
    task: 'Write a narrative about an understudy who learns, an hour before the curtain goes up, that they will perform tonight. Control your syntax to shape the pace, and let the reader infer what the moment means.',
    targetSkills: ['sentences.control', 'development.detail'],
    topics: ['arts', 'school'],
    checkpoint: true,
  },
];

export const HIGH_SCHOOL_PROMPTS: WritingPrompt[] = SPECS.map(make);

export const HIGH_SCHOOL_DRILLS: DrillSet[] = [
  {
    id: 'd910-integrate-quotes',
    version: 1,
    band: '9-10',
    skillId: 'development.evidence',
    title: 'Introduce, quote, explain',
    description:
      'Practice bringing evidence into your own sentences and explaining it, instead of dropping quotations in.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which sentence integrates the evidence best?',
        detail:
          'Source: “Moving the start time to 8:40 increased students’ average sleep by about 34 minutes a night.”',
        options: [
          {
            text: '“Moving the start time to 8:40 increased students’ average sleep by about 34 minutes a night.” This shows schools should start later.',
            correct: false,
            feedback:
              'The quotation stands alone, and the explanation only repeats the claim. Who found this, and why do 34 minutes matter?',
          },
          {
            text: 'According to Dr. Ortiz, a later start increased average sleep “by about 34 minutes a night,” which would move many students closer to the recommended eight hours.',
            correct: true,
            feedback:
              'Yes. The source is named, the quotation fits the sentence, and the explanation says why the number matters.',
          },
          {
            text: 'Dr. Ortiz says sleep is very important for teenagers.',
            correct: false,
            feedback:
              'This is vague and drops the specific evidence. Use the number the source gives.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which is the strongest explanation after this evidence?',
        detail:
          'Evidence: “In two of the towns, foot traffic on the main street rose by 15 to 25 percent.”',
        options: [
          {
            text: 'This proves that plazas are always a good idea.',
            correct: false,
            feedback:
              '“Always” goes beyond the evidence: the study also describes a town where shops closed.',
          },
          {
            text: 'This is a big increase.',
            correct: false,
            feedback: 'True, but why does it matter for your claim?',
          },
          {
            text: 'More people walking past means more chances for shops to gain customers, which answers the business owners’ fear that a plaza would drive people away.',
            correct: true,
            feedback:
              'Yes. It links the number to the claim and to the opposing concern.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Rewrite this so the evidence is introduced, quoted (or paraphrased) and explained.',
        original:
          'Phones are distracting. “44 said phone notifications interrupt lessons at least once a day.”',
        samples: [
          'Phone notifications are a daily problem in most classrooms: in the teachers’ survey, 44 of 54 teachers said they interrupt lessons “at least once a day,” which adds up to hours of lost teaching time across a school year.',
          'The teachers’ survey suggests the distraction is common rather than occasional, since more than four out of five teachers report daily interruptions from notifications.',
        ],
        checklist: [
          'I said where the evidence comes from.',
          'The quotation or paraphrase fits into my own sentence.',
          'I explained why the evidence matters for my claim.',
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Paraphrase the source in one sentence, in your own words, and name the source.',
        original:
          'Source 2 (transportation coordinator): “If the high school starts at 9:00, either the elementary schools must start earlier … or we must hire nine more drivers, costing about $480,000 a year.”',
        samples: [
          'The district’s transportation coordinator warns that a 9:00 start would force a choice between earlier elementary start times and nearly half a million dollars a year for extra drivers.',
        ],
        checklist: [
          'I named the source.',
          'I used my own words and sentence structure.',
          'I kept the meaning accurate, including the numbers.',
        ],
      },
    ],
  },
  {
    id: 'd910-semicolons-colons',
    version: 1,
    band: '9-10',
    skillId: 'conventions.mechanics',
    title: 'Semicolons and colons',
    description:
      'Use a semicolon to link closely related sentences and a colon to introduce what follows.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which sentence uses a semicolon correctly?',
        options: [
          {
            text: 'The lot is full by 10 a.m.; shop owners want more parking.',
            correct: true,
            feedback:
              'Yes. Both sides are complete sentences, and the ideas are closely related.',
          },
          {
            text: 'The lot is full by 10 a.m.; because many visitors drive.',
            correct: false,
            feedback:
              '“Because many visitors drive” is not a complete sentence, so a semicolon cannot join it.',
          },
          {
            text: 'The lot has; 60 spaces.',
            correct: false,
            feedback: 'A semicolon cannot split one sentence in the middle.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which sentence uses a colon correctly?',
        options: [
          {
            text: 'The study names three causes: mites, poor food supply and pesticides.',
            correct: true,
            feedback:
              'Yes. A complete sentence comes before the colon, and the list explains it.',
          },
          {
            text: 'The causes include: mites, poor food supply and pesticides.',
            correct: false,
            feedback:
              '“The causes include” is not complete on its own; leave out the colon.',
          },
          {
            text: 'Bees: struggle for several reasons.',
            correct: false,
            feedback: 'A colon cannot separate a subject from its verb.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which version is punctuated correctly?',
        options: [
          {
            text: 'The plaza could help shops, however, it needs nearby parking.',
            correct: false,
            feedback:
              'This is a comma splice. “However” between two sentences needs a semicolon before it.',
          },
          {
            text: 'The plaza could help shops; however, it needs nearby parking.',
            correct: true,
            feedback: 'Yes. Semicolon before “however”, comma after it.',
          },
          {
            text: 'The plaza could help shops however it needs nearby parking.',
            correct: false,
            feedback: 'Two sentences run together here.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Combine these into one sentence using a semicolon and a transition such as “however” or “therefore”.',
        original:
          'A varsity team would cost $3,000 a year. The club already has 28 members.',
        samples: [
          'A varsity team would cost $3,000 a year; however, with 28 members already, the club has shown there is demand.',
        ],
        checklist: [
          'Both sides of the semicolon are complete sentences.',
          'The transition shows how the ideas relate.',
          'There is a comma after the transition.',
        ],
      },
    ],
  },
  {
    id: 'd1112-qualify-claims',
    version: 1,
    band: '11-12',
    skillId: 'purpose.claim',
    title: 'Qualify a claim',
    description:
      'Make a claim fit the evidence by adding scope, conditions or exceptions.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which claim is qualified to fit the evidence?',
        detail:
          'Evidence: tutoring gains were largest for students who already completed homework regularly; some students used the tool to get answers.',
        options: [
          {
            text: 'AI tutors improve learning for every student.',
            correct: false,
            feedback:
              '“Every student” goes beyond the evidence, which shows uneven gains.',
          },
          {
            text: 'AI tutors are bad because some students cheat.',
            correct: false,
            feedback:
              'This overstates one finding and ignores the gains the pilot found.',
          },
          {
            text: 'AI tutors are likely to help most when they are set to require students to explain their thinking and are paired with regular homework routines.',
            correct: true,
            feedback:
              'Yes. It names the conditions under which the evidence supports the claim.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which verb matches how strong the evidence is?',
        detail:
          'Evidence: one study found that students who volunteered were more likely to vote later, but the effect was small when service was required.',
        options: [
          {
            text: 'The study proves that required service creates voters.',
            correct: false,
            feedback:
              '“Proves” is too strong, and the study found a small effect for required service.',
          },
          {
            text: 'The study suggests that volunteering may encourage later civic involvement, especially when students choose it.',
            correct: true,
            feedback:
              'Yes. “Suggests” and “may” match one study with mixed results.',
          },
          {
            text: 'The study shows nothing.',
            correct: false,
            feedback: 'The study found a real link; do not dismiss it.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Qualify this claim so it fits both sources about the dam (salmon habitat; residents’ use of the pond).',
        original: 'The Mill Creek dam should be removed.',
        samples: [
          'The county should remove the Mill Creek dam, provided it funds a plan to restore public access and recreation along the new stream within the first five years.',
          'Unless a fish ladder can be shown to restore salmon access at a similar rate, removal is the better long-term choice for the creek.',
        ],
        checklist: [
          'My claim names a condition, scope or exception.',
          'The qualification responds to the opposing source.',
          'The claim is still clear enough to argue for.',
        ],
      },
    ],
  },
  {
    id: 'd1112-concision',
    version: 1,
    band: '11-12',
    skillId: 'word_choice.precision',
    title: 'Cut the padding',
    description:
      'Replace wordy phrases with precise ones so every word does work.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which version is most concise without losing meaning?',
        detail:
          'Original: “Due to the fact that buses are full at this point in time, it is important to note that more buses are needed.”',
        options: [
          {
            text: 'Because buses are already full, the city needs more of them.',
            correct: true,
            feedback:
              'Yes. “Due to the fact that”, “at this point in time” and “it is important to note” are padding.',
          },
          {
            text: 'Due to the fact that buses are full, more buses are needed at this time.',
            correct: false,
            feedback: 'Still padded: “due to the fact that” means “because”.',
          },
          {
            text: 'Buses.',
            correct: false,
            feedback: 'Too short: the meaning is lost.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which sentence uses the more precise verb?',
        options: [
          {
            text: 'The report makes a statement that the stadium will create jobs.',
            correct: false,
            feedback: '“Makes a statement that” hides the verb. Try “claims”.',
          },
          {
            text: 'The report claims the stadium will create jobs.',
            correct: true,
            feedback:
              'Yes. “Claims” is concise and signals that the report is one side’s view.',
          },
          {
            text: 'The report talks about how the stadium will kind of create jobs.',
            correct: false,
            feedback: '“Talks about” and “kind of” are vague.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Cut this sentence to about half its length.',
        original:
          'In my personal opinion, I think that it is basically the case that the turbines would really produce a very large amount of electricity for a lot of homes.',
        samples: [
          'The turbines would power about 18,000 homes.',
          'The turbines would supply electricity to roughly 18,000 homes.',
        ],
        checklist: [
          'I removed “in my personal opinion, I think” (the reader knows it is my view).',
          'I removed filler words such as “basically”, “really” and “very”.',
          'I used an exact number instead of “a lot”.',
        ],
      },
    ],
  },
];

export { HIGH_SCHOOL_LESSONS };
