import type { Rubric, Skill } from './types';

export const SKILLS: Skill[] = [
  {
    id: 'purpose.claim',
    family: 'purpose',
    name: 'Clear opinion or claim',
    studentGoal:
      'I can state a clear opinion and keep my writing focused on it.',
  },
  {
    id: 'purpose.story',
    family: 'purpose',
    name: 'Story setup',
    studentGoal: 'I can introduce a character, a setting and a problem.',
  },
  {
    id: 'purpose.topic',
    family: 'purpose',
    name: 'Clear topic and focus',
    studentGoal: 'I can introduce my topic clearly and stay focused on it.',
  },
  {
    id: 'development.information',
    family: 'development',
    name: 'Facts and explanation',
    studentGoal:
      'I can explain my topic with facts, definitions, details and examples.',
  },
  {
    id: 'organization.structure',
    family: 'organization',
    name: 'Organization',
    studentGoal:
      'I can put my ideas in an order that makes sense, with a beginning and an ending.',
  },
  {
    id: 'development.evidence',
    family: 'development',
    name: 'Reasons and evidence',
    studentGoal:
      'I can support my opinion with reasons and explain how each one helps.',
  },
  {
    id: 'development.detail',
    family: 'development',
    name: 'Story details',
    studentGoal:
      'I can use actions, dialogue and description to show what happens.',
  },
  {
    id: 'development.counterclaim',
    family: 'development',
    name: 'Counterclaims',
    studentGoal:
      'I can explain a serious opposing view fairly and show why my claim still holds.',
  },
  {
    id: 'sentences.control',
    family: 'sentences',
    name: 'Sentences',
    studentGoal: 'I can write complete sentences that are easy to follow.',
  },
  {
    id: 'word_choice.precision',
    family: 'word_choice',
    name: 'Word choice',
    studentGoal: 'I can choose exact words that fit my reader.',
  },
  {
    id: 'conventions.mechanics',
    family: 'conventions',
    name: 'Conventions',
    studentGoal:
      'I can use capital letters, punctuation and spelling so my reader is not slowed down.',
  },
];

const PILOT = { status: 'pilot' as const };

