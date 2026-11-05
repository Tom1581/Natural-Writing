import type { Genre, Topic, WritingPrompt } from './types';

type GradeBand = '3-5' | '6-8';

/**
 * The prompt library. Each prompt is a short spec; success criteria and planning questions
 * come from the band, genre and target skills so the checklist always matches the rubric.
 * `checkpoint` prompts are reserved for independent transfer checks at the end of a plan.
 */

interface Spec {
  id: string;
  band: GradeBand;
  genre: Genre;
  title: string;
  task: string;
  targetSkills: string[];
  topics: Topic[];
  source?: { title: string; text: string };
  checkpoint?: boolean;
  /** Extra task-specific checklist items, shown first. */
  criteria?: string[];
  planning?: string[];
}

const RUBRIC: Record<GradeBand, Record<Genre, string>> = {
  '3-5': {
    opinion: 'g3-5-opinion',
    narrative: 'g3-5-narrative',
    informative: 'g3-5-informative',
  },
  '6-8': {
    opinion: 'g6-8-argument',
    narrative: 'g6-8-narrative',
    informative: 'g6-8-informative',
  },
};

const WORDS: Record<GradeBand, Record<Genre, { min: number; max: number }>> = {
  '3-5': {
    opinion: { min: 60, max: 250 },
    informative: { min: 60, max: 250 },
    narrative: { min: 80, max: 300 },
  },
  '6-8': {
    opinion: { min: 120, max: 400 },
    informative: { min: 120, max: 400 },
    narrative: { min: 150, max: 450 },
  },
};

/** One student-friendly checklist line per skill, worded for the band. */
const SKILL_CRITERIA: Record<GradeBand, Record<string, string>> = {
  '3-5': {
    'purpose.claim': 'I tell my opinion clearly at the start.',
    'purpose.story':
      'I introduce my character, where they are, and the problem.',
    'purpose.topic': 'My first sentence tells the reader what my topic is.',
    'organization.structure':
      'My ideas are in an order that makes sense, with a beginning and an ending.',
    'development.evidence': 'Each reason has an example or detail.',
    'development.detail': 'I show feelings with actions or dialogue.',
    'development.information':
      'I teach facts and details, and explain what they mean.',
    'sentences.control':
      'Every sentence is complete, and I join some ideas with "because", "so" or "when".',
    'word_choice.precision':
      'I use exact words instead of "good", "nice" or "stuff".',
    'conventions.mechanics': 'I check capitals, end punctuation and spelling.',
  },
  '6-8': {
    'purpose.claim':
      'My claim is precise and someone could reasonably disagree with it.',
    'purpose.story':
      'My opening establishes the situation, point of view and tension.',
    'purpose.topic': 'I introduce the topic with a clear controlling idea.',
    'organization.structure':
      'I use transitions that show how ideas connect, and my ending follows from what came before.',
    'development.evidence':
      'I explain how each piece of evidence supports my claim.',
    'development.detail':
      'I use dialogue, description and pacing to show what happens.',
    'development.information':
      'I explain the significance of each fact, not just list it.',
    'sentences.control': 'I vary my sentences to show how ideas relate.',
    'word_choice.precision':
      'I use precise words and a tone that fits my reader.',
    'conventions.mechanics':
      'I check punctuation (including commas and dialogue), grammar and spelling.',
  },
};

