import type {
  DrillSet,
  Genre,
  Lesson,
  Rubric,
  RubricDimension,
  Topic,
  WritingPrompt,
} from './types';

/**
 * Kindergarten to Grade 2. Young writers compose out loud before they can write everything
 * down, so every task starts from a picture set, an adult may type what the child says
 * (then spelling and punctuation are not rated), and feedback is short and read aloud.
 * Handwriting, drawing and letter formation are left to the adult and teacher.
 */

const PILOT = { status: 'pilot' as const };

const sentences: RubricDimension = {
  skillId: 'sentences.control',
  levels: {
    1: 'Words or short phrases, but no complete sentence yet.',
    2: 'Some complete sentences; others run together or stop partway.',
    3: 'Mostly complete simple sentences.',
    4: 'Complete sentences, including some joined with "and", "but" or "because".',
  },
};

const conventions: RubricDimension = {
  skillId: 'conventions.mechanics',
  levels: {
    1: 'Letters and words are hard to read, even when sounded out.',
    2: 'Some capital letters or end marks; many words are spelled in a way the reader cannot sound out.',
    3: 'Usually begins sentences with a capital letter and ends them with a period, and spells words so the reader can sound them out (spelling by sounds is expected).',
    4: 'Capitals and end marks are almost always correct, and common words such as "the", "was" and "said" are spelled correctly.',
  },
};

export const EARLY_RUBRICS: Rubric[] = [
  {
    id: 'gk-2-opinion',
    version: 1,
    band: 'K-2',
    genre: 'opinion',
    title: 'Kindergarten–Grade 2 opinion writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.claim',
        levels: {
          1: 'Does not tell an opinion, or talks about something else.',
          2: 'Tells something about the topic, but what they like or think is unclear.',
          3: 'Names the topic and clearly says what they like or think ("I like … best").',
          4: 'A clear opinion that comes back again at the end.',
        },
      },
      {
        skillId: 'development.evidence',
        levels: {
          1: 'No reason.',
          2: 'A reason that only repeats the opinion ("because I like it").',
          3: 'Gives at least one reason that explains the opinion.',
          4: 'Gives a reason with a detail or example, or more than one reason.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Ideas are in no order.',
          2: 'The opinion and a reason are there but jumbled, or there is no ending.',
          3: 'Opinion first, then the reason, with a word such as "because" or "also" linking ideas, and some sense of an ending.',
          4: 'Clear order with linking words and a closing sentence that ties back to the opinion.',
        },
      },
      sentences,
      conventions,
    ],
    anchors: [
      {
        text: 'I like the slid. It is fun.',
        ratings: {
          'purpose.claim': 3,
          'development.evidence': 2,
          'organization.structure': 2,
          'sentences.control': 3,
          'conventions.mechanics': 3,
        },
        note: 'Clear opinion. "It is fun" is a reason, but a very general one. "slid" for "slide" is good sound spelling.',
      },
      {
        text: 'I like the swings best becuz you can go up hi like a bird. Swings are the best!',
        ratings: {
          'purpose.claim': 4,
          'development.evidence': 4,
          'organization.structure': 4,
          'sentences.control': 4,
          'conventions.mechanics': 3,
        },
        note: 'A reason with a detail ("up high like a bird"), joined with "because", and an ending that returns to the opinion. "becuz" and "hi" can be sounded out.',
      },
    ],
  },
  {
    id: 'gk-2-informative',
    version: 1,
    band: 'K-2',
    genre: 'informative',
    title: 'Kindergarten–Grade 2 informative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.topic',
        levels: {
          1: 'The topic is not clear.',
          2: 'Tells something about the topic but does not name it.',
          3: 'Names the topic at the start ("This is how a seed grows").',
          4: 'Names the topic in a way that makes the reader want to learn about it.',
        },
      },
      {
        skillId: 'development.information',
        levels: {
          1: 'No facts about the topic.',
          2: 'One fact, or facts that are mostly about something else.',
          3: 'Gives two or more facts about the topic.',
          4: 'Gives facts with details, or uses a topic word and explains it.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Ideas are in no order.',
          2: 'Facts are there, but out of order, or there is no ending.',
          3: 'Facts or steps in order, with words such as "first", "next" or "then", and a closing sentence.',
          4: 'Clear order with a variety of order words and a closing sentence that sums up.',
        },
      },
      sentences,
      conventions,
    ],
    anchors: [
      {
        text: 'A seed. It grows. Flower.',
        ratings: {
          'purpose.topic': 2,
          'development.information': 2,
          'organization.structure': 2,
          'sentences.control': 2,
          'conventions.mechanics': 3,
        },
        note: 'The topic is there, but "A seed." and "Flower." are not complete sentences and there are no order words.',
      },
      {
        text: 'This is how a seed grows. First you plant the seed in dirt and give it water. Next a little sprowt comes up. Last it grows into a big flower. Now you have a flower!',
        ratings: {
          'purpose.topic': 3,
          'development.information': 3,
          'organization.structure': 4,
          'sentences.control': 4,
          'conventions.mechanics': 4,
        },
        note: 'Names the topic, gives steps in order with order words, and has a closing sentence. "sprowt" can be sounded out.',
      },
    ],
  },
  {
    id: 'gk-2-narrative',
    version: 1,
    band: 'K-2',
    genre: 'narrative',
    title: 'Kindergarten–Grade 2 narrative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.story',
        levels: {
          1: 'Does not tell about an event.',
          2: 'Tells about something, but it is unclear what happened or to whom.',
          3: 'Tells about one event, or a few events, and who they happened to.',
          4: 'Tells who, where and what the problem is near the start.',
        },
      },
      {
        skillId: 'development.detail',
        levels: {
          1: 'No details.',
          2: 'One or two details about what happened.',
          3: 'Details about what happened and how someone felt.',
          4: 'Details about actions, words or feelings that help the reader picture it.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Events are in no order.',
          2: 'Events are mostly in order, but there is no ending.',
          3: 'Events in order, with time words such as "first", "then" or "next", and an ending.',
          4: 'Events in order with a variety of time words, and an ending that tells how it worked out or how someone felt.',
        },
      },
      sentences,
      conventions,
    ],
    anchors: [
      {
        text: 'The dog. The mitten. Happy.',
        ratings: {
          'purpose.story': 2,
          'development.detail': 1,
          'organization.structure': 1,
          'sentences.control': 1,
          'conventions.mechanics': 3,
        },
        note: 'Names things from the pictures, but does not tell what happened yet.',
      },
      {
        text: 'Mia lost her red mitten in the snow. Then her dog Rex sniffed and sniffed. He found it! Mia gave Rex a big hug becuz she was so happy.',
        ratings: {
          'purpose.story': 4,
          'development.detail': 4,
          'organization.structure': 3,
          'sentences.control': 4,
          'conventions.mechanics': 3,
        },
        note: 'Who and the problem come first; actions ("sniffed and sniffed") and a feeling help the reader picture it.',
      },
    ],
  },
];