export const RUBRICS: Rubric[] = [
  {
    id: 'g3-5-opinion',
    version: 1,
    band: '3-5',
    genre: 'opinion',
    title: 'Grades 3–5 opinion writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.claim',
        levels: {
          1: 'No clear opinion, or the writing does not answer the question.',
          2: 'An opinion appears but is unclear, changes, or is hard to find.',
          3: 'States a clear opinion that answers the question and stays with it.',
          4: 'Clear opinion introduced in a way that draws the reader in, held throughout.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Ideas are listed in no clear order; no beginning or ending.',
          2: 'Some grouping of ideas; beginning or ending is missing or very thin.',
          3: 'Has a beginning, reasons grouped in a sensible order, and an ending. Uses linking words such as "because" or "also".',
          4: 'Clear order with smooth linking words between reasons and an ending that ties back to the opinion.',
        },
      },
      {
        skillId: 'development.evidence',
        levels: {
          1: 'No reasons, or reasons that do not connect to the opinion.',
          2: 'Gives a reason, but it is very general or repeats the opinion ("because it is good").',
          3: 'Gives at least two reasons with a fact, example or detail for at least one of them.',
          4: 'Gives reasons with specific details and explains how a detail supports the opinion.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Many sentences are incomplete or run together so the meaning is hard to follow.',
          2: 'Most sentences are understandable; several are fragments or run-ons.',
          3: 'Sentences are complete and easy to follow; some variety in length.',
          4: 'Varied sentences, including some that combine ideas with words like "when", "because" or "although".',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Words are often vague or confusing.',
          2: 'Mostly general words ("good", "nice", "stuff").',
          3: 'Some specific words that help the reader picture or understand the idea.',
          4: 'Exact, well-chosen words throughout that suit the reader.',
        },
      },
      {
        skillId: 'conventions.mechanics',
        levels: {
          1: 'Errors in capitals, end punctuation or spelling make the writing hard to read.',
          2: 'Frequent errors; the meaning is still mostly clear.',
          3: 'Grade-appropriate capitals, end punctuation and common spellings are mostly correct.',
          4: 'Very few errors, including commas in lists and correctly spelled grade-level words.',
        },
      },
    ],
    anchors: [
      {
        text: 'I think recess should be longer. Because it is fun. Recess is good and kids like it. That is why recess should be longer.',
        ratings: {
          'purpose.claim': 3,
          'organization.structure': 2,
          'development.evidence': 2,
          'sentences.control': 2,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Clear opinion. "Because it is fun" is a fragment, and "fun"/"good" are general reasons with no detail.',
      },
      {
        text: 'Our class should get a class pet. First, a pet would teach us to be responsible, because we would take turns feeding it every morning. Also, a fish or a hamster is calm, so it would not distract us during math. A class pet would make our room a better place to learn.',
        ratings: {
          'purpose.claim': 3,
          'organization.structure': 3,
          'development.evidence': 3,
          'sentences.control': 3,
          'word_choice.precision': 3,
          'conventions.mechanics': 3,
        },
        note: 'Two reasons, each with a detail, linking words, and an ending that returns to the opinion.',
      },
    ],
  },
  {
    id: 'g3-5-narrative',
    version: 1,
    band: '3-5',
    genre: 'narrative',
    title: 'Grades 3–5 narrative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.story',
        levels: {
          1: 'It is unclear who the story is about or what is happening.',
          2: 'A character appears, but the setting or problem is missing.',
          3: 'Introduces a character, a setting and a problem or goal.',
          4: 'Introduces the character, setting and problem in a way that makes the reader want to keep going.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Events are hard to follow or out of order.',
          2: 'Events are mostly in order but jump without connecting words; the ending is missing or sudden.',
          3: 'Events happen in a clear order with time words ("first", "later", "after that") and there is an ending.',
          4: 'Events flow naturally, and the ending shows how the problem was solved or what the character learned.',
        },
      },
      {
        skillId: 'development.detail',
        levels: {
          1: 'Very few details; the story is mostly a list of events.',
          2: 'Some details, but the writing mostly tells instead of showing.',
          3: 'Uses actions, dialogue or description to show what happens and how characters feel.',
          4: 'Chooses vivid details that show feelings and move the story forward.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Many sentences are incomplete or run together so the meaning is hard to follow.',
          2: 'Most sentences are understandable; several are fragments or run-ons.',
          3: 'Sentences are complete and easy to follow; some variety in how they begin.',
          4: 'Varied sentences that help the pace of the story.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Words are often vague or confusing.',
          2: 'Mostly general words ("went", "said", "nice").',
          3: 'Some exact verbs and describing words that help the reader picture the scene.',
          4: 'Exact, well-chosen words throughout, including sensory details.',
        },
      },
      {
        skillId: 'conventions.mechanics',
        levels: {
          1: 'Errors in capitals, end punctuation or spelling make the writing hard to read.',
          2: 'Frequent errors; the meaning is still mostly clear.',
          3: 'Grade-appropriate capitals, end punctuation and common spellings are mostly correct; dialogue may be imperfectly punctuated.',
          4: 'Very few errors, including quotation marks around dialogue.',
        },
      },
    ],
    anchors: [
      {
        text: 'One day I went to the park. I played on the swings. Then I went home and ate dinner. It was a good day.',
        ratings: {
          'purpose.story': 2,
          'organization.structure': 2,
          'development.detail': 1,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Events are in order but there is no problem, and the story lists events without showing anything.',
      },
    ],
  },
  {
    id: 'g6-8-argument',
    version: 1,
    band: '6-8',
    genre: 'opinion',
    title: 'Grades 6–8 argument writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.claim',
        levels: {
          1: 'No clear claim, or the writing does not respond to the task.',
          2: 'A claim is present but vague, buried, or not maintained.',
          3: 'States a clear, arguable claim that responds to the task and keeps the focus on it.',
          4: 'Precise claim that sets up the argument, and acknowledges that other positions exist when appropriate.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Ideas are not grouped; no introduction or conclusion.',
          2: 'Some grouping of ideas; transitions are missing or repetitive; conclusion is thin.',
          3: 'Introduction, logically ordered reasons, transitions that show how ideas relate, and a conclusion that follows from the argument.',
          4: 'Each paragraph builds on the last; transitions clarify relationships between claim, reasons and evidence.',
        },
      },
      {
        skillId: 'development.evidence',
        levels: {
          1: 'Little or no relevant support, or the claim is repeated as its own explanation.',
          2: 'Gives relevant reasons or details but leaves the connection to the claim mostly unstated.',
          3: 'Uses relevant evidence and explains how it supports the claim.',
          4: 'Explains the connection and addresses a meaningful limitation or competing view.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Frequent fragments or run-ons interfere with meaning.',
          2: 'Generally clear, with some awkward, fragmented or run-on sentences.',
          3: 'Clear, controlled sentences with some purposeful variety.',
          4: 'Sentence structure is varied to show relationships between ideas and to emphasize key points.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or inappropriate word choice obscures meaning.',
          2: 'Mostly general language; tone sometimes too casual for the task.',
          3: 'Precise language and a formal-enough tone for the audience.',
          4: 'Consistently precise, purposeful language; domain words used accurately.',
        },
      },
      {
        skillId: 'conventions.mechanics',
        levels: {
          1: 'Errors are frequent enough to interfere with meaning.',
          2: 'Noticeable errors that occasionally slow the reader.',
          3: 'Grade-appropriate grammar, punctuation and spelling with minor errors.',
          4: 'Few or no errors, including commas with introductory elements and clauses.',
        },
      },
    ],
    anchors: [
      {
        text: 'The club should meet outside because it is good. Outside is better than inside. Lots of students agree. In conclusion the club should meet outside.',
        ratings: {
          'purpose.claim': 3,
          'organization.structure': 2,
          'development.evidence': 1,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'The claim is clear, but "it is good" and "better" repeat the claim instead of supporting it.',
      },
      {
        text: 'The spare room should go to the art club. According to the planning note, the art club needs a dry place to store work, while the gardening club only needs a shelf for tools. Because paintings can be ruined by rain, a dry room matters more for art. The gardening club could keep its shelf in a corner, so both clubs would be helped.',
        ratings: {
          'purpose.claim': 3,
          'organization.structure': 3,
          'development.evidence': 4,
          'sentences.control': 3,
          'word_choice.precision': 3,
          'conventions.mechanics': 4,
        },
        note: "Uses a source detail, explains why it matters, and handles the other club's need.",
      },
    ],
  },
  {
    id: 'g6-8-narrative',
    version: 1,
    band: '6-8',
    genre: 'narrative',
    title: 'Grades 6–8 narrative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.story',
        levels: {
          1: 'Situation, narrator or characters are unclear.',
          2: 'Introduces characters or a situation, but the conflict or point of view is unclear.',
          3: 'Establishes a context, point of view and conflict that engage the reader.',
          4: 'Opening establishes context and tension efficiently and sets up what the story is really about.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Sequence is confusing; no clear ending.',
          2: 'Events are mostly sequenced, but shifts in time or setting are abrupt; ending is sudden.',
          3: 'Events unfold logically with transitions that signal shifts in time or setting, and a conclusion that follows from the events.',
          4: 'Pacing is controlled, and the conclusion reflects on the events or shows a change.',
        },
      },
      {
        skillId: 'development.detail',
        levels: {
          1: 'Mostly summary with few details.',
          2: 'Some description or dialogue, but much is told rather than shown.',
          3: 'Uses dialogue, pacing and description to develop experiences, events and characters.',
          4: 'Selects telling details and dialogue that reveal character and build tension.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Frequent fragments or run-ons interfere with meaning.',
          2: 'Generally clear, with some awkward, fragmented or run-on sentences.',
          3: 'Clear, controlled sentences with some purposeful variety.',
          4: 'Sentence length and structure are varied to control pacing and emphasis.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or confusing word choice.',
          2: 'Mostly general verbs and descriptions.',
          3: 'Precise words and sensory language that convey the experience.',
          4: 'Vivid, exact language that creates mood and voice.',
        },
      },
      {
        skillId: 'conventions.mechanics',
        levels: {
          1: 'Errors are frequent enough to interfere with meaning.',
          2: 'Noticeable errors that occasionally slow the reader.',
          3: 'Grade-appropriate grammar, punctuation and spelling with minor errors; dialogue punctuated mostly correctly.',
          4: 'Few or no errors, including consistent verb tense and dialogue punctuation.',
        },
      },
    ],
    anchors: [
      {
        text: 'I was nervous for the tryout. I walked into the gym. Everyone was there. I did the drills and I made the team. I was happy.',
        ratings: {
          'purpose.story': 2,
          'organization.structure': 2,
          'development.detail': 1,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Clear sequence, but feelings are named ("nervous", "happy") instead of shown, and the tension is resolved in one line.',
      },
    ],
  },
  {
    id: 'g3-5-informative',
    version: 1,
    band: '3-5',
    genre: 'informative',
    title: 'Grades 3–5 informative writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.topic',
        levels: {
          1: 'The topic is unclear, or the writing does not answer the task.',
          2: 'The topic is named but the writing wanders to other ideas.',
          3: 'Introduces the topic clearly and stays focused on it.',
          4: 'Introduces the topic in a way that tells the reader what they will learn, and stays focused throughout.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Information is in no clear order; no introduction or ending.',
          2: 'Some related information is grouped; the ending is missing or very thin.',
          3: 'Related information is grouped together (in paragraphs or sections), linked with words like "also", "another" or "for example", with a concluding sentence.',
          4: 'Clear groups or paragraphs, each with a main idea, smooth linking words, and a conclusion that sums up the information.',
        },
      },
      {
        skillId: 'development.information',
        levels: {
          1: 'Very few facts or details, or details that are not about the topic.',
          2: 'Some facts or details, but they are general or not explained.',
          3: 'Develops the topic with facts, definitions and details.',
          4: 'Develops the topic with well-chosen facts, definitions, details and examples, and explains what they mean.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Many sentences are incomplete or run together so the meaning is hard to follow.',
          2: 'Most sentences are understandable; several are fragments or run-ons.',
          3: 'Sentences are complete and easy to follow; some variety in length.',
          4: 'Varied sentences, including some that join ideas with words like "because", "when" or "which".',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Words are often vague or confusing.',
          2: 'Mostly general words ("thing", "stuff", "good").',
          3: 'Uses some exact words and topic words that help the reader understand.',
          4: 'Uses exact topic words correctly and explains any the reader might not know.',
        },
      },
      {
        skillId: 'conventions.mechanics',
        levels: {
          1: 'Errors in capitals, end punctuation or spelling make the writing hard to read.',
          2: 'Frequent errors; the meaning is still mostly clear.',
          3: 'Grade-appropriate capitals, end punctuation and common spellings are mostly correct.',
          4: 'Very few errors, including commas in lists and correctly spelled topic words.',
        },
      },
    ],
    anchors: [
      {
        text: 'Bees are bugs. They are yellow. Bees are cool and they do lots of stuff. I like bees.',
        ratings: {
          'purpose.topic': 2,
          'organization.structure': 1,
          'development.information': 1,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'Names the topic, but "cool" and "lots of stuff" give no information, and the last sentence is an opinion, not a conclusion.',
      },
      {
        text: 'Honeybees live together in a hive. Each bee has a job. Worker bees collect nectar from flowers, and the queen lays eggs. Bees also help plants grow, because pollen sticks to their legs and moves from flower to flower. Without bees, many fruits would not grow.',
        ratings: {
          'purpose.topic': 3,
          'organization.structure': 3,
          'development.information': 3,
          'sentences.control': 3,
          'word_choice.precision': 3,
          'conventions.mechanics': 3,
        },
        note: 'Grouped facts with topic words (hive, nectar, pollen), linking words, and a concluding sentence.',
      },
    ],
  },
  {
    id: 'g6-8-informative',
    version: 1,
    band: '6-8',
    genre: 'informative',
    title: 'Grades 6–8 informative/explanatory writing',
    review: PILOT,
    dimensions: [
      {
        skillId: 'purpose.topic',
        levels: {
          1: 'No clear topic or controlling idea, or the writing does not respond to the task.',
          2: 'The topic is introduced but the focus is vague or drifts.',
          3: 'Introduces the topic and a clear controlling idea, and maintains the focus.',
          4: 'Introduces the topic precisely, previews how it will be explained, and maintains a sharp focus.',
        },
      },
      {
        skillId: 'organization.structure',
        levels: {
          1: 'Ideas are not grouped; no introduction or conclusion.',
          2: 'Some grouping, but the organizing strategy is unclear; transitions are missing or repetitive.',
          3: 'Organizes ideas with a clear strategy (such as definition, classification, comparison or cause and effect), uses transitions that show relationships, and ends with a conclusion that follows from the information.',
          4: 'The organizing strategy fits the topic and each section builds understanding; transitions create cohesion across the piece.',
        },
      },
      {
        skillId: 'development.information',
        levels: {
          1: 'Little relevant information, or information that is inaccurate.',
          2: 'Some relevant facts or details, but they are listed without explanation.',
          3: 'Develops the topic with relevant facts, definitions, concrete details, quotations or examples, and explains them.',
          4: 'Selects the most useful information and analyzes it, showing how the details connect to the controlling idea.',
        },
      },
      {
        skillId: 'sentences.control',
        levels: {
          1: 'Frequent fragments or run-ons interfere with meaning.',
          2: 'Generally clear, with some awkward, fragmented or run-on sentences.',
          3: 'Clear, controlled sentences with some purposeful variety.',
          4: 'Sentence structure is varied to show relationships between ideas.',
        },
      },
      {
        skillId: 'word_choice.precision',
        levels: {
          1: 'Vague or inaccurate word choice obscures meaning.',
          2: 'Mostly general language; topic words are missing or misused; tone is sometimes too casual.',
          3: 'Precise language and topic-specific vocabulary in a formal style.',
          4: 'Consistently precise, accurate topic vocabulary, with terms explained for the reader when needed.',
        },
      },
      {
        skillId: 'conventions.mechanics',
        levels: {
          1: 'Errors are frequent enough to interfere with meaning.',
          2: 'Noticeable errors that occasionally slow the reader.',
          3: 'Grade-appropriate grammar, punctuation and spelling with minor errors.',
          4: 'Few or no errors, including punctuation of quotations and nonrestrictive elements.',
        },
      },
    ],
    anchors: [
      {
        text: 'Recycling is important. There are many kinds of recycling. People should recycle more because it is good for the earth. In conclusion recycling is important.',
        ratings: {
          'purpose.topic': 2,
          'organization.structure': 2,
          'development.information': 1,
          'sentences.control': 3,
          'word_choice.precision': 2,
          'conventions.mechanics': 3,
        },
        note: 'The topic is named, but the piece gives no facts or explanation and shifts into opinion ("people should").',
      },
      {
        text: 'Composting turns food scraps into soil. It works because tiny organisms called decomposers break down the scraps. These decomposers need three things: air, water and a mix of "green" waste, such as fruit peels, and "brown" waste, such as dry leaves. If a compost pile is too wet, it smells, because the decomposers that need air cannot survive.',
        ratings: {
          'purpose.topic': 3,
          'organization.structure': 3,
          'development.information': 4,
          'sentences.control': 4,
          'word_choice.precision': 4,
          'conventions.mechanics': 4,
        },
        note: 'Defines terms, explains cause and effect, and uses examples to make each idea concrete.',
      },
    ],
  },
];