const PLANNING: Record<GradeBand, Record<Genre, string[]>> = {
  '3-5': {
    opinion: [
      'Your opinion:',
      'Reason 1 and an example:',
      'Reason 2 and an example:',
    ],
    narrative: [
      'Who is your character, and where are they?',
      'What is the problem?',
      'What happens first, next and last?',
    ],
    informative: [
      'Your topic:',
      'Facts that go together (group 1):',
      'Facts that go together (group 2):',
    ],
  },
  '6-8': {
    opinion: [
      'Your claim, in one sentence:',
      'Reason 1 and evidence:',
      'Reason 2 and evidence:',
      'An objection, and your answer:',
    ],
    narrative: [
      'Who is the character, and what do they want?',
      'What gets in the way?',
      'What is the key moment?',
      'What has changed by the end?',
    ],
    informative: [
      'Your controlling idea:',
      'Section 1 and its key facts:',
      'Section 2 and its key facts:',
      'Terms your reader may need defined:',
    ],
  },
};

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
    rubricId: RUBRIC[spec.band][spec.genre],
    title: spec.title,
    task: spec.task,
    ...(spec.source ? { sources: [spec.source] } : {}),
    successCriteria: [...new Set(criteria)].slice(0, 4),
    planningQuestions: spec.planning ?? PLANNING[spec.band][spec.genre],
    targetSkills: spec.targetSkills,
    suggestedWords: WORDS[spec.band][spec.genre],
    ...(spec.checkpoint ? { checkpoint: true } : {}),
    topics: spec.topics,
    review: { status: 'pilot' },
  };
}