const RUBRIC_ID: Record<Genre, string> = {
  opinion: 'gk-2-opinion',
  informative: 'gk-2-informative',
  narrative: 'gk-2-narrative',
};

const WORDS: Record<Genre, { min: number; max: number }> = {
  opinion: { min: 5, max: 80 },
  informative: { min: 5, max: 80 },
  narrative: { min: 8, max: 100 },
};

const CRITERIA: Record<string, string> = {
  'purpose.claim': 'I tell what I like or think.',
  'development.evidence': 'I tell why, using "because".',
  'purpose.topic': 'I tell what my writing is about.',
  'development.information': 'I tell two or more facts.',
  'purpose.story': 'I tell who and what happened.',
  'development.detail': 'I tell how someone felt or what they did.',
  'organization.structure': 'I tell things in order: first, next, last.',
  'sentences.control': 'I write whole sentences.',
  'conventions.mechanics':
    'I start with a capital letter and end with a period.',
};

const PLANNING: Record<Genre, string[]> = {
  opinion: ['What do you like best?', 'Why? Say "because…"'],
  informative: ['What is it about?', 'What happens first, next and last?'],
  narrative: [
    'Who is in the story?',
    'What happens first, next and last?',
    'How do they feel at the end?',
  ],
};

const ADULT_GUIDE: Record<Genre, string> = {
  opinion:
    'Look at the pictures together and talk about each one. Ask: "Which one do you like best? Why?" Then your child can write, or you can type exactly what they say. Please don’t fix their words or spelling: the feedback is about their ideas.',
  informative:
    'Look at the pictures in order and ask: "What happens first? What happens next?" Let your child tell it out loud, then write it or type exactly what they say. Please don’t fix their words or spelling.',
  narrative:
    'Look at the pictures and ask: "Who is this? What happens? How do they feel?" Let your child tell the story out loud, then write it or type exactly what they say. Please don’t fix their words or spelling.',
};

