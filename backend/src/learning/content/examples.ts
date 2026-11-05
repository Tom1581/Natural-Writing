import type { GradeBand, Genre, ReviewInfo } from './types';

/**
 * Annotated model pieces: one for every rubric, written for this site in the voice of a
 * strong student at that age (not real student work). Each note quotes the exact words it
 * refers to; validateCatalog() checks every quote and rating.
 */
export interface WritingExample {
  id: string;
  rubricId: string;
  band: GradeBand;
  genre: Genre;
  /** The library prompt the piece answers (never a check-in or checkpoint). */
  promptId: string;
  title: string;
  /** Who it is written as, e.g. "a grade 4 student". */
  writer: string;
  text: string;
  ratings: Record<string, 1 | 2 | 3 | 4>;
  /** Typed by an adult from the child's words: conventions are not rated. */
  scribed?: boolean;
  notes: { quote: string; skillId: string; comment: string }[];
  /** Why this piece meets the goal. */
  whyItWorks: string;
  /** One change that would take it further. */
  nextStep: string;
  review: ReviewInfo;
}

const PILOT = { status: 'pilot' as const };

export const EXAMPLES: WritingExample[] = [
  // ─── Kindergarten–Grade 2 ───────────────────────────────────────────────
  {
    id: 'ex-k2-opinion-season',
    rubricId: 'gk-2-opinion',
    band: 'K-2',
    genre: 'opinion',
    promptId: 'k2-best-season',
    title: 'Winter is the best',
    writer: 'a grade 1 student, written by the child',
    text: 'Winter is my favrit season. I like it becuz I can bild a snowman with my dad. We give him a carrot nose. I also like hot coco. Winter is the best!',
    ratings: {
      'purpose.claim': 4,
      'development.evidence': 4,
      'organization.structure': 4,
      'sentences.control': 3,
      'conventions.mechanics': 3,
    },
    notes: [
      {
        quote: 'Winter is my favrit season.',
        skillId: 'purpose.claim',
        comment: 'The opinion comes first and is easy to find.',
      },
      {
        quote: 'becuz I can bild a snowman with my dad',
        skillId: 'development.evidence',
        comment:
          'A real reason, not "because I like it". The reader can picture it.',
      },
      {
        quote: 'I also like hot coco.',
        skillId: 'organization.structure',
        comment: '"Also" adds a second reason.',
      },
      {
        quote: 'Winter is the best!',
        skillId: 'organization.structure',
        comment: 'The ending goes back to the opinion.',
      },
      {
        quote: 'favrit',
        skillId: 'conventions.mechanics',
        comment:
          'Sound spelling: a reader can sound it out. That is just right for this age.',
      },
    ],
    whyItWorks:
      'It tells what the writer thinks, gives two real reasons with a detail, and ends by saying the opinion again.',
    nextStep:
      'Tell one more thing about the snowman, like how big it was or what you named it.',
    review: PILOT,
  },
  {
    id: 'ex-k2-informative-seed',
    rubricId: 'gk-2-informative',
    band: 'K-2',
    genre: 'informative',
    promptId: 'k2-seed-how',
    title: 'How a seed grows',
    writer: 'a kindergarten student, typed by an adult from the child’s words',
    scribed: true,
    text: 'I am going to tell you how a seed grows. First you put the seed in the dirt and you give it water. Next a little green sprout pokes out. Then it gets taller and it grows leaves. Last a yellow flower opens up. Seeds need water and sun to grow.',
    ratings: {
      'purpose.topic': 4,
      'development.information': 4,
      'organization.structure': 4,
      'sentences.control': 4,
    },
    notes: [
      {
        quote: 'I am going to tell you how a seed grows.',
        skillId: 'purpose.topic',
        comment: 'The first sentence tells the reader what they will learn.',
      },
      {
        quote: 'First you put the seed in the dirt',
        skillId: 'organization.structure',
        comment: '"First", "Next", "Then" and "Last" put the steps in order.',
      },
      {
        quote: 'a little green sprout pokes out',
        skillId: 'development.information',
        comment: 'A detail that matches the second picture.',
      },
      {
        quote: 'Seeds need water and sun to grow.',
        skillId: 'development.information',
        comment: 'An extra fact that sums up what a seed needs.',
      },
    ],
    whyItWorks:
      'The topic comes first, the steps follow the pictures in order with order words, and it ends with a fact that sums up.',
    nextStep: 'Add how long it takes, or what the roots do under the dirt.',
    review: PILOT,
  },
  {
    id: 'ex-k2-narrative-puppy',
    rubricId: 'gk-2-narrative',
    band: 'K-2',
    genre: 'narrative',
    promptId: 'k2-puppy-bath',
    title: 'Max and the mud',
    writer: 'a grade 2 student, written by the child',
    text: 'Max the puppy saw a big mud puddle. He jumped in with a SPLASH! Now Max was brown all over. Mom put him in the tub with lots of bubbles. Max did not like it. Then he shook and shook and water went everywhere. Lily laughed so hard she fell down.',
    ratings: {
      'purpose.story': 4,
      'development.detail': 4,
      'organization.structure': 3,
      'sentences.control': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote: 'Max the puppy saw a big mud puddle.',
        skillId: 'purpose.story',
        comment: 'Who (Max) and the problem (the mud) right at the start.',
      },
      {
        quote: 'He jumped in with a SPLASH!',
        skillId: 'development.detail',
        comment: 'A sound word makes the reader hear it.',
      },
      {
        quote: 'Max did not like it.',
        skillId: 'development.detail',
        comment: 'Tells how a character feels.',
      },
      {
        quote: 'Then he shook and shook',
        skillId: 'organization.structure',
        comment: '"Then" moves the story forward in time.',
      },
      {
        quote: 'Lily laughed so hard she fell down.',
        skillId: 'development.detail',
        comment: 'A funny ending that shows how Lily feels.',
      },
    ],
    whyItWorks:
      'It tells who and what happened, in order, with sounds, feelings and a funny ending.',
    nextStep:
      'Use one more time word, like "After that", to make the order even clearer.',
    review: PILOT,
  },

  // ─── Grades 3–5 ─────────────────────────────────────────────────────────
  {
    id: 'ex-35-opinion-garden',
    rubricId: 'g3-5-opinion',
    band: '3-5',
    genre: 'opinion',
    promptId: 'g35-school-garden',
    title: 'Every school needs a garden',
    writer: 'a grade 4 student',
    text: 'I think every school should have a garden that students help to look after. First, a garden would help us learn science outside the classroom. For example, we could measure how fast bean plants grow and record it in a chart every Friday. Second, a garden teaches responsibility. If nobody waters the tomatoes, they wilt, so students would have to make a watering schedule and stick to it. Some people might say a garden is too much work in summer, but families could sign up to water it for one week each. A garden would make school more interesting and help everyone learn. That is why every school should have one.',
    ratings: {
      'purpose.claim': 3,
      'organization.structure': 4,
      'development.evidence': 4,
      'sentences.control': 4,
      'word_choice.precision': 3,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'I think every school should have a garden that students help to look after.',
        skillId: 'purpose.claim',
        comment: 'A clear opinion that answers the question.',
      },
      {
        quote: 'For example, we could measure how fast bean plants grow',
        skillId: 'development.evidence',
        comment: 'The reason has a specific example the reader can picture.',
      },
      {
        quote: 'If nobody waters the tomatoes, they wilt',
        skillId: 'development.evidence',
        comment: 'Explains how the reason works, not just what it is.',
      },
      {
        quote: 'Some people might say a garden is too much work in summer',
        skillId: 'development.evidence',
        comment:
          'Answers a worry someone might have. That goes beyond the grade 4 goal.',
      },
      {
        quote: 'That is why every school should have one.',
        skillId: 'organization.structure',
        comment: 'The ending ties back to the opinion.',
      },
    ],
    whyItWorks:
      'Two reasons, each with a specific example, linked with "First", "Second" and "For example", and an ending that returns to the opinion.',
    nextStep:
      'Make the opening grab the reader, for example with a picture of the garden in spring, before stating the opinion.',
    review: PILOT,
  },
  {
    id: 'ex-35-informative-game',
    rubricId: 'g3-5-informative',
    band: '3-5',
    genre: 'informative',
    promptId: 'g35-how-to-game',
    title: 'How to play Four Square',
    writer: 'a grade 5 student',
    text: 'Four Square is a ball game for four players that you can learn in five minutes. You need a bouncy ball and a big square drawn on the ground, split into four smaller squares. Each player stands in one square. The best square is called the King square, and the player there serves first. To serve, the King bounces the ball once in their own square and hits it into someone else’s square. When the ball lands in your square, you must let it bounce once and then hit it into another square. If you let it bounce twice, hit it out of the court, or catch it, you are out. The player who is out goes to the lowest square, which means everyone else moves up one square. The goal is to reach the King square and stay there as long as you can.',
    ratings: {
      'purpose.topic': 4,
      'organization.structure': 3,
      'development.information': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'Four Square is a ball game for four players that you can learn in five minutes.',
        skillId: 'purpose.topic',
        comment: 'Names the topic and promises the reader something.',
      },
      {
        quote: 'The best square is called the King square',
        skillId: 'word_choice.precision',
        comment: 'Explains a word a new player wouldn’t know.',
      },
      {
        quote:
          'If you let it bounce twice, hit it out of the court, or catch it, you are out.',
        skillId: 'development.information',
        comment:
          'A clear rule with every way to get out, in a list with commas.',
      },
      {
        quote: 'which means everyone else moves up one square',
        skillId: 'development.information',
        comment: 'Explains what the rule means, not just the rule.',
      },
      {
        quote: 'The goal is to reach the King square',
        skillId: 'organization.structure',
        comment: 'A concluding sentence that sums up the point of the game.',
      },
    ],
    whyItWorks:
      'It follows the order a new player needs (equipment, setup, serving, playing, getting out) and explains every special word.',
    nextStep:
      'Split it into short paragraphs (setup, how to play, getting out) so a reader can find each part quickly.',
    review: PILOT,
  },
  {
    id: 'ex-35-narrative-door',
    rubricId: 'g3-5-narrative',
    band: '3-5',
    genre: 'narrative',
    promptId: 'g35-secret-door',
    title: 'The door behind the atlases',
    writer: 'a grade 4 student',
    text: 'Ava was putting the giant atlases back on the bottom shelf when she noticed a tiny wooden door behind them. It was no bigger than a lunchbox, and it had a brass handle shaped like a key. "Mr. Lee?" she whispered, but the librarian was busy at the desk. Ava pulled the handle. The door creaked open, and a cold breeze that smelled like the ocean blew her hair back. Inside was a staircase going down, down, down. Ava’s heart thumped. She took one step, then stopped and grabbed her flashlight from her backpack. After that, she counted every stair out loud. At the bottom she found a tiny library, with shelves full of books the size of stamps. On the smallest desk sat a note: "Thank you for finding us. Please keep our secret." Ava smiled, closed the door, and slid the atlases back in place.',
    ratings: {
      'purpose.story': 4,
      'organization.structure': 4,
      'development.detail': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote: 'she noticed a tiny wooden door behind them',
        skillId: 'purpose.story',
        comment:
          'The character, the setting and the surprise arrive in the first sentence.',
      },
      {
        quote: 'a cold breeze that smelled like the ocean blew her hair back',
        skillId: 'word_choice.precision',
        comment:
          'A sensory detail (touch and smell) that makes the scene feel real.',
      },
      {
        quote: 'Ava’s heart thumped.',
        skillId: 'development.detail',
        comment:
          'Shows she is nervous without saying "nervous". A short sentence speeds up the moment.',
      },
      {
        quote: 'After that, she counted every stair out loud.',
        skillId: 'organization.structure',
        comment:
          'A time word, and an action that shows she is brave but careful.',
      },
      {
        quote:
          'Ava smiled, closed the door, and slid the atlases back in place.',
        skillId: 'organization.structure',
        comment: 'The ending shows her choice: she keeps the secret.',
      },
    ],
    whyItWorks:
      'A surprising problem in the first line, events in order with time words, details that show feelings, and an ending that shows a decision.',
    nextStep:
      'Add one line of dialogue at the bottom of the stairs, so the reader hears how Ava reacts to the tiny library.',
    review: PILOT,
  },

  // ─── Grades 6–8 ─────────────────────────────────────────────────────────
  {
    id: 'ex-68-argument-zoos',
    rubricId: 'g6-8-argument',
    band: '6-8',
    genre: 'opinion',
    promptId: 'g68-zoos',
    title: 'Zoos: worth it, with limits',
    writer: 'a grade 7 student',
    text: 'Modern zoos do more good than harm, but only when they focus on the animals that benefit from being there. The strongest reason is conservation. According to the fact sheet, many zoos run breeding programs for endangered species, and some animals have been returned to the wild. Without those programs, a species with only a few hundred animals left could disappear completely, so a zoo can be the difference between extinction and survival. Zoos also teach visitors about wildlife, and a child who watches a red panda up close is more likely to care about protecting its forest. Critics point out that even large enclosures are far smaller than wild habitats, and that animals that roam long distances show signs of stress. This is a fair concern, and it is the reason zoos should stop keeping animals that cannot live well in captivity. A zoo that breeds endangered frogs does more good than one that keeps an elephant in a small yard. If zoos choose their animals carefully, they can protect species without causing unnecessary harm.',
    ratings: {
      'purpose.claim': 4,
      'organization.structure': 3,
      'development.evidence': 4,
      'sentences.control': 4,
      'word_choice.precision': 3,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'Modern zoos do more good than harm, but only when they focus on the animals that benefit from being there.',
        skillId: 'purpose.claim',
        comment:
          'An arguable claim with a limit built in, which shows the writer has thought about the other side.',
      },
      {
        quote: 'According to the fact sheet, many zoos run breeding programs',
        skillId: 'development.evidence',
        comment: 'Evidence is introduced with its source.',
      },
      {
        quote: 'so a zoo can be the difference between extinction and survival',
        skillId: 'development.evidence',
        comment: 'Explains why the evidence matters, not just what it says.',
      },
      {
        quote:
          'This is a fair concern, and it is the reason zoos should stop keeping animals',
        skillId: 'development.evidence',
        comment:
          'Concedes the critics’ point and uses it to sharpen the claim.',
      },
      {
        quote: 'If zoos choose their animals carefully',
        skillId: 'organization.structure',
        comment: 'The conclusion follows from the whole argument.',
      },
    ],
    whyItWorks:
      'A precise claim, evidence that is cited and explained, and a fair response to the opposing view that refines the claim.',
    nextStep:
      'Break it into paragraphs (claim, conservation, education, the concern, conclusion) and use a transition that shows contrast before the critics’ point.',
    review: PILOT,
  },
  {
    id: 'ex-68-informative-volcanoes',
    rubricId: 'g6-8-informative',
    band: '6-8',
    genre: 'informative',
    promptId: 'g68-volcanoes',
    title: 'Why some volcanoes explode',
    writer: 'a grade 6 student',
    text: 'Whether a volcano oozes or explodes depends mostly on one thing: how runny its magma is. Magma is melted rock beneath Earth’s surface, and it contains dissolved gases, much like the bubbles in a bottle of soda. When magma is runny, those gases can escape easily as it rises. As a result, lava flows out steadily, as it does at many Hawaiian volcanoes, where people can sometimes watch rivers of lava from a safe distance. Thick, sticky magma behaves very differently. Because it traps the gas, pressure builds inside the volcano, just as it builds in a shaken soda bottle with the cap on. Eventually the pressure is released all at once in an explosive eruption that can throw ash high into the air. In short, runny magma lets gas out gently, while sticky magma holds it in until it bursts.',
    ratings: {
      'purpose.topic': 4,
      'organization.structure': 4,
      'development.information': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'Whether a volcano oozes or explodes depends mostly on one thing: how runny its magma is.',
        skillId: 'purpose.topic',
        comment: 'The controlling idea previews the whole explanation.',
      },
      {
        quote: 'much like the bubbles in a bottle of soda',
        skillId: 'word_choice.precision',
        comment:
          'An analogy makes a hard idea (dissolved gas) easy to picture.',
      },
      {
        quote: 'As a result, lava flows out steadily',
        skillId: 'organization.structure',
        comment: 'A cause-and-effect transition that shows how ideas connect.',
      },
      {
        quote: 'Thick, sticky magma behaves very differently.',
        skillId: 'organization.structure',
        comment:
          'A short sentence signals the switch to the second case: a comparison structure.',
      },
      {
        quote:
          'In short, runny magma lets gas out gently, while sticky magma holds it in until it bursts.',
        skillId: 'development.information',
        comment: 'The conclusion sums up the comparison in one sentence.',
      },
    ],
    whyItWorks:
      'A clear controlling idea, a compare-and-contrast structure, facts from the source that are explained with an analogy, and a conclusion that pulls it together.',
    nextStep:
      'Define "pressure" for a younger reader, or add what scientists watch for to warn people before an explosive eruption.',
    review: PILOT,
  },
  {
    id: 'ex-68-narrative-trail',
    rubricId: 'g6-8-narrative',
    band: '6-8',
    genre: 'narrative',
    promptId: 'g68-trail',
    title: 'The missing markers',
    writer: 'a grade 8 student',
    text: 'The last orange marker had been nailed to a pine tree twenty minutes ago. Jonah knew because he had checked his watch when he passed it, the way his aunt had taught him. Now there was only fog and the hush of wet needles under his boots. "Okay," he said, and his voice sounded smaller than he expected. He stopped walking. His aunt’s rule came back to him: when you are lost, stay put, then think. He pulled out the paper map, already soft at the folds, and found the creek he could hear somewhere to his left. The trail crossed that creek at a footbridge. If he followed the sound downhill, he would find the bridge, and the bridge would put him back on the trail. He walked slowly, counting steps, until the gray shape of the railing rose out of the fog. On the far post, faded but there, was an orange marker. Jonah rested his hand on it for a long moment before he crossed.',
    ratings: {
      'purpose.story': 4,
      'organization.structure': 4,
      'development.detail': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'The last orange marker had been nailed to a pine tree twenty minutes ago.',
        skillId: 'purpose.story',
        comment:
          'The conflict arrives in the first sentence, without saying "I was lost".',
      },
      {
        quote: 'his voice sounded smaller than he expected',
        skillId: 'development.detail',
        comment: 'A telling detail that reveals fear indirectly.',
      },
      {
        quote: 'when you are lost, stay put, then think',
        skillId: 'development.detail',
        comment:
          'Brings in the aunt’s advice to show how Jonah solves the problem.',
      },
      {
        quote: 'He stopped walking.',
        skillId: 'sentences.control',
        comment: 'A short sentence slows the pace at the turning point.',
      },
      {
        quote:
          'Jonah rested his hand on it for a long moment before he crossed.',
        skillId: 'organization.structure',
        comment: 'The ending reflects on what happened without explaining it.',
      },
    ],
    whyItWorks:
      'Tension from the first line, pacing that slows at the key moment, details that reveal character, and an ending that shows relief through action.',
    nextStep:
      'Plant the aunt earlier (one line about a past hike) so her rule feels even more earned when it returns.',
    review: PILOT,
  },

  // ─── Grades 9–10 ────────────────────────────────────────────────────────
  {
    id: 'ex-910-argument-plaza',
    rubricId: 'g9-10-argument',
    band: '9-10',
    genre: 'opinion',
    promptId: 'g910-plaza-design',
    title: 'A plaza, but parking first',
    writer: 'a grade 10 student',
    text: 'Dear members of the Bell Harbor Town Council,\n\nThe council should turn the main-street parking lot into a public plaza, but only after it opens replacement parking within a five-minute walk. Building in that order would bring new visitors to Main Street without driving away the customers it already has.\n\nThe planning study offers the clearest evidence that a plaza can help local shops. In two of the three towns it examined, foot traffic on the main street rose by 15 to 25 percent within two years, and cafés added outdoor seating. More people walking past a shop window means more chances to sell, which is exactly what Main Street needs.\n\nThe business association’s survey, however, shows why the plaza cannot simply replace the lot. Thirty-one of forty-two owners say customers already complain about parking, and owners estimate that about 40 percent of weekend customers drive in from nearby towns. Those shoppers will not come if they cannot park. The study’s third town proves the point: when the nearest parking was a twelve-minute walk away, two shops closed.\n\nSome owners will argue that any change to the lot is too risky. Their concern is reasonable, since their businesses depend on drivers. Yet the evidence does not show that plazas fail; it shows that plazas fail when access disappears. Opening parking first removes that risk.\n\nFor these reasons, I urge the council to approve the plaza on the condition that replacement parking opens before construction begins.',
    ratings: {
      'purpose.claim': 4,
      'development.evidence': 4,
      'development.counterclaim': 4,
      'organization.structure': 4,
      'sentences.control': 4,
      'word_choice.precision': 3,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'but only after it opens replacement parking within a five-minute walk',
        skillId: 'purpose.claim',
        comment:
          'The condition makes the claim precise and signals the line of reasoning.',
      },
      {
        quote:
          'In two of the three towns it examined, foot traffic on the main street rose by 15 to 25 percent',
        skillId: 'development.evidence',
        comment: 'Specific, attributed evidence.',
      },
      {
        quote:
          'More people walking past a shop window means more chances to sell',
        skillId: 'development.evidence',
        comment: 'Explains why the number matters for the claim.',
      },
      {
        quote: 'The study’s third town proves the point',
        skillId: 'development.evidence',
        comment:
          'Uses the part of the source that cuts against a simple “build the plaza” view.',
      },
      {
        quote:
          'Their concern is reasonable, since their businesses depend on drivers.',
        skillId: 'development.counterclaim',
        comment: 'Concedes what is true in the opposing view.',
      },
      {
        quote: 'it shows that plazas fail when access disappears',
        skillId: 'development.counterclaim',
        comment: 'Responds with reasoning drawn from the evidence.',
      },
      {
        quote: 'however',
        skillId: 'organization.structure',
        comment: 'Transitions mark the turn from support to complication.',
      },
    ],
    whyItWorks:
      'A qualified claim, evidence from both sources that is explained, a fair counterclaim with a reasoned response, and paragraphs that each do one job.',
    nextStep:
      'Replace "proves" with a more exact verb such as "illustrates": one town is an example, not proof.',
    review: PILOT,
  },
  {
    id: 'ex-910-informative-bees',
    rubricId: 'g9-10-informative',
    band: '9-10',
    genre: 'informative',
    promptId: 'g910-bee-decline',
    title: 'Why honeybee colonies struggle',
    writer: 'a grade 9 student',
    text: 'When a honeybee colony fails, gardeners often look for a single culprit. The sources suggest a different picture: colonies usually struggle because several stresses arrive together, and each one makes the others harder to survive.\n\nThe first stress lives inside the hive. According to the extension office fact sheet, varroa mites feed on honeybees and spread viruses, and a colony with many mites in late summer is less likely to survive the winter. Beekeepers check for this by sampling about 300 bees from a frame, which shows how much of the colony is affected.\n\nThe second stress is outside the hive: food. The gardening magazine explains that large fields planted with one crop produce a burst of flowers for a few weeks and then very little. Bees, however, need pollen and nectar from spring to autumn. A colony that eats well in May may go hungry in August.\n\nThese stresses matter most in combination. A colony already weakened by mites copes poorly with a food shortage, and the fact sheet adds that some pesticides, even at levels that do not kill bees, can affect how well they find their way home. This is why researchers describe colony losses as the result of several stresses acting together.\n\nFor a community garden, the implication is practical: planting a mix of flowers that bloom at different times will not solve every problem, but it removes one stress that gardeners can control.',
    ratings: {
      'purpose.topic': 4,
      'development.information': 4,
      'organization.structure': 4,
      'sentences.control': 4,
      'word_choice.precision': 3,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'colonies usually struggle because several stresses arrive together',
        skillId: 'purpose.topic',
        comment: 'A controlling idea that previews how the parts relate.',
      },
      {
        quote: 'The first stress lives inside the hive.',
        skillId: 'organization.structure',
        comment:
          'Topic sentences signal each section: inside the hive, outside the hive, together.',
      },
      {
        quote: 'which shows how much of the colony is affected',
        skillId: 'development.information',
        comment: 'Explains what a fact means, not just the fact.',
      },
      {
        quote: 'A colony that eats well in May may go hungry in August.',
        skillId: 'development.information',
        comment: 'A concrete example that makes the source’s point vivid.',
      },
      {
        quote: 'These stresses matter most in combination.',
        skillId: 'development.information',
        comment: 'Connects the information across both sources.',
      },
      {
        quote: 'For a community garden, the implication is practical',
        skillId: 'organization.structure',
        comment: 'The conclusion states an implication for this audience.',
      },
    ],
    whyItWorks:
      'A clear controlling idea, sections that build from separate causes to how they interact, and a conclusion that tells the newsletter’s readers what it means for them.',
    nextStep:
      'Explain the word "varroa" or "pesticide" for readers who are new to beekeeping.',
    review: PILOT,
  },
  {
    id: 'ex-910-narrative-team',
    rubricId: 'g9-10-narrative',
    band: '9-10',
    genre: 'narrative',
    promptId: 'g910-new-team',
    title: 'Ninth chair',
    writer: 'a grade 9 student',
    text: 'The orchestra had been rehearsing the spring concert for six weeks when I arrived, and the only empty seat was ninth chair, last in the second violins, beside the radiator that clanked whenever it felt like it.\n\n"You can sit out the hard part," Ms. Okafor said, tapping measures forty through sixty-four. "Nobody expects you to learn it in time."\n\nI nodded, because nodding is what you do on your first day. Then I took the music home and played measures forty through sixty-four until my mom started closing doors.\n\nAt Friday’s rehearsal, the second violins hit measure forty and fell apart. Someone came in early; someone else stopped. Ms. Okafor lowered her baton. "From forty," she said, already sounding tired.\n\nThis time I played. I wasn’t loud, but I was steady, counting every rest under my breath, and one by one the others found the beat beside me. When we reached sixty-four, the radiator clanked, and for once nobody laughed at it.\n\nAfter rehearsal, the girl in eighth chair slid her stand a few inches closer to mine. "You can share my pencil," she said. It was the first thing anyone had offered me all week, and it felt like a seat.',
    ratings: {
      'purpose.story': 4,
      'development.detail': 4,
      'organization.structure': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'the only empty seat was ninth chair, last in the second violins',
        skillId: 'purpose.story',
        comment:
          'Establishes the situation, point of view and tension in one sentence.',
      },
      {
        quote:
          'Then I took the music home and played measures forty through sixty-four until my mom started closing doors.',
        skillId: 'development.detail',
        comment: 'Shows determination through action and a touch of humor.',
      },
      {
        quote: 'Someone came in early; someone else stopped.',
        skillId: 'sentences.control',
        comment: 'Balanced short clauses capture the chaos quickly.',
      },
      {
        quote: 'counting every rest under my breath',
        skillId: 'development.detail',
        comment: 'The key moment is slowed down with a precise detail.',
      },
      {
        quote: 'and it felt like a seat',
        skillId: 'organization.structure',
        comment:
          'The ending reflects on the change: she has earned a real place.',
      },
    ],
    whyItWorks:
      'A clear situation and voice, a turning point the story builds toward, a slowed-down key moment, and an ending whose small detail carries the meaning.',
    nextStep:
      'Bring the radiator back once more at the very end to frame the story.',
    review: PILOT,
  },

  // ─── Grades 11–12 ───────────────────────────────────────────────────────
  {
    id: 'ex-1112-argument-dam',
    rubricId: 'g11-12-argument',
    band: '11-12',
    genre: 'opinion',
    promptId: 'g1112-dam-removal',
    title: 'Removing the Mill Creek dam',
    writer: 'a grade 12 student',
    text: 'The county should remove the Mill Creek dam, provided it commits from the start to restoring public access along the new stream. The two sources agree on the central facts: the dam blocks salmon from forty kilometers of spawning habitat, and the pond behind it is a valued part of local life. They disagree about which of those facts should decide the dam’s future.\n\nOn the ecological question, the conservation report is the more persuasive source. Its claim rests on regional evidence rather than prediction: where similar small dams were removed, fish returned within three to five years. The residents’ proposed alternative, a fish ladder at $1.8 million, would also cost the county money, and neither source shows that a ladder would bring fish back as reliably as removal has elsewhere.\n\nThe residents’ objection is nonetheless serious. Fifty-eight percent of nearby residents oppose removal, and draining the pond would expose mud flats for several years while the land recovers. For families who swim and skate there, the cost is real and immediate, while the benefit to salmon is gradual and less visible.\n\nThat imbalance is why removal should come with a restoration plan rather than stand alone. If the county funds trails, a swimming area downstream and replanting of the exposed banks, it can replace much of what residents would lose while still reopening the river. Repairing the dam, the only other option, would cost $2.5 million with no grant support and leave the habitat closed for another generation.\n\nThe decision is ultimately about time. Keeping the dam protects a present that residents value; removing it, done carefully, protects a future that both sources, in different ways, say is worth having.',
    ratings: {
      'purpose.claim': 4,
      'development.evidence': 4,
      'development.counterclaim': 4,
      'organization.structure': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'provided it commits from the start to restoring public access along the new stream',
        skillId: 'purpose.claim',
        comment:
          'A qualified claim: it states the condition under which removal is justified.',
      },
      {
        quote:
          'They disagree about which of those facts should decide the dam’s future.',
        skillId: 'development.evidence',
        comment:
          'Synthesis: identifies exactly where the sources agree and disagree.',
      },
      {
        quote: 'Its claim rests on regional evidence rather than prediction',
        skillId: 'development.evidence',
        comment: 'Explains why one source is more persuasive.',
      },
      {
        quote: 'The residents’ objection is nonetheless serious.',
        skillId: 'development.counterclaim',
        comment:
          'Takes the strongest objection seriously, with its own evidence.',
      },
      {
        quote:
          'That imbalance is why removal should come with a restoration plan',
        skillId: 'development.counterclaim',
        comment:
          'The counterclaim refines the claim rather than being dismissed.',
      },
      {
        quote: 'The decision is ultimately about time.',
        skillId: 'organization.structure',
        comment:
          'The conclusion extends the reasoning to a larger implication.',
      },
    ],
    whyItWorks:
      'A qualified claim, sources that are synthesized and weighed, a counterclaim that genuinely shapes the recommendation, and a conclusion that reframes the whole decision.',
    nextStep:
      'Compare costs completely: the report says grants cover “much of” the $4 million, so say what the county would still pay, or note that the source does not give that figure.',
    review: PILOT,
  },
  {
    id: 'ex-1112-informative-misinformation',
    rubricId: 'g11-12-informative',
    band: '11-12',
    genre: 'informative',
    promptId: 'g1112-misinformation',
    title: 'Why corrections arrive too late',
    writer: 'a grade 11 student, writing for grade 10 readers',
    text: 'If you have ever seen a shocking post, shared it, and learned the next day that it was false, you have experienced the timing problem at the center of online misinformation. False posts are not just common; they are fast, and the way most feeds work rewards that speed.\n\nStart with how people react. The media-lab study tracked 10,000 posts and found that posts later rated false were shared faster than accurate ones in their first six hours. Emotion helps explain why: posts that provoked surprise or anger were shared about twice as often as neutral posts, whether or not they were true. A false story is often more surprising than the truth, so it gets a head start.\n\nThe platform’s own explanation shows how that head start grows. Its feed ranks posts partly by early engagement, meaning how quickly people like, comment on and share them. A post that is shared quickly is shown to more people, who share it in turn. Surprise drives early sharing, and early sharing earns a wider audience.\n\nCorrections enter this cycle late. Fact-checks are added only after a partner organization reviews a post, which usually takes one to three days, and the study found that most sharing happens in the first day. Labeled posts are shown to fewer people afterwards, but by then the loop has usually run its course.\n\nThe practical lesson is about your own first few minutes. Pausing before you share a surprising post costs you little, and it removes one link from a chain that fact-checkers cannot reach in time.',
    ratings: {
      'purpose.topic': 4,
      'development.information': 4,
      'organization.structure': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote:
          'you have experienced the timing problem at the center of online misinformation',
        skillId: 'purpose.topic',
        comment: 'Frames the topic through the readers’ own experience.',
      },
      {
        quote: 'Emotion helps explain why',
        skillId: 'development.information',
        comment: 'Moves from a finding to the reason behind it.',
      },
      {
        quote:
          'The platform’s own explanation shows how that head start grows.',
        skillId: 'development.information',
        comment:
          'Integrates the second source as the next step in the mechanism.',
      },
      {
        quote:
          'Surprise drives early sharing, and early sharing earns a wider audience.',
        skillId: 'sentences.control',
        comment: 'Parallel structure makes the loop easy to remember.',
      },
      {
        quote: 'Corrections enter this cycle late.',
        skillId: 'organization.structure',
        comment:
          'Each section builds on the one before: reaction, ranking, correction.',
      },
      {
        quote: 'The practical lesson is about your own first few minutes.',
        skillId: 'organization.structure',
        comment: 'The conclusion states the implication for this audience.',
      },
    ],
    whyItWorks:
      'The explanation is organized as a cause-and-effect chain, both sources are woven into each step, and the ending tells younger readers what it means for them.',
    nextStep:
      'Note one limit of the evidence (for example, that the study covered one platform) so readers know how far the findings reach.',
    review: PILOT,
  },
  {
    id: 'ex-1112-narrative-final',
    rubricId: 'g11-12-narrative',
    band: '11-12',
    genre: 'narrative',
    promptId: 'g1112-final-match',
    title: 'Forty seconds',
    writer: 'a grade 12 student',
    text: 'Forty seconds. The gym smelled of floor polish and popcorn, and the scoreboard hummed the way it always did, slightly flat, as if it had never quite learned the note.\n\nMara stood at the line and bounced the ball twice, then once more, because that was the number. In the stands her father was the only one sitting down. He sat the way he sat at the kitchen table on the first of the month, elbows in, hands folded, as if he could hold something together by holding still.\n\nShe had made this shot a thousand times in the driveway, under the light that buzzed and then gave up at ten. She had never made it with a scholarship scout in row three, writing on a clipboard she was trying not to see.\n\nThe referee handed her the ball. Somewhere behind her, someone shouted her name, and then someone else told them to hush.\n\nShe breathed out. Bent her knees. Let it go.\n\nThe ball rolled once around the rim, deciding.\n\nLater she would not remember whether the crowd cheered or groaned. She would remember only that, for the first time all season, her father stood up before he knew.',
    ratings: {
      'purpose.story': 4,
      'development.detail': 4,
      'organization.structure': 4,
      'sentences.control': 4,
      'word_choice.precision': 4,
      'conventions.mechanics': 4,
    },
    notes: [
      {
        quote: 'Forty seconds.',
        skillId: 'purpose.story',
        comment:
          'A fragment as an opening sets the clock and the tension at once.',
      },
      {
        quote: 'as if it had never quite learned the note',
        skillId: 'word_choice.precision',
        comment:
          'An image that sustains a slightly melancholy, observant voice.',
      },
      {
        quote:
          'He sat the way he sat at the kitchen table on the first of the month',
        skillId: 'development.detail',
        comment:
          'Lets the reader infer the family’s money worries without stating them.',
      },
      {
        quote: 'She breathed out. Bent her knees. Let it go.',
        skillId: 'sentences.control',
        comment: 'Deliberate fragments slow time to single actions.',
      },
      {
        quote: 'The ball rolled once around the rim, deciding.',
        skillId: 'organization.structure',
        comment: 'Withholds the result; the story is about something else.',
      },
      {
        quote: 'her father stood up before he knew',
        skillId: 'organization.structure',
        comment:
          'The ending changes how earlier details read: his stillness was fear, and his standing is faith.',
      },
    ],
    whyItWorks:
      'A sustained voice, details that reveal character and stakes indirectly, syntax crafted to slow time, and an ending that withholds the score to deliver the real meaning.',
    nextStep:
      'Cut "writing on a clipboard she was trying not to see" to a shorter image: the scout is already clear, and the paragraph slows slightly there.',
    review: PILOT,
  },
];
