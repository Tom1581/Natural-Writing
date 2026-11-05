/**
 * Guides for parents and teachers. Written for this site; each one links to the lessons,
 * rubrics and grade pages it refers to so readers can act on it.
 */

export interface GuideSection {
  heading: string;
  paragraphs: string[];
  list?: string[];
}

export interface Guide {
  slug: string;
  title: string;
  description: string;
  audience: 'Parents' | 'Teachers' | 'Parents and teachers';
  published: string;
  updated: string;
  intro: string;
  sections: GuideSection[];
  related: { label: string; href: string }[];
}

export const GUIDES: Guide[] = [
  {
    slug: 'help-your-child-with-writing',
    title: 'How to Help Your Child With Writing (Without Writing It for Them)',
    description:
      'Practical ways for parents to support a child’s writing at home: what to ask before, during and after a draft, how to talk about feedback, and what to avoid.',
    audience: 'Parents',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'Most parents want to help with writing homework, and most of us were never taught how. The goal is simple to state and hard to do: your child should leave each session with a better piece of writing that is still entirely theirs. Here is what that looks like in practice.',
    sections: [
      {
        heading: 'Before writing: talk first',
        paragraphs: [
          'Children, and plenty of teenagers, can say far more than they can write. Talking before writing turns a blank page into a list of ideas. Ask open questions and let your child do most of the talking.',
          'For a story, ask who it is about, what they want and what goes wrong. For an opinion or argument, ask what they think and why, and then ask “What would someone who disagrees say?” For an explanation, ask them to teach you the topic as if you knew nothing.',
        ],
        list: [
          '“What is the most important thing you want your reader to know?”',
          '“Can you give me an example of that?”',
          '“What happens first? Then what?”',
          '“Who is going to read this?”',
        ],
      },
      {
        heading: 'During writing: stay out of the pen',
        paragraphs: [
          'Resist the urge to supply sentences. Once an adult’s words are in a draft, the child learns that good writing comes from someone else. If your child is stuck, point back to what they said out loud: “You told me the dog was scared. Where could that go?”',
          'For young children (kindergarten to grade 2), it is fine to type or write exactly what they say. That is called scribing, and it lets you see their ideas before their handwriting and spelling catch up. Write their words, not improved ones.',
        ],
      },
      {
        heading: 'After writing: one strength, one next step',
        paragraphs: [
          'When your child shows you a draft, name one specific thing that works and say why: “This line about the cold door handle made me feel the snow.” Then pick one change that would help most. One clear next step is more useful than a page of corrections.',
          'Leave spelling and punctuation until last, and only if the task is close to finished. A child who revises their ideas has learned more than a child whose spelling was fixed for them.',
        ],
      },
      {
        heading: 'Reading feedback together',
        paragraphs: [
          'Writing Studio feedback quotes your child’s own sentences, rates each skill from 1 to 4 and gives one next step with a hint. Read it together and ask your child to explain the hint in their own words before they revise.',
          'A level 3 means the piece meets the goal for that task. A level 2 is not a failing mark; it means the skill is developing. Levels describe one piece of writing, not your child.',
        ],
      },
      {
        heading: 'What to avoid',
        paragraphs: ['These well-meant habits tend to make writing harder over time:'],
        list: [
          'Rewriting sentences “just to show how”. Show with a different example instead.',
          'Fixing every error in red. Choose one pattern to work on.',
          'Praising length. A short piece that does its job is better than a long one that wanders.',
          'Comparing with siblings or classmates. Compare this draft with your child’s last one.',
        ],
      },
    ],
    related: [
      { label: 'For parents: how Writing Studio works', href: '/learn/for-parents' },
      { label: 'How to read a writing rubric', href: '/learn/guides/how-to-read-a-writing-rubric' },
      { label: 'Writing practice by grade', href: '/learn/grades' },
    ],
  },
  {
    slug: 'how-to-read-a-writing-rubric',
    title: 'How to Read a Writing Rubric (and What “Level 3” Really Means)',
    description:
      'A plain-language guide to four-level writing rubrics: what each level means, why levels are not percentages, and how to use a rubric to plan a revision.',
    audience: 'Parents and teachers',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'A writing rubric is a table that describes what a piece of writing looks like at different levels, skill by skill. Rubrics make expectations visible, so students can aim for something specific instead of guessing what the teacher wants.',
    sections: [
      {
        heading: 'Rows are skills, columns are levels',
        paragraphs: [
          'Each row of a rubric is one skill, such as stating a clear claim, organizing ideas, or using evidence. Each column is a level. Our rubrics use four levels: 1 Getting started, 2 Developing, 3 Meets the goal, and 4 Beyond the goal.',
          'Reading across a row shows how a skill grows. For example, in our grades 9–10 argument rubric, the counterclaims row moves from “no opposing view” at level 1 to “presents the strongest opposing view fairly, concedes what is valid in it, and shows why the claim still holds” at level 4.',
        ],
      },
      {
        heading: 'Level 3 is the target, not a B',
        paragraphs: [
          'Level 3 means the writing meets the goal for that task at that grade. It is the level most well-taught students should reach with practice. Level 4 is reachable, but it describes something extra, such as weighing a source’s limits or a structure built for a specific reader.',
          'Levels are categories, not percentages. A piece rated 3, 3, 2, 4 has not “scored 75 percent”. Averaging levels hides the useful information: which skill to work on next.',
        ],
      },
      {
        heading: 'How a rating is decided',
        paragraphs: [
          'Good rubric use checks the descriptors in order. A rater gives level 3 only when every part of the level 3 description is met, and level 4 only when the writing also does what level 4 adds. If a piece is too short or off topic to judge a skill, the honest answer is “not enough evidence yet”, not a low number.',
          'In Writing Studio, every rating must quote the student’s own words as evidence. If the AI cannot point to a sentence that supports the rating, the feedback is rejected and not shown.',
        ],
      },
      {
        heading: 'Use the rubric to plan a revision',
        paragraphs: ['A rubric is most useful before and during writing, not only after.'],
        list: [
          'Before writing, read the level 3 column aloud and turn each line into a question (“Is my claim arguable?”).',
          'After feedback, find the skill with the lowest level and read the level above it. That gap is your revision goal.',
          'Revise one skill at a time, then check the row again.',
        ],
      },
      {
        heading: 'Rubrics change by grade',
        paragraphs: [
          'The same skill name means different things at different ages. “Reasons and evidence” in kindergarten to grade 2 means giving a reason with “because”; in grades 11–12 it means synthesizing sources that disagree. That is why we publish separate rubrics for each band, matched to the official standards for those grades.',
        ],
      },
    ],
    related: [
      { label: 'All writing rubrics', href: '/learn/rubrics' },
      { label: 'Grades 9–10 argument rubric', href: '/learn/rubrics/g9-10-argument' },
      { label: 'How the feedback works', href: '/learn/how-it-works' },
    ],
  },
  {
    slug: 'opinion-vs-argument-writing',
    title: 'Opinion vs Argument Writing: What Changes From Kindergarten to Grade 12',
    description:
      'How persuasive writing grows across the school years: from “I like… because” in kindergarten to qualified, source-based arguments in grades 11–12, with what to teach at each stage.',
    audience: 'Teachers',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'In the Common Core, students write “opinion pieces” through grade 5 and “arguments” from grade 6. Other curricula use different words (persuasive writing in England and Australia, persuasive texts in Ontario), but the progression is similar. Knowing what changes helps you teach the next step instead of repeating the last one.',
    sections: [
      {
        heading: 'Kindergarten to grade 2: tell what you think and why',
        paragraphs: [
          'Young writers state a preference and give a reason, often with “because”. Many compose by drawing and talking, with an adult writing their words. The key move to teach is the difference between repeating the opinion (“because I like it”) and giving a real reason (“because you can go up high like a bird”).',
        ],
      },
      {
        heading: 'Grades 3–5: reasons with examples',
        paragraphs: [
          'Students now organize several reasons, support each with facts or details, link them with words such as “because”, “also” and “for example”, and end with a conclusion. The common gap is a list of reasons with no examples. Teach students to ask “Can my reader picture this?” after each reason.',
        ],
      },
      {
        heading: 'Grades 6–8: claims and evidence that is explained',
        paragraphs: [
          'The opinion becomes a claim that someone could reasonably dispute, supported by evidence from sources. The new demand is explanation: students must say how a piece of evidence supports the claim, not just include it. Students also begin to acknowledge that other positions exist.',
        ],
      },
      {
        heading: 'Grades 9–10: counterclaims and fair reasoning',
        paragraphs: [
          'Students distinguish their claim from alternative claims, develop counterclaims fairly, and point out the strengths and limitations of both sides. A formal style and objective tone become expected. Teach the three-part counterclaim: state the strongest objection fairly, concede what is true, then respond with reasons or evidence.',
        ],
      },
      {
        heading: 'Grades 11–12: synthesis and qualified claims',
        paragraphs: [
          'Students work with sources that disagree and make knowledgeable, qualified claims: claims that say when, where or for whom they hold. Strong essays let the counterclaim refine the original position, and conclusions explain implications. The move from summary (“Source 1 says… Source 2 says…”) to synthesis (“Both sources agree that…, but they disagree about…”) is the big step.',
        ],
      },
      {
        heading: 'Teaching tips that work across grades',
        paragraphs: [''],
        list: [
          'Use the same success checklist language from year to year, so students see the progression.',
          'Model with a weak and a strong example side by side; ask students what the strong one does.',
          'Rate one skill at a time when giving feedback, so students know exactly what to revise.',
          'Give a fresh prompt to check whether a skill transfers; revising the same essay does not show independence.',
        ],
      },
    ],
    related: [
      { label: 'Lesson: Answer the strongest objection (grades 9–10)', href: '/learn/lessons/g910-counterclaim' },
      { label: 'Lesson: Make sources talk to each other (grades 11–12)', href: '/learn/lessons/g1112-synthesis' },
      { label: 'Lesson: Say why with “because” (K–2)', href: '/learn/lessons/k2-because' },
    ],
  },
  {
    slug: 'teaching-counterclaims',
    title: 'Teaching Counterclaims in High School: A Step-by-Step Approach',
    description:
      'A practical sequence for teaching grades 9–12 students to present opposing views fairly and respond to them, with sentence frames, common mistakes and a quick check.',
    audience: 'Teachers',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'Counterclaims are where many high-school arguments fall apart. Students either skip them, set up a straw man, or concede so much that their own claim disappears. This sequence builds the skill in small steps.',
    sections: [
      {
        heading: 'Step 1: find the strongest objection, not the easiest',
        paragraphs: [
          'Give students two sources that disagree. Ask them to underline the single best point in the source they disagree with. Discuss why it is strong: Does it rest on evidence? Does it affect many people? The strongest objection is the one a thoughtful opponent would raise first.',
        ],
      },
      {
        heading: 'Step 2: state it fairly',
        paragraphs: [
          'Have students write the objection in a way its supporters would accept. A useful test: could the other side read this sentence and say “Yes, that is our view”? Avoid vague openers such as “Some people think”; name who holds the view and why.',
        ],
        list: [
          '“The transportation coordinator warns that…”',
          '“Critics of the plan argue that…, pointing to…”',
          '“The most serious objection is that…”',
        ],
      },
      {
        heading: 'Step 3: concede what is true',
        paragraphs: [
          'A concession shows the writer has thought carefully. It also builds trust with a reader who disagrees. Short concession phrases work well: “This concern is fair”, “Admittedly”, “It is true that”.',
        ],
      },
      {
        heading: 'Step 4: respond with reasoning or evidence',
        paragraphs: [
          'The response must do more than repeat the claim. Students can show the objection is outweighed, that it can be solved, that it rests on weaker evidence, or that it applies only in some cases. In grades 11–12, the best responses often refine the claim itself, for example by adding a condition.',
        ],
        list: ['“However, this overlooks…”', '“Even so, the evidence suggests…”', '“This is why the plan should include…”'],
      },
      {
        heading: 'Common mistakes to watch for',
        paragraphs: [''],
        list: [
          'The straw man: an objection nobody would actually make.',
          'The dismissal: “but that is wrong” with no reason.',
          'The collapse: conceding so much that the original claim is abandoned.',
          'The tacked-on paragraph: a counterclaim that never connects back to the claim.',
        ],
      },
      {
        heading: 'A quick check',
        paragraphs: [
          'Ask students to highlight the sentence where they concede something and the sentence where they respond. If either is missing, they know what to revise. In Writing Studio, the counterclaims row of the grades 9–10 and 11–12 argument rubrics rates exactly this.',
        ],
      },
    ],
    related: [
      { label: 'Grades 9–10 argument rubric', href: '/learn/rubrics/g9-10-argument' },
      { label: 'Lesson: Let the objection sharpen your claim (grades 11–12)', href: '/learn/lessons/g1112-refine-with-counterclaim' },
      { label: 'Practice: Qualify a claim', href: '/learn/practice/d1112-qualify-claims' },
    ],
  },
  {
    slug: 'early-writing-kindergarten-to-grade-2',
    title: 'Early Writing in Kindergarten to Grade 2: Drawing, Telling and Sound Spelling',
    description:
      'What writing looks like for 5- to 8-year-olds, why sound spelling (invented spelling) is a good sign, how scribing helps, and how to give feedback a young child can use.',
    audience: 'Parents and teachers',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'Young children compose long before they can write everything down. A five-year-old can tell a story with a beginning, middle and end while still learning to form letters. Good early writing support keeps those two things apart, so ideas are not held back by handwriting.',
    sections: [
      {
        heading: 'Composition and transcription are different skills',
        paragraphs: [
          'Composition is deciding what to say and in what order. Transcription is getting it onto the page: handwriting, spelling and punctuation. Both matter, but they develop at different speeds. The National Curriculum in England notes that at the beginning of Year 1, not all pupils will have the spelling and handwriting skills to write down everything they can compose out loud.',
          'That is why Common Core kindergarten standards describe composing with “a combination of drawing, dictating, and writing”.',
        ],
      },
      {
        heading: 'Sound spelling is a good sign',
        paragraphs: [
          'When a child writes “becuz” for “because” or “sprowt” for “sprout”, they are using what they know about letters and sounds. That is exactly the skill early spelling instruction builds. Praise the sounds they heard, and teach a few common words (“the”, “was”, “said”) to spell correctly over time.',
          'In Writing Studio’s kindergarten to grade 2 rubric, words a reader can sound out meet the spelling goal. Feedback never calls sound spelling a mistake.',
        ],
      },
      {
        heading: 'Scribing: writing down a child’s words',
        paragraphs: [
          'Scribing means an adult writes or types exactly what the child says. It lets children produce longer, richer pieces and shows them that their spoken words can become writing. Write their words, not improved ones, and read it back so they can hear their story.',
          'When a piece is scribed, its spelling and punctuation belong to the adult, so we do not rate them. Writing Studio has a checkbox for this.',
        ],
      },
      {
        heading: 'Pictures help children plan',
        paragraphs: [
          'A sequence of three pictures gives young writers a structure: first, next, last. Our K–2 prompts each come with a picture set. Talk about each picture first, then let the child tell or write the whole piece.',
        ],
      },
      {
        heading: 'Feedback a young child can use',
        paragraphs: ['Keep it short, specific and spoken:'],
        list: [
          'One thing that works: “You told who was in your story!”',
          'One thing to try: “Can you tell how Sam felt at the end?”',
          'Read the feedback aloud, and let the child make the change themselves.',
        ],
      },
    ],
    related: [
      { label: 'Kindergarten writing practice', href: '/learn/grades/kindergarten' },
      { label: 'K–2 opinion writing rubric', href: '/learn/rubrics/gk-2-opinion' },
      { label: 'Lesson: First, next, last', href: '/learn/lessons/k2-first-next-last' },
    ],
  },
  {
    slug: 'ai-writing-feedback-in-the-classroom',
    title: 'Using AI Writing Feedback in the Classroom: What It Can and Can’t Do',
    description:
      'An honest guide for teachers: where AI feedback on student writing helps, where it goes wrong, and the safeguards that keep the teacher in charge.',
    audience: 'Teachers',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'AI can give every student quick, specific feedback on a draft. It can also be confidently wrong. Used well, it frees teacher time for the conversations that matter; used carelessly, it replaces student thinking. These are the principles we built Writing Studio around.',
    sections: [
      {
        heading: 'What AI feedback is good at',
        paragraphs: [''],
        list: [
          'Speed: feedback in under a minute, while the student still remembers what they meant.',
          'Consistency on clear criteria: checking whether a claim is stated, whether evidence is explained, whether events are in order.',
          'Pointing to evidence: quoting the exact sentence a comment is about.',
          'Patience: the fifth revision gets the same careful reading as the first.',
        ],
      },
      {
        heading: 'Where it goes wrong',
        paragraphs: [
          'Language models can misread unusual but valid choices, be too generous or too harsh on a given day, and invent quotes that are not in the student’s text. They are weaker at judging whether an idea is truly original or whether a student understood a source deeply. They should never decide a grade on their own.',
        ],
      },
      {
        heading: 'Safeguards that matter',
        paragraphs: ['If you use any AI feedback tool, look for these:'],
        list: [
          'Every rating quotes the student’s own words, and the quote is checked against the text.',
          'Feedback gives questions and next steps, never replacement sentences to paste in.',
          'Teachers can see and change every rating, and students see the change.',
          'Results are labeled as practice guidance, not grades or grade-level scores.',
          'Writing that suggests a child may be at risk is flagged for an adult, not commented on.',
        ],
      },
      {
        heading: 'Keeping students independent',
        paragraphs: [
          'The risk with any help, from an AI or an adult, is that the writing stops being the student’s. Keep some pieces fully independent: in Writing Studio, check-ins and checkpoints have no hints, and only independent first drafts count toward showing a skill.',
        ],
      },
      {
        heading: 'How we check our own feedback',
        paragraphs: [
          'We compare the AI’s ratings with ratings from trained humans on held-out essays and publish the agreement. Our current figures come from developer-rated samples, which show consistency but not validity; we are collecting teacher-rated samples next. Kindergarten to grade 2 and grades 9–12 are labeled early access until that work is done.',
        ],
      },
    ],
    related: [
      { label: 'For teachers', href: '/learn/for-teachers' },
      { label: 'How it works', href: '/learn/how-it-works' },
      { label: 'Writing rubrics', href: '/learn/rubrics' },
    ],
  },
  {
    slug: 'school-years-compared',
    title: 'US Grades, Canadian Grades, UK Years and Australian Years Compared',
    description:
      'How school years line up for writing in the United States, Canada (Ontario), England and Australia, from kindergarten and Foundation to grade 12 and Year 13, and why England counts one year ahead.',
    audience: 'Parents and teachers',
    published: '2026-11-04',
    updated: '2026-11-04',
    intro:
      'Families who move, tutors who work across countries, and teachers who borrow resources all run into the same question: which grade is “Year 6”? This guide lines up the four systems Writing Studio supports.',
    sections: [
      {
        heading: 'The short answer',
        paragraphs: [
          'The United States, Canada and Australia number school years the same way from grade or Year 1, and Australia calls the first year of school Foundation. England counts one ahead: Year 1 in England is the year children turn six, the same age group as US kindergarten. So US grade 5 is Year 6 in England, grade 5 in Ontario and Year 5 in Australia.',
        ],
      },
      {
        heading: 'Primary and elementary years',
        paragraphs: [''],
        list: [
          'Ages 5–6: US kindergarten · Ontario kindergarten · England Year 1 · Australia Foundation',
          'Ages 6–7: US grade 1 · Ontario grade 1 · England Year 2 · Australia Year 1',
          'Ages 8–9: US grade 3 · Ontario grade 3 · England Year 4 · Australia Year 3',
          'Ages 10–11: US grade 5 · Ontario grade 5 · England Year 6 (end of key stage 2) · Australia Year 5',
        ],
      },
      {
        heading: 'Secondary and high school',
        paragraphs: [''],
        list: [
          'Ages 11–12: US grade 6 · Ontario grade 6 · England Year 7 (key stage 3) · Australia Year 6',
          'Ages 14–15: US grade 9 · Ontario grade 9 · England Year 10 (key stage 4) · Australia Year 9',
          'Ages 16–17: US grade 11 · Ontario grade 11 · England Year 12 · Australia Year 11',
          'Ages 17–18: US grade 12 · Ontario grade 12 · England Year 13 · Australia Year 12',
        ],
      },
      {
        heading: 'Which writing standards apply',
        paragraphs: [
          'In the US, most states use the Common Core State Standards or standards based on them. Ontario uses its 2023 Language curriculum for grades 1–8, the 2023 English course for grade 9, and the 2007 English curriculum for grades 10–12. England has statutory programmes of study up to key stage 4 (Year 11); Years 12–13 follow exam board specifications instead. Australia uses the Australian Curriculum: English up to Year 10, and senior years are taught through state and territory courses.',
          'Writing Studio maps every rubric skill to these documents and quotes the official wording, so you can check the match for any grade or year.',
        ],
      },
      {
        heading: 'A caution',
        paragraphs: [
          'Start dates and birthday cut-offs differ by state, province and country, so a child may be a year either side of these rows. Use the table as a guide and look at the writing goals for the grades either side if you are unsure.',
        ],
      },
    ],
    related: [
      { label: 'Writing practice by grade', href: '/learn/grades' },
      { label: 'Curriculum alignment', href: '/learn/curriculum' },
      { label: 'England: National Curriculum alignment', href: '/learn/curriculum/uk-eng' },
    ],
  },
  {
    slug: 'narrative-writing-by-grade',
    title: 'Narrative Writing From Kindergarten to Grade 12: What Changes',
    description:
      'How story writing develops across the school years, from telling events in order to controlling pace, voice and meaning, with what to teach next at each stage.',
    audience: 'Parents and teachers',
    published: '2026-11-05',
    updated: '2026-11-05',
    intro:
      'Every curriculum asks students to write stories, from kindergarten retellings to senior-year personal narratives. The genre stays the same; what changes is how much control the writer has over order, detail, pace and meaning. Knowing the next step keeps practice from going in circles.',
    sections: [
      {
        heading: 'Kindergarten to grade 2: who, what happened, in order',
        paragraphs: [
          'Young writers tell one event or a short sequence, usually about themselves or a picture, using words such as “first”, “next” and “then”. The goals are simple and important: say who the story is about, tell what happened in order, and give a feeling or reaction at the end.',
          'The most useful prompt for this age is a question about feelings: “How did Max feel when the water was cold?” It turns a list of events into a story.',
        ],
      },
      {
        heading: 'Grades 3–5: setting, problem and showing',
        paragraphs: [
          'Stories now introduce a character, a setting and a problem, and use dialogue and description to show how characters feel. The classic teaching move is “show, don’t tell”: instead of “she was nervous”, write what she did (“she re-tied her laces for the third time”).',
          'Endings matter more at this stage. A good ending shows how the problem was solved or what the character learned, rather than “and then I woke up”.',
        ],
      },
      {
        heading: 'Grades 6–8: pacing and point of view',
        paragraphs: [
          'Middle-school writers learn to control time: summarize unimportant stretches in a sentence and slow down the key moment over a paragraph. They choose a point of view on purpose and build tension toward a turning point.',
          'A quick exercise: ask students to underline the most important moment in their draft, then count the sentences spent on it. If it is shorter than the walk to school, it needs expanding.',
        ],
      },
      {
        heading: 'Grades 9–12: voice, structure and implied meaning',
        paragraphs: [
          'High-school narratives are judged on craft: a distinct voice, structures such as flashback or withheld information, telling details, and endings that change how earlier moments read. Strong writers trust the reader to infer feelings and themes instead of stating them.',
          'Syntax becomes a tool. A run of short sentences or a deliberate fragment can slow time at a climax, as long as the surrounding sentences are controlled.',
        ],
      },
      {
        heading: 'Feedback that moves stories forward',
        paragraphs: ['Whatever the age, the most useful comments are about one moment, not the whole story:'],
        list: [
          '“Which moment matters most? Slow it down.”',
          '“What does she do here that shows how she feels?”',
          '“What has changed by the end?”',
          '“Read your first sentence: does it start close to the problem?”',
        ],
      },
    ],
    related: [
      { label: 'Model piece: The door behind the atlases (grade 4)', href: '/learn/examples/ex-35-narrative-door' },
      { label: 'Model piece: Ninth chair (grade 9)', href: '/learn/examples/ex-910-narrative-team' },
      { label: 'Lesson: Slow down the moment that matters', href: '/learn/lessons/g910-slow-the-moment' },
    ],
  },
  {
    slug: 'teaching-informative-writing',
    title: 'Teaching Informative Writing: From Listing Facts to Explaining Them',
    description:
      'Why informative essays turn into fact lists, and five moves that teach students to explain: a controlling idea, grouping, “which means”, analogies and a conclusion with a point.',
    audience: 'Teachers',
    published: '2026-11-05',
    updated: '2026-11-05',
    intro:
      'Ask students to write about volcanoes and many will produce a list of true sentences. The facts are fine; what is missing is explanation. Informative writing is not about how much the writer knows, but about how much the reader understands afterwards.',
    sections: [
      {
        heading: 'Start with a controlling idea',
        paragraphs: [
          'A controlling idea is to informative writing what a claim is to argument: one sentence that tells the reader what the explanation will show. “Volcanoes are interesting” is a topic. “Whether a volcano oozes or explodes depends mostly on how runny its magma is” is a controlling idea, and it tells the writer what to include and what to leave out.',
        ],
      },
      {
        heading: 'Group before you write',
        paragraphs: [
          'Have students sort their facts into two or three groups before drafting, and name each group. The names become topic sentences. Common patterns are cause and effect, compare and contrast, steps in a process, and problem and solution.',
        ],
      },
      {
        heading: 'Teach the “which means” sentence',
        paragraphs: [
          'After every fact, the writer asks what it means for the reader, and writes the answer. Sentence starters help younger writers: “This means…”, “This is important because…”, “As a result…”. In our rubrics, this is the difference between level 2 (lists facts) and level 3 (explains them) for facts and explanation.',
        ],
      },
      {
        heading: 'Use comparisons the reader already knows',
        paragraphs: [
          'An analogy can carry a hard idea: dissolved gas in magma behaves like the bubbles in a shaken soda bottle. Teach students to use one analogy where the reader is most likely to get lost, and to say where the comparison stops working.',
        ],
      },
      {
        heading: 'End with a point, not a repeat',
        paragraphs: [
          'A conclusion should sum up the explanation in one sentence and, from about grade 6, say why it matters: an implication, a consequence or what the reader can do with the information. “In conclusion, volcanoes are interesting” tells the reader nothing new.',
        ],
      },
    ],
    related: [
      { label: 'Model piece: Why some volcanoes explode (grade 6)', href: '/learn/examples/ex-68-informative-volcanoes' },
      { label: 'Lesson: From facts to explanation (grades 9–10)', href: '/learn/lessons/g910-explain-significance' },
      { label: 'Grades 6–8 informative rubric', href: '/learn/rubrics/g6-8-informative' },
    ],
  },
  {
    slug: 'writing-with-sources',
    title: 'Writing With Sources: Quoting, Paraphrasing and Avoiding Plagiarism',
    description:
      'A practical guide for grades 6–12: when to quote and when to paraphrase, how to introduce and explain evidence, and simple habits that prevent accidental plagiarism.',
    audience: 'Parents and teachers',
    published: '2026-11-05',
    updated: '2026-11-05',
    intro:
      'From middle school onward, most argument and explanatory writing is source-based. Students are expected to use other people’s words and data honestly and to make them do work in their own reasoning. Both skills can be taught directly.',
    sections: [
      {
        heading: 'Quote or paraphrase?',
        paragraphs: ['A simple rule of thumb:'],
        list: [
          'Quote when the exact words matter: a striking phrase, a definition, or a claim you are about to challenge.',
          'Paraphrase when the idea matters more than the wording, especially numbers and findings.',
          'Summarize when you need the gist of a whole source in one or two sentences.',
        ],
      },
      {
        heading: 'Introduce, give, explain',
        paragraphs: [
          'Evidence needs three moves. Introduce it, so the reader knows where it comes from (“According to the sleep researcher…”). Give it, quoted or paraphrased. Then explain how it supports the point. The explanation is the step most often missing, and it is where the writer’s thinking shows.',
        ],
      },
      {
        heading: 'Paraphrasing honestly',
        paragraphs: [
          'A paraphrase changes both the words and the sentence structure while keeping the meaning, and it still names the source. Swapping a few words for synonyms is not enough. A reliable method: read the passage, look away, write the idea from memory, then check it against the original for accuracy.',
        ],
      },
      {
        heading: 'Habits that prevent plagiarism',
        paragraphs: [''],
        list: [
          'Put quotation marks around copied words in your notes, not only in the essay.',
          'Write the source next to every note.',
          'Keep your own ideas in a different color or column from source notes.',
          'Name sources the same way every time (“the media-lab study”), so readers can follow who said what.',
        ],
      },
      {
        heading: 'Using AI tools responsibly',
        paragraphs: [
          'Schools set their own rules about AI. Whatever the policy, the safest habit is the same as with any source: if wording or ideas came from somewhere else, say so. Writing Studio’s feedback never writes sentences for students to paste, and our high-school tasks come with their sources, so students practice using evidence without outside searching.',
        ],
      },
    ],
    related: [
      { label: 'Practice: Introduce, quote, explain', href: '/learn/practice/d910-integrate-quotes' },
      { label: 'Practice: Synthesis sentences', href: '/learn/practice/d1112-synthesis-sentences' },
      { label: 'Lesson: Make sources talk to each other', href: '/learn/lessons/g1112-synthesis' },
    ],
  },
  {
    slug: 'helping-a-reluctant-writer',
    title: 'Helping a Reluctant Writer: Small Moves That Work',
    description:
      'Practical, low-pressure ways to help a child or teen who avoids writing: shrink the task, talk first, separate ideas from spelling, and make progress visible.',
    audience: 'Parents and teachers',
    published: '2026-11-05',
    updated: '2026-11-05',
    intro:
      'Reluctance usually has a reason: the task feels too big, handwriting or spelling is slow, the student has been corrected so often that writing feels risky, or they simply cannot see the point. The fix is rarely more pressure. It is a smaller, safer first step.',
    sections: [
      {
        heading: 'Shrink the task',
        paragraphs: [
          'A blank page asking for “an essay” is overwhelming. Ask for one sentence that answers the question, then one reason, then one example. Three small wins feel very different from one big demand, and they add up to a paragraph.',
        ],
      },
      {
        heading: 'Talk first, write second',
        paragraphs: [
          'Let the student say their ideas out loud before writing. For younger children, write down exactly what they say (scribing), then let them copy or finish it. For older students, voice typing can get a first draft down quickly; the editing happens afterwards.',
        ],
      },
      {
        heading: 'Separate ideas from spelling',
        paragraphs: [
          'Correcting spelling during drafting teaches a student that writing is about not making mistakes. Agree that the first draft is for ideas only. Look at spelling and punctuation last, and pick one pattern to work on rather than every error.',
        ],
      },
      {
        heading: 'Give real choices',
        paragraphs: [
          'Choice of topic is one of the cheapest motivators. Let the student pick between two prompts, or connect the task to something they care about: sport, games, animals, a fictional world. Writing Studio lets students set interests so their plan suggests prompts on those topics.',
        ],
      },
      {
        heading: 'Make progress visible',
        paragraphs: [
          'Reluctant writers often believe they are “bad at writing”. Show them evidence otherwise: compare a draft with an earlier one, point to a skill that went from level 2 to 3, or keep a portfolio of pieces they are proud of. Specific praise (“this line made me feel the cold”) works better than general praise.',
        ],
      },
    ],
    related: [
      { label: 'How to help your child with writing', href: '/learn/guides/help-your-child-with-writing' },
      { label: 'Early writing: drawing, telling and sound spelling', href: '/learn/guides/early-writing-kindergarten-to-grade-2' },
      { label: 'Writing practice by grade', href: '/learn/grades' },
    ],
  },
  {
    slug: 'year-6-writing-expectations-england',
    title: 'Year 6 Writing in England: What “Working at the Expected Standard” Means',
    description:
      'A plain-English guide for parents and teachers to the end of key stage 2 writing teacher assessment framework: what pupils are expected to show by the end of Year 6, with practical examples.',
    audience: 'Parents and teachers',
    published: '2026-11-05',
    updated: '2026-11-05',
    intro:
      'At the end of Year 6, teachers in England assess pupils’ writing against the statutory teacher assessment framework (TAF), introduced for 2018 onwards. Pupils are judged as working towards, at, or at greater depth within the expected standard, based on a range of their independent writing over the year. Here is what the expected standard asks for, with the official wording.',
    sections: [
      {
        heading: 'Purpose and audience',
        paragraphs: [
          'Pupils should “write effectively for a range of purposes and audiences, selecting language that shows good awareness of the reader (e.g. the use of the first person in a diary; direct address in instructions and persuasive writing)”. In practice, a persuasive letter should sound different from a story, and a pupil should be able to say who they are writing for.',
        ],
      },
      {
        heading: 'Narrative',
        paragraphs: [
          'In stories, pupils should “describe settings, characters and atmosphere” and “integrate dialogue in narratives to convey character and advance the action”. The key word is integrate: dialogue should move the story on or reveal something about a character, not just fill space.',
        ],
      },
      {
        heading: 'Vocabulary, grammar and cohesion',
        paragraphs: [
          'Pupils should “select vocabulary and grammatical structures that reflect what the writing requires, doing this mostly appropriately” and “use a range of devices to build cohesion (e.g. conjunctions, adverbials of time and place, pronouns, synonyms) within and across paragraphs”. Cohesion is what makes paragraphs flow: a reader should always know how one idea connects to the next.',
        ],
      },
      {
        heading: 'Accuracy',
        paragraphs: [
          'Pupils should “use verb tenses consistently and correctly throughout their writing”, “use the range of punctuation taught at key stage 2 mostly correctly” and “spell correctly most words from the year 5 / year 6 spelling list”. “Mostly” matters: the standard allows occasional errors in otherwise secure writing.',
        ],
      },
      {
        heading: 'Greater depth',
        paragraphs: [
          'Writing at greater depth goes further. One of its statements asks pupils to “distinguish between the language of speech and writing and choose the appropriate register”: for example, a formal letter that never slips into chatty phrases.',
        ],
      },
      {
        heading: 'How Writing Studio lines up',
        paragraphs: [
          'For Year 6 pupils, every skill our feedback rates is matched to these TAF statements as well as the Years 5–6 programme of study, and the progress report quotes them word for word. Our levels describe single pieces of writing; they are practice guidance and do not replace your child’s teacher assessment.',
        ],
      },
    ],
    related: [
      { label: 'Grade 5 / Year 6 writing practice', href: '/learn/grades/grade-5' },
      { label: 'England: National Curriculum alignment', href: '/learn/curriculum/uk-eng' },
      { label: 'US grades, UK years and Australian years compared', href: '/learn/guides/school-years-compared' },
    ],
  },
];

export const getGuide = (slug: string) => GUIDES.find((g) => g.slug === slug);