interface Spec {
  id: string;
  genre: Genre;
  title: string;
  task: string;
  picture: { id: string; description: string };
  targetSkills: string[];
  topics: Topic[];
  checkIn?: boolean;
  checkpoint?: boolean;
}

function make(spec: Spec): WritingPrompt {
  return {
    id: spec.id,
    version: 1,
    band: 'K-2',
    genre: spec.genre,
    rubricId: RUBRIC_ID[spec.genre],
    title: spec.title,
    task: spec.task,
    picture: spec.picture,
    adultGuide: ADULT_GUIDE[spec.genre],
    successCriteria: [
      ...new Set([
        ...spec.targetSkills.map((s) => CRITERIA[s]),
        CRITERIA['conventions.mechanics'],
      ]),
    ].slice(0, 3),
    planningQuestions: PLANNING[spec.genre],
    targetSkills: spec.targetSkills,
    suggestedWords: WORDS[spec.genre],
    ...(spec.checkIn ? { checkIn: true } : {}),
    ...(spec.checkpoint ? { checkpoint: true } : {}),
    topics: spec.topics,
    review: PILOT,
  };
}

export const PICTURES = {
  playground: {
    id: 'playground',
    description:
      'Three pictures of a playground: 1) a tall slide, 2) two swings, 3) a sandbox with a bucket and spade.',
  },
  lostMitten: {
    id: 'lost-mitten',
    description:
      'Three pictures: 1) a child walks in the snow and a red mitten falls out of a pocket; 2) a dog sniffs the red mitten in the snow; 3) the dog brings the mitten back and the child smiles.',
  },
  seed: {
    id: 'seed-growing',
    description:
      'Three pictures: 1) a seed is planted in soil and watered; 2) a small green sprout comes up; 3) a tall plant with a yellow flower.',
  },
  sandwich: {
    id: 'making-sandwich',
    description:
      'Three pictures: 1) two slices of bread; 2) jam is spread on one slice with a butter knife; 3) the slices are put together and the sandwich is cut in half.',
  },
  fruit: {
    id: 'fruit-choice',
    description:
      'Three pictures: 1) a red apple, 2) a yellow banana, 3) a bunch of purple grapes.',
  },
  seasons: {
    id: 'seasons',
    description:
      'Three pictures: 1) a sunny day at the beach, 2) trees with orange leaves falling, 3) a snowy day with a snowman.',
  },
  rainyDay: {
    id: 'rainy-day',
    description:
      'Three pictures of things to do inside while it rains outside the window: 1) building with blocks, 2) painting at an easel, 3) reading a book on a cushion.',
  },
  pets: {
    id: 'pet-choice',
    description:
      'Three pictures: 1) a goldfish in a bowl, 2) a cat curled up asleep, 3) a puppy with a ball.',
  },
  frog: {
    id: 'frog-life',
    description:
      'Three pictures: 1) frog eggs floating in a pond, 2) a tadpole with a tail, 3) a grown frog sitting on a lily pad.',
  },
  teeth: {
    id: 'brush-teeth',
    description:
      'Three pictures: 1) toothpaste is squeezed onto a toothbrush; 2) a child brushes their teeth; 3) the child rinses with a cup of water and smiles.',
  },
  tower: {
    id: 'block-tower',
    description:
      'Three pictures: 1) a child builds a tall block tower; 2) the tower falls down; 3) the child and a friend build it again together.',
  },
  kite: {
    id: 'kite-day',
    description:
      'Three pictures: 1) a child flies a kite on a windy day; 2) the kite gets stuck in a tree; 3) a grown-up helps get the kite down and the child flies it again.',
  },
  puppyBath: {
    id: 'puppy-bath',
    description:
      'Three pictures: 1) a puppy jumps into a mud puddle; 2) the puppy has a bath in a tub with bubbles; 3) the puppy shakes water everywhere and a child laughs.',
  },
  nest: {
    id: 'bird-nest',
    description:
      'Three pictures: 1) a bird carries a twig in its beak; 2) a nest made of twigs in a tree; 3) three small eggs in the nest.',
  },
} as const;

