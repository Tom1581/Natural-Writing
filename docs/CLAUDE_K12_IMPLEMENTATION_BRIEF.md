# Claude implementation brief: Natural Quill Writing Studio

Read `docs/K12_WRITING_PRODUCT_PLAN.md` first. It is the detailed product and engineering specification. This brief is the execution sequence, not permission to claim the whole product is ready after a frontend build.

## Objective

Make Natural Quill primarily a K–12 writing practice platform with prompts, short lessons, AI formative feedback, student revision, a starting assessment, and evidence-based practice recommendations. Move the existing converter to `/tools/rewrite` as the secondary function and preserve existing paid access.

Design for the full K–12 range. Pilot grades 3–8 first. Treat K–2 as adult-supported early writing and 9–12 as a separate source/argument curriculum. Initial language and standards assumption: English and US grade expectations. Keep standards versioned and replaceable.

## Start by inspecting the actual repository

The planning snapshot was commit `9e649ca`, October 31, 2026. Check the current branch, working tree and remote before editing; preserve unrelated changes. Read applicable `AGENTS.md`, including the instruction to read the installed Next.js documentation before writing code. Do not replace the framework or create another backend by default.

Relevant current files:

- `frontend/src/app/page.tsx`: converter currently owns the homepage.
- `frontend/src/app/layout.tsx`: global AdSense, GA and GTM scripts/iframe.
- `frontend/src/components/HumanizerWorkspace.tsx`: existing converter.
- `frontend/src/components/RichTextEditor.tsx`, `TextInputPanel.tsx`: possible editor building blocks.
- `frontend/src/components/SiteNav.tsx`, `SiteFooter.tsx`: navigation.
- `frontend/src/lib/supabase.ts`: current frontend auth client.
- `frontend/src/lib/analytics.ts`: current unrestricted marketing event wrapper.
- `backend/src/rewrite/rewrite.controller.ts`: client-supplied email identity/admin logic needs replacement.
- `backend/src/app.module.ts`: production schema synchronization/TLS configuration needs review.
- `backend/src/main.ts` and `backend/api/index.ts`: maintain equivalent CORS, validation and authentication behavior.
- `app/db/migrations/`: inventory historical schema work before choosing the authoritative migration location.

The source observations are not a full audit. Verify production schema and configuration before migrations. Do not infer readiness from old audit notes, file names or a successful build.

## Implementation sequence

### 1. Write the implementation contract

Document the selected tenancy/identity design, learner-session model, authorization states, authoritative migration path, AI provider adapter, queue runtime and route/script isolation in a short architecture decision record. Inventory converter billing behavior so migration preserves legitimate entitlements.

Implement tested server authentication and ownership checks first. Do not trust submitted emails, learner IDs, admin flags or paid-tier fields. Scoped learner sessions must not carry the guardian's unrestricted permissions. Configure explicit CORS origins and DTO/body validation in both local and serverless entry points. Replace production schema auto-sync with migrations and use verified TLS.

Family authorization and school authority are separate flows. Develop initially with synthetic data. Do not open a child pilot until authorization, vendor handling and deletion policy are approved and implemented.

### 2. Restructure the site and keep the converter working

Create the new learning-focused public homepage and `/tools/rewrite`. Reuse the converter component where practical. Update navigation, metadata, internal links and public sitemap. Separate shared typography/brand from route-specific marketing scripts. Student and unknown-age learning pages must contain no AdSense, GA, GTM, replay scripts or marketing iframe.

Test cross-navigation as well as cold entry: a script loaded on a legacy page must not remain active in the student workspace. A conditional child component is not enough to undo an already-executed script. Select separate root documents, full navigation or a separate learning origin as appropriate. Keep the learning CSS and UI calmer and simpler than the converter.

### 3. Build one complete lesson before broad dashboards

Implement the “Explain your evidence” grade-6 lesson from the master plan, using its fictional room-planning source. Store versioned skill, prompt, rubric and lesson records with publication states. Implement learner access, assignment creation, draft autosave with conflict protection, immutable submission, durable evaluation job, validated feedback, revision and reflection.

The model receives only the minimum authorized text/context and cannot call tools or decide access. Enforce a structured schema and match every evidence quote to the saved submission. Handle empty/insufficient input, provider failure, malformed JSON, invented quotes, duplicate requests and revoked authorization. Preserve work and explain failures.

Use real integrated behavior in this vertical slice. Stubbed feedback may be clearly labeled in local development, but cannot count as completion or appear as genuine evaluated output in production.

### 4. Add assessment and a deterministic plan engine

Collect enrolled grade separately from observed skills. Use multiple tasks and record accommodations/assistance. Report provisional skill evidence; do not generate decimal grade equivalents, percentiles or disability diagnoses.