const SPECS: Spec[] = [
  // ─── Grades 3–5 · opinion ───────────────────────────────────────────────
  {
    id: 'g35-homework-choice',
    band: '3-5',
    genre: 'opinion',
    title: 'Choose your own homework',
    task: 'Should students be allowed to choose their own homework topic one day a week? Give your opinion and support it with reasons and examples.',
    targetSkills: ['purpose.claim', 'development.evidence'],
    topics: ['school'],
  },
  {
    id: 'g35-apartment-pet',
    band: '3-5',
    genre: 'opinion',
    title: 'The best pet for a small home',
    task: 'What is the best pet for a family that lives in a small home, such as an apartment or flat? Choose one pet and give reasons it would be a good fit.',
    targetSkills: ['development.evidence', 'word_choice.precision'],
    topics: ['animals'],
  },
  {
    id: 'g35-rainy-day',
    band: '3-5',
    genre: 'opinion',
    title: 'Rainy-day plans',
    task: 'On a rainy day, is it better to play inside or to put on boots and play outside? Give your opinion and explain why.',
    targetSkills: ['organization.structure', 'development.evidence'],
    topics: ['nature', 'sports'],
  },
  {
    id: 'g35-book-or-movie',
    band: '3-5',
    genre: 'opinion',
    title: 'Book first or movie first?',
    task: 'When a book is made into a movie, should you read the book first or watch the movie first? Give your opinion and support it with reasons.',
    targetSkills: ['purpose.claim', 'organization.structure'],
    topics: ['arts'],
  },
  {
    id: 'g35-school-garden',
    band: '3-5',
    genre: 'opinion',
    title: 'A garden for every school',
    task: 'Should every school have a garden that students help to look after? Give your opinion with at least two reasons and examples.',
    targetSkills: ['development.evidence', 'sentences.control'],
    topics: ['nature', 'food', 'school'],
  },
  {
    id: 'g35-longer-lunch',
    band: '3-5',
    genre: 'opinion',
    title: 'More time for lunch',
    task: 'Should lunchtime at your school be longer? Write your opinion and explain your reasons.',
    targetSkills: ['purpose.claim', 'conventions.mechanics'],
    topics: ['food', 'school'],
  },
  {
    id: 'g35-robot-helper',
    band: '3-5',
    genre: 'opinion',
    title: 'A robot helper for the classroom',
    task: 'Imagine your class could have a robot helper. Would that be a good idea? Give your opinion, reasons and examples.',
    targetSkills: [
      'purpose.claim',
      'development.evidence',
      'organization.structure',
    ],
    topics: ['technology', 'school'],
    checkpoint: true,
  },
  {
    id: 'g35-team-trophies',
    band: '3-5',
    genre: 'opinion',
    title: 'Trophies for everyone?',
    task: 'Should every player on a sports team get a trophy at the end of the season, or only the winners? Give your opinion and support it.',
    targetSkills: [
      'purpose.claim',
      'development.evidence',
      'word_choice.precision',
    ],
    topics: ['sports'],
    checkpoint: true,
  },

  // ─── Grades 3–5 · narrative ─────────────────────────────────────────────
  {
    id: 'g35-talking-backpack',
    band: '3-5',
    genre: 'narrative',
    title: 'The talking backpack',
    task: 'Write a story about a character whose backpack suddenly starts talking. What does it say, and what happens next?',
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['adventure', 'school'],
  },
  {
    id: 'g35-secret-door',
    band: '3-5',
    genre: 'narrative',
    title: 'The small door in the library',
    task: 'Write a story about a character who finds a small door hidden behind the shelves of the school library.',
    targetSkills: ['organization.structure', 'word_choice.precision'],
    topics: ['adventure', 'arts'],
  },
  {
    id: 'g35-missing-pet',
    band: '3-5',
    genre: 'narrative',
    title: 'Where did Biscuit go?',
    task: 'Write a made-up story about a character whose pet goes missing for an afternoon. Where do they look, and how is the pet found?',
    targetSkills: ['organization.structure', 'development.detail'],
    topics: ['animals', 'community'],
  },
  {
    id: 'g35-surprise-day',
    band: '3-5',
    genre: 'narrative',
    title: 'The surprise day off',
    task: 'School is unexpectedly closed for a day because of the weather. Write a story about what a character does with the surprise free day.',
    targetSkills: ['purpose.story', 'sentences.control'],
    topics: ['nature', 'adventure'],
  },
  {
    id: 'g35-new-friend',
    band: '3-5',
    genre: 'narrative',
    title: 'An unexpected friend',
    task: 'Write a story about a character who makes a new friend in a way they did not expect.',
    targetSkills: ['development.detail', 'conventions.mechanics'],
    topics: ['school', 'community'],
  },
  {
    id: 'g35-kitchen-mix-up',
    band: '3-5',
    genre: 'narrative',
    title: 'The kitchen mix-up',
    task: 'Write a story about a character who is making a snack or meal when something goes funny or wrong. How do they fix it?',
    targetSkills: ['organization.structure', 'word_choice.precision'],
    topics: ['food'],
  },
  {
    id: 'g35-time-machine',
    band: '3-5',
    genre: 'narrative',
    title: 'One hundred years ago',
    task: 'A character steps into a time machine and visits their town one hundred years ago. Write the story of their visit.',
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['science', 'adventure', 'community'],
  },
  {
    id: 'g35-museum-night',
    band: '3-5',
    genre: 'narrative',
    title: 'Locked in the museum',
    task: 'Write a story about a character who is still inside a museum after it closes for the night.',
    targetSkills: [
      'purpose.story',
      'organization.structure',
      'development.detail',
    ],
    topics: ['arts', 'adventure'],
    checkpoint: true,
  },
  {
    id: 'g35-big-game',
    band: '3-5',
    genre: 'narrative',
    title: 'The last minute of the game',
    task: 'Write a story about the last minute of an important game. Show how the character feels as time runs out.',
    targetSkills: [
      'purpose.story',
      'development.detail',
      'conventions.mechanics',
    ],
    topics: ['sports'],
    checkpoint: true,
  },

  // ─── Grades 3–5 · informative ───────────────────────────────────────────
  {
    id: 'g35-seed-to-plant',
    band: '3-5',
    genre: 'informative',
    title: 'From seed to plant',
    task: 'Explain how a seed grows into a plant. Use the fact card, and put the stages in order.',
    targetSkills: ['organization.structure', 'development.information'],
    topics: ['nature', 'science'],
    source: {
      title: 'Fact card',
      text: 'A seed needs water, warmth and air to start growing. First a root grows down. Then a shoot pushes up toward the light. The first leaves open, and the plant uses sunlight to make its own food. Later, many plants grow flowers, which can make new seeds.',
    },
  },
  {
    id: 'g35-weather-ready',
    band: '3-5',
    genre: 'informative',
    title: 'Ready for the weather',
    task: 'Choose one kind of weather where you live (heat, rain, snow or wind). Explain how people can stay safe and comfortable in it.',
    targetSkills: ['purpose.topic', 'development.information'],
    topics: ['nature', 'community'],
  },
  {
    id: 'g35-simple-snack',
    band: '3-5',
    genre: 'informative',
    title: 'How to make a simple snack',
    task: 'Explain how to make a simple snack that does not need an oven, so that a younger student could follow your steps.',
    targetSkills: ['organization.structure', 'word_choice.precision'],
    topics: ['food'],
  },
  {
    id: 'g35-recycling',
    band: '3-5',
    genre: 'informative',
    title: 'Where recycling goes',
    task: 'Explain how recycling works at your school or home: what can be recycled, where it goes, and why it matters.',
    targetSkills: ['purpose.topic', 'sentences.control'],
    topics: ['community', 'nature'],
  },
  {
    id: 'g35-sport-rules',
    band: '3-5',
    genre: 'informative',
    title: 'The rules of a sport',
    task: 'Explain the main rules of a sport you know, so a new player understands how to play and how to score.',
    targetSkills: ['development.information', 'organization.structure'],
    topics: ['sports'],
  },
  {
    id: 'g35-making-sound',
    band: '3-5',
    genre: 'informative',
    title: 'How instruments make sound',
    task: 'Use the fact card to explain how musical instruments make sound. Give an example of each kind.',
    targetSkills: ['development.information', 'word_choice.precision'],
    topics: ['arts', 'science'],
    source: {
      title: 'Fact card',
      text: 'Sound is made when something vibrates, which means it moves back and forth very quickly. Guitar and violin strings vibrate when they are plucked or bowed. A drum skin vibrates when it is hit. In a flute or recorder, the air inside the instrument vibrates. Faster vibrations make higher sounds.',
    },
  },
  {
    id: 'g35-moon-phases',
    band: '3-5',
    genre: 'informative',
    title: 'Why the Moon changes shape',
    task: 'Use the fact card to explain why the Moon seems to change shape during a month.',
    targetSkills: ['purpose.topic', 'conventions.mechanics'],
    topics: ['science'],
    source: {
      title: 'Fact card',
      text: 'The Moon does not make its own light. Sunlight shines on it. As the Moon travels around Earth, we see different amounts of its sunny side. When we see the whole sunny side, it is a full moon. When we see none of it, it is a new moon. One full cycle takes about 29 and a half days.',
    },
  },
  {
    id: 'g35-community-helper',
    band: '3-5',
    genre: 'informative',
    title: 'A community helper',
    task: 'Choose a community helper, such as a librarian, firefighter, crossing guard or nurse. Explain what they do and why their job matters.',
    targetSkills: [
      'purpose.topic',
      'organization.structure',
      'development.information',
    ],
    topics: ['community'],
    checkpoint: true,
  },
  {
    id: 'g35-compare-animals',
    band: '3-5',
    genre: 'informative',
    title: 'Two animals, compared',
    task: 'Choose two animals. Explain how they are alike and how they are different.',
    targetSkills: [
      'purpose.topic',
      'development.information',
      'sentences.control',
    ],
    topics: ['animals'],
    checkpoint: true,
  },

  // ─── Grades 6–8 · argument ──────────────────────────────────────────────
  {
    id: 'g68-uniforms',
    band: '6-8',
    genre: 'opinion',
    title: 'School uniforms',
    task: 'Should students at your school wear uniforms? Write an argument that takes a position and addresses the strongest counterargument.',
    targetSkills: ['development.evidence', 'purpose.claim'],
    topics: ['school', 'arts'],
  },
  {
    id: 'g68-break-screens',
    band: '6-8',
    genre: 'opinion',
    title: 'Screens at break time',
    task: 'Should students be allowed to use phones or tablets during break and lunch? Write an argument with reasons and evidence, and end with a strong conclusion.',
    targetSkills: ['organization.structure', 'development.evidence'],
    topics: ['technology', 'school'],
  },
  {
    id: 'g68-four-day-week',
    band: '6-8',
    genre: 'opinion',
    title: 'A four-day school week',
    task: 'Read the planning note. Should the school try a four-day week? Use details from the note and explain how they support your position.',
    targetSkills: ['development.evidence', 'sentences.control'],
    topics: ['school', 'community'],
    source: {
      title: 'Planning note (fictional)',
      text: 'Proposal: school days would run 50 minutes longer, Monday to Thursday, with no school on Friday. In a survey of 300 families, 58% supported the idea and 31% were worried about childcare on Fridays. Bus costs would fall by about one fifth. Teachers would use two Fridays a month for training.',
    },
  },
  {
    id: 'g68-zoos',
    band: '6-8',
    genre: 'opinion',
    title: 'Are zoos worth it?',
    task: 'Read the fact sheet. Do modern zoos do more good than harm? Take a position, use evidence from the fact sheet, and respond to the other side.',
    targetSkills: ['purpose.claim', 'development.evidence'],
    topics: ['animals', 'science'],
    source: {
      title: 'Fact sheet (simplified for this task)',
      text: 'Many zoos run breeding programs for endangered species, and some animals have been returned to the wild this way. Zoos also teach visitors about wildlife. Critics argue that even large enclosures are far smaller than wild habitats, and that some animals, such as those that roam long distances, show signs of stress in captivity.',
    },
  },
  {
    id: 'g68-esports-club',
    band: '6-8',
    genre: 'opinion',
    title: 'Esports as a school team',
    task: 'Should competitive video gaming (esports) be an official school team, like basketball or debate? Argue your position in a formal style.',
    targetSkills: ['word_choice.precision', 'organization.structure'],
    topics: ['technology', 'sports'],
  },
  {
    id: 'g68-optional-homework',
    band: '6-8',
    genre: 'opinion',
    title: 'Optional homework',
    task: 'Should homework be optional for students your age? Write an argument with a precise claim, reasons and evidence, and a response to an objection.',
    targetSkills: [
      'purpose.claim',
      'development.evidence',
      'organization.structure',
    ],
    topics: ['school'],
    checkpoint: true,
  },
  {
    id: 'g68-empty-lot',
    band: '6-8',
    genre: 'opinion',
    title: 'What to build on the empty lot',
    task: 'Read the council note. Should the town build a skate park or a community garden on the empty lot? Use details from the note to support your recommendation.',
    targetSkills: [
      'purpose.claim',
      'development.evidence',
      'word_choice.precision',
    ],
    topics: ['community', 'sports', 'nature'],
    checkpoint: true,
    source: {
      title: 'Town council note (fictional)',
      text: 'The lot is 40 metres by 30 metres, next to a primary school. A skate park would cost about 120,000 and needs little upkeep; 85 young people signed a petition for one. A community garden would cost about 25,000, needs volunteers each week, and would give 30 families a plot. Neighbours have raised concerns about noise and about who would maintain the garden.',
    },
  },

  // ─── Grades 6–8 · narrative ─────────────────────────────────────────────
  {
    id: 'g68-invention-glitch',
    band: '6-8',
    genre: 'narrative',
    title: 'The invention that glitched',
    task: 'Write a story about a fictional character whose science-fair invention does something unexpected on the day of the fair.',
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['science', 'technology'],
  },
  {
    id: 'g68-trail',
    band: '6-8',
    genre: 'narrative',
    title: 'Off the trail',
    task: 'Write a story about a character who realizes, on a hike, that the trail markers have disappeared. Build tension, and show how they decide what to do.',
    targetSkills: ['organization.structure', 'word_choice.precision'],
    topics: ['nature', 'adventure'],
  },
  {
    id: 'g68-stage-fright',
    band: '6-8',
    genre: 'narrative',
    title: 'Two minutes before the curtain',
    task: 'Write a story about a character in the last two minutes before they perform on stage. Slow the pace down to show what they think and notice.',
    targetSkills: ['development.detail', 'sentences.control'],
    topics: ['arts'],
  },
  {
    id: 'g68-strange-signal',
    band: '6-8',
    genre: 'narrative',
    title: 'The strange signal',
    task: 'A character’s old radio picks up a signal no one else can hear. Write the story of what they discover.',
    targetSkills: ['purpose.story', 'organization.structure'],
    topics: ['science', 'adventure', 'technology'],
  },
  {
    id: 'g68-unlikely-team',
    band: '6-8',
    genre: 'narrative',
    title: 'The unlikely team',
    task: 'Write a story about two characters who don’t get along but are forced to work together to win something.',
    targetSkills: ['development.detail', 'conventions.mechanics'],
    topics: ['sports', 'school'],
  },
  {
    id: 'g68-old-photograph',
    band: '6-8',
    genre: 'narrative',
    title: 'The old photograph',
    task: 'A character finds an old photograph of their street, taken long ago, with a detail that doesn’t make sense. Write the story.',
    targetSkills: ['purpose.story', 'word_choice.precision'],
    topics: ['community', 'arts'],
  },
  {
    id: 'g68-moving-day',
    band: '6-8',
    genre: 'narrative',
    title: 'The last afternoon',
    task: 'Write a story about a fictional character’s last afternoon in a place they love before they move away. Show the feeling through details rather than naming it.',
    targetSkills: ['development.detail', 'organization.structure'],
    topics: ['community'],
  },
  {
    id: 'g68-two-sides',
    band: '6-8',
    genre: 'narrative',
    title: 'Two sides of the same moment',
    task: 'Tell the story of one event (a lost ticket, a broken window, a surprise result) twice: first from one character’s point of view, then from another’s.',
    targetSkills: [
      'purpose.story',
      'organization.structure',
      'development.detail',
    ],
    topics: ['school'],
    checkpoint: true,
  },
  {
    id: 'g68-one-hour',
    band: '6-8',
    genre: 'narrative',
    title: 'One hour',
    task: 'Write a story that takes place in exactly one hour. Use the time limit to build tension, and make the ending follow from the events.',
    targetSkills: [
      'purpose.story',
      'development.detail',
      'conventions.mechanics',
    ],
    topics: ['adventure'],
    checkpoint: true,
  },

  // ─── Grades 6–8 · informative ───────────────────────────────────────────
  {
    id: 'g68-water-cycle',
    band: '6-8',
    genre: 'informative',
    title: 'The water cycle',
    task: 'Use the fact sheet to explain the water cycle to a younger student. Define each key term and explain how the stages connect.',
    targetSkills: ['development.information', 'word_choice.precision'],
    topics: ['science', 'nature'],
    source: {
      title: 'Fact sheet',
      text: 'Heat from the Sun causes water in oceans, lakes and plants to evaporate, turning into water vapour. As the vapour rises, it cools and condenses into tiny droplets that form clouds. When droplets join and become heavy, they fall as precipitation: rain, snow, sleet or hail. Water then collects in oceans, rivers and underground, and the cycle continues.',
    },
  },
  {
    id: 'g68-volcanoes',
    band: '6-8',
    genre: 'informative',
    title: 'Why volcanoes erupt',
    task: 'Use the fact sheet to explain why some volcanoes erupt explosively while others release lava slowly.',
    targetSkills: ['purpose.topic', 'organization.structure'],
    topics: ['science', 'nature'],
    source: {
      title: 'Fact sheet',
      text: 'Magma is melted rock beneath Earth’s surface. It contains dissolved gases. Runny magma lets gas escape easily, so lava flows out steadily, as in many Hawaiian volcanoes. Thick, sticky magma traps gas; pressure builds until it is released in an explosive eruption that can throw ash high into the air.',
    },
  },
  {
    id: 'g68-strong-passwords',
    band: '6-8',
    genre: 'informative',
    title: 'Strong passwords',
    task: 'Explain what makes a password strong and how a student can create and remember one. Organize your explanation so each section answers one question.',
    targetSkills: ['organization.structure', 'sentences.control'],
    topics: ['technology'],
  },
  {
    id: 'g68-class-event',
    band: '6-8',
    genre: 'informative',
    title: 'Planning a class event',
    task: 'Explain the steps for planning a class event (such as a bake sale or a games afternoon), from the first idea to cleaning up.',
    targetSkills: ['organization.structure', 'word_choice.precision'],
    topics: ['community', 'school', 'food'],
  },
  {
    id: 'g68-bridges',
    band: '6-8',
    genre: 'informative',
    title: 'Two kinds of bridges',
    task: 'Use the fact sheet to compare beam bridges and suspension bridges. Explain how each carries weight and when each is used.',
    targetSkills: ['development.information', 'purpose.topic'],
    topics: ['technology', 'science'],
    source: {
      title: 'Fact sheet',
      text: 'A beam bridge is a horizontal beam supported at each end; it is simple and cheap but works best for short spans. A suspension bridge hangs its deck from cables slung over tall towers and anchored at each end; the cables carry the load to the towers and anchors, so it can cross very long distances, such as wide rivers and bays, but it costs much more to build.',
    },
  },
  {
    id: 'g68-practice-skill',
    band: '6-8',
    genre: 'informative',
    title: 'How skills are learned',
    task: 'Explain how an athlete, musician or gamer improves a difficult skill through practice. Use specific examples and explain why each method works.',
    targetSkills: ['development.information', 'sentences.control'],
    topics: ['sports', 'arts'],
  },
  {
    id: 'g68-food-chain',
    band: '6-8',
    genre: 'informative',
    title: 'A food chain',
    task: 'Use the fact sheet to explain how energy moves through a food chain, and what might happen if one link disappeared.',
    targetSkills: ['development.information', 'conventions.mechanics'],
    topics: ['animals', 'nature', 'science'],
    source: {
      title: 'Fact sheet',
      text: 'In a pond, algae use sunlight to make food. Tiny animals called zooplankton eat the algae. Small fish eat zooplankton, and herons eat the fish. Each animal uses most of the energy it gets to live and move, so only about a tenth of the energy passes to the next level. If small fish declined, zooplankton might increase and herons would have less to eat.',
    },
  },
  {
    id: 'g68-invention-changed',
    band: '6-8',
    genre: 'informative',
    title: 'An invention that changed daily life',
    task: 'Choose one invention (for example, the printing press, the bicycle, the refrigerator or the telephone). Explain how it changed daily life, organizing your piece by cause and effect.',
    targetSkills: [
      'purpose.topic',
      'organization.structure',
      'development.information',
    ],
    topics: ['technology', 'community'],
    checkpoint: true,
  },
  {
    id: 'g68-wetland',
    band: '6-8',
    genre: 'informative',
    title: 'What happened to the wetland',
    task: 'Read the report. Explain the causes of the changes in the wetland and their effects on wildlife.',
    targetSkills: [
      'purpose.topic',
      'development.information',
      'word_choice.precision',
    ],
    topics: ['nature', 'animals', 'science'],
    checkpoint: true,
    source: {
      title: 'Wetland report (fictional)',
      text: 'Between 2010 and 2020, a new road drained part of the Marsh Creek wetland, and the area covered by water fell by about a third. Over the same years, counts of frogs fell by half and two kinds of wading birds stopped nesting there. In 2021 volunteers blocked a drainage ditch; by 2024 open water had increased, and frog counts were rising again.',
    },
  },
];

export const LIBRARY_PROMPTS: WritingPrompt[] = SPECS.map(make);