const SPECS: Spec[] = [
  // Check-ins
  {
    id: 'k2-checkin-playground',
    genre: 'opinion',
    title: 'Check-in: the playground',
    task: 'Look at the playground pictures. Which one would you choose to play on? Tell why.',
    picture: PICTURES.playground,
    targetSkills: ['purpose.claim', 'development.evidence'],
    topics: ['school', 'sports'],
    checkIn: true,
  },
  {
    id: 'k2-checkin-lost-mitten',
    genre: 'narrative',
    title: 'Check-in: the lost mitten',
    task: 'Look at the pictures. Tell the story of the lost mitten. What happened first, next and last?',
    picture: PICTURES.lostMitten,
    targetSkills: ['purpose.story', 'organization.structure'],
    topics: ['animals', 'adventure'],
    checkIn: true,
  },
  // Practice
  {
    id: 'k2-best-fruit',
    genre: 'opinion',
    title: 'The best snack',
    task: 'Look at the three fruits. Which one is the best snack? Tell why.',
    picture: PICTURES.fruit,
    targetSkills: ['purpose.claim', 'sentences.control'],
    topics: ['food'],
  },
  {
    id: 'k2-best-season',
    genre: 'opinion',
    title: 'My favorite season',
    task: 'Look at the pictures of three seasons. Which one is your favorite? Give a reason with "because".',
    picture: PICTURES.seasons,
    targetSkills: ['development.evidence', 'organization.structure'],
    topics: ['nature'],
  },
  {
    id: 'k2-mitten-reward',
    genre: 'opinion',
    title: 'A treat for the dog?',
    task: 'In the pictures, the dog finds the lost mitten. Should the dog get a treat? Tell what you think and why.',
    picture: PICTURES.lostMitten,
    targetSkills: ['sentences.control', 'development.evidence'],
    topics: ['animals'],
  },
  {
    id: 'k2-seed-how',
    genre: 'informative',
    title: 'How a seed grows',
    task: 'Look at the pictures. Teach someone how a seed grows into a flower. Tell the steps in order.',
    picture: PICTURES.seed,
    targetSkills: ['organization.structure', 'development.information'],
    topics: ['nature', 'science'],
  },
  {
    id: 'k2-sandwich',
    genre: 'informative',
    title: 'Make a jam sandwich',
    task: 'Look at the pictures. Tell how to make a jam sandwich. Start by saying what you are teaching.',
    picture: PICTURES.sandwich,
    targetSkills: ['purpose.topic', 'organization.structure'],
    topics: ['food'],
  },
  {
    id: 'k2-bird-nest',
    genre: 'informative',
    title: 'Birds build nests',
    task: 'Look at the pictures. Tell what you know about how birds build nests. Give two or more facts.',
    picture: PICTURES.nest,
    targetSkills: ['development.information', 'purpose.topic'],
    topics: ['animals', 'nature'],
  },
  {
    id: 'k2-seed-story',
    genre: 'narrative',
    title: 'Sam’s seed',
    task: 'Look at the pictures. Tell a story about a child named Sam who plants a seed. How does Sam feel at the end?',
    picture: PICTURES.seed,
    targetSkills: ['development.detail', 'organization.structure'],
    topics: ['nature'],
  },
  {
    id: 'k2-puppy-bath',
    genre: 'narrative',
    title: 'The muddy puppy',
    task: 'Look at the pictures. Tell the story of the muddy puppy. Who is in the story, and what happens?',
    picture: PICTURES.puppyBath,
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['animals'],
  },
  // Checkpoints
  {
    id: 'k2-cp-rainy-day',
    genre: 'opinion',
    title: 'Checkpoint: a rainy day',
    task: 'It is raining outside. Look at the pictures. What is the best thing to do inside? Tell why.',
    picture: PICTURES.rainyDay,
    targetSkills: ['purpose.claim', 'development.evidence'],
    topics: ['arts', 'school'],
    checkpoint: true,
  },
  {
    id: 'k2-cp-class-pet',
    genre: 'opinion',
    title: 'Checkpoint: a class pet',
    task: 'Look at the three pets. Which one would be the best class pet? Give a reason.',
    picture: PICTURES.pets,
    targetSkills: ['development.evidence', 'organization.structure'],
    topics: ['animals', 'school'],
    checkpoint: true,
  },
  {
    id: 'k2-cp-frog',
    genre: 'informative',
    title: 'Checkpoint: from egg to frog',
    task: 'Look at the pictures. Teach someone how an egg turns into a frog. Tell the steps in order.',
    picture: PICTURES.frog,
    targetSkills: ['development.information', 'organization.structure'],
    topics: ['animals', 'science'],
    checkpoint: true,
  },
  {
    id: 'k2-cp-teeth',
    genre: 'informative',
    title: 'Checkpoint: brushing teeth',
    task: 'Look at the pictures. Tell how to brush your teeth. Say what you are teaching first.',
    picture: PICTURES.teeth,
    targetSkills: ['purpose.topic', 'organization.structure'],
    topics: ['science'],
    checkpoint: true,
  },
  {
    id: 'k2-cp-block-tower',
    genre: 'narrative',
    title: 'Checkpoint: the block tower',
    task: 'Look at the pictures. Tell the story of the block tower. What happens, and how do the children feel?',
    picture: PICTURES.tower,
    targetSkills: ['purpose.story', 'development.detail'],
    topics: ['school'],
    checkpoint: true,
  },
  {
    id: 'k2-cp-kite',
    genre: 'narrative',
    title: 'Checkpoint: the stuck kite',
    task: 'Look at the pictures. Tell the story of the kite. Use "first", "next" and "last".',
    picture: PICTURES.kite,
    targetSkills: ['organization.structure', 'development.detail'],
    topics: ['adventure', 'nature'],
    checkpoint: true,
  },
];

