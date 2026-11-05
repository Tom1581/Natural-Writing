import type { DrillSet } from './types';

const PILOT = { status: 'pilot' as const };

/** Additional practice sets for the K–2 and grades 9–12 bands. */
export const MORE_DRILLS: DrillSet[] = [
  {
    id: 'dk2-first-next-last',
    version: 1,
    band: 'K-2',
    skillId: 'organization.structure',
    title: 'First, next, last',
    description: 'Put steps and story events in order with order words.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'What happens first when you plant a seed?',
        options: [
          {
            text: 'A flower opens.',
            correct: false,
            feedback: 'That happens last.',
          },
          {
            text: 'You put the seed in the dirt.',
            correct: true,
            feedback: 'Yes! Planting comes first.',
          },
          {
            text: 'A sprout pokes out.',
            correct: false,
            feedback: 'That happens next.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which word tells the reader it is the end?',
        options: [
          {
            text: 'First',
            correct: false,
            feedback: '"First" is for the beginning.',
          },
          {
            text: 'Next',
            correct: false,
            feedback: '"Next" is for the middle.',
          },
          {
            text: 'Last',
            correct: true,
            feedback: 'Yes! "Last" tells the reader it is the end.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which one is in the right order?',
        options: [
          {
            text: 'First I brushed my teeth. Next I put toothpaste on my brush. Last I rinsed.',
            correct: false,
            feedback: 'The toothpaste goes on before you brush.',
          },
          {
            text: 'First I put toothpaste on my brush. Next I brushed my teeth. Last I rinsed.',
            correct: true,
            feedback: 'Yes! Each step is in the right place.',
          },
          {
            text: 'Last I rinsed. First I brushed. Next I put on toothpaste.',
            correct: false,
            feedback: 'These steps are mixed up.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which word fits? "We built a tall tower. ___ it fell down!"',
        options: [
          {
            text: 'Then',
            correct: true,
            feedback: 'Yes! "Then" shows what happened after.',
          },
          {
            text: 'First',
            correct: false,
            feedback: 'The tower was already built, so this is not first.',
          },
          {
            text: 'Because',
            correct: false,
            feedback: '"Because" tells why, not when.',
          },
        ],
      },
    ],
  },
  {
    id: 'd910-formal-tone',
    version: 1,
    band: '9-10',
    skillId: 'word_choice.precision',
    title: 'Formal, objective tone',
    description:
      'Revise casual or loaded language so an argument sounds fair and credible.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which sentence has a formal, objective tone?',
        options: [
          {
            text: 'Honestly, the parking situation is a total disaster and everyone knows it.',
            correct: false,
            feedback:
              '"Honestly", "total disaster" and "everyone knows" are casual and exaggerated.',
          },
          {
            text: 'Thirty-one of forty-two shop owners report that customers complain about parking.',
            correct: true,
            feedback:
              'Yes. It states the evidence precisely and lets it speak.',
          },
          {
            text: 'Parking is super bad on Saturdays, like really bad.',
            correct: false,
            feedback:
              '"Super" and "like really" are spoken, informal language.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which word choice is fairest to the other side?',
        detail:
          '"The parent ___ that esports would take money from other teams."',
        options: [
          {
            text: 'whines',
            correct: false,
            feedback: '"Whines" mocks the writer and weakens your credibility.',
          },
          {
            text: 'argues',
            correct: true,
            feedback: 'Yes. "Argues" reports the view neutrally.',
          },
          {
            text: 'falsely claims',
            correct: false,
            feedback:
              'Judging the view in the reporting verb is not objective; show why it is wrong instead.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which revision removes the second person ("you") appropriately for a formal letter?',
        detail:
          'Original: "If you think about it, you can see the plaza would help."',
        options: [
          {
            text: 'If you really think about it, the plaza would help.',
            correct: false,
            feedback: 'Still informal, and "really" adds nothing.',
          },
          {
            text: 'The evidence suggests that the plaza would help.',
            correct: true,
            feedback: 'Yes. It is formal and points to evidence.',
          },
          {
            text: 'Obviously the plaza would help.',
            correct: false,
            feedback: '"Obviously" asserts instead of showing.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Rewrite this sentence in a formal, objective tone.',
        original:
          'The people against AI art are just scared of new stuff and need to get over it.',
        samples: [
          'Critics of AI-generated art worry that it rewards prompts rather than practiced skill, a concern that a process statement could address.',
          'Some judges oppose AI-generated entries because they cannot see how much of the work reflects the entrant’s own decisions.',
        ],
        checklist: [
          'I described the other side’s view fairly, without insults.',
          'I removed casual words such as "just", "stuff" and "get over it".',
          'I named what the concern actually is.',
        ],
      },
    ],
  },
  {
    id: 'd1112-synthesis-sentences',
    version: 1,
    band: '11-12',
    skillId: 'development.evidence',
    title: 'Synthesis sentences',
    description:
      'Put two sources in conversation instead of summarizing them one at a time.',
    review: PILOT,
    items: [
      {
        kind: 'choice',
        prompt: 'Which sentence synthesizes the two sources?',
        detail:
          'Source A: the council projects 30% more student riders. Source B: two routes are already full at 7:45 a.m.',
        options: [
          {
            text: 'Source A says ridership will rise. Source B says buses are full.',
            correct: false,
            feedback: 'This summarizes each source separately.',
          },
          {
            text: 'Read together, the sources suggest demand is real but can be absorbed only on routes with spare capacity.',
            correct: true,
            feedback: 'Yes. It draws a conclusion neither source states alone.',
          },
          {
            text: 'Both sources talk about buses.',
            correct: false,
            feedback: 'True, but it says nothing about how they relate.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt: 'Which verb best shows how Source B relates to Source A?',
        detail:
          'Source A: a stadium will add $60 million in spending. Source B: most stadium spending is shifted from other local businesses.',
        options: [
          {
            text: 'confirms',
            correct: false,
            feedback: 'Source B challenges A rather than supporting it.',
          },
          {
            text: 'complicates',
            correct: true,
            feedback:
              'Yes. B does not deny the spending; it questions whether it is new.',
          },
          {
            text: 'repeats',
            correct: false,
            feedback: 'B adds a different point.',
          },
        ],
      },
      {
        kind: 'choice',
        prompt:
          'Which sentence judges which source is more persuasive, and says why?',
        options: [
          {
            text: 'The conservation report is better.',
            correct: false,
            feedback: 'Better how? Give the reason.',
          },
          {
            text: 'The conservation report is more persuasive on fish recovery because it draws on dams that were actually removed, not on predictions.',
            correct: true,
            feedback:
              'Yes. It names the point and the reason for the judgment.',
          },
          {
            text: 'Both sources have good points and bad points.',
            correct: false,
            feedback: 'This avoids making a judgment.',
          },
        ],
      },
      {
        kind: 'rewrite',
        prompt: 'Combine these two summaries into one synthesis sentence.',
        original:
          'The research summary says homework helps up to about 90 minutes to two hours a night. The teachers say advanced courses need more homework than a 90-minute limit allows.',
        samples: [
          'The research supports a limit near 90 minutes for most students, but the teachers’ letter suggests that a single district-wide cap would fall hardest on advanced courses, so any limit may need exceptions.',
          'Although the research finds little benefit beyond about two hours, the teachers point out that advanced courses rely on homework time, which suggests coordinating due dates may work better than a strict cap.',
        ],
        checklist: [
          'Both sources appear in one sentence.',
          'I used a word that shows how they relate (but, although, so, which suggests).',
          'My sentence draws a conclusion that neither source states alone.',
        ],
      },
    ],
  },
];
