# Natural Quill: K–12 Writing Studio

Detailed product, learning, UX, and engineering design for a Claude implementation handoff.

Prepared: October 31, 2026. Repository inspected at commit `9e649ca`.

Status: proposed design. This document does not implement the product, certify assessment validity, or confirm AdSense approval. Numerical thresholds below are initial product rules to evaluate in a pilot, not established educational norms.

## 1. Product decision

Make Natural Quill a writing practice platform where students develop their own writing through short lessons, original prompts, targeted AI feedback, revision, and repeated practice. Keep the existing natural converter as the second product, named **Writing Converter**, under `/tools/rewrite`.

Suggested positioning: **“Practice writing. Get useful feedback. See your progress.”**

Primary homepage action: **Start writing practice**. Secondary action: **Open Writing Converter**. A visitor should immediately understand that learning to write is the main purpose.

The learning promise is a useful next step: “Find what to practice next and build your writing skills.” Avoid promises to determine a student's exact grade level, diagnose a disability, guarantee school grades, or make writing undetectable by AI detectors.

The product should answer five questions:

1. What can this student already do, based on actual writing?
2. What is one useful skill to practice next?
3. What instruction and example will help?
4. Did the student's own revision improve that skill?
5. Can the student demonstrate it again on a different task with less help?

### Planning assumptions

- Initial language: English. Use US grade expectations and versioned Common Core mappings as the starting curriculum reference; support alternative standards later. This is a planning assumption, not a claim that Common Core applies everywhere.
- Full destination: kindergarten through grade 12. First controlled pilot: grades 3–8, with separate grades 3–5 and 6–8 content. K–2 and 9–12 require their own experiences and release gates.
- Initial commercial entry: families and a small number of verified school partners. A teacher declaring a role does not itself authorize collection of children's data.
- AI evaluation is formative guidance. Teachers and parents can review, correct, and override recommendations. Schools retain responsibility for official grades and placement.
- Student practice, onboarding, assessments, and portfolios are free of advertising and marketing trackers. The existing AdSense plan must be reconsidered for the new audience.
- Student text is private by default. There is no public student gallery, open chat, peer messaging, or public leaderboard in the first release.

## 2. What exists and what must change

The repository already has a Next.js 16.2.4 / React 19 frontend, a NestJS API, Supabase authentication on the frontend, TypeORM persistence with Postgres support, Stripe integration, and writing UI components. These are reusable foundations; they are not yet a student learning system.

| Existing path | Observed purpose or issue | Design action |
| --- | --- | --- |
| `frontend/src/app/page.tsx` | Home renders `HumanizerWorkspace` and converter marketing | Replace with the learning homepage; move converter to its own route |
| `frontend/src/components/HumanizerWorkspace.tsx` | Full rewrite experience, generation, billing and user controls | Retain behind role and mode policies; do not use as the student lesson editor |
| `frontend/src/components/RichTextEditor.tsx`, `TextInputPanel.tsx` | Editor components worth reviewing for reuse | Build a smaller student wrapper with accessible controls, draft saving and feedback anchors |
| `frontend/src/components/RevisionAudit.tsx`, `frontend/src/lib/compareDrafts.ts` | Visible number/citation comparison | Reuse as an optional revision aid; it is not a writing evaluator |
| `frontend/src/components/SiteNav.tsx`, `SiteFooter.tsx` | Converter-first navigation | Create public, learner, adult and converter navigation variants |
| `frontend/src/app/layout.tsx` | AdSense, GTM and GA load globally, including a GTM iframe | Remove tracking from the shared root; use explicit route and audience policies before any new student flow |
| `frontend/src/lib/analytics.ts` | Broad event payload function | Replace student telemetry with an allowlisted first-party event interface |
| `backend/src/rewrite/rewrite.controller.ts` | Accepts `userEmail`; admin handling checks a submitted email; no auth guards observed in inspected source | Introduce verified identity and authorization before introducing student records; migrate legacy endpoints too |
| `backend/src/app.module.ts` | Production TypeORM uses `synchronize: true` and `rejectUnauthorized: false` | Use reviewed migrations and verified database TLS configuration before student launch |
| `backend/src/main.ts`, `backend/api/index.ts` | Both allow reflected CORS origins with credentials | Share an explicit origin allowlist and request validation configuration |
| `backend/src/rewrite/rewrite.service.ts` | Persists manuscripts and uses text/options cache keys | Give learner records explicit ownership and retention; prohibit cross-learner draft/feedback caching |
| `app/db/migrations/` | Historical Python-side SQL migrations also exist | Inventory the actual hosted schema; establish one migration owner for new learning tables |

These are source observations from this planning pass, not a new penetration test or a claim about current production exploitability. Do not add child data to the existing email-based request pattern. No implementation or deployment was performed for this design.

## 3. People, roles, and access

| Role | Main needs | Access boundaries |
| --- | --- | --- |
| Student | Practice, feedback, a clear next step, confidence | Only their own permitted learning workspace; no billing or adult controls |
| Parent/guardian | Create learner profiles, authorize use, understand progress | Linked learners only; consent, export and deletion flows with custody/access rules |
| Teacher | Assign practice, review drafts, correct AI feedback | Verified organization membership and active class roster relationships |
| School administrator | Roster and policy management | Own institution; no default unrestricted reading of every student's draft |
| Curriculum editor | Create prompts, rubrics and lessons | No production student essays unless separately authorized for a specific review |
| Support administrator | Resolve issues | Audited, time-limited access; ordinary support uses metadata, not draft contents |

Allow one adult to hold parent and teacher roles, but require an explicit workspace switch. Never merge access just because two people share a school domain or a learner's name matches.

For school-managed accounts, define who controls records, who can authorize disclosure, and how parent access is verified. Do not link a parent to school records using a student-entered email alone. Handle school transfer, removed teachers, guardian changes, and students reaching adulthood as explicit access changes.

## 4. Information architecture

### Public website

- `/`: writing practice homepage.
- `/how-it-works`: assessment, lessons, feedback and revision explained with synthetic examples.
- `/curriculum`: grade bands, skill map, genre coverage and available lessons.
- `/prompts`: reviewed public prompt previews, searchable by grade and purpose.
- `/for-parents`, `/for-teachers`: adult explanations and onboarding entry points.
- `/tools/rewrite`: the existing converter, the secondary function.
- `/ai-phrase-checker`, `/revision-audit`: supplementary tools with accurate limits.
- `/blog`: useful adult-facing guides; retain good existing articles and update internal links.
- `/privacy`, `/student-privacy`, `/terms`, `/accessibility`, `/support`.
- `/pricing`: clearly distinguish learning plans from legacy converter word packs.