export const EARLY_PROMPTS: WritingPrompt[] = SPECS.map(make);

/** Short read-aloud lessons; one for every skill the K–2 rubrics score. */
export const EARLY_LESSONS: Lesson[] = [
  {
    id: 'k2-tell-what-you-like',
    version: 1,
    band: 'K-2',
    skillId: 'purpose.claim',
    title: 'Tell what you like',
    minutes: 8,
    objective: 'I can tell what I like or think.',
    explanation: [
      'An opinion tells what you like or what you think.',
      'You can start with "I like…", "I think…" or "The best one is…".',
    ],
    model: {
      text: 'I think the apple is the best snack.',
      annotations: [
        '"I think" tells the reader this is an opinion.',
        '"the apple" tells which one.',
      ],
    },
    nonExample: {
      text: 'There is an apple and a banana and grapes.',
      whatIsMissing:
        'This tells what is in the pictures, but not which one the writer likes.',
    },
    guided: {
      question: 'Which one tells an opinion?',
      options: [
        {
          text: 'The banana is yellow.',
          correct: false,
          feedback: 'That is true, but it does not say what you like.',
        },
        {
          text: 'I like grapes the best.',
          correct: true,
          feedback: 'Yes! "I like" tells your opinion.',
        },
        {
          text: 'Grapes.',
          correct: false,
          feedback: 'Tell more: do you like them?',
        },
      ],
    },
    practicePromptId: 'k2-best-fruit',
    reflection: 'Read your first sentence. Does it say what you like?',
    exitCheck: 'Point to the words that tell your opinion.',
    review: PILOT,
  },
  {
    id: 'k2-because',
    version: 1,
    band: 'K-2',
    skillId: 'development.evidence',
    title: 'Say why with "because"',
    minutes: 8,
    objective: 'I can tell why I think something, using "because".',
    explanation: [
      'After you tell your opinion, tell why.',
      'The word "because" helps you say why. Try to tell something real: "because I can build a snowman."',
    ],
    model: {
      text: 'Winter is my favorite season because I can build a snowman with my sister.',
      annotations: [
        '"Winter is my favorite season" is the opinion.',
        '"because I can build a snowman" tells why.',
      ],
    },
    nonExample: {
      text: 'Winter is my favorite because I like it.',
      whatIsMissing:
        '"Because I like it" says the opinion again. What do you like about winter?',
    },
    guided: {
      question: 'Which one gives the best reason?',
      detail: 'Opinion: "Summer is the best season…"',
      options: [
        {
          text: '…because it is the best.',
          correct: false,
          feedback: 'That says the opinion again. What do you do in summer?',
        },
        {
          text: '…because we can swim at the beach.',
          correct: true,
          feedback: 'Yes! Swimming at the beach is a real reason.',
        },
        {
          text: '…summer.',
          correct: false,
          feedback: 'Tell why you like summer.',
        },
      ],
    },
    practicePromptId: 'k2-best-season',
    reflection:
      'Find the word "because" in your writing. What reason comes after it?',
    exitCheck: 'Say your reason out loud to a grown-up.',
    review: PILOT,
  },
  {
    id: 'k2-name-the-topic',
    version: 1,
    band: 'K-2',
    skillId: 'purpose.topic',
    title: 'Say what you are teaching',
    minutes: 8,
    objective: 'I can tell what my writing is about at the start.',
    explanation: [
      'When you teach someone, tell them what you are teaching first.',
      'You can start with "This is how to…" or "I will tell you about…".',
    ],
    model: {
      text: 'This is how to make a jam sandwich.',
      annotations: [
        '"This is how to" tells the reader they will learn something.',
        '"make a jam sandwich" names the topic.',
      ],
    },
    nonExample: {
      text: 'Put the jam on.',
      whatIsMissing: 'The reader does not know what you are making yet.',
    },
    guided: {
      question: 'Which one is the best first sentence?',
      options: [
        {
          text: 'Brush up and down.',
          correct: false,
          feedback: 'This is a step. Tell what you are teaching first.',
        },
        {
          text: 'This is how to brush your teeth.',
          correct: true,
          feedback: 'Yes! Now the reader knows the topic.',
        },
        {
          text: 'I have a toothbrush.',
          correct: false,
          feedback: 'Close! Tell what you will teach about it.',
        },
      ],
    },
    practicePromptId: 'k2-sandwich',
    reflection: 'Read your first sentence. Does it tell what you are teaching?',
    exitCheck: 'Point to your topic.',
    review: PILOT,
  },
  {
    id: 'k2-teach-facts',
    version: 1,
    band: 'K-2',
    skillId: 'development.information',
    title: 'Tell two facts',
    minutes: 8,
    objective: 'I can tell two or more facts about my topic.',
    explanation: [
      'A fact is something true you can learn about.',
      'Look at each picture. What does it teach? Each picture can give you a fact.',
    ],
    model: {
      text: 'Birds build nests in trees. They use twigs. The mother bird lays eggs in the nest.',
      annotations: [
        'Fact 1: nests are in trees.',
        'Fact 2: they use twigs.',
        'Fact 3: eggs go in the nest.',
      ],
    },
    nonExample: {
      text: 'Birds are cool.',
      whatIsMissing: 'This is an opinion, not a fact. What do birds do?',
    },
    guided: {
      question: 'Which one is a fact about frogs?',
      options: [
        {
          text: 'Frogs are my favorite.',
          correct: false,
          feedback: 'That is your opinion. A fact is true for everyone.',
        },
        {
          text: 'Baby frogs are called tadpoles.',
          correct: true,
          feedback: 'Yes! That is a fact.',
        },
        {
          text: 'I saw a frog.',
          correct: false,
          feedback: 'That is about you. Tell something about frogs.',
        },
      ],
    },
    practicePromptId: 'k2-bird-nest',
    reflection: 'Count your facts. How many did you tell?',
    exitCheck: 'Hold up a finger for each fact you wrote.',
    review: PILOT,
  },
  {
    id: 'k2-who-and-what',
    version: 1,
    band: 'K-2',
    skillId: 'purpose.story',
    title: 'Who and what happened',
    minutes: 8,
    objective: 'I can tell who is in my story and what happened.',
    explanation: [
      'A story tells about someone and something that happens to them.',
      'Start by telling who: give them a name. Then tell what happens.',
    ],
    model: {
      text: 'Max was a little puppy. One day he jumped in a big mud puddle.',
      annotations: [
        '"Max was a little puppy" tells who.',
        '"he jumped in a big mud puddle" tells what happened.',
      ],
    },
    nonExample: {
      text: 'Mud. Bath. Bubbles.',
      whatIsMissing:
        'These words are from the pictures, but they do not tell who or what happened.',
    },
    guided: {
      question: 'Which one is the best start for a story?',
      options: [
        {
          text: 'A kite.',
          correct: false,
          feedback: 'Tell who has the kite and what happens.',
        },
        {
          text: 'Lily took her new kite to the park.',
          correct: true,
          feedback: 'Yes! We know who (Lily) and what is happening.',
        },
        {
          text: 'Kites are fun.',
          correct: false,
          feedback: 'That is an opinion. A story tells what happened.',
        },
      ],
    },
    practicePromptId: 'k2-puppy-bath',
    reflection: 'Who is in your story? Did you give them a name?',
    exitCheck: 'Point to the name of your character.',
    review: PILOT,
  },
  {
    id: 'k2-feelings',
    version: 1,
    band: 'K-2',
    skillId: 'development.detail',
    title: 'Tell how they feel',
    minutes: 8,
    objective: 'I can tell how someone feels and what they do.',
    explanation: [
      'Good stories tell how people feel: happy, sad, surprised, proud.',
      'You can also tell what they do or say: "Sam jumped up and down." "Sam said, Look!"',
    ],
    model: {
      text: 'When the flower opened, Sam jumped up and down. He was so proud.',
      annotations: [
        '"jumped up and down" tells what Sam did.',
        '"He was so proud" tells how he felt.',
      ],
    },
    nonExample: {
      text: 'Sam planted a seed. It grew.',
      whatIsMissing: 'We know what happened, but not how Sam felt.',
    },
    guided: {
      question: 'Which sentence tells how someone feels?',
      options: [
        {
          text: 'The tower fell down.',
          correct: false,
          feedback: 'That tells what happened. How did the children feel?',
        },
        {
          text: 'Ben was sad, so he sat on the floor.',
          correct: true,
          feedback:
            'Yes! "Ben was sad" tells a feeling, and "sat on the floor" tells what he did.',
        },
        {
          text: 'There were blocks.',
          correct: false,
          feedback: 'That tells what is in the picture.',
        },
      ],
    },
    practicePromptId: 'k2-seed-story',
    reflection: 'Find a feeling word in your story.',
    exitCheck: 'Act out how your character feels at the end.',
    review: PILOT,
  },
  {
    id: 'k2-first-next-last',
    version: 1,
    band: 'K-2',
    skillId: 'organization.structure',
    title: 'First, next, last',
    minutes: 8,
    objective: 'I can tell things in order using "first", "next" and "last".',
    explanation: [
      'Order words help the reader know what happens first.',
      'Look at the pictures from left to right. Say "First…" for picture 1, "Next…" for picture 2 and "Last…" for picture 3.',
    ],
    model: {
      text: 'First, you plant the seed. Next, a sprout comes up. Last, it grows into a flower.',
      annotations: [
        '"First" goes with picture 1.',
        '"Next" goes with picture 2.',
        '"Last" goes with picture 3.',
      ],
    },
    nonExample: {
      text: 'It is a flower. You plant the seed. A sprout comes up.',
      whatIsMissing:
        'The steps are mixed up, so the reader cannot follow them.',
    },
    guided: {
      question: 'What comes first when a frog grows?',
      options: [
        {
          text: 'A frog sits on a lily pad.',
          correct: false,
          feedback: 'That comes last.',
        },
        {
          text: 'A tadpole swims.',
          correct: false,
          feedback: 'That comes next.',
        },
        {
          text: 'Eggs float in the pond.',
          correct: true,
          feedback: 'Yes! The eggs come first.',
        },
      ],
    },
    practicePromptId: 'k2-seed-how',
    reflection: 'Find your order words. Are they in the right order?',
    exitCheck: 'Touch each picture as you read your sentences.',
    review: PILOT,
  },
  {
    id: 'k2-whole-sentence',
    version: 1,
    band: 'K-2',
    skillId: 'sentences.control',
    title: 'Whole sentences',
    minutes: 8,
    objective: 'I can write a whole sentence that tells who and what.',
    explanation: [
      'A whole sentence tells who (or what) and what they do: "The dog finds the mitten."',
      'Say your sentence out loud first. Does it make sense on its own?',
    ],
    model: {
      text: 'The dog finds the mitten.',
      annotations: [
        '"The dog" tells who.',
        '"finds the mitten" tells what the dog does.',
      ],
    },
    nonExample: {
      text: 'The red mitten in the snow.',
      whatIsMissing:
        'What happens to the mitten? Add what it does or what someone does with it.',
    },
    guided: {
      question: 'Which one is a whole sentence?',
      options: [
        {
          text: 'The big dog.',
          correct: false,
          feedback: 'What does the dog do?',
        },
        {
          text: 'The dog should get a treat.',
          correct: true,
          feedback: 'Yes! It tells who and what.',
        },
        {
          text: 'Get a treat.',
          correct: false,
          feedback: 'Who gets the treat?',
        },
      ],
    },
    practicePromptId: 'k2-mitten-reward',
    reflection:
      'Read each sentence out loud. Does each one make sense on its own?',
    exitCheck: 'Point to who and what in one sentence.',
    review: PILOT,
  },
  {
    id: 'k2-capital-period',
    version: 1,
    band: 'K-2',
    skillId: 'conventions.mechanics',
    title: 'Capital at the start, period at the end',
    minutes: 8,
    objective:
      'I can start a sentence with a capital letter and end it with a period.',
    explanation: [
      'Every sentence starts with a capital letter. The word "I" is always a capital.',
      'Every telling sentence ends with a period. A period tells the reader to stop and take a breath.',
      'Spelling words by their sounds is great. Just say the word slowly and write the sounds you hear.',
    ],
    model: {
      text: 'I like bananas. They are sweet.',
      annotations: [
        '"I" and "They" start with capital letters.',
        'Each sentence ends with a period.',
      ],
    },
    nonExample: {
      text: 'i like bananas they are sweet',
      whatIsMissing:
        'There are no capital letters at the start and no periods, so the sentences run together.',
    },
    guided: {
      question: 'Which one is written correctly?',
      options: [
        {
          text: 'my cat is soft',
          correct: false,
          feedback: 'Add a capital M and a period.',
        },
        {
          text: 'My cat is soft.',
          correct: true,
          feedback:
            'Yes! A capital letter at the start and a period at the end.',
        },
        {
          text: 'My cat is soft',
          correct: false,
          feedback: 'Great capital! Now add a period at the end.',
        },
      ],
    },
    practicePromptId: 'k2-best-fruit',
    reflection: 'Check each sentence: capital at the start, period at the end?',
    exitCheck: 'Circle your capital letters and your periods.',
    review: PILOT,
  },
];

