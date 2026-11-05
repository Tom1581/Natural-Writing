import type { Lesson } from './types';

const PILOT = { status: 'pilot' as const };

export const LESSONS: Lesson[] = [
  // ─── Grades 3–5 ─────────────────────────────────────────────────────────
  {
    id: 'g35-reasons-with-examples',
    version: 1,
    band: '3-5',
    skillId: 'development.evidence',
    title: 'Give a reason, then an example',
    minutes: 12,
    objective: 'I can back up each reason with an example.',
    explanation: [
      'A reason tells why you think something. An example shows your reader what you mean.',
      'After you write a reason, ask yourself: "Can my reader picture this?" If not, add "For example," and tell something that could really happen.',
    ],
    model: {
      text: 'Our class should plant a garden. One reason is that we could learn about science. For example, we could measure how tall the bean plants grow each week. Another reason is that it would make our school prettier, because flowers would grow next to the front door.',
      annotations: [
        'Sentence 1 tells the opinion.',
        '"One reason is that we could learn about science" is a reason.',
        '"For example, we could measure…" shows the reader exactly what learning would look like.',
        'The second reason has its example in the same sentence, after "because".',
      ],
    },
    nonExample: {
      text: 'Our class should plant a garden. It would be fun. It would be good. Gardens are nice.',
      whatIsMissing:
        '"Fun", "good" and "nice" are reasons, but there are no examples, so the reader cannot picture why a garden would be fun or good.',
    },
    guided: {
      question: 'Which sentence is the best example for this reason?',
      detail: 'Reason: "A class pet would teach us responsibility."',
      options: [
        {
          text: 'Pets are really cute.',
          correct: false,
          feedback: 'Cute is a new idea. Does it show responsibility?',
        },
        {
          text: 'For example, we would take turns feeding the fish and cleaning its tank.',
          correct: true,
          feedback:
            'Yes. Feeding and cleaning show exactly what being responsible would look like.',
        },
        {
          text: 'A class pet would teach us responsibility a lot.',
          correct: false,
          feedback: 'This repeats the reason. What would students actually do?',
        },
      ],
    },
    practicePromptId: 'g35-field-trip',
    reflection:
      'Pick one example you wrote. How does it help your reader understand your reason?',
    exitCheck:
      'Underline one reason in your writing and circle the example that goes with it.',
    review: PILOT,
  },
  {
    id: 'g35-story-order',
    version: 1,
    band: '3-5',
    skillId: 'organization.structure',
    title: 'First, next, then, finally',
    minutes: 12,
    objective: 'I can tell the events of a story in order using time words.',
    explanation: [
      'Readers follow a story more easily when they know when each thing happens.',
      'Time words such as "first", "after that", "later", "that night" and "finally" act like signposts. Use a new one when time moves forward.',
    ],
    model: {
      text: 'First, Maya noticed her kite was stuck in the oak tree. After that, she tried jumping, but her fingers only brushed the leaves. Later, she asked the custodian if he had a long pole. Finally, the kite floated down, and Maya cheered.',
      annotations: [
        'Each sentence starts with a time word.',
        'The events are in the order they happened.',
        'The last sentence uses "Finally" and shows that the problem is solved.',
      ],
    },
    nonExample: {
      text: 'Maya got her kite back. Her kite was stuck. She asked the custodian. She jumped.',
      whatIsMissing:
        'The events are out of order and there are no time words, so the reader cannot tell what happened first.',
    },
    guided: {
      question: 'Which word fits best in the blank?',
      detail:
        '"Leo dropped his lunch tray. ____, his friend helped him pick everything up."',
      options: [
        {
          text: 'Right away',
          correct: true,
          feedback:
            'Yes. It tells the reader the help came just after the tray fell.',
        },
        {
          text: 'First',
          correct: false,
          feedback:
            '"First" starts a sequence. Something already happened before this sentence.',
        },
        {
          text: 'Because',
          correct: false,
          feedback: '"Because" gives a reason, not a time. Try a time word.',
        },
      ],
    },
    practicePromptId: 'g35-lost-and-found',
    reflection: 'Which time word helped your story the most? Why?',
    exitCheck: 'Draw a box around every time word in your story.',
    review: PILOT,
  },
  {
    id: 'g35-complete-sentences',
    version: 1,
    band: '3-5',
    skillId: 'sentences.control',
    title: 'Complete sentences',
    minutes: 10,
    objective:
      'I can write complete sentences and join ideas with "because", "so" or "when".',
    explanation: [
      'A complete sentence has a who-or-what (the subject) and what they do or are (the verb). It makes sense on its own.',
      '"Because it is fun." does not make sense on its own. Join it to the sentence before: "Recess is my favorite time because it is fun."',
    ],
    model: {
      text: 'Students should pick their seats because they know where they learn best. When I sit near the window, I get distracted, so I would choose a seat near the front.',
      annotations: [
        'Each sentence has a subject and a verb.',
        '"because they know…" is joined to the idea it explains.',
        '"When…" and "so…" join three ideas into one clear sentence.',
      ],
    },
    nonExample: {
      text: 'Students should pick their seats. Because they know. Near the window. I get distracted so I would choose the front and also my friends are there and it is fun.',
      whatIsMissing:
        '"Because they know." and "Near the window." are fragments, and the last sentence runs on with "and" too many times.',
    },
    guided: {
      question: 'Which is a complete sentence?',
      options: [
        {
          text: 'Because we could talk to our friends.',
          correct: false,
          feedback:
            'This starts with "Because" but the main idea is missing. What happens because of it?',
        },
        {
          text: 'We could work faster because we could help each other.',
          correct: true,
          feedback:
            'Yes. It has a subject ("We"), a verb ("could work"), and a reason joined with "because".',
        },
        {
          text: 'Sitting with friends at the round table.',
          correct: false,
          feedback:
            'Who is sitting, and what happens? Add a subject and a verb.',
        },
      ],
    },
    practicePromptId: 'g35-pick-seats',
    reflection:
      'Find a sentence you joined with "because", "so" or "when". Read it aloud. Does it make sense on its own?',
    exitCheck:
      'Read each sentence aloud by itself. Fix any that do not make sense alone.',
    review: PILOT,
  },

  // ─── Grades 6–8 ─────────────────────────────────────────────────────────
  {
    id: 'g68-explain-your-evidence',
    version: 1,
    band: '6-8',
    skillId: 'development.evidence',
    title: 'Explain your evidence',
    minutes: 15,
    objective: 'I can explain how my evidence supports my claim.',
    explanation: [
      'A detail tells the reader what happened. An explanation tells the reader why that detail supports your point.',
      'After every piece of evidence, ask: "How does this help my reader understand my claim?" Your answer is the sentence your reader needs.',
    ],
    model: {
      text: 'The library should open a quiet study room at lunch. In our invented class poll, 12 students said they could not find a quiet place to read. A separate room would give those students somewhere to focus without asking the whole cafeteria to be quiet.',
      annotations: [
        'Sentence 1 states the claim.',
        'Sentence 2 gives evidence (a fictional poll, used only as an example; never present invented evidence as real).',
        'Sentence 3 explains the connection: why the evidence means the room is a good idea.',
      ],
    },
    nonExample: {
      text: 'The library should open a study room. Twelve students want it. This proves it is good.',
      whatIsMissing:
        '"This proves it is good" repeats the claim. It never explains why twelve students wanting a quiet place makes the room worthwhile.',
    },
    guided: {
      question:
        'Which sentence best explains how the evidence supports the claim?',
      detail:
        'Claim: "Our school should add water-bottle refill stations." Evidence: "The custodian empties two bins of plastic bottles every day."',
      options: [
        {
          text: 'That is a lot of bottles.',
          correct: false,
          feedback: 'True, but why does that matter for refill stations?',
        },
        {
          text: 'If students could refill their own bottles, many of those plastic bottles would never be thrown away.',
          correct: true,
          feedback:
            'Yes. It connects the trash in the bins to what refill stations would change.',
        },
        {
          text: 'Refill stations are a great idea for our school.',
          correct: false,
          feedback:
            'This repeats the claim. Explain how the evidence leads to it.',
        },
      ],
    },
    practicePromptId: 'g68-spare-room',
    reflection:
      'How did your explanation help the reader see why your detail matters?',
    exitCheck:
      'Underline the detail and the sentence explaining why it matters.',
    review: PILOT,
  },
  {
    id: 'g68-clear-claim',
    version: 1,
    band: '6-8',
    skillId: 'purpose.claim',
    title: 'Write a claim someone could argue with',
    minutes: 12,
    objective:
      'I can write a precise claim that someone could reasonably disagree with.',
    explanation: [
      'A claim is not a topic ("group projects") or a fact ("many classes have group projects"). It is a position a reasonable person could disagree with.',
      'Strong claims are specific: they say what should happen and hint at why.',
    ],
    model: {
      text: "Group projects should be graded individually, because a shared grade lets one student's effort hide another's.",
      annotations: [
        'It takes a side ("should be graded individually").',
        'A reasonable classmate could disagree.',
        'The "because" previews the main reason the essay will develop.',
      ],
    },
    nonExample: {
      text: 'In this essay I will talk about group projects and grades.',
      whatIsMissing:
        'This names a topic but takes no position, so the reader does not know what the essay will prove.',
    },
    guided: {
      question: 'Which is the strongest claim?',
      options: [
        {
          text: 'Homework is something most students get.',
          correct: false,
          feedback: 'This is a fact. Nobody would argue against it.',
        },
        {
          text: 'Homework is bad.',
          correct: false,
          feedback:
            'It takes a side but is vague. Bad how, and what should change?',
        },
        {
          text: 'Middle schools should limit homework to 30 minutes a night so students have time to rest and read.',
          correct: true,
          feedback: 'Yes. It is specific, arguable and previews the reasons.',
        },
      ],
    },
    practicePromptId: 'g68-group-grades',
    reflection:
      'Read your claim. What would someone who disagrees say? Does your essay answer them?',
    exitCheck:
      'Highlight your claim. Check: does it take a side, and could someone disagree?',
    review: PILOT,
  },
  {
    id: 'g68-transitions',
    version: 1,
    band: '6-8',
    skillId: 'organization.structure',
    title: 'Transitions that show connections',
    minutes: 12,
    objective:
      'I can use transitions that show how my ideas relate to each other.',
    explanation: [
      '"Also" and "next" only say that another idea is coming. Stronger transitions tell the reader how ideas relate.',
      'Use "as a result" for cause and effect, "however" or "on the other hand" for contrast, and "even more important" to rank your reasons.',
    ],
    model: {
      text: 'A field day would include every student, not only the ones who want to perform. As a result, no one would spend the afternoon just watching. Even more important, field day teams mix grades, so younger students get to know older ones.',
      annotations: [
        '"As a result" shows that the second idea follows from the first.',
        '"Even more important" tells the reader which reason matters most.',
        '"So" links a detail to its effect inside the sentence.',
      ],
    },
    nonExample: {
      text: 'A field day includes everyone. Also, no one just watches. Also, teams mix grades. Also, it is outside.',
      whatIsMissing:
        'Every transition is "also", so the reader cannot tell how the ideas connect or which matters most.',
    },
    guided: {
      question: 'Which transition fits best?',
      detail:
        '"A talent show lets students share hidden skills. ____, some students feel nervous on stage."',
      options: [
        {
          text: 'As a result',
          correct: false,
          feedback:
            'Sharing skills does not cause nervousness. The second idea is a contrast.',
        },
        {
          text: 'However',
          correct: true,
          feedback:
            'Yes. "However" signals that the second idea pushes against the first.',
        },
        {
          text: 'Also',
          correct: false,
          feedback: '"Also" adds an idea but hides that it is a downside.',
        },
      ],
    },
    practicePromptId: 'g68-field-day',
    reflection:
      'Which transition did the most work in your argument? What relationship does it show?',
    exitCheck:
      'Circle each transition and label it: add, contrast, cause, or rank.',
    review: PILOT,
  },
  {
    id: 'g68-show-dont-tell',
    version: 1,
    band: '6-8',
    skillId: 'development.detail',
    title: "Show, don't tell",
    minutes: 15,
    objective:
      "I can show a character's feelings through action, dialogue and description.",
    explanation: [
      'Telling names a feeling: "Sam was nervous." Showing lets the reader figure it out from what the character does, says and notices.',
      'You do not have to show everything. Save showing for the moments that matter most in your story.',
    ],
    model: {
      text: 'Sam read the team list twice, then a third time, tracing each name with one finger. His name was not there. "Maybe they forgot a page," he said to no one, already knowing they hadn\'t.',
      annotations: [
        'Reading the list three times shows hope and worry without naming either.',
        'The dialogue reveals that Sam is trying to stay hopeful.',
        '"already knowing they hadn\'t" shows disappointment.',
      ],
    },
    nonExample: {
      text: 'Sam looked at the team list. He was not on it. He was really sad and disappointed.',
      whatIsMissing:
        'The feelings are named, not shown. The reader is told what to feel instead of experiencing it with Sam.',
    },
    guided: {
      question: 'Which sentence best shows that Ana is excited?',
      options: [
        {
          text: 'Ana was very excited about the trip.',
          correct: false,
          feedback: 'This names the feeling. What would an excited person do?',
        },
        {
          text: 'Ana had packed her bag by Tuesday, even though the trip was on Saturday.',
          correct: true,
          feedback:
            'Yes. Packing days early lets the reader figure out she is excited.',
        },
        {
          text: 'The trip was on Saturday.',
          correct: false,
          feedback: "This is a fact about the trip, not about Ana's feelings.",
        },
      ],
    },
    practicePromptId: 'g68-new-place',
    reflection:
      'Find one place where you showed a feeling instead of naming it. What clue did you give the reader?',
    exitCheck:
      'Underline one feeling word you could replace with an action or a line of dialogue.',
    review: PILOT,
  },

  // ─── Added: a lesson for every scored skill in both bands ───────────────
  {
    id: 'g35-state-your-opinion',
    version: 1,
    band: '3-5',
    skillId: 'purpose.claim',
    title: 'Say what you think, right away',
    minutes: 10,
    objective: 'I can state my opinion clearly in my first sentence.',
    explanation: [
      'An opinion tells what you think or believe. Your reader should know your opinion after reading your very first sentence.',
      'A clear opinion names the topic and says what you think about it: "Winter is the best season for playing outside."',
    ],
    model: {
      text: 'Autumn is the best season for playing outside. The air is cool, so you can run without getting too hot, and the piles of leaves are perfect for jumping in.',
      annotations: [
        'The first sentence names the topic (playing outside) and the opinion (autumn is best).',
        'The next sentence gives reasons that match the opinion.',
      ],
    },
    nonExample: {
      text: 'There are four seasons. Some people like summer and some people like winter. I am going to write about seasons.',
      whatIsMissing:
        'The reader never finds out what the writer thinks. "I am going to write about seasons" names a topic, not an opinion.',
    },
    guided: {
      question: 'Which sentence is the clearest opinion?',
      options: [
        {
          text: 'Many people play outside in spring.',
          correct: false,
          feedback: 'This is a fact. Does it tell what the writer thinks?',
        },
        {
          text: 'Spring is the best season for playing outside.',
          correct: true,
          feedback:
            'Yes. It names the topic and says exactly what the writer thinks.',
        },
        {
          text: 'This writing is about spring.',
          correct: false,
          feedback: 'This tells the topic but not an opinion about it.',
        },
      ],
    },
    practicePromptId: 'g35-best-season',
    reflection:
      'Read your first sentence aloud. Would a reader know your opinion right away?',
    exitCheck: 'Underline your opinion sentence.',
    review: PILOT,
  },
  {
    id: 'g35-story-starts',
    version: 1,
    band: '3-5',
    skillId: 'purpose.story',
    title: 'Who, where and what’s wrong',
    minutes: 12,
    objective:
      'I can begin a story by introducing a character, a setting and a problem.',
    explanation: [
      'The beginning of a story answers three questions: Who is it about? Where are they? What is the problem?',
      'You don’t need a long introduction. One or two sentences can answer all three questions.',
    ],
    model: {
      text: 'Ravi pedaled his bike past the bakery on Hill Street, already late for his cousin’s birthday party. When he reached the corner, the road was blocked by a giant puddle.',
      annotations: [
        'Who: Ravi.',
        'Where: on his bike, on Hill Street.',
        'What’s wrong: he is late, and the road is blocked.',
      ],
    },
    nonExample: {
      text: 'One day something happened. It was crazy. Then it was over.',
      whatIsMissing:
        'We don’t know who the story is about, where it happens, or what the problem is.',
    },
    guided: {
      question:
        'Which opening introduces a character, a setting AND a problem?',
      options: [
        {
          text: 'Mia liked dogs.',
          correct: false,
          feedback: 'We know who, but not where or what is wrong.',
        },
        {
          text: 'At the crowded beach, Mia realized her little brother was no longer beside her.',
          correct: true,
          feedback:
            'Yes. Who: Mia. Where: the beach. Problem: her brother is missing.',
        },
        {
          text: 'The beach was sunny and nice.',
          correct: false,
          feedback:
            'We know where, but who is in the story, and what goes wrong?',
        },
      ],
    },
    practicePromptId: 'g35-wrong-turn',
    reflection:
      'Point to the words in your opening that tell who, where and what is wrong.',
    exitCheck:
      'Label your first two sentences: W (who), WH (where), P (problem).',
    review: PILOT,
  },
  {
    id: 'g35-show-feelings',
    version: 1,
    band: '3-5',
    skillId: 'development.detail',
    title: 'Show feelings with actions and words',
    minutes: 12,
    objective: 'I can show how a character feels using actions and dialogue.',
    explanation: [
      'Instead of writing "She was scared," show what a scared person does or says.',
      'Think: What would their hands, face or voice do? What might they say?',
    ],
    model: {
      text: 'Jo opened the lost-and-found box and gasped. Inside was a tiny silver key. “Who would lose this?” she whispered, turning it over in her fingers.',
      annotations: [
        '"gasped" shows surprise.',
        'The whispered question shows she is curious and a little nervous.',
        '"turning it over in her fingers" shows she is studying it closely.',
      ],
    },
    nonExample: {
      text: 'Jo found a key. She was surprised. She was curious.',
      whatIsMissing:
        'The feelings are named, not shown. We can’t picture Jo’s reaction.',
    },
    guided: {
      question: 'Which sentence best SHOWS that Ben is excited?',
      options: [
        {
          text: 'Ben was very excited.',
          correct: false,
          feedback: 'This names the feeling. What would an excited person do?',
        },
        {
          text: 'Ben bounced on his toes and shouted, “It’s finally here!”',
          correct: true,
          feedback: 'Yes. Bouncing and shouting show excitement.',
        },
        {
          text: 'Ben went to the door.',
          correct: false,
          feedback: 'This is an action, but it doesn’t show a feeling.',
        },
      ],
    },
    practicePromptId: 'g35-lost-and-found',
    reflection:
      'Which action or line of dialogue shows a feeling best in your story?',
    exitCheck:
      'Circle one feeling word you replaced with an action or dialogue.',
    review: PILOT,
  },
  {
    id: 'g35-introduce-topic',
    version: 1,
    band: '3-5',
    skillId: 'purpose.topic',
    title: 'Tell your reader what they will learn',
    minutes: 10,
    objective:
      'I can introduce my topic so the reader knows what they will learn.',
    explanation: [
      'Informative writing teaches. The first sentence or two should tell the reader the topic and what they are going to find out.',
      'Then every fact in your writing should be about that topic.',
    ],
    model: {
      text: 'Penguins are birds that cannot fly, but they are amazing swimmers. Here is how their bodies help them survive in icy water.',
      annotations: [
        'The topic is penguins.',
        'The second sentence tells the reader what they will learn: how penguins survive in icy water.',
      ],
    },
    nonExample: {
      text: 'Penguins. I saw one at the zoo once and my sister liked the gift shop.',
      whatIsMissing:
        'The topic is named, but the writing wanders to the zoo trip and never says what the reader will learn.',
    },
    guided: {
      question:
        'Which is the best introduction for a piece about how frogs grow?',
      options: [
        {
          text: 'Frogs are green and I think they are cute.',
          correct: false,
          feedback: 'This is an opinion. What will the reader learn?',
        },
        {
          text: 'A frog changes shape completely as it grows. Its life has four stages.',
          correct: true,
          feedback:
            'Yes. It names the topic and tells the reader what they will learn.',
        },
        {
          text: 'This is about frogs and toads and lizards.',
          correct: false,
          feedback: 'Too many topics. Focus on one.',
        },
      ],
    },
    practicePromptId: 'g35-animal-survive',
    reflection:
      'Does every fact in your writing match the topic you introduced?',
    exitCheck:
      'Underline your topic sentence. Cross out any sentence that is off-topic.',
    review: PILOT,
  },
  {
    id: 'g35-facts-and-details',
    version: 1,
    band: '3-5',
    skillId: 'development.information',
    title: 'Facts, then "this means…"',
    minutes: 12,
    objective:
      'I can develop my topic with facts and details, and explain what they mean.',
    explanation: [
      'A fact teaches the reader something true. A detail makes the fact clearer.',
      'After a fact, you can add "This means…" or "This helps because…" so your reader understands why it matters.',
    ],
    model: {
      text: 'Put your pencils in one cup and your markers in another. This means you can grab the right tool without digging through everything.',
      annotations: [
        'The first sentence gives the idea with exact details (pencils, markers, cups).',
        'The second sentence explains why it helps.',
      ],
    },
    nonExample: {
      text: 'Make your desk better. Put stuff away. It helps.',
      whatIsMissing:
        '"Stuff" and "better" are vague, and "It helps" doesn’t say how.',
    },
    guided: {
      question: 'Which sentence best explains why the idea helps?',
      detail: 'Idea: "Put a label on each drawer."',
      options: [
        {
          text: 'Labels are colorful.',
          correct: false,
          feedback: 'True, but how does that make things easier to find?',
        },
        {
          text: 'That way, you know what is inside without opening every drawer.',
          correct: true,
          feedback: 'Yes. It explains exactly how labels help.',
        },
        {
          text: 'You should put a label on each drawer.',
          correct: false,
          feedback: 'This repeats the idea. Explain why it helps.',
        },
      ],
    },
    practicePromptId: 'g35-tidy-desk',
    reflection:
      'Find one fact you explained. What words did you use to explain it?',
    exitCheck:
      'Draw a star next to each "this means" or "because" explanation.',
    review: PILOT,
  },
  {
    id: 'g35-exact-words',
    version: 1,
    band: '3-5',
    skillId: 'word_choice.precision',
    title: 'Swap tired words for exact ones',
    minutes: 10,
    objective:
      'I can replace general words with exact words that help my reader.',
    explanation: [
      'Some words are tired: "good", "nice", "thing", "stuff", "went". They don’t tell the reader much.',
      'Exact words paint a picture: instead of "went", try "raced", "tiptoed" or "wandered". Instead of "stuff", name the things.',
    ],
    model: {
      text: 'Each player needs a beanbag. Toss your beanbag so it lands inside a chalk square, then hop on one foot to pick it up.',
      annotations: [
        '"beanbag", "chalk square" and "hop on one foot" are exact. A new player knows exactly what to do.',
      ],
    },
    nonExample: {
      text: 'You need a thing. You throw it and then you go get it in a good way.',
      whatIsMissing:
        '"thing", "go get it" and "in a good way" are too general to follow.',
    },
    guided: {
      question: 'Which sentence uses the most exact words?',
      options: [
        {
          text: 'The dog did a cool thing.',
          correct: false,
          feedback: '"cool thing" doesn’t tell us what happened.',
        },
        {
          text: 'The dog leapt over the fence and dashed across the field.',
          correct: true,
          feedback:
            'Yes. "leapt", "fence", "dashed" and "field" paint a clear picture.',
        },
        {
          text: 'The dog went somewhere fast.',
          correct: false,
          feedback: '"went somewhere" is vague. Where, and how?',
        },
      ],
    },
    practicePromptId: 'g35-how-to-game',
    reflection:
      'Which word did you swap for a more exact one? How did it help?',
    exitCheck: 'Find two tired words in your writing and replace them.',
    review: PILOT,
  },
  {
    id: 'g35-capitals-and-punctuation',
    version: 1,
    band: '3-5',
    skillId: 'conventions.mechanics',
    title: 'Capitals, end marks and speech marks',
    minutes: 12,
    objective:
      'I can use capital letters, end punctuation and quotation marks (speech marks) correctly.',
    explanation: [
      'Every sentence starts with a capital letter and ends with a period (full stop), question mark or exclamation mark. Names of people and places start with capitals too.',
      'When a character speaks, put their exact words inside quotation marks (also called speech marks or inverted commas). Use a comma or end mark before the closing mark: “Let’s go,” said Sam.',
    ],
    model: {
      text: '“Which way is the park?” asked Lena. Her dad pointed down Maple Road. “It’s just past the library,” he said.',
      annotations: [
        'Each sentence starts with a capital and ends with a mark.',
        'Lena and Maple Road are names, so they have capitals.',
        'The spoken words are inside quotation marks, with the comma or question mark inside them.',
      ],
    },
    nonExample: {
      text: 'which way is the park asked lena. its just past the library he said',
      whatIsMissing:
        'Missing capitals for the sentence start and names, missing the question mark, the apostrophe in "it’s", and quotation marks around the spoken words.',
    },
    guided: {
      question: 'Which sentence is punctuated correctly?',
      options: [
        {
          text: '“Wait for me” shouted Omar.',
          correct: false,
          feedback:
            'Something is missing before the closing quotation mark. A comma or exclamation mark goes there.',
        },
        {
          text: '“Wait for me!” shouted Omar.',
          correct: true,
          feedback:
            'Yes. The exclamation mark goes inside the quotation marks.',
        },
        {
          text: 'Wait for me! shouted omar.',
          correct: false,
          feedback:
            'The spoken words need quotation marks, and "Omar" needs a capital.',
        },
      ],
    },
    practicePromptId: 'g35-wrong-turn',
    reflection:
      'Read your dialogue aloud. Did you put quotation marks around only the spoken words?',
    exitCheck: 'Check every sentence: capital at the start, mark at the end.',
    review: PILOT,
  },
  {
    id: 'g68-hook-the-reader',
    version: 1,
    band: '6-8',
    skillId: 'purpose.story',
    title: 'Openings that pull readers in',
    minutes: 12,
    objective:
      'I can write an opening that establishes the setting, the narrator or character, and tension.',
    explanation: [
      'A strong opening drops the reader into a moment instead of explaining everything first.',
      'Within the first few sentences, the reader should know where we are, whose eyes we see through, and what might go wrong.',
    ],
    model: {
      text: 'The lights died at 8:14, right in the middle of Nadia’s sentence. In the sudden dark, the wind sounded louder, as if it had been waiting for this. Somewhere upstairs, a door slammed.',
      annotations: [
        'Starts in a specific moment (8:14), not with background.',
        'The setting is a house in a storm; we see it through Nadia.',
        'Tension: the dark, the wind "waiting", the slammed door.',
      ],
    },
    nonExample: {
      text: 'This is a story about a girl named Nadia. She lived in a house. One night there was a storm and the power went out.',
      whatIsMissing:
        'It summarizes instead of showing a moment, so there is no tension. "This is a story about" tells the reader how to feel instead of making them feel it.',
    },
    guided: {
      question: 'Which opening creates the most tension?',
      options: [
        {
          text: 'Once upon a time there was a boy who went camping.',
          correct: false,
          feedback:
            'This sets up a story but gives no tension. What might go wrong?',
        },
        {
          text: 'Leo zipped the tent shut, then froze: something outside had just snapped a branch.',
          correct: true,
          feedback:
            'Yes. It starts in a moment, through Leo, with an immediate question: what is out there?',
        },
        {
          text: 'Camping is fun and many families go every summer.',
          correct: false,
          feedback: 'This is a general statement, not a story opening.',
        },
      ],
    },
    practicePromptId: 'g68-storm-night',
    reflection:
      'What question does your opening make the reader want answered?',
    exitCheck:
      'Highlight the words in your first paragraph that create tension.',
    review: PILOT,
  },
  {
    id: 'g68-controlling-idea',
    version: 1,
    band: '6-8',
    skillId: 'purpose.topic',
    title: 'Write a controlling idea',
    minutes: 12,
    objective:
      'I can introduce a topic with a controlling idea that previews my explanation.',
    explanation: [
      'A topic is what you are writing about. A controlling idea is the main point you will explain about it.',
      'A good controlling idea previews your organization, so the reader knows what is coming.',
    ],
    model: {
      text: 'Walking and taking the bus both get students to school, but they differ in cost, time and exercise.',
      annotations: [
        'Topic: two ways of getting to school.',
        'Controlling idea: they differ in three ways.',
        'It previews the organization: one section each on cost, time and exercise.',
      ],
    },
    nonExample: {
      text: 'In this essay I will talk about walking and the bus.',
      whatIsMissing:
        'It names a topic but no controlling idea, so the reader doesn’t know what the essay will explain.',
    },
    guided: {
      question: 'Which sentence is the strongest controlling idea?',
      options: [
        {
          text: 'Volcanoes are interesting.',
          correct: false,
          feedback: 'This is an opinion and gives no preview.',
        },
        {
          text: 'Volcanoes erupt when pressure builds from gas and magma trapped beneath the Earth’s crust.',
          correct: true,
          feedback:
            'Yes. It states the topic and the main idea the essay will explain.',
        },
        {
          text: 'This essay is about volcanoes.',
          correct: false,
          feedback:
            'This names a topic but not what you will explain about it.',
        },
      ],
    },
    practicePromptId: 'g68-compare-transport',
    reflection: 'Does each paragraph match a part of your controlling idea?',
    exitCheck:
      'Highlight your controlling idea and number the parts it previews.',
    review: PILOT,
  },
  {
    id: 'g68-explain-information',
    version: 1,
    band: '6-8',
    skillId: 'development.information',
    title: 'Fact, then significance',
    minutes: 15,
    objective:
      'I can develop a topic with relevant facts and explain what each one means.',
    explanation: [
      'Listing facts is not the same as explaining a topic. After each fact, tell the reader its significance: what it shows, causes or means.',
      'Phrases such as "This means that", "As a result" and "This matters because" help you move from fact to explanation.',
    ],
    model: {
      text: 'During sleep, the brain sorts and stores memories from the day. This means that a student who sleeps well after studying is more likely to remember what they learned.',
      annotations: [
        'Sentence 1 is a relevant fact from the source.',
        'Sentence 2 explains its significance for the reader.',
      ],
    },
    nonExample: {
      text: 'Teenagers need 8 to 10 hours of sleep. Screens can make it hard to sleep. Sleep helps memory.',
      whatIsMissing:
        'Three accurate facts, but none is explained, and the reader has to work out how they connect.',
    },
    guided: {
      question: 'Which sentence best explains the significance of this fact?',
      detail:
        'Fact: "Screens used late at night can make it harder to fall asleep."',
      options: [
        {
          text: 'Many students use phones.',
          correct: false,
          feedback: 'True, but it doesn’t explain what the fact means.',
        },
        {
          text: 'As a result, scrolling in bed can cut into the hours of sleep a growing brain needs.',
          correct: true,
          feedback:
            'Yes. It connects the fact to a consequence for the reader.',
        },
        {
          text: 'Screens make it harder to sleep at night.',
          correct: false,
          feedback: 'This repeats the fact. What does it mean for the reader?',
        },
      ],
    },
    practicePromptId: 'g68-sleep-science',
    reflection:
      'For one fact you used, what did your explanation add that the fact alone did not?',
    exitCheck: 'Underline each fact once and each explanation twice.',
    review: PILOT,
  },
  {
    id: 'g68-sentence-variety',
    version: 1,
    band: '6-8',
    skillId: 'sentences.control',
    title: 'Combine and vary sentences',
    minutes: 12,
    objective: 'I can combine and vary sentences to show how my ideas relate.',
    explanation: [
      'A string of short sentences sounds choppy and hides how ideas connect. Combining them shows the relationship: cause, contrast, time or condition.',
      'Use subordinating conjunctions (because, although, when, if, since) and relative clauses (who, which, that). Keep some short sentences for emphasis.',
    ],
    model: {
      text: 'Knead the dough for ten minutes, until it feels smooth and springy. Although this step is tiring, it builds the gluten that helps the bread rise. Don’t skip it.',
      annotations: [
        '"until it feels…" adds a time limit inside the first sentence.',
        '"Although…" shows a contrast between effort and benefit.',
        'The final short sentence adds emphasis.',
      ],
    },
    nonExample: {
      text: 'Knead the dough. Do it for ten minutes. It gets smooth. It is tiring. It helps the bread rise.',
      whatIsMissing:
        'Every sentence has the same short pattern, and the reader can’t tell how the ideas connect.',
    },
    guided: {
      question:
        'Which version best combines these sentences? "The bike tire was flat. I found the hole. I used soapy water."',
      options: [
        {
          text: 'The bike tire was flat and I found the hole and I used soapy water.',
          correct: false,
          feedback:
            'Joining with "and" three times creates a run-on feel and still hides the relationship.',
        },
        {
          text: 'When the bike tire went flat, I used soapy water to find the hole.',
          correct: true,
          feedback: 'Yes. "When" shows time and "to find" shows purpose.',
        },
        {
          text: 'The bike tire was flat, I found the hole, I used soapy water.',
          correct: false,
          feedback:
            'Commas alone can’t join complete sentences. This is a comma splice.',
        },
      ],
    },
    practicePromptId: 'g68-explain-process',
    reflection:
      'Find a sentence you combined. What relationship does the joining word show?',
    exitCheck: 'Read your first paragraph aloud. Combine two choppy sentences.',
    review: PILOT,
  },
  {
    id: 'g68-precise-formal-language',
    version: 1,
    band: '6-8',
    skillId: 'word_choice.precision',
    title: 'Precise words, formal style',
    minutes: 12,
    objective:
      'I can choose precise words and keep a formal style in an argument.',
    explanation: [
      'Arguments persuade best in a formal style: no slang, no "like, really, super", and no vague words such as "stuff" or "things".',
      'Precise words carry exact meaning. "Many students" is vague; "most of the 30 students surveyed" is precise. "Bad" is vague; "distracting" or "unsafe" says exactly what is wrong.',
    ],
    model: {
      text: 'Opening the library at lunch would give students a quiet, supervised space to finish assignments, which is difficult in a crowded cafeteria.',
      annotations: [
        '"quiet, supervised space" and "finish assignments" are precise.',
        'No slang; the tone is formal but still clear.',
      ],
    },
    nonExample: {
      text: 'The library should be open at lunch cuz the cafeteria is super loud and stuff and it’s really annoying.',
      whatIsMissing:
        '"cuz", "super", "and stuff" and "really annoying" are casual and vague, so the argument sounds less convincing.',
    },
    guided: {
      question: 'Which sentence is the most precise and formal?',
      options: [
        {
          text: 'Homework is kind of a lot sometimes.',
          correct: false,
          feedback: '"kind of" and "a lot" are vague and informal.',
        },
        {
          text: 'Two hours of homework a night leaves little time for sleep or exercise.',
          correct: true,
          feedback:
            'Yes. "Two hours" and "sleep or exercise" are precise, and the tone is formal.',
        },
        {
          text: 'Homework is super bad for everybody.',
          correct: false,
          feedback:
            '"super bad" is informal, and "everybody" overstates the claim.',
        },
      ],
    },
    practicePromptId: 'g68-library-hours',
    reflection:
      'Which vague or casual word did you replace, and what did you replace it with?',
    exitCheck: 'Circle any slang or vague words and replace them.',
    review: PILOT,
  },
  {
    id: 'g68-commas-that-help',
    version: 1,
    band: '6-8',
    skillId: 'conventions.mechanics',
    title: 'Commas that help readers',
    minutes: 12,
    objective:
      'I can use commas after introductory elements, between clauses, and in dialogue.',
    explanation: [
      'Put a comma after an introductory word, phrase or clause: "When the lights went out, we froze."',
      'Use a comma before a coordinating conjunction (and, but, so) that joins two complete sentences, and to separate dialogue from the speaker tag: “Stay here,” she said. Never join two complete sentences with only a comma.',
    ],
    model: {
      text: 'As the thunder rolled closer, Amir checked the window. The street was dark, but a single candle flickered in the house opposite. “Someone’s awake,” he whispered.',
      annotations: [
        'Comma after the introductory clause "As the thunder rolled closer".',
        'Comma before "but" joining two complete sentences.',
        'Comma inside the quotation marks before the speaker tag.',
      ],
    },
    nonExample: {
      text: 'As the thunder rolled closer Amir checked the window, the street was dark. “Someone’s awake” he whispered.',
      whatIsMissing:
        'No comma after the introductory clause; a comma splice joins two sentences; no comma before the closing quotation mark.',
    },
    guided: {
      question: 'Which sentence uses commas correctly?',
      options: [
        {
          text: 'After the storm passed we went outside, it was quiet.',
          correct: false,
          feedback:
            'Two errors: no comma after "passed", and a comma splice before "it was quiet".',
        },
        {
          text: 'After the storm passed, we went outside, and it was quiet.',
          correct: true,
          feedback:
            'Yes. A comma after the introductory clause, and a comma before "and" joining two sentences.',
        },
        {
          text: 'After, the storm passed we went outside and, it was quiet.',
          correct: false,
          feedback: 'The commas are in places that break up the ideas.',
        },
      ],
    },
    practicePromptId: 'g68-storm-night',
    reflection: 'Find one comma you added. Which rule does it follow?',
    exitCheck:
      'Check each sentence that starts with "When", "As", "After" or "If" for a comma.',
    review: PILOT,
  },

  // ─── Added: paragraphs, dialogue, counterclaims, conclusions ────────────
  {
    id: 'g35-paragraphs',
    version: 1,
    band: '3-5',
    skillId: 'organization.structure',
    title: 'One idea, one paragraph',
    minutes: 12,
    objective: 'I can group sentences about the same idea into a paragraph.',
    explanation: [
      'A paragraph is a group of sentences about one main idea. When you move to a new idea, start a new paragraph.',
      'The first sentence of a paragraph often tells the reader what the paragraph is about.',
    ],
    model: {
      text: 'A guinea pig is a good pet for a small home. It lives in a cage that fits on a table, and it does not need to go for walks.\n\nGuinea pigs are also friendly. They squeak when they see you and like to be held gently.',
      annotations: [
        'Paragraph 1 is all about size and space.',
        'Paragraph 2 starts a new idea: being friendly.',
        'Each paragraph begins with a sentence that tells its main idea.',
      ],
    },
    nonExample: {
      text: 'A guinea pig is a good pet. They squeak. It fits on a table. They like to be held. It does not need walks. They are friendly.',
      whatIsMissing:
        'Ideas about space and ideas about friendliness are mixed together, so the reader has to sort them out.',
    },
    guided: {
      question:
        'Which sentence belongs in a paragraph about why guinea pigs are easy to care for?',
      options: [
        {
          text: 'Guinea pigs come in many colors.',
          correct: false,
          feedback:
            'Interesting, but color is not about care. It belongs somewhere else.',
        },
        {
          text: 'They only need fresh food, water and a clean cage.',
          correct: true,
          feedback: 'Yes. It tells exactly why they are easy to care for.',
        },
        {
          text: 'My cousin has a dog.',
          correct: false,
          feedback: 'This is about a different animal and a different idea.',
        },
      ],
    },
    practicePromptId: 'g35-apartment-pet',
    reflection: 'What is the main idea of each of your paragraphs?',
    exitCheck:
      'Write the main idea of each paragraph in the margin. Does every sentence match it?',
    review: PILOT,
  },
  {
    id: 'g35-dialogue',
    version: 1,
    band: '3-5',
    skillId: 'development.detail',
    title: 'Let your characters talk',
    minutes: 12,
    objective: 'I can use dialogue to show what characters think and feel.',
    explanation: [
      'Dialogue is the exact words characters say. It lets the reader hear the characters and figure out how they feel.',
      'Start a new line each time a different character speaks, and put their words inside quotation marks.',
    ],
    model: {
      text: '“Did you hear that?” whispered Noor, grabbing her brother’s sleeve.\n“It’s just the wind,” said Sami, but he didn’t let go of the flashlight.',
      annotations: [
        'Noor’s whisper and grabbing show she is scared.',
        'Sami says it is nothing, but holding the flashlight tight shows he is nervous too.',
        'Each speaker starts a new line.',
      ],
    },
    nonExample: {
      text: 'Noor heard a noise and told Sami. Sami said it was the wind. They were scared.',
      whatIsMissing:
        'We are told what they said instead of hearing them, and the feelings are named instead of shown.',
    },
    guided: {
      question:
        'Which line of dialogue best shows that a character is excited?',
      options: [
        {
          text: '“I am excited,” said Leo.',
          correct: false,
          feedback:
            'This names the feeling. How would an excited person sound?',
        },
        {
          text: '“We won? We actually won?” Leo shouted, jumping up and down.',
          correct: true,
          feedback:
            'Yes. The repeated question and the jumping show excitement.',
        },
        {
          text: '“Okay,” said Leo.',
          correct: false,
          feedback: '"Okay" could mean many things. Show more.',
        },
      ],
    },
    practicePromptId: 'g35-new-friend',
    reflection:
      'Which line of dialogue tells the reader the most about your character?',
    exitCheck:
      'Check that each new speaker starts a new line, inside quotation marks.',
    review: PILOT,
  },
  {
    id: 'g68-counterclaims',
    version: 1,
    band: '6-8',
    skillId: 'development.evidence',
    title: 'Answer the other side',
    minutes: 15,
    objective:
      'I can acknowledge a counterclaim and respond to it with evidence and reasoning.',
    explanation: [
      'A strong argument shows you have considered what someone who disagrees would say. Ignoring the other side makes readers suspicious.',
      'Use a three-step move: name the counterclaim fairly ("Some people argue…"), concede what is true about it, then respond with evidence that explains why your claim still holds.',
    ],
    model: {
      text: 'Some families argue that uniforms are expensive. It is true that buying several sets at once can cost a lot. However, many schools that require uniforms run second-hand sales, and families no longer need to buy as many different outfits, so the total cost over a year can be lower.',
      annotations: [
        '"Some families argue…" names the counterclaim fairly.',
        '"It is true that…" concedes a fair point.',
        '"However…" responds with evidence and explains why it matters.',
      ],
    },
    nonExample: {
      text: 'Some people think uniforms are bad, but they are wrong. Uniforms are good.',
      whatIsMissing:
        'The counterclaim is vague and is dismissed without any evidence or reasoning.',
    },
    guided: {
      question:
        'Which is the best response to this counterclaim? "Some students say phones at lunch help them relax."',
      options: [
        {
          text: 'That is not true at all.',
          correct: false,
          feedback: 'Dismissing it without reasons won’t convince anyone.',
        },
        {
          text: 'Relaxing matters, but talking with friends or playing outside also helps students relax, and those activities don’t pull students into a screen for the whole break.',
          correct: true,
          feedback:
            'Yes. It concedes the point and then explains why the claim still holds.',
        },
        {
          text: 'Phones are bad for your eyes.',
          correct: false,
          feedback:
            'This is a new reason, not a response to the counterclaim about relaxing.',
        },
      ],
    },
    practicePromptId: 'g68-uniforms',
    reflection: 'How did answering the other side make your argument stronger?',
    exitCheck: 'Label your counterclaim paragraph: name it, concede, respond.',
    review: PILOT,
  },
  {
    id: 'g68-strong-conclusions',
    version: 1,
    band: '6-8',
    skillId: 'organization.structure',
    title: 'Conclusions that follow from the argument',
    minutes: 12,
    objective:
      'I can write a conclusion that follows from my argument instead of just repeating it.',
    explanation: [
      'A conclusion is your last chance to show why your argument matters. Repeating "In conclusion, I think…" wastes it.',
      'A strong conclusion briefly pulls the reasons together and then looks outward: what should happen next, or what is at stake?',
    ],
    model: {
      text: 'Limiting screens at break would give students time to move, talk and rest their eyes, three things a school day rarely allows. A trial of one term would show whether those benefits are real, and it would cost the school nothing to try.',
      annotations: [
        'The first sentence pulls the reasons together in a new way.',
        'The second looks forward with a practical next step.',
        'It never says "In conclusion".',
      ],
    },
    nonExample: {
      text: 'In conclusion, screens should be limited at break because of the reasons I said. That is my opinion.',
      whatIsMissing:
        'It points back to the reasons without saying anything new or showing why the argument matters.',
    },
    guided: {
      question:
        'Which is the strongest final sentence for an argument that the library should open at lunch?',
      options: [
        {
          text: 'That is why I think the library should open.',
          correct: false,
          feedback: 'This only repeats the claim.',
        },
        {
          text: 'Opening one room for one hour a day would give every student a quiet place to learn, a small change with a large benefit.',
          correct: true,
          feedback: 'Yes. It sums up the argument and shows why it matters.',
        },
        {
          text: 'Libraries have lots of books.',
          correct: false,
          feedback: 'This is a new, unrelated fact.',
        },
      ],
    },
    practicePromptId: 'g68-break-screens',
    reflection: 'What does your conclusion add that your introduction did not?',
    exitCheck:
      'Cross out "In conclusion" and check that your last sentence looks forward.',
    review: PILOT,
  },
];