### Learner workspace

- `/learn`: today's recommended practice and continue-draft action.
- `/learn/start`: safe onboarding and learner profile selection.
- `/learn/check-in/[sessionId]`: initial assessment and later checkpoints.
- `/learn/plan`: current goals and short practice schedule.
- `/learn/lessons/[lessonId]`: one focused lesson.
- `/learn/practice/[assignmentId]`: prompt, planning, draft and revision.
- `/learn/feedback/[submissionId]`: reviewed feedback and revision entry.
- `/learn/progress`: skill evidence over time.
- `/learn/portfolio`: private selected drafts and reflections.

### Adult and administration workspaces

- `/family`: linked learners, permissions and progress.
- `/teach`: classes, assignments, feedback queue and class skill summaries.
- `/teach/review/[submissionId]`: teacher correction and approval.
- `/admin/curriculum`: versioned editorial workflow.
- `/admin/evaluations`: restricted AI quality review using approved data.

Student and adult private pages require authentication and authorization, `noindex`, and suitable private/no-store response caching. Robots rules are not an access-control mechanism. Only public reviewed content belongs in the sitemap.

## 5. Homepage and visual design

The new homepage should contain, in order:

1. Brand and navigation: Practice, Curriculum, For Parents, For Teachers, Writing Converter, Sign in.
2. Hero: “Build your writing skills, one draft at a time.” Explain prompts, feedback and practice in two sentences.
3. Primary CTA: “Start writing practice.” Secondary CTA: “Explore a sample lesson.” Smaller converter link.
4. Three-step illustration: write a sample → get a practice plan → learn and revise.
5. Grade-band cards: K–2, 3–5, 6–8, 9–10, 11–12. Clearly label unlaunched bands as previews; do not funnel users into nonexistent functionality.
6. A working synthetic demonstration of useful feedback, with original and student-revised sentences.
7. A short curriculum preview and parent/teacher explanation of how AI is checked.
8. A secondary Writing Converter card for existing visitors.
9. Plain-language privacy, accessibility and support links.

Use a calm light writing surface, dark readable text, one blue/teal action color and restrained celebratory accents. Reuse the Quill mark and bundled fonts. Avoid the current dense control-panel appearance in the student experience. Do not make older students use a childish interface.

Draft width: approximately 65–75 characters per line on desktop. Default student text at least 18px with adjustable size and spacing. On tablets/mobile, prompt, writing and feedback become separate tabs; the editor retains the most room. Desktop may use a collapsible prompt column, editor, and feedback panel. Avoid decorative animations while students read or type.

