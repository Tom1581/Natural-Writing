import type { DrillSet } from './types';

const PILOT = { status: 'pilot' as const };

export const DRILLS: DrillSet[] = [
  {
    id: 'd35-fix-fragments',
    version: 1,
    band: '3-5',
    skillId: 'sentences.control',
    title: 'Fix fragments and run-ons',
    description:
      'Spot sentences that are missing a part or run on too long, and fix them.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which one is a complete sentence?',
        options: [
          {
            text: 'Because the bell rang.',
            correct: false,
            feedback:
              'This starts with "Because" but never says what happened. It’s a fragment.',
          },
          {
            text: 'We lined up because the bell rang.',
            correct: true,
            feedback:
              'Yes. It has a subject (We), a verb (lined up), and the reason is joined on.',
          },
          {
            text: 'Lining up at the door.',
            correct: false,
            feedback: 'Who is lining up? There’s no subject.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which is the best way to fix this run-on?',
        detail:
          '"I love reading I read every night my favorite books are mysteries."',
        options: [
          {
            text: 'I love reading. I read every night. My favorite books are mysteries.',
            correct: true,
            feedback: 'Yes. Each idea is now its own sentence.',
          },
          {
            text: 'I love reading, I read every night, my favorite books are mysteries.',
            correct: false,
            feedback: 'Commas alone can’t hold complete sentences together.',
          },
          {
            text: 'I love reading I read every night and my favorite books are mysteries.',
            correct: false,
            feedback: 'The first two ideas still run together.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Join the fragment to the sentence it belongs with.',
        original: 'My brother laughed. When the puppy sneezed.',
        samples: [
          'My brother laughed when the puppy sneezed.',
          'When the puppy sneezed, my brother laughed.',
        ],
        checklist: [
          'It is one sentence.',
          'It has a subject and a verb.',
          'If it starts with "When", there is a comma after the first part.',
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Split this run-on into two or three complete sentences.',
        original: 'we went to the pool it was closed we went home',
        samples: [
          'We went to the pool. It was closed, so we went home.',
          'We went to the pool, but it was closed. We went home.',
        ],
        checklist: [
          'Each sentence starts with a capital letter.',
          'Each sentence ends with a period (full stop).',
          'Each sentence makes sense on its own.',
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which word best joins these two sentences? "I wore my coat. It was cold."',
        options: [
          {
            text: 'because',
            correct: true,
            feedback:
              'Yes: "I wore my coat because it was cold." The second part gives the reason.',
          },
          {
            text: 'but',
            correct: false,
            feedback:
              '"But" shows a contrast. Is being cold a contrast to wearing a coat?',
          },
          {
            text: 'or',
            correct: false,
            feedback: '"Or" gives a choice. That doesn’t fit here.',
          },
        ],
      },
    ],
  },
  {
    id: 'd35-linking-words',
    version: 1,
    band: '3-5',
    skillId: 'organization.structure',
    title: 'Linking and time words',
    description:
      'Choose words that connect your ideas: because, also, for example, first, then, finally.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt:
          'Which word fits? "I think we should get a class pet. ____, a pet would teach us to be responsible."',
        options: [
          {
            text: 'For example',
            correct: false,
            feedback:
              '"For example" introduces an example, but this sentence is a reason.',
          },
          {
            text: 'First',
            correct: true,
            feedback: 'Yes. "First" introduces the first reason.',
          },
          {
            text: 'Finally',
            correct: false,
            feedback: '"Finally" is for the last reason, not the first.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which word fits? "Bees make honey. ____, they help flowers grow."',
        options: [
          {
            text: 'Also',
            correct: true,
            feedback: 'Yes. "Also" adds a second fact about bees.',
          },
          {
            text: 'Because',
            correct: false,
            feedback:
              '"Because" gives a reason. Helping flowers isn’t the reason bees make honey.',
          },
          {
            text: 'But',
            correct: false,
            feedback: '"But" shows a contrast. These two facts go together.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Add time words so the order is clear.',
        original:
          'I mixed the flour and eggs. I poured the batter. I baked it.',
        samples: [
          'First, I mixed the flour and eggs. Next, I poured the batter into a pan. Finally, I baked it.',
        ],
        checklist: [
          'A different time word starts each step.',
          'The steps are in order.',
          'There is a comma after each time word.',
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which sentence is the best ending for an opinion piece about longer recess (break time)?',
        options: [
          {
            text: 'That is why a longer recess would help us learn and play better.',
            correct: true,
            feedback: 'Yes. It returns to the opinion and sums up the reasons.',
          },
          {
            text: 'Also, I like lunch.',
            correct: false,
            feedback: 'This adds a new idea instead of ending.',
          },
          {
            text: 'The end.',
            correct: false,
            feedback:
              'This stops the writing, but doesn’t remind the reader of your opinion.',
          },
        ],
      },
    ],
  },
  {
    id: 'd35-exact-words',
    version: 1,
    band: '3-5',
    skillId: 'word_choice.precision',
    title: 'Exact words',
    description:
      'Replace tired words like "good", "nice", "went" and "stuff" with exact ones.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt:
          'Which word is most exact? "The rabbit ____ across the garden."',
        options: [
          {
            text: 'went',
            correct: false,
            feedback: '"Went" doesn’t tell us how it moved.',
          },
          {
            text: 'zigzagged',
            correct: true,
            feedback: 'Yes. We can picture exactly how it moved.',
          },
          {
            text: 'moved',
            correct: false,
            feedback: 'Better than "went", but still general.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Rewrite with exact words instead of "nice" and "stuff".',
        original: 'The beach was nice and we did lots of stuff.',
        samples: [
          'The beach was warm and sandy, and we built a castle and hunted for shells.',
        ],
        checklist: [
          '"Nice" is replaced with a word that describes the beach.',
          '"Stuff" is replaced with real activities.',
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which sentence uses a topic word correctly?',
        options: [
          {
            text: 'An owl is a predator because it hunts mice.',
            correct: true,
            feedback: 'Yes. A predator hunts other animals.',
          },
          {
            text: 'An owl is a predator because it sleeps in the day.',
            correct: false,
            feedback: 'Sleeping in the day doesn’t make an animal a predator.',
          },
          {
            text: 'A predator is a kind of tree.',
            correct: false,
            feedback: 'A predator is an animal that hunts other animals.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Replace "said" with a word that shows how the character spoke.',
        original: '“There’s a spider on your shoulder,” said Mia.',
        samples: [
          '“There’s a spider on your shoulder,” whispered Mia.',
          '“There’s a spider on your shoulder,” giggled Mia.',
        ],
        checklist: [
          'The new word shows a feeling or a way of speaking.',
          'The quotation marks and comma are still in place.',
        ],
      },
    ],
  },
  {
    id: 'd35-punctuation',
    version: 1,
    band: '3-5',
    skillId: 'conventions.mechanics',
    title: 'Capitals, commas and speech marks',
    description:
      'Practice capital letters, commas in lists, apostrophes and punctuating dialogue.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which sentence uses commas in a list correctly?',
        options: [
          {
            text: 'We packed apples, crackers, and water.',
            correct: true,
            feedback:
              'Yes. Commas separate the items. (Some places leave out the last comma before "and"; both are accepted.)',
          },
          {
            text: 'We packed, apples crackers and water.',
            correct: false,
            feedback:
              'The comma is in the wrong place. Put commas between the items.',
          },
          {
            text: 'We packed apples crackers and water.',
            correct: false,
            feedback: 'Without commas, the items run together.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which shows something that belongs to one girl?',
        options: [
          {
            text: 'the girls bike',
            correct: false,
            feedback: 'An apostrophe is needed to show ownership.',
          },
          {
            text: 'the girl’s bike',
            correct: true,
            feedback: 'Yes. ’s shows the bike belongs to one girl.',
          },
          {
            text: 'the girls’ bike',
            correct: false,
            feedback: 's’ shows it belongs to more than one girl.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Add quotation marks (speech marks), a comma and capital letters.',
        original: 'can we go to the library asked sam',
        samples: ['“Can we go to the library?” asked Sam.'],
        checklist: [
          'The spoken words are inside quotation marks.',
          'The question mark is inside the closing mark.',
          '"Can" and "Sam" start with capitals.',
          'The sentence ends with a period (full stop).',
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which word needs a capital letter? "on friday we visited the museum in toronto."',
        options: [
          {
            text: 'friday and toronto (and "on" at the start)',
            correct: true,
            feedback:
              'Yes. Days of the week, place names, and the first word of a sentence take capitals.',
          },
          {
            text: 'museum',
            correct: false,
            feedback: '"Museum" is a common noun here, so no capital.',
          },
          {
            text: 'visited',
            correct: false,
            feedback: 'Verbs only need a capital at the start of a sentence.',
          },
        ],
      },
    ],
  },
  {
    id: 'd68-combine-sentences',
    version: 1,
    band: '6-8',
    skillId: 'sentences.control',
    title: 'Combine sentences to show relationships',
    description:
      'Use subordinating conjunctions and relative clauses to show cause, contrast and time.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt:
          'Which combination shows contrast? "The test was long. Most students finished early."',
        options: [
          {
            text: 'Although the test was long, most students finished early.',
            correct: true,
            feedback:
              'Yes. "Although" signals that the second idea is surprising given the first.',
          },
          {
            text: 'Because the test was long, most students finished early.',
            correct: false,
            feedback:
              '"Because" claims the length caused finishing early, which doesn’t make sense.',
          },
          {
            text: 'The test was long, most students finished early.',
            correct: false,
            feedback:
              'This is a comma splice: two sentences joined only by a comma.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Combine using a relative clause (who, which or that).',
        original:
          'Ms. Patel coaches our team. She played on a national youth team.',
        samples: [
          'Ms. Patel, who played on a national youth team, coaches our team.',
          'Ms. Patel, who coaches our team, played on a national youth team.',
        ],
        checklist: [
          'There is one sentence.',
          '"who" refers to Ms. Patel.',
          'The extra information is set off with commas.',
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which sentence is NOT a comma splice?',
        options: [
          {
            text: 'It started raining, we ran inside.',
            correct: false,
            feedback:
              'Two complete sentences joined only by a comma: a splice.',
          },
          {
            text: 'It started raining, so we ran inside.',
            correct: true,
            feedback: 'Yes. A comma plus "so" correctly joins two sentences.',
          },
          {
            text: 'It started raining, then we ran inside.',
            correct: false,
            feedback:
              '"Then" is an adverb, not a conjunction, so this is still a splice.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Revise this choppy paragraph so the sentences vary in length and structure.',
        original:
          'The museum opened in 1990. It has a dinosaur hall. The hall is popular. Many students visit it.',
        samples: [
          'Since it opened in 1990, the museum’s dinosaur hall has become one of its most popular exhibits, drawing many student visitors.',
        ],
        checklist: [
          'At least one sentence uses a joining word (since, because, which, when).',
          'Sentence lengths vary.',
          'No facts were lost.',
        ],
      },
    ],
  },
  {
    id: 'd68-transitions',
    version: 1,
    band: '6-8',
    skillId: 'organization.structure',
    title: 'Transitions that show relationships',
    description:
      'Choose transitions for addition, contrast, cause and effect, and comparison.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt:
          'Which transition fits? "Walking is free. ____, the bus costs money every day."',
        options: [
          {
            text: 'In contrast',
            correct: true,
            feedback: 'Yes. The second sentence contrasts with the first.',
          },
          {
            text: 'Similarly',
            correct: false,
            feedback:
              '"Similarly" signals a likeness, but these are different.',
          },
          {
            text: 'As a result',
            correct: false,
            feedback: 'Walking being free doesn’t cause the bus to cost money.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which transition fits? "The cafeteria is crowded at lunch. ____, many students cannot find a quiet place to read."',
        options: [
          {
            text: 'However',
            correct: false,
            feedback:
              '"However" signals contrast. The second sentence is a consequence.',
          },
          {
            text: 'As a result',
            correct: true,
            feedback: 'Yes. The crowding causes the problem.',
          },
          {
            text: 'For instance',
            correct: false,
            feedback: 'This introduces an example, not a consequence.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt:
          'Replace each "Also" with a transition that shows the real relationship.',
        original:
          'A field day includes every student. Also, no one has to perform alone. Also, it is the most important reason: it mixes grades.',
        samples: [
          'A field day includes every student. As a result, no one has to perform alone. Even more important, it mixes grades.',
        ],
        checklist: [
          'Each transition shows a relationship (cause, contrast, ranking).',
          'The most important reason is signaled.',
        ],
      },
      {
        kind: 'choice',
        prompt:
          'In an explanation organized by cause and effect, which sentence best starts the effects section?',
        options: [
          {
            text: 'These changes lead to three main effects.',
            correct: true,
            feedback: 'Yes. It signals the shift from causes to effects.',
          },
          {
            text: 'Another thing is effects.',
            correct: false,
            feedback: 'Vague: "thing" doesn’t guide the reader.',
          },
          {
            text: 'In conclusion, effects.',
            correct: false,
            feedback: '"In conclusion" signals an ending, not a new section.',
          },
        ],
      },
    ],
  },
  {
    id: 'd68-precise-language',
    version: 1,
    band: '6-8',
    skillId: 'word_choice.precision',
    title: 'Precise and formal language',
    description: 'Replace vague, casual and wordy language with precise words.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which is most precise?',
        options: [
          {
            text: 'A lot of students think it’s a good idea.',
            correct: false,
            feedback: '"A lot" and "good idea" are vague.',
          },
          {
            text: '18 of the 25 students surveyed supported the change.',
            correct: true,
            feedback: 'Yes. Exact numbers and a precise verb.',
          },
          {
            text: 'Pretty much everyone likes it.',
            correct: false,
            feedback: 'Casual and overstated.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Rewrite in a formal style.',
        original:
          'Honestly, phones in class are super distracting and kinda ruin everything.',
        samples: [
          'Phones in class distract students and make it harder to concentrate on lessons.',
        ],
        checklist: [
          'No slang ("super", "kinda").',
          'The claim is specific (what exactly is harmed?).',
          'No exaggeration ("ruin everything").',
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Cut the wordiness without losing meaning.',
        original:
          'In my personal opinion, I think that the reason why we should recycle is because of the fact that it reduces waste.',
        samples: ['We should recycle because it reduces waste.'],
        checklist: [
          '"In my personal opinion, I think" is gone.',
          '"the reason why… is because of the fact that" is simplified.',
          'The meaning is unchanged.',
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which word best fits a formal explanation? "Plants ____ sunlight into energy."',
        options: [
          {
            text: 'turn',
            correct: false,
            feedback:
              'Understandable, but there is a more precise scientific word.',
          },
          {
            text: 'convert',
            correct: true,
            feedback: 'Yes. "Convert" is the precise term.',
          },
          {
            text: 'do stuff with',
            correct: false,
            feedback: 'Too vague and casual.',
          },
        ],
      },
    ],
  },
  {
    id: 'd68-commas',
    version: 1,
    band: '6-8',
    skillId: 'conventions.mechanics',
    title: 'Commas, clauses and dialogue',
    description:
      'Commas after introductions, before conjunctions joining sentences, around extra information, and in dialogue.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which sentence is punctuated correctly?',
        options: [
          {
            text: 'If you finish early you may read quietly.',
            correct: false,
            feedback: 'An introductory "If…" clause needs a comma after it.',
          },
          {
            text: 'If you finish early, you may read quietly.',
            correct: true,
            feedback: 'Yes. Comma after the introductory clause.',
          },
          {
            text: 'If, you finish early you may read quietly.',
            correct: false,
            feedback: 'The comma goes after the whole introductory clause.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which correctly sets off extra (nonessential) information?',
        options: [
          {
            text: 'My bike which is blue has a flat tire.',
            correct: false,
            feedback: 'Extra information needs commas around it.',
          },
          {
            text: 'My bike, which is blue, has a flat tire.',
            correct: true,
            feedback:
              'Yes. The commas show "which is blue" is extra information.',
          },
          {
            text: 'My bike, which is blue has a flat tire.',
            correct: false,
            feedback:
              'You need a comma on both sides of the extra information.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Punctuate the dialogue correctly.',
        original:
          'I think the power is back said Lucas but the lights are still flickering',
        samples: [
          '“I think the power is back,” said Lucas, “but the lights are still flickering.”',
        ],
        checklist: [
          'Both spoken parts are inside quotation marks.',
          'A comma comes before each closing mark that leads to the speaker tag.',
          '"but" stays lowercase because the sentence continues.',
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Fix the comma splice two different ways.',
        original: 'The storm was loud, nobody could sleep.',
        samples: [
          'The storm was loud, so nobody could sleep.',
          'The storm was loud; nobody could sleep.',
          'Because the storm was loud, nobody could sleep.',
        ],
        checklist: [
          'The two complete ideas are joined correctly (conjunction, semicolon, or subordinate clause), or split into two sentences.',
        ],
      },
    ],
  },
];