export const EARLY_DRILLS: DrillSet[] = [
  {
    id: 'dk2-capitals-periods',
    version: 1,
    band: 'K-2',
    skillId: 'conventions.mechanics',
    title: 'Capitals and periods',
    description:
      'Find the sentence that starts with a capital letter and ends with a period.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which one is right?',
        options: [
          {
            text: 'the sun is hot.',
            correct: false,
            feedback: '"the" needs a capital T.',
          },
          {
            text: 'The sun is hot.',
            correct: true,
            feedback: 'Yes! Capital T and a period.',
          },
          {
            text: 'The sun is hot',
            correct: false,
            feedback: 'Add a period at the end.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which one is right?',
        options: [
          {
            text: 'I have a dog.',
            correct: true,
            feedback: 'Yes! "I" is always a capital letter.',
          },
          {
            text: 'i have a dog.',
            correct: false,
            feedback: '"I" is always a capital letter.',
          },
          { text: 'I have a dog', correct: false, feedback: 'Add a period.' },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which one shows two sentences the right way?',
        options: [
          {
            text: 'We went to the park we saw a duck.',
            correct: false,
            feedback: 'These two sentences run together.',
          },
          {
            text: 'We went to the park. We saw a duck.',
            correct: true,
            feedback:
              'Yes! A period ends the first sentence, and a capital starts the next.',
          },
          {
            text: 'We went to the park. we saw a duck.',
            correct: false,
            feedback: '"we" starts a sentence, so it needs a capital.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which name is written the right way?',
        options: [
          {
            text: 'My friend is maya.',
            correct: false,
            feedback: 'Names start with a capital letter.',
          },
          {
            text: 'My friend is Maya.',
            correct: true,
            feedback: 'Yes! Names always start with a capital letter.',
          },
          {
            text: 'my friend is Maya.',
            correct: false,
            feedback: 'The sentence needs a capital at the start too.',
          },
        ],
      },
    ],
  },
  {
    id: 'dk2-whole-sentences',
    version: 1,
    band: 'K-2',
    skillId: 'sentences.control',
    title: 'Whole sentences',
    description: 'Choose the sentence that tells who and what happens.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which one is a whole sentence?',
        options: [
          {
            text: 'The little bird.',
            correct: false,
            feedback: 'What does the bird do?',
          },
          {
            text: 'The little bird sings.',
            correct: true,
            feedback: 'Yes! Who (the bird) and what (sings).',
          },
          { text: 'Sings a song.', correct: false, feedback: 'Who sings?' },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which one is a whole sentence?',
        options: [
          {
            text: 'Jumped in the mud.',
            correct: false,
            feedback: 'Who jumped?',
          },
          {
            text: 'The puppy jumped in the mud.',
            correct: true,
            feedback: 'Yes! Now we know who and what.',
          },
          {
            text: 'The puppy in the mud.',
            correct: false,
            feedback: 'What did the puppy do?',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which one joins two ideas with "and"?',
        options: [
          {
            text: 'I ran and I jumped.',
            correct: true,
            feedback: 'Yes! "and" joins the two ideas.',
          },
          {
            text: 'I ran. And.',
            correct: false,
            feedback: '"And." is not a sentence on its own.',
          },
          {
            text: 'Ran jumped.',
            correct: false,
            feedback: 'Who ran and jumped?',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which one uses "because" to tell why?',
        options: [
          {
            text: 'Because it is fun.',
            correct: false,
            feedback: 'What is fun? Add the first part of the sentence.',
          },
          {
            text: 'I like the slide because it is fast.',
            correct: true,
            feedback: 'Yes! "because" tells why.',
          },
          {
            text: 'I like the slide because.',
            correct: false,
            feedback: 'Tell why after "because".',
          },
        ],
      },
    ],
  },
];