Target WCAG 2.2 AA, including keyboard access, visible focus, meaningful labels and accessible error feedback; verify with assistive technology rather than relying only on an automated scan. This is a design target, not a certification. [WCAG 2.2](https://www.w3.org/TR/WCAG22/)

## 6. Grade and learner profile

Collect **enrolled school grade** separately from **observed writing skills**. An enrolled grade is used to choose appropriate topics and reference rubrics; it is never overwritten when a student struggles.

Minimum learner profile:

| Field | Purpose and handling |
| --- | --- |
| Display alias | Friendly name; full legal name unnecessary for family practice |
| Enrolled grade | K, 1–12, or ungraded; adult confirms when appropriate |
| Curriculum profile | Initially US English; later jurisdiction and standards version |
| Age eligibility band | Under 13, 13–17, 18+ or unknown, determined by an approved flow; grade cannot substitute for age |
| Practice goal | Examples: clearer paragraphs, stories, school essays, supporting opinions |
| Interests | Optional fixed choices; skip available; no sensitive profiling |
| Weekly availability | Suggested 2–4 short sessions; adult or student may change |
| Support preferences | Read-aloud, dictation accommodation, enlarged text, extra time; avoid collecting disability diagnoses |
| Language support | Optional indication that English is an additional language; used for scaffolding, not score penalties |
| Authorization context | Family or school, permitted processing, consent record/version, status |

Do not request school grades/transcripts, exact birth dates, addresses, photographs, disability records or demographic profiles for personalization. If an approved verification process requires extra information, isolate it from the learning profile and minimize retention. School SSO identifiers and actual school names belong only in the school integration when needed.

Onboarding flow: choose role → adult/school authorization or approved eligible self-signup → learner profile → explain privacy and AI limits → choose starting assessment or explore static example → save a starting plan. Unknown authorization permits only static, synthetic examples; no remote free-text collection or AI evaluation.

## 7. A starting assessment that produces useful evidence

Student-facing name: **Writing Check-in**. Adult-facing description: **Starting writing assessment**. “Diagnostic” means identifying instructional needs here; it must not suggest a medical evaluation or a validated disability screener.

### Assessment design

Use multiple small pieces of evidence, preferably across two sessions:

1. A short comfort/input check, separate from skill scoring: can the learner use this input method and understand the directions?
2. One independent narrative or explanatory response appropriate to the grade band.
3. A different independent response, including an opinion/argument or source-based task where appropriate.
4. A small revision task, using a supplied sample or an earlier response. Record this as revision evidence, not another independent essay.
5. Optional follow-up only when a key skill remains unobserved or results conflict. After at most two follow-ups, offer a provisional plan and adult review instead of an endless test.

Show the task's success criteria before writing. Do not show model answers or rewriting help during the independent part. Retain accessible directions, read-aloud and agreed accommodations; record assistance mode so the system does not interpret dictation as spelling evidence. A student can pause, skip, or ask an adult for help without receiving a failure label.

| Band | Appropriate starting evidence | Suggested session length, not a timer |
| --- | --- | --- |
| K–2 | Picture response, sequence of events, oral explanation transcribed by an adult, labels and emerging sentences | 5–10 minutes with adult support |
| 3–5 | Short story or explanation, supported opinion, small revision task | Two sessions of roughly 10–15 minutes |
| 6–8 | Organized explanation, argument using a short supplied source, revision/reflection | Two sessions of roughly 15–20 minutes |
| 9–10 | Claim and evidence, organization across paragraphs, treatment of another position | Two sessions of roughly 20 minutes |
| 11–12 | Synthesis of supplied sources, qualification, audience and argument choices | Two sessions of roughly 20–25 minutes |

Do not make word count or typing speed a pass criterion. Guidance such as “try a paragraph” helps students begin, but short meaningful writing can still show a skill. An incomplete response means insufficient evidence, not automatically low ability.

Kindergarten needs a distinct design: the standards include drawing, dictating and writing. A typed essay test would miss much of the intended construct. The early-years release must separate composition, transcription and handwriting observations. [Kindergarten writing standards](https://www.thecorestandards.org/ELA-Literacy/W/K/)

### Example initial report

> Your ideas are easy to follow. You gave a clear opinion and a reason. Next, practice explaining how an example supports your opinion. We have two writing samples so far. We need another task before saying much about source use.

Adult detail might show:

- Enrolled grade: 6.
- Current focus: explaining evidence and paragraph development.
- Organization: demonstrated on two tasks with light support.
- Source use: not enough evidence.
- Suggested plan: three 15-minute sessions per week for two weeks, then a new independent check-in.

Do not output “Grade 4.7 writer,” an IQ-like score, a percentile, an academic track assignment, or a disability label. Grade-equivalent claims require an independently validated instrument and representative norms that this product does not have.

## 8. Skill model and rubrics

Use a common skill taxonomy, with grade/genre-specific descriptors and examples:

| Skill family | Observable evidence |
| --- | --- |
| Purpose and ideas | Responds to the task; develops a clear focus |
| Organization and cohesion | Logical grouping, sequence, connections and ending |
| Development and elaboration | Specific details, examples, explanation, narrative development |
| Reasoning and evidence | Supports a claim and explains the relationship between evidence and claim |
| Sentence construction | Complete/controlled sentences, relationships between ideas, purposeful variation |
| Word choice and audience | Precise language and suitable register without requiring ornate vocabulary |
| Conventions | Applicable spelling, punctuation, capitalization and grammar |
| Revision and reflection | Makes purposeful changes and can describe their effect |
| Source use | Accurate use of provided material, attribution and synthesis when the task requires it |

Not every skill is applicable to every task. Source use on a personal narrative is `not_applicable`; an absent response is `insufficient_evidence`. Neither receives a zero. Avoid double-penalizing a single issue across multiple dimensions.

Internal rubric scale, anchored to the specific task and grade-band rubric:

- `1 — Needs substantial support`: relevant skill is attempted but repeatedly breaks down.
- `2 — Developing`: some successful evidence; substantial inconsistency remains.
- `3 — Demonstrated for this task`: meets the stated descriptor with appropriate support conditions.
- `4 — Extends the target`: purposeful control beyond the basic task expectation.
- `null`: not applicable, insufficient evidence, or evaluation unavailable; record the reason.

These are ordinal categories, not evenly spaced measurements. Do not average them into a universal writing percentage. The student interface emphasizes strengths, a next step and concrete evidence; numeric rubric details are available to adults where useful.

For each grade/genre/skill combination, store descriptor text, prerequisites, annotated exemplars, acceptable variations, common misconceptions and exclusions. Keep enrolled-grade task expectations separate from the difficulty of a remedial lesson.

### Sample grade 6 rubric: explaining evidence

| Category | Descriptor |
| --- | --- |
| 1 | Gives a claim with little relevant support, or repeats the claim as its explanation |
| 2 | Gives a relevant example or source detail but leaves the connection mostly unstated |
| 3 | Explains how a relevant detail supports the claim |
| 4 | Explains the connection and addresses a meaningful limitation or competing explanation when appropriate |

This is a proposed instructional rubric, not a standardized score scale. Curriculum experts must refine and test anchors. Grade 6 argument and explanatory writing provide a reference for the initial mapping; high-school tasks require different expectations. [Grade 6](https://www.thecorestandards.org/ELA-Literacy/W/6/), [Grades 9–10](https://www.thecorestandards.org/ELA-Literacy/W/9-10/)

### Evidence quality instead of invented confidence

Store a deterministic evidence-quality category: `limited`, `developing`, or `supported`. Base it on applicable independent samples, task coverage, assistance conditions, checks for grader disagreement and adult review. A model's self-reported certainty is not a calibrated probability.

Do not show progress across incompatible rubric versions as a continuous score. Keep historical versions visible, run bridging/calibration before changing a scoring model, and explain discontinuities.

## 9. Personalized training plan

The plan selects from approved curriculum. AI can explain the recommendation or adapt phrasing, but it cannot silently invent the curriculum, standards, mastery rules or student level.

Suggested plan structure:

- One main goal and one maintenance goal.
- Two-week horizon with 2–4 sessions each week, adjustable by the learner or adult.
- Each session lasts roughly 10–20 minutes for the pilot, with pause/resume.
- A mixture of a familiar skill, a current target, and occasional transfer to a new prompt.
- A short independent checkpoint after the sequence.
- An explanation: “We chose this because your last two drafts included examples but did not explain how they support the claim.”

### Initial recommendation rules

1. Exclude evidence that is inapplicable, too limited, or based on full rewriting help.
2. Identify prerequisite gaps that prevent the learner from attempting the current task.
3. Prioritize recurring needs across separate prompts over a single weak response.
4. Select one main target with an available, reviewed lesson at a suitable reading level.
5. Add a maintenance activity for a previously demonstrated skill.
6. Choose a fresh prompt matching the learner's permitted interests; randomize within equivalent task sets.
7. Explain the selection and allow adult override or student choice between two equivalent topics.

Proposed state machine for each skill: `not_observed → starting → practicing → demonstrated → transfer_check_due`. A tentative “demonstrated” rule is performance at category 3 or 4 on two distinct independent prompts on different days, using comparable rubrics. It is a pilot heuristic; an educator can override it. Multiple rewrites of one essay count as revision practice, not multiple independent demonstrations.

If the student struggles twice, reduce task complexity or add modeling, not merely more identical tasks. If they succeed, fade the scaffold before increasing difficulty. A missed week produces a gentle restart, not lost points or a broken streak warning.

## 10. Lessons and daily learning loop

Use explicit instruction, examples, practice and reflection. The IES elementary guide supports teaching the writing process and foundational writing fluency; the secondary guide recommends a Model–Practice–Reflect cycle. These support the instructional design, not a claim that AI tutoring itself has been proven effective. [Elementary writing guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/17), [Secondary writing guide](https://ies.ed.gov/ncee/wwc/PracticeGuide/22)

Every lesson contains:

1. A student-friendly objective: “I can explain how my example supports my opinion.”
2. A short explanation and annotated original example.
3. A non-example with a specific explanation of what is missing.
4. One guided practice interaction with immediate, bounded feedback.
5. An independent writing task on a different topic.
6. A revision opportunity focused on the target skill.
7. A reflection question: “What did you change, and why?”
8. An exit check and scheduling rule for later independent practice.

Content should be useful without AI: examples, instructions, organizers and self-checks remain available when the model is down. AI adds draft-specific feedback; it is not responsible for every page of a lesson.

### Complete example lesson: Explain your evidence

Audience: grades 6–8. Target: connect a detail to a claim. Duration: around 15 minutes.

**Mini-lesson:** A detail tells the reader what happened. An explanation tells the reader why that detail supports your point. After a detail, ask: “How does this help my reader understand my claim?”

**Original model:** “The library should open a quiet study room at lunch. In our invented class poll, 12 students said they could not find a quiet place to read. A separate room would give those students somewhere to focus without asking the whole cafeteria to be quiet.”

**Annotation:** The first sentence states the claim. The second gives a fictional example. The third explains the connection. The invented poll is only an instructional example; students must not present it as real evidence.

**Non-example:** “The library should open a study room. Twelve students want it. This proves it is good.” Ask the learner what the last sentence fails to explain.

**Guided task:** Choose which of three explanations connects a provided detail to the claim. Explain the choice in one sentence. Wrong answers receive a hint about the missing connection, then another attempt.

**Independent task:** Read this fictional school-planning note: “The art club and gardening club each have 20 members. The school has one spare room. The art club needs a dry place to store work. The gardening club meets outdoors but needs a shelf for tools. The room can be divided, but each club would have less space.” Recommend a use for the room. Use one detail and explain how it supports your recommendation. More than one answer is defensible.

**Feedback limit:** One specific strength and one next step about the evidence connection. Do not grade unrelated advanced vocabulary or demand a counterargument unless it was part of the published task.

**Revision:** Student adds or changes their own explanation. The coach asks a question before offering a different-topic example.

**Exit check:** Underline the detail and the sentence explaining why it matters. Reflection: “How did your explanation help the reader?”

**Later transfer:** A fresh prompt about choosing a club activity, with new evidence and no sentence frame.

## 11. K–12 curriculum scope

| Band | Main learning work | Practical tools |
| --- | --- | --- |
| K–2 | Oral composition, picture sequence, labels, sentences, simple opinions and information | Picture sequencer, adult transcription, read-aloud, sentence builder, drawing/handwriting activities |
| 3–5 | Paragraph focus, relevant detail, sequencing, reasons, basic revision | Paragraph organizer, story planner, reason/example builder, sentence combiner, editing checklist |
| 6–8 | Claims, evidence explanation, paragraph coherence, source-based writing, revision choices | Evidence organizer, paragraph map, source-note cards, revision comparison |
| 9–10 | Sustained argument, counterclaims, source evaluation, audience and style | Argument map, counterclaim workshop, citation practice with supplied sources |
| 11–12 | Synthesis, qualification, nuanced reasoning, independent process and revision | Multi-source matrix, qualification checklist, revision rationale and portfolio |

Full coverage means separate K, grades 1–8, 9–10 and 11–12 mappings; a shared band is a UX grouping, not permission to apply one rubric to every grade. Use tags for opinion/argument, informative/explanatory, narrative and practical everyday writing.

Starter prompt examples (newly authored here):

| Band | Prompt 1 | Prompt 2 |
| --- | --- | --- |
| K–2 | Look at three reviewed pictures of a seed growing. Tell or show what happens first, next and last. | Choose a classroom activity you like. Draw or write one reason someone might enjoy it. |
| 3–5 | Explain how someone could organize a crowded desk so materials are easier to find. | Write a story in which a character solves a small problem by asking a useful question. |
| 6–8 | Use the fictional room-planning note above to support a recommendation. | Explain how a group can divide a project fairly, including one example of a problem and solution. |
| 9–10 | Use two reviewed, supplied sources about a community design choice to support a position and consider a competing view. | Revise a confusing set of instructions for a younger audience and explain two decisions. |
| 11–12 | Synthesize supplied sources that disagree on a school policy; make a qualified recommendation. | Write an explanation for two audiences, then justify what changed and what remained accurate. |

Do not generate prompts that require disclosures about family income, religion, trauma, immigration, health or private relationships. Fictional alternatives and topic switching should always be available. Source-based tasks must include the actual source material and rights information, not links students cannot access.

### Content inventory for the first pilot

Target 24 complete reviewed lessons: 12 for grades 3–5 and 12 for 6–8. Within each band: three idea/organization lessons, three development/evidence lessons, three sentence/convention lessons and three revision/audience lessons. Every lesson has explicit grade variants where expectations differ.

Target 72 reviewed prompt variants: 36 per band, including narrative, explanatory and opinion/argument tasks. Reserve a separate checkpoint set so assessments do not reuse practiced prompts. Author and review the exemplars and rubrics before publishing; counts are staffing targets, not educational validity thresholds.

K–2 expansion requires original/licensed picture sets, adult guidance and separate composition/transcription observation rules. Grades 9–12 expansion requires curated source sets and expert review of argument/synthesis rubrics. Do not label these bands fully available until their complete learning loop has been tested.

## 12. AI feedback design

The student's submission is data, never an instruction to the evaluator. Feedback should refer to exact evidence in the draft and ask for a manageable next action.

Default student response:

- One or two specific strengths, each tied to the writing.
- One primary improvement target, with at most one optional secondary target.
- One short explanation of why the change would help a reader.
- A question or hint that helps the student make the change.
- Optional example on a different topic, revealed after the student asks for more help.
- A visible reminder that feedback may be mistaken and a “This feedback seems wrong” action.

Example for the sentence “The club should meet outside because it is good”:

> You made your recommendation clear: “The club should meet outside.” Your reason is still broad. What could students do outside that they could not do in the classroom? Add one specific example, then explain why it matters.

Do not respond with a rewritten essay. Do not equate a dialect, multilingual influence, short sentences or simple vocabulary with poor ideas. Teach the conventions appropriate to the task while preserving voice. Do not use AI-authorship scores or accuse a learner of cheating based on a detector, paste event or style change.

### Evaluation pipeline

1. Authenticate the actor, authorize the learner relationship, check permitted processing and usage allowance.
2. Save an immutable submission version and its canonical text with block IDs; include prompt, rubric and assistance versions.
3. Run basic eligibility checks: empty/incomplete text, supported language, task applicability, input mode and safety handling. Return an understandable non-score state when necessary.
4. Submit only necessary text and context to the approved AI provider: age/grade band, task, rubric descriptors, relevant source material and target skills. Exclude names, school IDs, billing details and broad history.
5. Request structured evidence and ratings, not an unrestricted conversation or hidden chain-of-thought. Tools, arbitrary URLs and database access are unavailable to the evaluator.
6. Validate the response schema, skill IDs, rating range, source IDs and evidence quotes against the exact immutable text.
7. Apply checks for inconsistent ratings, invented evidence, harmful language and unsupported recommendations. Use a second pass or human review only when indicated.
8. Produce age-appropriate feedback from the validated result. Validate the displayed feedback too.
9. Store versions, usage, policy decisions and the result; update learning evidence only if eligible.
10. If validation fails after one bounded repair attempt, show “Your draft is saved; feedback needs another look.” Never fabricate a passing result to complete the flow.

Pin model, prompt, rubric and feedback-policy versions per evaluation. Changing a provider model requires calibration against the existing benchmark set before promotion. An AI provider must be approved for the intended children's-data use, retention and contract terms; do not assume the existing rewrite provider is suitable.

### Suggested response contract

```json
{
  "schemaVersion": "1.0",
  "submissionVersionId": "server-owned-id",
  "rubricVersion": "g6-opinion-v1",
  "status": "evaluated",
  "assistanceMode": "independent",
  "dimensions": [
    {
      "skillId": "evidence.explain",
      "rating": 2,
      "evidenceState": "observed",
      "evidence": [
        {
          "blockId": "paragraph-1",
          "quote": "The club should meet outside because it is good.",
          "occurrence": 1
        }
      ],
      "reason": "The reason is broad and does not explain a specific benefit."
    }
  ],
  "strengths": [{"skillId": "purpose.claim", "message": "Your recommendation is clear."}],
  "nextSteps": [{"skillId": "evidence.explain", "hint": "What activity would work better outside, and why?"}],
  "requiresReview": false
}
```

The server supplies trusted IDs and metadata; the model cannot choose another learner or update permissions. The sample JSON illustrates a shape, not a complete evaluation. Derive highlight offsets server-side after quote matching, using a documented Unicode indexing convention. When the draft changes, show that the feedback refers to the earlier version and remove stale inline anchors.

## 13. Converter as the second function

Keep the converter discoverable in public navigation and in an adult/eligible-user tools area. Preserve existing customers' paid word balances and billing access. A new learning subscription must not silently replace an existing converter purchase.

| Context | Converter behavior |
| --- | --- |
| Public adult/eligible converter user | Existing rewrite tool under `/tools/rewrite`, subject to the new audience and authorization policy |
| Independent check-in/checkpoint | No converter or generated-answer assistance; backend rejects attempts to use learning-session context for rewriting |
| Ordinary student practice | Hints and explanations first; sentence-level comparisons only where the curriculum and adult policy allow |
| Completed practice revision | Optional before/after example with explanation; record assisted mode |
| Teacher demonstration | Can use the converter on synthetic or authorized examples for instruction |

Hide the generic “generate draft” feature from the learning workspace. Enforce these rules on the backend too. A learner who manually uses an external tool cannot be perfectly detected; explain the purpose of independent work and allow an adult-reviewed retry without punitive detector claims.

Assisted writing stays in the portfolio, but does not count as independent mastery evidence. Provide the action “Explain this change” rather than encouraging students to replace their whole draft with AI output.

## 14. Student, parent and teacher screens

### Student dashboard

The first card says what to do today and why: “Practice explaining your examples — about 15 minutes.” Show Continue Draft, Today's Lesson and My Writing. A simple skill strip shows three current goals with evidence dates. Rewards recognize completion, revision effort and reflection; no public ranking or pressure to maintain a streak.

### Practice workspace

Prompt → Plan → Write → Review → Revise → Reflect. The student can move back to planning. Autosave shows Saving, Saved, Offline changes, or Save failed. Submission requires a confirmed persisted version. Do not imply an unsaved draft was submitted.

On shared devices, provide explicit sign out and clear local drafts on account switch. Offer temporary device storage only with a suitable policy and clear explanation; do not leave child writing indefinitely in localStorage. Handle offline edits, conflicts and retry without overwriting newer work.

### Feedback screen

Display the submitted draft beside the feedback. Each note opens the relevant passage. Show only a few actionable notes at a time. “Try revising” opens a new draft version. The learner can dismiss a suggestion with a reason; this is useful review evidence, not defiance.

### Parent dashboard

Show the learner's goals, recently completed work, observed strengths and next steps in plain language. Display uncertainty and assistance conditions. Provide permission controls, export, deletion and practice scheduling. Marketing and billing actions remain in adult space. Do not imply that a parent's purchase improves a child's assessment score.

### Teacher dashboard

Create a class, assign a reviewed prompt or lesson, choose rubric and assistance policy, and review a queue. Show aggregate skill needs only where sample size and classroom privacy permit. Let teachers edit or reject AI feedback, add comments and change the next lesson. A corrected rating appends an override with reason and updates the plan without deleting the original result.

Class feedback summaries must not expose student essays to classmates. Teacher-created prompts need validation and appropriate review; students cannot use arbitrary prompts to obtain unrestricted chatbot access.

## 15. Curriculum authoring and review

Define reusable content records rather than hard-coding every lesson page:

- `skill`: stable ID, family, prerequisites, developmental sequence.
- `standard_mapping`: jurisdiction, version, grade, standard ID, rationale and reviewer.
- `rubric_version`: dimensions, descriptors, examples and applicability conditions.
- `prompt_version`: grade range, genre, task, source passages, target skills, scaffold level, time guidance, rights, review status.
- `lesson_version`: objective, model, annotation, guided activity, practice prompt, reflection and exit check.
- `source_asset`: provenance, license/permission, age suitability, text and immutable version.

Editorial states: `draft → educational_review → safety_and_accessibility_review → approved → published → retired`. AI may draft candidate content, but cannot publish it. Every published item needs a named reviewer and review date. A teacher seeing an old assignment sees the content version that was actually assigned.

Build a seed-data importer that validates references and fails on missing rubric/skill versions. Pilot content may start as reviewed JSON or MDX in version control; a full CMS can follow after the content model works. Never populate the production catalog with hundreds of unreviewed generated pages for SEO.

## 16. Privacy, advertising and child safety

This audience change makes authorization, retention and age-appropriate processing part of the initial design. US COPPA requirements were amended in 2025, with the general compliance date in April 2026. Use current requirements and qualified review before launch. [Final rule publication](https://www.govinfo.gov/content/pkg/FR-2025-04-22/html/2025-05904.htm)

The FTC explains that school authorization has limits and is tied to educational purposes; it is not a blanket substitute for parental consent for unrelated commercial use. The implementation needs an approved family consent flow and, separately, verified school authority and notices. Grade selection or a checked box claiming to be a teacher is insufficient. [FTC COPPA guidance](https://www.ftc.gov/business-guidance/resources/complying-coppa-frequently-asked-questions)

School records may also trigger FERPA obligations and institutional contract requirements. Define data roles, access, deletion and permitted use with school partners. The plan is US-first; launching in other jurisdictions requires a separate applicability review. [US Department of Education guidance](https://studentprivacy.ed.gov/sites/default/files/resource_document/file/Student%20Privacy%20and%20Online%20Educational%20Services%20%28February%202014%29_0.pdf)

### Proposed product rules

- No AdSense, GTM, third-party marketing analytics, session replay or remarketing in student or unknown-age learning routes. Initially disable advertising on the new K–12 homepage too.
- Remove the global script injection before inviting learners; hiding ad components is insufficient. Test direct page loads and transitions from old public pages, because already-loaded scripts can persist during client navigation.
- Use route-specific or separate root layouts and, where necessary, a full document navigation. For stronger isolation, evaluate a separate learning subdomain with scoped cookies and an allowlisted CSP. Route groups alone do not isolate cookies or already-executed scripts.
- If adult editorial advertising is retained later, verify its audience and configuration independently. Do not treat an “adult” label on a page as an adequate age determination.
- No student writing in analytics events, URLs, ordinary logs, error reports, support telemetry or advertising systems.
- No use of student writing to train models by default. Evaluate provider contracts, subcontractors, data residency and retention; do not equate an API setting with a complete privacy program.
- Parent/school permissions are versioned and revocable. Revocation stops new evaluation jobs and triggers the appropriate retention/deletion workflow.
- First-party telemetry records only necessary events, such as lesson completion, evaluation failure code and duration bucket, using access-controlled IDs and short retention.

### Proposed retention schedule for review

Drafts and feedback: while the account/educational purpose is active, with adult export/deletion controls; review inactive accounts after 12 months and notify before removing unneeded data. After a valid deletion request, target removal from active systems within 30 days and expiring backups within 90 days, subject to applicable record obligations and provider capabilities. These are proposed service commitments to validate, not legal deadlines.

Queue payloads: keep only as long as the job and bounded retry period require. Operational logs: about 30 days, without student text. Authorization and audit records: a separate documented schedule justified by obligations. Maintain a deletion inventory spanning drafts, evaluations, object storage, queues, caches, vendors and backups; restored backups must reapply deletion tombstones.

### Sensitive writing and safeguarding

Use reviewed prompts and an age-appropriate output filter. Writing may contain fictional violence, personal distress, abuse disclosures or private information. Do not automatically treat a story as a real disclosure or send accusations to adults. Provide a carefully reviewed supportive response and a restricted human-review route for cases requiring attention. Define who actually monitors that queue, its hours, response expectations and jurisdiction-specific responsibilities before enabling it. Never promise emergency monitoring or confidentiality the product cannot provide.

Warn students gently not to include addresses, passwords or other identifying details. Redact identifiable context before model processing where feasible, while acknowledging automated redaction is imperfect. Do not silently lower a writing score because the content was sensitive; separate safety handling from instructional evaluation.

## 17. Proposed engineering architecture

Reuse the current Next.js frontend and NestJS backend. Do not add a second learning backend in the historical Python directory. Use one Postgres schema/migration ownership strategy for the new product, with Supabase Auth as the existing authentication foundation where appropriate.

```text
Next.js public / learner / adult interfaces
                  |
     verified session + request validation
                  |
NestJS learning API: authorization and policy checks
       |                         |
Postgres + private storage   durable evaluation job queue
                                 |
                         bounded background worker
                                 |
                        approved AI provider adapter
                                 |
                  validation -> feedback -> learning evidence
```

Suggested modules: Auth, Authorization, Learners, Consent, Curriculum, Assessments, Drafts, Evaluations, LearningPlans, Classrooms, Progress, Privacy and LearningBilling. Keep Rewrite/Stripe functions behind explicit legacy entitlements and audience policies.

Vercel request handlers must not start fire-and-forget work. Submit a durable job and return a job ID; a worker on an appropriate runtime processes it. The queue product can be selected after deployment/operations requirements are checked. Do not introduce Redis merely to run one synchronous model call; select managed infrastructure based on retry, privacy and worker needs.

### Identity and authorization

- Verify JWT issuer, audience, signature and expiry on the server, or validate an opaque application session server-side. Derive actor ID and roles from trusted records.
- Family children use adult-created learner identities. A supervised learner session is scoped to one child and cannot call adult or billing endpoints; switching to adult controls requires reauthentication. Do not place the guardian's unrestricted token in the child's workspace.
- School learners use individually authorized identities through a roster or approved SSO integration. A reusable class code is an enrollment aid, never a credential that reveals class records.
- Use organization IDs plus membership and ownership checks for every object lookup. The client cannot choose its tenant, paid status, admin role or data owner by submitting an email.
- RLS protects direct database access where applicable. Server/service-role connections may bypass it, so API authorization remains mandatory. Test both access paths.
- Cookie sessions need appropriate HttpOnly/Secure/SameSite settings and CSRF protection for unsafe methods; bearer-token routes require equally explicit origin and storage decisions.
- Rate-limit by actor, authorized learner, institution and IP where useful. Limits must not penalize an entire classroom using one network.

### Database and deployment corrections

Inventory actual hosted tables and existing migration history before changing schema. Disable TypeORM schema synchronization in production, introduce migrations with review/rollback plans, and use verified TLS with the platform's supported trust configuration. Add global DTO validation and body-size limits consistently to local and Vercel entry points. Tighten CORS without treating CORS as authorization.

Existing converter access must migrate to verified identity without losing legitimate paid balances. Avoid account linking based on arbitrary supplied emails. Read installed Next.js documentation as required by `frontend/AGENTS.md` before implementing route/layout/auth changes.

## 18. Data model

Use UUID primary keys, timestamps, explicit lifecycle status, foreign keys and ownership columns. For educational records, tenant and learner identity must be checkable without trusting request payloads.

| Entity | Essential data |
| --- | --- |
| `actors` / `actor_roles` | Auth subject, verified roles, status; no email-based admin bypass |
| `organizations` / `memberships` | Institution, member actor, role, verified status, effective dates |
| `learners` | Tenant, display alias, enrolled grade, curriculum, age-eligibility state, status |
| `learner_access` | Verified guardian/teacher/learner relationship, allowed actions, expiry |
| `authorizations` | Learner, authority type, permitted purposes, notice version, verification method, active/revoked timestamps |
| `learner_preferences` | Optional interests, schedule and support settings, not clinical diagnoses |
| `skills` / `standard_mappings` | Curriculum graph and reviewed mappings |
| `rubric_versions` / `prompt_versions` / `lesson_versions` | Immutable published content and rights/review metadata |
| `classes` / `class_memberships` | Organization, teacher relationships, active learner roster |
| `assignments` | Owner, prompt/lesson version, rubric version, assistance policy, optional due date |
| `assignment_recipients` | Assigned learners and individual state; family practice also uses explicit ownership |
| `assessment_sessions` / `assessment_tasks` | Purpose, version, selected tasks, completion and provisional status |
| `drafts` / `draft_versions` | Learner, assignment, ordered content, canonical text, save revision, assistance metadata |
| `submissions` | Immutable draft version and task/rubric snapshot |
| `evaluation_jobs` | Idempotency key, submission, policy context, attempt count, lease, state and failure code |
| `evaluations` / `evaluation_evidence` | Model/prompt/rubric versions, dimension result, verified quote anchors, review status |
| `teacher_overrides` | Original result reference, corrected result, reason, author and audit time |
| `skill_evidence` | Learner, skill, task, rubric, independent/assisted state and quality category |
| `learning_plans` / `plan_items` | Version, goals, selection rationale, approved lessons/prompts, schedule, superseded status |
| `lesson_attempts` / `reflections` | Completion, response versions, eligible learning evidence |
| `privacy_requests` / `audit_events` | Verified request, scoped actions, completion and minimal trace |
| `usage_ledger` / `learning_entitlements` | Adult payer, learner allowance, reserved/consumed/refunded evaluations; separate converter balances |

Published curriculum versions and submissions are immutable; revisions create new rows. Use optimistic concurrency on drafts to prevent silent overwrites. A teacher override is append-only and triggers evidence/plan recomputation. Cross-tenant foreign-key constraints or equivalent verified relationships should prevent a submission from referencing another tenant's learner or assignment.

## 19. API and state contracts

All `/v1` learner endpoints require verified identity, authorization, DTO validation and processing permission. Public published curriculum reads expose no student data.

| Endpoint | Behavior |
| --- | --- |
| `GET /v1/me` | Actor roles, permitted workspaces and policy capabilities |
| `POST /v1/learners` | Authorized adult creates a learner, subject to account/consent rules |
| `PATCH /v1/learners/:id/preferences` | Validated preferences; no self-granted age/role/consent change |
| `POST /v1/assessments` | Start/resume an authorized starting assessment; server chooses approved tasks |
| `GET /v1/assessments/:id` | Task state, pause/resume and provisional result |
| `POST /v1/drafts` | Create an owned draft for an allowed task |
| `PATCH /v1/drafts/:id` | Save with expected revision; conflict returns `409` and recoverable versions |
| `POST /v1/submissions` | Freeze a persisted draft version and enqueue evaluation with an idempotency key |
| `GET /v1/evaluation-jobs/:id` | Authorized polling: queued, running, needs_review, complete or failed |
| `GET /v1/submissions/:id/feedback` | Version-bound validated feedback |
| `POST /v1/submissions/:id/feedback-reports` | Learner/adult flags inaccurate feedback |
| `POST /v1/submissions/:id/overrides` | Authorized teacher correction with reason |
| `GET /v1/learners/:id/plan` | Current version and recommendation reasons |
| `POST /v1/learners/:id/plan-adjustments` | Authorized preference or teacher override, preserved in history |
| `POST /v1/lesson-attempts` | Save responses and completion; completion alone does not grant mastery |
| `GET /v1/learners/:id/progress` | Skill evidence summaries with assistance and rubric versions |
| `POST /v1/privacy/exports` / `POST /v1/privacy/deletions` | Verified async privacy workflow; no public export URLs |

Submission request contains draft/version/task IDs, not scores, owner email, admin flags or model instructions. `202 Accepted` returns `{ submissionId, jobId, state }`. Reusing an idempotency key with identical content returns the same job; a different payload returns `409`. Only validated successful output consumes a billable evaluation under the published allowance policy.

Job state: `queued → running → validating → complete`; alternate terminal/holding states `needs_review`, `failed`, `cancelled`. Use leases and bounded retries for worker crashes; the same submission cannot double-update mastery or double-charge. Check consent and deletion status before provider submission, before persisting results and before any retry. Poll with backoff and a clear saved-draft message; never strand the student behind an endless spinner.

## 20. Evaluation quality and acceptance gates

Build a consented or properly de-identified educator-rated benchmark before making learning-level claims. Synthetic examples are appropriate for software tests and demonstrations but cannot establish performance on real children's writing.

Pilot evaluation design:

- Recruit qualified writing educators to independently score a deliberately varied sample, then adjudicate disagreements.
- Cover each launched grade, genre, performance range and assistance mode, including multilingual learners and relevant input accommodations.
- A proposed first dataset is 120 samples for grades 3–8 (about 20 per grade), double-rated where feasible. This is a feasibility/calibration set, not sufficient evidence for broad fairness or standardized placement claims.
- Compare model/teacher and teacher/teacher agreement by dimension; report exact/adjacent-category agreement, systematic score bias and suitable ordinal reliability metrics. Do not hide weak dimensions behind an average.
- Measure whether highlighted quotes exist, whether feedback is educationally useful, and how often it gives an incorrect correction or writes the student's answer.
- Inspect differences across supported groups only with an appropriate consent/data plan and adequate samples. Do not infer demographics from prose.
- Keep a held-out set, and do not tune prompts on it repeatedly. Model updates must pass regression and educator review before becoming the default.

Product release targets, to negotiate with educators: no unauthorized data disclosures in the test suite; all displayed quote anchors validated; no critical safety failures in the curated red-team suite; at least 90% of audited notes judged accurate and actionable; at least 90% within one rubric category of adjudicated ratings on eligible dimensions. These are proposed operational gates, not validation claims. Report exact agreement, uncertainty and sample sizes alongside the adjacent-category target.

Run a small monitored pilot before broad release. Measure improvement on new, independently written tasks rated blind to condition/time point where possible. A rise in the AI's own scores after AI coaching does not by itself prove learning or product effectiveness.

## 21. Essential test scenarios

1. Student A cannot fetch, save, evaluate or export Student B's work by changing IDs.
2. A former teacher loses class access immediately when membership ends; family and school tenants remain isolated.
3. A learner cannot impersonate an adult/admin by submitting an email, modifying a role field or opening an adult route.
4. No ad/marketing requests occur on direct student entry or after navigation from legacy pages; include iframe, tag-manager and persistent-script checks.
5. Unknown/revoked authorization blocks free-text evaluation; jobs already queued are cancelled or safely discarded according to policy.
6. A prompt injection inside an essay cannot alter rubric, return another learner's data or make the model use tools.
7. Empty text, unsupported language, dictated text, irrelevant sources and insufficient evidence produce correct non-score states.
8. An invented quote, invalid skill ID or out-of-range rating is rejected before display.
9. Duplicate submissions, retries, worker restarts and timeouts cannot double-bill or double-count evidence.
10. The same essay revised repeatedly cannot establish independent mastery; a teacher correction recomputes the plan reproducibly.
11. Autosave conflict, intermittent connectivity, account switch and shared-device sign-out preserve work appropriately without leaking drafts.
12. Keyboard, screen reader, zoom and small-screen workflows support assessment through revision, including understandable error states.
13. Export/deletion includes all documented stores and vendors; backup restore preserves deletions.
14. Converter paid access survives migration; assessment sessions cannot call restricted converter/generation endpoints.
15. A changed rubric/model preserves historical results and is shown as a new evaluation version.

## 22. Monetization and measurement

Recommend a useful free practice tier funded by adult subscriptions and school licensing, with converter purchases remaining separate. Avoid student-facing purchase pressure and advertising-dependent access to lessons.

Proposed packaging to validate with real cost and demand data:

- Free learning: static lessons, organizers, a limited starting assessment and a modest weekly AI feedback allowance after authorization.
- Family: adult-managed multiple learner profiles, greater feedback allowance, progress reports and planned practice.
- School: roster/assignment management, teacher review, organization controls, procurement and support.
- Converter: retain existing word packs/subscription entitlements until a deliberate migration is approved.

Do not promise unlimited AI feedback before measuring per-session costs and abuse controls. Define a session as the allowed draft/revision evaluations, not an arbitrary word pack. Reserve allowance when a job starts, charge once for a valid result, release it on failure. A student can continue static practice when the allowance is used.

Track activation (first completed write-feedback-revision loop), return to practice, independent skill evidence, teacher override frequency, feedback usefulness, accessibility failures and successful draft saving. Track infrastructure spend per completed learning session, not just per model call. Keep retention metrics subordinate to learning; time spent alone is not success.

Suggested initial performance objectives: save acknowledgement typically under 2 seconds on a normal connection; most feedback within 30 seconds, with an asynchronous state for longer jobs; durable recovery for every accepted submission. Validate these targets with the actual provider and runtime. Set daily organization and system budget limits and alerts before launch.

## 23. Implementation order and release scope

| Milestone | Deliverable | Exit gate |
| --- | --- | --- |
| 0. Architecture and policy foundation | Hosted-schema inventory, auth/role model, adult authorization flow, script isolation, provider/data decisions, migration plan | Reviewed security/privacy design and tests using synthetic data; no child pilot yet |
| 1. Product shell and converter relocation | New public homepage, role-specific navigation, `/tools/rewrite`, learner dashboard and static lesson preview | Existing converter accounts work; no misleading live feature claims; tracker checks pass |
| 2. One complete learning loop | One grade-6 lesson, one prompt, saved draft, queued AI feedback, revision and reflection | Auth, persistence, jobs, feedback anchors, error states and accessibility work end to end |
| 3. Starting assessment and plans | Multiple task evidence, provisional skill profile, rule-based next lesson, progress history | No false precision; insufficient-evidence and assisted-work cases pass |
| 4. Grades 3–8 pilot | Reviewed catalog, parent access, limited teacher assignments/review, calibration dataset | Educator rubric/feedback review, consent flow, deletion and tenant isolation verified |
| 5. Classroom operations | Verified institutions, roster integrations, assignment workflow, reports and review staffing | Pilot feedback resolves operational and access problems |
| 6. Complete K–12 expansion | K–2 multimodal/adult-supported path and 9–12 source/argument path | Separate curriculum, evaluation and usability gates for each band |

Build a vertical slice in milestone 2 before filling every dashboard and writing a large content library. Do not enable all grades with placeholder rubrics. Release school integrations, audio/OCR uploads, open-ended AI chat and multilingual scoring only through later scoped designs.

Existing users need a visible “Looking for the converter?” link and direct route. Preserve good legacy URLs with relevant content/redirects, update canonical metadata and sitemaps, and avoid redirecting every old article to the new homepage. Keep deployment rollback and database backward compatibility explicit. No change in this design guarantees AdSense approval.

## 24. Definition of done and handoff

The first learning release is ready for a controlled pilot when a properly authorized learner can complete two independent tasks, receive a qualified skill profile, follow a reviewed lesson, write and revise, and later demonstrate the skill on a fresh prompt. An authorized adult can inspect evidence and correct a result. Unauthorized users cannot see the records. AI failures preserve drafts and explain what happened. Child routes do not load advertising or marketing scripts. The converter remains usable as a clearly secondary function with existing paid access preserved.

Code completion, production deployment, educator review, child-data readiness, pilot success, assessment validity and advertising approval are separate milestones. Claude must report each separately with evidence.

See `CLAUDE_K12_IMPLEMENTATION_BRIEF.md` for the ordered implementation instructions and handoff acceptance criteria.
