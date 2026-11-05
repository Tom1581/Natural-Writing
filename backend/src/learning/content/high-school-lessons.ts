import type { Lesson } from './types';

const PILOT = { status: 'pilot' as const };

/** One lesson for every skill each grades 9–12 rubric scores. Models are written for this site. */
export const HIGH_SCHOOL_LESSONS: Lesson[] = [
  // ─── Grades 9–10 ────────────────────────────────────────────────────────
  {
    id: 'g910-precise-claim',
    version: 1,
    band: '9-10',
    skillId: 'purpose.claim',
    title: 'From topic to precise claim',
    minutes: 15,
    objective:
      'I can write a precise, arguable claim and distinguish it from other positions.',
    explanation: [
      'A topic ("the parking lot") is not a claim. A claim takes a position someone could reasonably dispute: "Bell Harbor should turn half the lot into a plaza and keep 30 spaces."',
      'A precise claim says what should happen and, often, how or why. It also tells the reader which alternative you are rejecting, so your argument has a clear shape.',
      'Test your claim: Could a thoughtful person disagree? Does it answer the exact question in the task? Could you prove it with the sources you have?',
    ],
    model: {
      text: 'Bell Harbor should convert the main-street lot into a plaza only after it opens replacement parking within a five-minute walk. Building the plaza first would repeat the mistake of the town in the planning study where two shops closed.',
      annotations: [
        'The claim answers the task (what to do with the lot) and takes a position.',
        '"Only after it opens replacement parking" makes it precise: it names a condition.',
        'The second sentence distinguishes this claim from the alternative ("plaza first") and previews the evidence.',
      ],
    },
    nonExample: {
      text: 'There are many opinions about the parking lot. Plazas and parking both have pros and cons. This essay will discuss both sides.',
      whatIsMissing:
        'The writer never takes a position. "Pros and cons" and "discuss both sides" announce a topic, not a claim.',
    },
    guided: {
      question: 'Which is the most precise, arguable claim?',
      options: [
        {
          text: 'Parking is an important issue for Bell Harbor.',
          correct: false,
          feedback: 'Nobody would disagree. What should the town do?',
        },
        {
          text: 'Bell Harbor should keep the lot as parking until a study shows where visitors would park instead.',
          correct: true,
          feedback:
            'Yes. It takes a position, names a condition, and someone could argue against it.',
        },
        {
          text: 'The lot has 60 spaces and is full most Saturdays.',
          correct: false,
          feedback:
            'This is a fact from the source. It could support a claim but is not one.',
        },
      ],
    },
    practicePromptId: 'g910-plaza-design',
    reflection:
      'Write your claim at the top of your plan. Who would disagree with it, and why?',
    exitCheck:
      'Underline your claim. Circle the word or phrase that makes it precise (a condition, scope or reason).',
    review: PILOT,
  },
  {
    id: 'g910-evidence-sandwich',
    version: 1,
    band: '9-10',
    skillId: 'development.evidence',
    title: 'Introduce, cite, explain',
    minutes: 15,
    objective:
      'I can bring evidence from a source into my argument and explain how it supports my claim.',
    explanation: [
      'Evidence works when the reader knows where it came from, sees exactly what it says, and understands why it matters. Think of three moves: introduce the source, give the evidence (quoted or paraphrased), then explain it.',
      'The explanation is the part writers skip most often. Ask yourself: "So what? How does this prove my claim?" Your answer is the explanation.',
      'Choose evidence that fits your reason exactly. One well-explained number beats three facts dropped in a row.',
    ],
    model: {
      text: 'An esports team would reach students the school currently misses. According to the club coach, 19 of the 28 members “do not play any other school sport.” A varsity team would therefore give those students the structure that athletes already get from teams: practices, a coach and a reason to keep their grades up.',
      annotations: [
        'The first sentence is the reason. It links back to the claim.',
        '"According to the club coach" introduces the source.',
        'The quotation is part of the writer’s own sentence.',
        'The final sentence explains why the number matters: it connects the evidence to the claim.',
      ],
    },
    nonExample: {
      text: 'Esports should be a sport. “Players review game footage, plan strategy and practice communication under pressure.” Also “19 of them do not play any other school sport.” This proves my point.',
      whatIsMissing:
        'The quotations are dropped in without saying who wrote them, and "this proves my point" does not explain how.',
    },
    guided: {
      question: 'Which sentence best explains this evidence?',
      detail:
        'Evidence: the parent’s letter says esports would compete with track and swimming for “the same limited budget”.',
      options: [
        {
          text: 'This is a good point.',
          correct: false,
          feedback:
            'Why is it a good point, and what does it mean for the claim?',
        },
        {
          text: 'If the $3,000 comes from the existing sports budget, teams that already share old equipment would lose out, so the school would need a separate source of funding.',
          correct: true,
          feedback:
            'Yes. It explains what the evidence means and what follows from it.',
        },
        {
          text: 'The parent wrote a letter to the school board.',
          correct: false,
          feedback:
            'This repeats where the evidence came from but does not explain it.',
        },
      ],
    },
    practicePromptId: 'g910-esports-varsity',
    reflection:
      'Choose one piece of evidence you used. Read your explanation sentence aloud: would a reader who disagrees understand why it matters?',
    exitCheck:
      'Label one paragraph with I (introduce), E (evidence) and X (explain).',
    review: PILOT,
  },
  {
    id: 'g910-counterclaim',
    version: 1,
    band: '9-10',
    skillId: 'development.counterclaim',
    title: 'Answer the strongest objection',
    minutes: 15,
    objective:
      'I can present a serious opposing view fairly and respond to it with reasons or evidence.',
    explanation: [
      'Readers who disagree with you are already thinking of objections. If you state the strongest one fairly, they keep reading; if you ignore it or mock it, they stop trusting you.',
      'A strong counterclaim paragraph has three parts: state the opposing view at its best, concede what is true in it, then respond. "Although…", "Admittedly…" and "Critics argue…" are useful openings; "however", "even so" and "but this overlooks" signal the response.',
      'Sometimes the best response changes your claim. That is not weakness: it shows you have tested your position.',
    ],
    model: {
      text: 'The judges are right that an image produced from a single typed prompt shows little of the entrant’s own skill. Banning every use of AI, however, would also exclude artists like the student in the interview, who uses a tool only to test color schemes and paints every final mark by hand. A process statement with sketches, already required by two other contests, would let judges see the decisions behind each piece.',
      annotations: [
        'The opposing view is stated in its strongest form, not as a straw man.',
        '"The judges are right that…" concedes the valid point.',
        '"However" turns to the response, which uses evidence from the other source.',
        'The last sentence offers a solution that answers the objection.',
      ],
    },
    nonExample: {
      text: 'Some people think AI art is not real art. They are wrong because AI is the future and everyone uses it now.',
      whatIsMissing:
        'The opposing view is vague ("some people"), and the response is an assertion with no evidence.',
    },
    guided: {
      question: 'Which response to the objection is strongest?',
      detail:
        'Objection: "A varsity esports team would take money from the track and swim teams."',
      options: [
        {
          text: 'That is not true.',
          correct: false,
          feedback:
            'Saying it is false is not a reason. What evidence or plan answers it?',
        },
        {
          text: 'This concern is fair, because the sports budget is limited; however, league fees could be covered by a separate technology grant, as the coach’s $3,000 estimate is small enough for one.',
          correct: true,
          feedback:
            'Yes. It concedes the point, then answers it with a specific plan.',
        },
        {
          text: 'Track and swimming are boring anyway.',
          correct: false,
          feedback: 'This insults the other side instead of answering it.',
        },
      ],
    },
    practicePromptId: 'g910-ai-art-contest',
    reflection:
      'What is the strongest objection to your claim? Did your response change your claim at all?',
    exitCheck:
      'Highlight the sentence where you concede something, and the sentence where you respond.',
    review: PILOT,
  },
  {
    id: 'g910-argument-structure',
    version: 1,
    band: '9-10',
    skillId: 'organization.structure',
    title: 'Paragraphs with a job',
    minutes: 15,
    objective:
      'I can organize an argument so each paragraph has one job and transitions show the logic.',
    explanation: [
      'Before you draft, give every paragraph a job: introduce the claim, give reason 1, give reason 2, answer the counterclaim, conclude. If two paragraphs do the same job, combine them.',
      'Transitions should show relationships, not just order. "First" and "second" count; "because of this", "even so" and "as a result" explain.',
      'A conclusion should follow from your argument: what happens if the reader accepts your claim? Avoid only repeating the introduction.',
    ],
    model: {
      text: 'Paragraph plan: (1) Claim: the cafeteria should let students decline items they do not want. (2) Reason: most waste is food students were made to take; audit evidence. (3) Counterclaim: a share table would rescue food too; response: it needs staff the manager does not have. (4) Conclusion: declining is the change the school can run tomorrow, and it teaches students the rules they already have.',
      annotations: [
        'Each numbered paragraph has one job.',
        'The counterclaim has its own paragraph, placed after the main reason.',
        'The conclusion states a consequence ("can run tomorrow") instead of repeating the claim.',
      ],
    },
    nonExample: {
      text: 'First, food waste is bad. Second, the audit found 38 kilograms. Third, a share table is good. Finally, students should decline food. In conclusion, food waste is bad.',
      whatIsMissing:
        'The transitions only count. The reasons are not connected to one claim, and the conclusion repeats the opening.',
    },
    guided: {
      question: 'Which transition best connects these two sentences?',
      detail:
        '"The audit found that 62 percent of students took items they did not want." ___ "letting students decline items would cut waste at its source."',
      options: [
        {
          text: 'Secondly,',
          correct: false,
          feedback: 'This counts, but it does not show how the ideas relate.',
        },
        {
          text: 'For this reason,',
          correct: true,
          feedback:
            'Yes. It shows the second sentence follows from the evidence.',
        },
        {
          text: 'In addition,',
          correct: false,
          feedback:
            'The second sentence is not an extra point; it is a consequence.',
        },
      ],
    },
    practicePromptId: 'g910-cafeteria-waste',
    reflection:
      'Read only the first sentence of each paragraph. Do they make the argument on their own?',
    exitCheck:
      'Write the job of each paragraph in the margin, in three words or fewer.',
    review: PILOT,
  },
  {
    id: 'g910-controlling-idea',
    version: 1,
    band: '9-10',
    skillId: 'purpose.topic',
    title: 'A controlling idea for explanations',
    minutes: 12,
    objective:
      'I can introduce an explanation with a controlling idea that previews what I will explain.',
    explanation: [
      'Informative writing does not argue, but it still needs a point. A controlling idea tells the reader what you will explain and how the parts fit together.',
      'Compare "This essay is about the town budget" with "Bell Harbor’s budget is built by staff in the autumn, but residents can still change it at the March hearings." The second one previews the structure: how it is made, then where residents fit in.',
    ],
    model: {
      text: 'Most of Bell Harbor’s budget is decided before residents ever see it, yet last year a group of residents moved $38,000 in a single evening. Understanding the yearly cycle shows when one voice can make that kind of difference.',
      annotations: [
        'The opening contrast catches the reader’s attention with a fact from the source.',
        'The controlling idea ("understanding the yearly cycle shows when one voice can make a difference") previews the explanation.',
        'It stays informative: it explains, rather than telling readers what they should do.',
      ],
    },
    nonExample: {
      text: 'Budgets are important. In this essay I will tell you about budgets and how they work and other information about them.',
      whatIsMissing:
        'The topic is named, but there is no controlling idea: the reader cannot tell what the explanation will show.',
    },
    guided: {
      question:
        'Which sentence is the best controlling idea for an explanation of honeybee losses?',
      options: [
        {
          text: 'Bees are amazing insects.',
          correct: false,
          feedback:
            'This is a general comment, not a preview of the explanation.',
        },
        {
          text: 'Everyone should plant flowers to save the bees.',
          correct: false,
          feedback: 'This is an argument. Informative writing explains first.',
        },
        {
          text: 'Honeybee colonies rarely fail for one reason; mites, gaps in the food supply and pesticides add up, and each makes the others worse.',
          correct: true,
          feedback: 'Yes. It previews the causes and how they connect.',
        },
      ],
    },
    practicePromptId: 'g910-town-budget',
    reflection:
      'Does your conclusion answer the question your controlling idea raised?',
    exitCheck:
      'Underline your controlling idea, then number the parts it previews.',
    review: PILOT,
  },
  {
    id: 'g910-explain-significance',
    version: 1,
    band: '9-10',
    skillId: 'development.information',
    title: 'From facts to explanation',
    minutes: 15,
    objective:
      'I can use facts from sources and explain what each one shows and how they connect.',
    explanation: [
      'A list of facts is not an explanation. After each fact, tell the reader what it means: "This matters because…" or "This shows that…".',
      'The strongest explanations connect facts to each other. Words like "because", "which means", "as a result" and "at the same time" show cause, effect and combination.',
      'Be honest about uncertainty. If the source says scientists are still studying something, say so.',
    ],
    model: {
      text: 'A colony with many varroa mites in late summer is less likely to survive the winter, because the mites spread viruses that weaken the bees. This becomes more serious when food runs short: the gardening magazine explains that single-crop fields flower for only a few weeks, so a colony already weakened by mites may face months with little pollen. As a result, beekeepers and gardeners each solve only part of the problem.',
      annotations: [
        'Each fact is followed by "because" or an explanation of what it causes.',
        '"This becomes more serious when…" connects the two sources.',
        '"As a result" gives the significance: why the connection matters.',
      ],
    },
    nonExample: {
      text: 'Varroa mites feed on bees. Single-crop fields flower for a few weeks. Some pesticides affect bees. Researchers say there are several causes.',
      whatIsMissing:
        'Every sentence is accurate, but none is explained or connected, so the reader learns facts without understanding them.',
    },
    guided: {
      question: 'What is the best sentence to follow this fact?',
      detail:
        'Fact: "Residents can submit written comments online up to a week before the vote."',
      options: [
        {
          text: 'This means people who cannot attend an evening hearing can still influence the budget, as long as they act early.',
          correct: true,
          feedback: 'Yes. It explains what the fact means for the reader.',
        },
        {
          text: 'The council votes in April.',
          correct: false,
          feedback: 'This is another fact, not an explanation of the first.',
        },
        {
          text: 'Everyone should submit comments.',
          correct: false,
          feedback: 'This turns the explanation into an argument.',
        },
      ],
    },
    practicePromptId: 'g910-bee-decline',
    reflection: 'Find your best fact. Did you explain it, or just state it?',
    exitCheck: 'Draw an arrow from one fact to the sentence that explains it.',
    review: PILOT,
  },
  {
    id: 'g910-narrative-opening',
    version: 1,
    band: '9-10',
    skillId: 'purpose.story',
    title: 'Open with tension and a point of view',
    minutes: 12,
    objective:
      'I can open a narrative by establishing a situation, a point of view and tension.',
    explanation: [
      'Strong openings drop the reader into a moment where something is at stake. Instead of starting with the alarm clock, start close to the problem.',
      'Choose your point of view early. A first-person narrator can reveal private thoughts; a third-person narrator can show what the character does not notice.',
      'Tension can be small: a choice to make, something unsaid, a deadline. The reader should want to know what happens next.',
    ],
    model: {
      text: 'By the time Priya reached the field, the team was already running drills, and nobody had saved her a pinnie. Coach pointed to the bench without looking up. She had transferred in October; the roster had been printed in August.',
      annotations: [
        'The story starts at the problem (arriving to a team that has not made room), not before it.',
        'Third-person point of view lets the reader see Coach not looking up.',
        'The last line explains the tension with two dates instead of a long backstory.',
      ],
    },
    nonExample: {
      text: 'Hi, my name is Priya and I am going to tell you a story about when I joined a new soccer team. It was a sunny day and I woke up and ate breakfast.',
      whatIsMissing:
        'The opening announces the story and starts long before anything is at stake.',
    },
    guided: {
      question: 'Which opening creates the most tension?',
      options: [
        {
          text: 'This is a story about a time I was nervous.',
          correct: false,
          feedback:
            'It tells the reader about a feeling instead of showing a situation.',
        },
        {
          text: 'The museum lights clicked off one row at a time, and the guard’s footsteps faded toward the exit before I could shout.',
          correct: true,
          feedback:
            'Yes. The reader is inside the moment and wants to know what happens.',
        },
        {
          text: 'Museums are interesting places with a lot of history.',
          correct: false,
          feedback: 'This is a general statement, not a story opening.',
        },
      ],
    },
    practicePromptId: 'g910-new-team',
    reflection:
      'What does the reader want to know after your first two sentences?',
    exitCheck: 'Mark the word or line in your opening that creates tension.',
    review: PILOT,
  },
  {
    id: 'g910-slow-the-moment',
    version: 1,
    band: '9-10',
    skillId: 'development.detail',
    title: 'Slow down the moment that matters',
    minutes: 15,
    objective:
      'I can develop the key moment of a story with dialogue, action, sensory detail and reflection.',
    explanation: [
      'Stories have a pace. Unimportant time can pass in a sentence ("Two hours later…"). The moment that changes things deserves a full paragraph or more.',
      'To slow a moment, add one of each: an action, a sensory detail, a line of dialogue, and a thought. Choose telling details: specific ones that reveal character.',
    ],
    model: {
      text: 'The exit sign buzzed. I pressed my palm against the glass door, then my forehead, and the cold went straight through me. Somewhere behind me, in the dark gallery, the motion sensor on the dinosaur exhibit clicked on and off, on and off, as if something were breathing. "Okay," I said out loud, to hear a voice. "Okay. Think."',
      annotations: [
        'Action: pressing palm, then forehead, against the door.',
        'Sensory details: the buzz, the cold, the clicking sensor.',
        'Dialogue reveals fear and the attempt to stay calm.',
        'The whole paragraph covers perhaps ten seconds: time slows down.',
      ],
    },
    nonExample: {
      text: 'I realized I was locked in. I was scared. Then I found a phone and called for help and they came and let me out.',
      whatIsMissing:
        'The most important moment is summarized in three sentences, so the reader never feels it.',
    },
    guided: {
      question: 'Which detail is most telling about a nervous character?',
      options: [
        {
          text: 'She was very nervous.',
          correct: false,
          feedback: 'This tells instead of shows.',
        },
        {
          text: 'She re-tied her laces for the third time, though they had not come loose.',
          correct: true,
          feedback:
            'Yes. A specific action reveals the nerves without naming them.',
        },
        {
          text: 'She wore blue shoes.',
          correct: false,
          feedback: 'Specific, but it does not reveal anything about her.',
        },
      ],
    },
    practicePromptId: 'g910-museum-night',
    reflection:
      'Which moment in your story did you slow down? Was it the most important one?',
    exitCheck:
      'Label an action, a sensory detail, a line of dialogue and a thought in your key moment.',
    review: PILOT,
  },
  {
    id: 'g910-sentence-variety',
    version: 1,
    band: '9-10',
    skillId: 'sentences.control',
    title: 'Phrases, clauses and pace',
    minutes: 12,
    objective:
      'I can vary my sentences with phrases and clauses to show how ideas relate and to control pace.',
    explanation: [
      'Sentences that all start the same way and run the same length feel flat. Mix them: begin some with a phrase ("Under the bench,"), some with a dependent clause ("Although the radio was silent,"), and keep some short.',
      'In stories, short sentences speed up tense moments. Longer sentences with added detail slow down reflection.',
      'Every variation must still be a complete, controlled sentence.',
    ],
    model: {
      text: 'The radio had not worked in years. Turning the dial, Sam felt something rattle inside the case, small and hard, like a seed in a gourd. He stopped. When he finally opened the back panel, a folded note slid into his palm.',
      annotations: [
        'Short first sentence states the situation.',
        '"Turning the dial," opens with a phrase and adds detail.',
        '"He stopped." is short for a moment of tension.',
        '"When he finally opened…" begins with a dependent clause that shows time.',
      ],
    },
    nonExample: {
      text: 'Sam turned the dial. Sam heard a rattle. Sam opened the panel. Sam found a note. Sam read the note.',
      whatIsMissing:
        'Every sentence has the same pattern, so nothing stands out and the relationships between events are lost.',
    },
    guided: {
      question: 'Which version shows the relationship between the ideas best?',
      detail: '"The repair took hours. Sam did not give up."',
      options: [
        {
          text: 'Although the repair took hours, Sam did not give up.',
          correct: true,
          feedback: 'Yes. "Although" shows the contrast between the two ideas.',
        },
        {
          text: 'The repair took hours, Sam did not give up.',
          correct: false,
          feedback:
            'This is a comma splice: two sentences joined with only a comma.',
        },
        {
          text: 'The repair took hours and Sam did not give up and he kept going.',
          correct: false,
          feedback: 'The "and… and" chain does not show how the ideas relate.',
        },
      ],
    },
    practicePromptId: 'g910-repair-shop',
    reflection: 'Read your draft aloud. Where does the rhythm feel flat?',
    exitCheck:
      'Find one sentence you combined or shortened on purpose, and say why.',
    review: PILOT,
  },
  {
    id: 'g910-audience-style',
    version: 1,
    band: '9-10',
    skillId: 'word_choice.precision',
    title: 'Words that fit the reader',
    minutes: 12,
    objective:
      'I can choose precise words and a style and tone that fit my audience and purpose.',
    explanation: [
      'Precise words do more work: "dissolve" is clearer than "mix it until it goes away", but only if your reader knows it. For a younger reader, use the simple word and explain the technical one once.',
      'Tone is your attitude toward the reader. Formal writing avoids slang and exaggeration; it is still clear and direct. Choose verbs that are exact ("stir", "hang", "wait three days") instead of general ones ("do", "put", "make").',
    ],
    model: {
      text: 'Step 3: Pour the warm water into the cup. Step 4: Open the packet marked B and tip all the crystals into the water. Stir with the spoon until you cannot see any crystals. (Scientists call this dissolving.)',
      annotations: [
        'Each step is one exact action with a precise verb (pour, tip, stir).',
        '"Until you cannot see any crystals" tells a ten-year-old how to know the step is done.',
        'The technical word "dissolving" is introduced once, in brackets, for a young reader.',
      ],
    },
    nonExample: {
      text: 'Do the crystals thing with the water, then stuff happens and you put the string on and wait for it to work.',
      whatIsMissing:
        '"Thing", "stuff" and "put" are vague, and the reader cannot tell what to do or in what order.',
    },
    guided: {
      question: 'Which word fits a formal letter to a town council?',
      detail: '"The plaza would ___ foot traffic on Main Street."',
      options: [
        {
          text: 'boost',
          correct: false,
          feedback: 'Understandable, but a little informal and vague.',
        },
        {
          text: 'super-charge',
          correct: false,
          feedback: 'This exaggerates and sounds like an advertisement.',
        },
        {
          text: 'increase',
          correct: true,
          feedback: 'Yes. It is precise and suits a formal, objective tone.',
        },
      ],
    },
    practicePromptId: 'g910-instructions-revise',
    reflection: 'Who is your reader? Find one word you changed for them.',
    exitCheck:
      'Circle three vague words in your draft and replace them with precise ones.',
    review: PILOT,
  },
  {
    id: 'g910-edit-sources',
    version: 1,
    band: '9-10',
    skillId: 'conventions.mechanics',
    title: 'Proofread like an editor',
    minutes: 12,
    objective:
      'I can proofread for grammar, punctuation and spelling, including punctuation around quotations.',
    explanation: [
      'Proofread in separate passes: one for sentence boundaries (no comma splices or fragments), one for quotations and citations, one for spelling of names and terms from the sources.',
      'Quotation punctuation: introduce with a comma after a speaking verb (The coordinator warns, “…”) or blend the words into your sentence with no comma (The study found that traffic rose “by 15 to 25 percent.”). In American style, periods and commas go inside the closing quotation mark; British and Australian style often places them outside unless they belong to the quotation.',
      'Read your work aloud slowly. Your ear catches errors your eye skips.',
    ],
    model: {
      text: 'The extension office warns that mites spread viruses “inside the hive.” Because a weakened colony struggles in winter, beekeepers sample about 300 bees to check mite levels.',
      annotations: [
        'The quotation blends into the sentence, so there is no comma before it.',
        'The introductory clause ("Because a weakened colony struggles in winter,") is followed by a comma.',
        'The number and the term from the source are copied accurately.',
      ],
    },
    nonExample: {
      text: 'The extension office warns that, “mites spread viruses inside the hive”, beekeepers sample about 300 bee’s to check mite levels.',
      whatIsMissing:
        'An extra comma before the blended quotation, a comma splice joining two sentences, and an apostrophe in a plural ("bee’s").',
    },
    guided: {
      question: 'Which sentence is punctuated correctly?',
      options: [
        {
          text: 'According to the report, the hottest neighborhood was 6 °C warmer than the coolest.',
          correct: true,
          feedback: 'Yes. A comma follows the introductory phrase.',
        },
        {
          text: 'According to the report the hottest neighborhood, was 6 °C warmer than the coolest.',
          correct: false,
          feedback:
            'The comma is in the wrong place: it splits the subject from its verb.',
        },
        {
          text: 'According to the report. The hottest neighborhood was 6 °C warmer.',
          correct: false,
          feedback: '"According to the report." is a fragment.',
        },
      ],
    },
    practicePromptId: 'g910-bee-decline',
    reflection:
      'Which kind of error do you make most often? Make it your first proofreading pass.',
    exitCheck:
      'Check every quotation: is it introduced, accurate and punctuated correctly?',
    review: PILOT,
  },

  // ─── Grades 11–12 ───────────────────────────────────────────────────────
  {
    id: 'g1112-qualified-claim',
    version: 1,
    band: '11-12',
    skillId: 'purpose.claim',
    title: 'Qualified claims',
    minutes: 15,
    objective:
      'I can write a claim that says why the issue matters and is qualified to fit the evidence.',
    explanation: [
      'Real evidence is rarely all on one side. A qualified claim limits itself to what the evidence supports: for whom, under what conditions, or with what exception.',
      'Qualifying is not hedging. "AI tutors might be good or bad" says nothing. "AI tutors should be adopted for maths study hall, with settings that require students to explain each step" is precise and arguable.',
      'Also tell the reader why the issue matters: what is at stake if the board decides wrongly?',
    ],
    model: {
      text: 'The district should introduce AI tutoring in maths study halls next year, but only with settings that require students to explain their reasoning before the tool responds. The pilot’s gains were real, and so was the shortcut its teachers observed; a well-designed rollout can keep the first without the second.',
      annotations: [
        '"In maths study halls next year" sets the scope.',
        '"But only with settings that…" adds a condition drawn from the evidence.',
        'The second sentence says why it matters and previews both sources.',
      ],
    },
    nonExample: {
      text: 'AI tutors have advantages and disadvantages. It depends on how they are used. There is no right answer.',
      whatIsMissing:
        'This avoids taking a position. "It depends" needs to become a claim that names what it depends on.',
    },
    guided: {
      question: 'Which claim is qualified without becoming vague?',
      options: [
        {
          text: 'Stadium funding is a complicated issue with many sides.',
          correct: false,
          feedback: 'True but not a claim. What should the city do?',
        },
        {
          text: 'The city should not fund the stadium.',
          correct: false,
          feedback:
            'Clear, but it ignores the conditions under which some support might make sense.',
        },
        {
          text: 'The city should contribute to the stadium only through repayable loans, since independent research finds that subsidies rarely return their cost.',
          correct: true,
          feedback:
            'Yes. It takes a position and limits it in a way the evidence supports.',
        },
      ],
    },
    practicePromptId: 'g1112-ai-tutors',
    reflection:
      'What word or phrase in your claim qualifies it? What evidence made you add it?',
    exitCheck:
      'Underline the qualification in your claim, and note which source it answers.',
    review: PILOT,
  },
  {
    id: 'g1112-synthesis',
    version: 1,
    band: '11-12',
    skillId: 'development.evidence',
    title: 'Make sources talk to each other',
    minutes: 18,
    objective:
      'I can synthesize sources that disagree and explain which is more persuasive on the key point.',
    explanation: [
      'Summary goes source by source: "Source 1 says… Source 2 says…". Synthesis puts sources in conversation: "Both sources agree that…, but they disagree about…".',
      'Find the key point where the sources disagree. Then judge them: which has stronger evidence, fewer conflicts of interest, or answers the question more directly?',
      'Use precise verbs to show how sources relate: "confirms", "complicates", "contradicts", "overlooks", "extends".',
    ],
    model: {
      text: 'Both sources agree that the dam blocks salmon; they disagree about what the creek is for. The conservation report’s evidence on fish is the stronger of the two, because it rests on regional cases where fish returned within five years. The residents’ letter, however, identifies a cost the report overlooks: several years of exposed mud flats where families now swim and skate.',
      annotations: [
        '"Both sources agree… they disagree about…" frames the sources together.',
        'The writer judges which source is more persuasive and says why.',
        '"Overlooks" shows how the second source complicates the first.',
      ],
    },
    nonExample: {
      text: 'Source 1 says salmon cannot get upstream. Source 2 says people like the pond. Both sources have good points.',
      whatIsMissing:
        'The sources are summarized one at a time, and "both have good points" avoids judging them.',
    },
    guided: {
      question: 'Which sentence synthesizes rather than summarizes?',
      options: [
        {
          text: 'The team’s report says the stadium will add $60 million. The economists say stadiums do not add spending.',
          correct: false,
          feedback:
            'This lists the sources side by side without relating them.',
        },
        {
          text: 'The economists’ research complicates the team’s $60 million estimate, because it suggests much of that spending would simply move from other local businesses.',
          correct: true,
          feedback: 'Yes. "Complicates" relates the sources and explains why.',
        },
        {
          text: 'Stadiums are expensive.',
          correct: false,
          feedback: 'This uses neither source.',
        },
      ],
    },
    practicePromptId: 'g1112-dam-removal',
    reflection:
      'Where exactly do your sources disagree? Which one did you find more persuasive, and why?',
    exitCheck: 'Highlight one sentence where two sources appear together.',
    review: PILOT,
  },
  {
    id: 'g1112-refine-with-counterclaim',
    version: 1,
    band: '11-12',
    skillId: 'development.counterclaim',
    title: 'Let the objection sharpen your claim',
    minutes: 15,
    objective:
      'I can weigh the strongest opposing view, with its evidence, and refine my claim in response.',
    explanation: [
      'At this level, a counterclaim is not a box to tick. It is a test. Present the opposing view with its best evidence, decide what it gets right, and show how your position accounts for it.',
      'Anticipate your audience: an education committee will worry about cost and fairness. Address the concerns they are most likely to hold.',
      'Often the strongest essays change the original claim slightly ("required service, but counting paid work and family care") because the objection was right about something.',
    ],
    model: {
      text: 'The student’s objection is the most serious one: a requirement falls hardest on students who already work or care for family. The volunteering study supports this concern indirectly, since required service produced the smallest benefit. A requirement that counts paid work and family care, and lets students choose their placements, keeps the civic benefits the study found while removing the burden the student describes.',
      annotations: [
        'The objection is named as "the most serious one" and stated fairly.',
        'The writer uses the other source to show the objection is partly right.',
        'The claim is refined: the requirement now counts paid work and family care.',
      ],
    },
    nonExample: {
      text: 'Some people say students are too busy. But everyone can find 40 hours if they try.',
      whatIsMissing:
        'The objection is weakened ("some people") and dismissed with an assumption, not evidence.',
    },
    guided: {
      question: 'Which response best answers the objection?',
      detail:
        'Objection: "Wind turbines near homes cause sleep disturbance from noise."',
      options: [
        {
          text: 'Turbines are quiet, so this is not a problem.',
          correct: false,
          feedback: 'This contradicts the source without evidence.',
        },
        {
          text: 'Because the reports of disturbance come from residents living near turbines, the project should adopt the 1.5-kilometer setback, keeping eight turbines and most of the benefits.',
          correct: true,
          feedback:
            'Yes. It takes the evidence seriously and refines the claim.',
        },
        {
          text: 'Noise is less important than clean energy.',
          correct: false,
          feedback: 'This dismisses the concern instead of weighing it.',
        },
      ],
    },
    practicePromptId: 'g1112-service-hours',
    reflection: 'How did the strongest objection change your claim, if at all?',
    exitCheck: 'Put a star next to the sentence where your claim is refined.',
    review: PILOT,
  },
  {
    id: 'g1112-building-sections',
    version: 1,
    band: '11-12',
    skillId: 'organization.structure',
    title: 'Sections that build',
    minutes: 15,
    objective:
      'I can organize an argument so each section builds on the last and the conclusion explains implications.',
    explanation: [
      'In a building structure, each paragraph depends on the one before. For example: what the team promises → what the evidence shows → why the difference matters → what the city should do.',
      'Transitions at this level express precise relationships: concession ("granted"), contrast ("yet"), consequence ("it follows that"), escalation ("more importantly").',
      'A strong conclusion goes one step further than the body: implications, consequences, or what the decision says about the community’s priorities.',
    ],
    model: {
      text: 'Section plan: (1) The team’s promise: 400 permanent jobs and $60 million in new spending. (2) Granted, a new stadium will be busy; yet independent research shows most of that spending moves from elsewhere in the city. (3) It follows that the public would pay for benefits concentrated near one site. (4) Conclusion: if the city still wants the team to stay, repayable loans protect taxpayers, and the choice reveals whether the city values visibility or its neighborhoods.',
      annotations: [
        'Each section depends on the previous one: promise, test, consequence, decision.',
        '"Granted… yet…" and "It follows that" show precise relationships.',
        'The conclusion adds an implication (what the choice reveals) instead of repeating.',
      ],
    },
    nonExample: {
      text: 'First, stadiums cost money. Second, teams create jobs. Third, economists disagree. In conclusion, there are many factors.',
      whatIsMissing:
        'The paragraphs could be shuffled with no loss: nothing builds, and the conclusion avoids a position.',
    },
    guided: {
      question:
        'Which transition best signals that the next section builds on the last?',
      options: [
        {
          text: 'Another point is that…',
          correct: false,
          feedback: 'This adds a point but does not build on the previous one.',
        },
        {
          text: 'If shifted spending is counted as new, then the team’s estimate overstates the benefit, which matters because…',
          correct: true,
          feedback:
            'Yes. It takes the previous finding and moves the argument forward.',
        },
        {
          text: 'Also,',
          correct: false,
          feedback: 'This lists rather than builds.',
        },
      ],
    },
    practicePromptId: 'g1112-stadium-funding',
    reflection:
      'Could your paragraphs be shuffled without losing meaning? If so, what is missing?',
    exitCheck:
      'Write the logical link between each pair of paragraphs in the margin.',
    review: PILOT,
  },
  {
    id: 'g1112-frame-for-audience',
    version: 1,
    band: '11-12',
    skillId: 'purpose.topic',
    title: 'Frame a complex topic for your reader',
    minutes: 12,
    objective:
      'I can introduce a complex topic with a controlling idea framed for a specific audience.',
    explanation: [
      'The same topic needs a different frame for different readers. For a general adult audience, start from something familiar (the batteries in their phone) and move to the unfamiliar (nodules on the sea floor).',
      'Your controlling idea should show the reader why the explanation matters to them and preview its parts.',
    ],
    model: {
      text: 'The metals in the battery of a phone or electric car may one day come from the ocean floor, four kilometers down. Deep-sea mining promises a new supply of those metals, but scientists are still discovering what lives there, and what mining would leave behind.',
      annotations: [
        'Starts from something familiar to a general audience.',
        'The controlling idea previews two parts: the promise and the unknowns.',
        'It stays balanced: informative, not an argument for or against.',
      ],
    },
    nonExample: {
      text: 'Deep-sea mining is the process of extracting polymetallic nodules from the abyssal plain. It is very controversial.',
      whatIsMissing:
        'Technical terms arrive with no explanation for a general reader, and "controversial" does not preview what will be explained.',
    },
    guided: {
      question:
        'Which opening is best framed for a city council deciding on heat-pump rebates?',
      options: [
        {
          text: 'A heat pump is like a fridge running backwards!',
          correct: false,
          feedback:
            'A helpful analogy for a child, but the council needs to know why it matters to the city.',
        },
        {
          text: 'Heat pumps deliver two to four units of heat for every unit of electricity, which is why rebates could cut both residents’ bills and the city’s emissions.',
          correct: true,
          feedback:
            'Yes. It leads with what matters to this audience and previews the explanation.',
        },
        {
          text: 'This essay is about heat pumps.',
          correct: false,
          feedback: 'This names the topic without framing it.',
        },
      ],
    },
    practicePromptId: 'g1112-deep-sea-mining',
    reflection:
      'Who is your reader, and what do they already know? Where does your opening meet them?',
    exitCheck:
      'Underline the phrase in your introduction that connects the topic to your audience.',
    review: PILOT,
  },
  {
    id: 'g1112-integrate-sources',
    version: 1,
    band: '11-12',
    skillId: 'development.information',
    title: 'Integrate, don’t list',
    minutes: 15,
    objective:
      'I can integrate information from several sources into one explanation and say where they agree or differ.',
    explanation: [
      'An integrated explanation is organized by idea, not by source. Each paragraph answers a part of the question and draws on whichever sources help.',
      'When sources describe the same process from different angles, show how they fit: one may describe the cause, the other the mechanism. When they differ, say so and explain what that means for the reader.',
    ],
    model: {
      text: 'Speed is what gives a false post its advantage. The media-lab study found that false posts outpace accurate ones in their first six hours, and the platform’s own explanation shows why that head start matters: its feed rewards early engagement. A fact-check label, which takes one to three days, therefore arrives after most of the sharing has already happened.',
      annotations: [
        'The paragraph is organized by idea (speed), not by source.',
        'The two sources are joined: one gives the finding, the other the mechanism.',
        '"Therefore" draws the implication from both together.',
      ],
    },
    nonExample: {
      text: 'The first source is a study. It found false posts spread fast. The second source is from a platform. It says the feed ranks posts by engagement and fact-checks take a few days.',
      whatIsMissing:
        'The sources are described one at a time, and the connection between them is left for the reader to work out.',
    },
    guided: {
      question: 'Which sentence integrates the two coral sources?',
      options: [
        {
          text: 'The fact sheet explains bleaching. The report talks about two reefs.',
          correct: false,
          feedback: 'This lists the sources without connecting them.',
        },
        {
          text: 'Because bleached corals are starving rather than dead, recovery depends on conditions afterwards, which may explain why the clearer offshore reef recovered almost three times as much coral as the reef near the river mouth.',
          correct: true,
          feedback:
            'Yes. The fact sheet’s mechanism explains the report’s finding.',
        },
        {
          text: 'Coral reefs are beautiful and should be protected.',
          correct: false,
          feedback: 'This is opinion, and it uses neither source.',
        },
      ],
    },
    practicePromptId: 'g1112-misinformation',
    reflection:
      'Is each paragraph organized around an idea or around a source?',
    exitCheck:
      'Find one sentence that uses two sources together. If there is none, write one.',
    review: PILOT,
  },
  {
    id: 'g1112-nuance',
    version: 1,
    band: '11-12',
    skillId: 'word_choice.precision',
    title: 'Words that carry the right certainty',
    minutes: 12,
    objective:
      'I can choose words with the right degree of certainty and connotation for my audience.',
    explanation: [
      'Verbs for evidence carry different strengths: "proves" is rare; "shows" and "demonstrates" are strong; "suggests" and "indicates" are cautious. Match the verb to the evidence.',
      'Connotation matters. "The union warns" and "the union complains" report the same thing, but one sounds fair and the other dismissive.',
      'For different audiences, change vocabulary and detail, but keep the facts accurate in every version.',
    ],
    model: {
      text: 'For a ten-year-old: "A heat pump is a bit like a fridge working backwards. It collects warmth from the cold air outside and moves it into your house." For the council: "A heat pump transfers heat rather than generating it, delivering two to four units of heat per unit of electricity, although its efficiency falls in very cold weather."',
      annotations: [
        'The child version uses an analogy and everyday words.',
        'The council version uses precise terms ("transfers", "units of electricity").',
        'Both stay accurate, and the council version keeps the limitation ("efficiency falls").',
      ],
    },
    nonExample: {
      text: 'Heat pumps are totally amazing and will definitely solve all our energy problems forever.',
      whatIsMissing:
        '"Totally", "definitely" and "forever" overstate the evidence, and the tone suits neither audience.',
    },
    guided: {
      question: 'Which verb best fits one pilot study with mixed results?',
      detail:
        '"The pilot ___ that AI tutoring can raise scores when students already do homework."',
      options: [
        {
          text: 'proves',
          correct: false,
          feedback: 'Too strong for one pilot.',
        },
        {
          text: 'suggests',
          correct: true,
          feedback: 'Yes. It matches limited but real evidence.',
        },
        {
          text: 'hints at the possibility',
          correct: false,
          feedback: 'Too weak and wordy: the pilot found measurable gains.',
        },
      ],
    },
    practicePromptId: 'g1112-two-audiences',
    reflection:
      'Find a verb you used to report evidence. Does its strength match the evidence?',
    exitCheck:
      'Circle every verb you used for a source (says, shows, suggests…). Change any that overstate.',
    review: PILOT,
  },
  {
    id: 'g1112-voice-question',
    version: 1,
    band: '11-12',
    skillId: 'purpose.story',
    title: 'A voice and a question',
    minutes: 12,
    objective:
      'I can open a narrative with a sustained voice and a question that the story will answer.',
    explanation: [
      'Mature narratives often begin with a voice the reader trusts or wonders about, and a question the reader wants answered: Why is she here? What happened between them?',
      'The question does not need to be stated. It can come from a gap: something the narrator knows and the reader does not yet.',
    ],
    model: {
      text: 'My mother said I would only need to translate the medical words, which is how I ended up explaining to my grandmother, in a language I speak like a child, that the doctor was not going to fix her knee.',
      annotations: [
        'A distinct voice: wry, honest, slightly self-critical ("a language I speak like a child").',
        'The reader wants to know how the grandmother will react, and what this does to them both.',
        'The situation and its significance arrive in one long, controlled sentence.',
      ],
    },
    nonExample: {
      text: 'This is a story about a time when I had to translate for my grandmother at the doctor. It was hard but I learned a lot.',
      whatIsMissing:
        'The narrator announces the story and its lesson, so there is no question left for the reader.',
    },
    guided: {
      question: 'Which opening raises the strongest question?',
      options: [
        {
          text: 'The train was long and the night was dark.',
          correct: false,
          feedback: 'Atmosphere, but no question about the characters.',
        },
        {
          text: 'The woman across from me had been crying since Lyon, and at two in the morning she asked if I could keep a secret.',
          correct: true,
          feedback: 'Yes. Who is she, and what is the secret?',
        },
        {
          text: 'I like trains because they are relaxing.',
          correct: false,
          feedback: 'A statement of preference, not a story opening.',
        },
      ],
    },
    practicePromptId: 'g1112-interpreter',
    reflection:
      'What question does your opening raise? Where in the story is it answered?',
    exitCheck: 'Write the question your opening raises in the margin.',
    review: PILOT,
  },
  {
    id: 'g1112-revealing-detail',
    version: 1,
    band: '11-12',
    skillId: 'development.detail',
    title: 'Details that reveal, not explain',
    minutes: 15,
    objective:
      'I can choose details and dialogue that let the reader infer character and meaning.',
    explanation: [
      'At this level, the reader should do some of the work. Instead of "She was proud of her brother", show her filming his whole race and missing her own name being called.',
      'Choose one or two details that carry meaning. A recurring detail (a phrase, an object) can quietly change meaning by the end.',
      'Dialogue should do double work: move the scene and reveal what the characters will not say directly.',
    ],
    model: {
      text: 'Forty seconds left. Mara found her father in the stands without looking; he was the only one sitting down, the way he sat at the kitchen table when the bills came. She took the free throw. It rolled once around the rim, deciding.',
      annotations: [
        'The father’s posture reveals worry and history without stating either.',
        '"The way he sat… when the bills came" lets the reader infer what is at stake.',
        '"Deciding" gives the ball a life of its own and slows the moment.',
      ],
    },
    nonExample: {
      text: 'There were forty seconds left. Mara was very nervous because her father was watching and money was tight and a scholarship depended on the game. She took the shot.',
      whatIsMissing:
        'Every feeling and reason is explained, so the reader has nothing to infer.',
    },
    guided: {
      question: 'Which line of dialogue reveals the most without stating it?',
      options: [
        {
          text: '"I am angry that you forgot my performance."',
          correct: false,
          feedback: 'It states the feeling directly.',
        },
        {
          text: '"They saved you a seat," she said. "Third row. It was empty the whole time."',
          correct: true,
          feedback: 'Yes. The reader infers the hurt from the empty seat.',
        },
        {
          text: '"Hello, how are you?"',
          correct: false,
          feedback: 'Realistic, but it reveals nothing.',
        },
      ],
    },
    practicePromptId: 'g1112-final-match',
    reflection: 'What does your reader infer that you never say directly?',
    exitCheck: 'Highlight one detail that carries meaning beyond description.',
    review: PILOT,
  },
  {
    id: 'g1112-syntax-effect',
    version: 1,
    band: '11-12',
    skillId: 'sentences.control',
    title: 'Syntax for effect',
    minutes: 12,
    objective:
      'I can vary syntax for effect, including emphasis, rhythm, parallel structure and deliberate fragments.',
    explanation: [
      'Syntax shapes how a reader feels the ideas. A long sentence that builds clause by clause can create momentum; a short one after it lands like a stop.',
      'Parallel structure (the same grammatical pattern repeated) creates rhythm and makes comparisons clear: "She read the letters slowly, then quickly, then not at all."',
      'A deliberate fragment can create emphasis, but only when the surrounding sentences are controlled, so the reader knows it is a choice.',
    ],
    model: {
      text: 'The letters were addressed to the mill, to the mayor, to anyone who might listen, and every one asked the same thing in a different hand: Where did the river go? I read them until the archive closed. Then I read them again. Forty-one letters. No replies.',
      annotations: [
        'Parallel phrases ("to the mill, to the mayor, to anyone…") build momentum.',
        'The colon introduces the question with emphasis.',
        'Short sentences and two deliberate fragments slow the ending and land the meaning.',
      ],
    },
    nonExample: {
      text: 'I found some letters. They were in a box. They were about the river. I read them. There were 41 of them. Nobody replied to them.',
      whatIsMissing:
        'Every sentence has the same short pattern, so nothing is emphasized and the ending has no weight.',
    },
    guided: {
      question: 'Which version uses parallel structure correctly?',
      options: [
        {
          text: 'She wanted to sing, dancing, and to act.',
          correct: false,
          feedback: 'The pattern breaks: "to sing… dancing… to act".',
        },
        {
          text: 'She wanted to sing, to dance and to act, and tonight she would do all three.',
          correct: true,
          feedback:
            'Yes. "To sing, to dance and to act" repeats the same pattern.',
        },
        {
          text: 'She wanted singing, to dance, and acting was also something she wanted.',
          correct: false,
          feedback:
            'Three different patterns make the sentence hard to follow.',
        },
      ],
    },
    practicePromptId: 'g1112-archive-letters',
    reflection:
      'Where did you use a short sentence or fragment on purpose? What effect does it create?',
    exitCheck:
      'Mark one long sentence and one short sentence that work together.',
    review: PILOT,
  },
  {
    id: 'g1112-cite-consistently',
    version: 1,
    band: '11-12',
    skillId: 'conventions.mechanics',
    title: 'Clean, consistent citation',
    minutes: 12,
    objective:
      'I can proofread carefully and refer to every source accurately and consistently.',
    explanation: [
      'Choose one way to name each source and keep it: "the media-lab study" in every paragraph, not "the study", then "Source 1", then "the researchers". Consistency helps the reader track who said what.',
      'Check every number, name and quotation against the source. A misquoted number is a factual error, not just a typo.',
      'Proofread last, in passes: sentence boundaries, then quotations and citations, then spelling.',
    ],
    model: {
      text: 'The media-lab study found that false posts spread faster than accurate ones “in their first six hours.” According to the platform’s published explanation, fact-check labels take “one to three days.” The media-lab study’s timeline and the platform’s explanation together show why corrections arrive late.',
      annotations: [
        'Each source keeps the same name every time it is mentioned.',
        'Quotations match the source exactly.',
        'Each sentence is complete and correctly punctuated.',
      ],
    },
    nonExample: {
      text: 'The study found false posts spread faster “in the first six hour’s”. Source 2 says fact checks take “1-3 day”. The researchers and the platform shows why corrections are late.',
      whatIsMissing:
        'The sources are named inconsistently, the quotations are inaccurate, and "the researchers and the platform shows" is a subject–verb agreement error.',
    },
    guided: {
      question: 'Which sentence has correct subject–verb agreement?',
      options: [
        {
          text: 'The data from both sources suggest that recovery takes years.',
          correct: true,
          feedback:
            'Yes. "Data" is plural in formal writing, so "suggest" agrees (though "data suggests" is widely accepted).',
        },
        {
          text: 'Each of the reefs were monitored for a year.',
          correct: false,
          feedback: '"Each" is singular: "Each of the reefs was monitored".',
        },
        {
          text: 'The report, along with the fact sheet, show that heat causes bleaching.',
          correct: false,
          feedback:
            'The subject is "the report" (singular), so it should be "shows".',
        },
      ],
    },
    practicePromptId: 'g1112-misinformation',
    reflection:
      'Which proofreading pass found the most errors? Do that one first next time.',
    exitCheck:
      'Check each number and quotation in your draft against the source.',
    review: PILOT,
  },
];