Use approved lessons and explicit rules to choose the next practice. Count independent evidence from distinct tasks; revisions of one draft cannot repeatedly increase mastery. Store recommendation reasons and versions. Allow an authorized educator override without deleting original results. Show unobserved skills honestly.

### 5. Add adult workflows and content

Build family progress/export/deletion and verified teacher assignment/review flows. Limit each adult to their permitted relationships and organization. Add curriculum import validation and reviewed content. Then expand to the proposed grades 3–8 catalog with distinct grade descriptors and a reserved independent checkpoint bank.

Publish only content approved through educational, safety and accessibility review. AI-generated draft lessons remain unpublished until reviewed. Prompt count is not a substitute for educational quality.

### 6. Calibrate and pilot

Use synthetic examples for software testing. Use properly authorized real writing and qualified educators for calibration. Compare grader agreement, usefulness, hallucinated evidence and disparities across supported conditions. Keep a held-out set and version models/rubrics. Report sample sizes and uncertainty; do not claim standardized validity from a small pilot.

Release K–2 and grades 9–12 only after their distinct curriculum/input/evaluation gates are met. Do not launch a single generic essay scorer under a K–12 label.

## Proposed file/module organization

Adapt this to installed Next.js conventions and the selected auth layout:

```text
frontend/src/app/
  (public)/                  learning homepage, curriculum, parent/teacher information
  (learning)/learn/          dashboard, check-in, lessons, practice, feedback, progress
  (adult)/family/            linked learners, settings, privacy requests
  (adult)/teach/             assignments, class summary, review queue
  (tools)/tools/rewrite/     existing converter
frontend/src/components/learning/
  LearnerShell, PracticeEditor, LessonPlayer, FeedbackPanel, SkillEvidenceCard
frontend/src/lib/learning/
  contracts, curriculum-types, evidence-types
backend/src/
  auth/, authorization/, learners/, consent/, curriculum/
  assessments/, drafts/, evaluations/, learning-plans/
  classrooms/, progress/, privacy/, learning-billing/
content/learning/            reviewed seed content with immutable published versions
```

Route groups are organization, not a privacy boundary. Do not put marketing scripts in a shared root that wraps learner routes. Only add modules when implementing the corresponding milestone; avoid empty scaffolding that suggests completed capabilities.

## Required implementation behavior

- AI coaches the student's work; it does not replace the whole assignment.
- Feedback includes evidence, one actionable target and a chance to revise.
- Independent assessment mode disables converter/generation on client and server.
- Assisted work is labeled and excluded from independent mastery evidence.
- Model/rubric/prompt versions and immutable submission IDs travel with every result.
- Provider requests and caches cannot expose another learner's work.
- `202` job acceptance is durable; retries cannot double-charge or double-count learning evidence.
- Child privacy applies to URLs, logs, analytics, queues, backups and error reporting as well as database rows.
- Accessibility works across the entire learning loop, not only the landing page.
- Existing converter balances and billing access remain correct after the move.

## Acceptance checks

Run relevant frontend/backend builds and lint/type checks, migration checks, unit tests for plan/evidence rules, API integration tests for ownership and job behavior, and browser tests for the learning loop. Distinguish new failures from existing ones; do not hide them by disabling checks.

Mandatory adversarial cases: another learner's IDs; removed teacher; spoofed email/admin; unapproved school account; revoked consent mid-job; essay prompt injection; invented quote; malformed output; duplicate submission; autosave conflict; provider outage; stale feedback after revision; repeated revisions counted as mastery; marketing scripts surviving navigation; deleted data restored from backup; child session calling billing/converter endpoints.

Use synthetic accounts and writing for development tests. Confirm live behavior in the intended deployment environment before calling a feature deployed. Keep credentials out of commits and logs.

At each milestone, report: implemented behavior, files/migrations changed, tests with outcomes, remaining gates, deployment state and rollback plan. Do not claim “COPPA compliant,” “validated writing level,” “all K–12 supported,” or “AdSense approved” without the corresponding external evidence and review.

## Suggested first assignment to Claude

> Read both K–12 design documents in `docs/`, inspect the current repository and relevant installed Next.js docs, and implement milestones 0–2 as a reviewable vertical slice. Make the learning homepage primary and move the existing converter to `/tools/rewrite`. Establish verified identity, tenant/learner authorization, student-route tracker isolation and versioned content before introducing student data. Build the sample grade-6 lesson through saved draft, durable AI evaluation, validated feedback, student revision and reflection. Preserve existing converter entitlements. Use synthetic data, complete the specified tests, and report unresolved authorization/provider/curriculum review gates. Do not substitute hard-coded scores or unreviewed generated curriculum for working functionality. Do not deploy a public child-data service until its launch gates are met.

After that slice passes, continue assessment/plan and adult workflows using the milestones and acceptance criteria in the master plan. The owner's immediate request was a design handoff; this document itself makes no production changes.
