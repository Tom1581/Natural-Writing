# Writing Studio: architecture and decisions

Status: implemented 2026-11-02 to 2026-11-05, not yet deployed or committed. Builds on `K12_WRITING_PRODUCT_PLAN.md` and `CLAUDE_K12_IMPLEMENTATION_BRIEF.md`; this file records what was actually built and where it differs.

## What students, parents and teachers get

| Area | Built |
| --- | --- |
| Instruction | 24 lessons (12 per band) so that every scored skill has a lesson in grades 3–5 and 6–8. Each lesson has a goal, explanation, model with annotations, non-example, practice question with hints, writing task, reflection, exit check. |
| Practice | 72 prompts (36 per band) in three genres, including 12 reserved checkpoints, (opinion/argument, informative/explanatory, narrative) with success checklists, planning questions, visible rubric, optional fictional source text. 8 sentence-level practice sets (33 items: instant-check choices and self-checked rewrites). |
| Assessment | Two-piece Writing Check-in per band (opinion/argument + narrative) before lessons start. Six skills rated 1–4 per piece, each with a quote from the student’s text. |
| Feedback | Strengths, one or two next steps with a guiding question, suggested lesson, revise-and-resubmit with “up from 2”, reflection, “This feedback seems wrong”, curriculum links. |
| Coaching | “Am I on track?”: checks a draft against its success checklist (met / partly / not yet + a tip). No score; off for check-ins; 6 per draft per day; marks the next submission “coached”. |
| Progress | Skill status (not seen / practicing / shown on 2 prompts), next-step recommendation, assignments, suggested drills, writing history, printable progress report with per-skill history and the student’s curriculum statements, full JSON export. |
| Teachers | Classes, assignments (prompt + optional lesson + due date + note), review queue with flagged items first, level corrections and notes (append-only), class distribution by level (counts, never averages). |
| Students on their own devices | Sign-in codes (`XXXX-XXXX-XXXX`, ~59 bits, hashed at rest) that open a 12-hour session limited to one profile. |
| Grades | Kindergarten to Grade 12 in five bands (K–2, 3–5, 6–8, 9–10, 11–12). Grades 3–8 are available; K–2 and 9–12 are **early access** (full loop works, not yet checked against teacher-rated samples), shown to adults on every result and grade page. |
| Kindergarten–Grade 2 | 3 rubrics (5 skills), 16 picture prompts (14 drawn picture sets, each with a text description the AI and screen readers use), 9 read-aloud lessons, 2 practice sets. A grown-up can type the child’s words (“scribed”: spelling not rated or counted); sound spelling is never called a mistake; feedback is one strength and one next step in short sentences, read aloud. |
| Grades 9–12 | 6 rubrics with a new **Counterclaims** skill; 36 prompts whose argument and informative tasks come with two fictional sources (11–12 sources disagree, for synthesis); 22 lessons (qualified claims, synthesis, counterclaims, syntax for effect…); 4 practice sets. |
| Regions | US (Common Core K–12), Canada (Ontario Language 2023 Grades 1–8, ENL1W 2023 Grade 9, English 2007 Grades 10–12), England (Years 1–13: KS1–KS4 programmes + 2018 KS2 TAF; Years 12–13 shown against KS4 with a note), Australia (v9.0 Foundation–Year 10; Senior Secondary English for Years 11–12 with a note). 804 verbatim statements. Local year names, regional spelling, region picker. |
| Accessibility | Read-aloud (browser speech, regional voice), text size and line spacing, keyboard-operable controls, visible focus, reduced-motion support, print styles. |
| SEO | Prerendered public pages: 13 grade pages (`/learn/grades/kindergarten` … `grade-12`, each with local names, goals, lessons, prompts and that grade’s official statements, plus FAQ JSON-LD), 15 printable rubric pages with scored examples, ~95 public prompt pages (check-ins and checkpoints excluded), 12 guides for parents and teachers (`Article` JSON-LD), lessons, practice sets and curriculum pages. Breadcrumbs (visible + `BreadcrumbList`), `ItemList` on index pages, `LearningResource` on prompts/rubrics/lessons, `WebSite` + FAQ on the home page, per-page Open Graph images, canonical URLs, ~220-URL sitemap. Private pages are `noindex`. |
| Operations | AI usage ledger (tokens per call, purpose, account; no text) with a daily token budget (`AI_DAILY_TOKEN_BUDGET`, default 180,000 for Groq’s free tier): when spent, work is saved and gets feedback after midnight UTC, and the coach rests. Automatic second AI reading (different temperature) for surprising results, added as a note for adults only. Operator metrics page (`/learn/admin/metrics`): budget, tokens per feedback, completed loops, returning students, correction rate, helpfulness. |
| Content review | Invited educators (`CONTENT_REVIEWER_EMAILS`, plus admins) approve or request changes on each item version at `/learn/admin/content`; public pages show “Educator reviewed” with reviewer roles only. |
| Model pieces | 15 annotated examples, one per rubric (`/learn/examples`), each answering a library prompt, rated skill by skill, with numbered notes tied to exact quotes (checked by `validateCatalog()`), “why it works” and a next step. |
| Visual design | Skill icons, grade-band identity colors (validated as a categorical set in light and dark, always paired with a text label), band cards with small scenes on the home page, a kindergarten-to-12 staircase on grade pages, icon feature cards, no-orphan grids. |
| Student work | “Was this feedback helpful?” on every result; a portfolio of chosen pieces with levels and reflections (`/learn/portfolio`, printable). |

## Decisions

| Topic | Decision | Why |
| --- | --- | --- |
| Where it lives | `/learn/*` with its own root layout `src/app/(learn)/layout.tsx`; the converter moved unchanged into `src/app/(site)/`. `global-not-found` (experimental flag) handles unmatched URLs. | Separate root layouts force a full page load between them, so AdSense/GTM/GA never run on learning pages (verified on a production build). Converter URLs and SEO unchanged. |
| Access without a code (2026-11-05) | Anyone can write to any prompt and get feedback without an account (`POST /v1/learning/guest/feedback`, `GuestService`): the draft stays in the browser, and the server stores no text, feedback or identity, only token counts under purpose `guest`. Guests get 5 feedback requests per hour per connection (in memory) and at most 40% of the daily AI budget (`AI_GUEST_BUDGET_SHARE`), so profiles keep getting feedback. Writing that may describe harm shows the student helplines for their country. Students 13 or older can make their own account and one profile for themselves (`relationship: 'self'`, `confirmedAge13`, US grade 7 and up); learning notice bumped to 2026-11-05. | Under-13s can't open saved accounts without an adult (COPPA, UK Children's Code), so they practice as guests, where nothing is collected. The free Groq tier allows roughly 20 guest feedbacks a day at the default share. |
| Home page (2026-11-05) | Writing Studio is the main product: its landing page is the site root (`src/app/(learn)/page.tsx`) and `/learn` 308-redirects there; its other pages stay under `/learn/*`. The converter moved from `/` to `/converter` (`src/app/(site)/converter/page.tsx`) with its title, H1, FAQ and structured data unchanged. A shared product bar (`ProductSwitcher`) lists Writing Studio first and the converter as an optional tool for adults; students signed in with a code never see the converter, in the bar or in the home-page note (`ConverterCallout`). Every converter link, the Stripe cancel/portal return URLs and post-login redirects point to `/converter`. Converter pages share one Open Graph card (`src/lib/converterOgCard.tsx`) through a small `opengraph-image.tsx` in each top-level folder, because Writing Studio owns the root card. | The home page now shows learning, not an AI humanizer. `/` cannot redirect because it has new content, so the converter's rankings move to `/converter` through internal links, the sitemap and Search Console; expect a dip for a few weeks. The home page carries no ads or analytics, and site verification by meta tag is also set in the studio layout. |
| Grades | Grades 3–8 (Years 4–9 in England, Years 3–8 in Australia). | Pilot scope; K–2 and 9–12 need different curricula and inputs. |
| Curriculum alignment | Verbatim statements in `backend/src/learning/content/standards.data.ts` (448 statements, generated by `backend/scripts/standards/` from the official documents); mapping in `frameworks.ts`. `validateCatalog()` fails the test suite if any skill × genre × grade × framework cites a missing statement. | Precise and checkable. |
| Identity | Adults: Supabase JWT verified against the project JWKS (ES256) or `SUPABASE_JWT_SECRET` (HS256). Students: HS256 token signed with `LEARNING_SESSION_SECRET`, issuer `natural-quill-learning`, containing only the learner id. | Ownership keyed on verified ids, never emails. |
| Access rules | One `AccessService`: adults reach only profiles they own; student sessions reach only themselves and cannot create/delete profiles, make codes, export, or use teacher tools. Other people’s records return 404. | Covered by integration tests. |
| AI provider | Groq free tier, one pinned model (`openai/gpt-oss-120b`), JSON mode, no fallback chain. Prompts tell the model the student’s local year, regional spelling and school terms. Template `feedback-v2`, `coach-v1`. | Consistent scoring; switching to a paid tier is an env change (`EVAL_LLM_*`). |
| Validation | Every rubric skill rated exactly once, ratings 1–4 or null with reason, every quote found in the text (offsets server-side). One repair attempt; 4 attempts then `needs_review`, never fabricated feedback. Coach output validated per criterion. | Students never see invented evidence. |
| Mastery | “Shown” = level 3+ on two different prompts on two different days, first drafts written without hints. Revisions and coached pieces are recorded but `independent = false`. Teacher corrections update the evidence. | Pilot rule from the plan. |
| Jobs | Durable `learning_evaluation_jobs` row; the client calls `POST /evaluation-jobs/:id/process`, which runs inside that request under a lease; rate limits re-queue with `retryInSeconds`. | No queue service needed on Vercel’s free tier. |
| Database | 11 `learning_*` tables from migration `1793577600000-LearningTables`. TypeORM `synchronize` is **off** for Postgres; migrations run on startup. TLS verified when `DATABASE_CA_CERT` is set. | Auto-sync can drop columns holding student work. Converter tables untouched. |

## Verification done

- Backend: 77 tests pass (catalog/alignment integrity, quote anchoring, mastery rules, coach validation, auth, ownership, student sessions, autosave conflicts, idempotent submission, retries, revocation, teacher overrides, reports, deletion).
- Migration run against real Postgres (PGlite): all tables created, every entity round-trips; the only schema difference is the cascade foreign keys the migration adds on purpose.
- Live Groq runs (free tier): US grade 7 argument, England Year 8 informative piece (British spelling accepted), Australian coach check — all valid on the first call, ~3 s each.
- Production builds of frontend and backend; headless-Chrome screenshots of the landing, lesson, practice, curriculum, sign-in, and (as a code-signed-in England Year 7 student) dashboard, editor with live coach, feedback and report pages; layout checked at 375 px.

## Accuracy, safety and the two-week plan (2026-11-03/04)

**Content now meets the plan's targets:** 24 lessons (12 per band) and 72 prompts (36 per band, 12 per genre), including 12 checkpoint prompts reserved for independent transfer checks. Library prompts are short specs in `content/prompt-library.ts`; their checklists come from the target skills, so they always match the rubric. Prompts carry interest tags.

**Two-week plan (`plan.ts`):** after the two-piece check-in, the plan picks a main goal (the weakest skill with a lesson, or an adult's chosen focus) and a maintenance goal. It then lays out 4–8 sessions (2–4 a week, set by the student or adult): lesson, practice set, fresh prompts (matched to interests, each with an equivalent alternative), a maintenance prompt, and finally an unseen checkpoint written without the coach. Choices use evidence from before the plan started, so the plan stays stable while items tick off. Skills now move through not seen → practicing → shown → time to check again (after 28 days).

**Wellbeing:** every submission passes a narrow first-person phrase screen (self-harm, abuse by a named adult, threats, personal details), even if the AI is down. The evaluator also returns a separate wellbeing judgment. Either one creates a flag that only the managing adult sees: a dashboard alert, the top of the review queue, and the feedback page, where they mark it handled with a note. The student sees a calm support message with their country's helpline and emergency number, and nothing else. Flags never change ratings, and the evaluator is told not to quote or comment on personal disclosures. The site states plainly that it isn't monitored around the clock.

**Accuracy:** `npm run calibrate` runs the real evaluator over human-rated essays and reports exact and within-one agreement, bias and QWK per skill (see `backend/calibration/README.md`). In the app, adults can confirm ratings as well as correct them, and the operator (`ADMIN_EMAILS`) sees AI-versus-adult agreement at `/learn/admin/quality`. On the 16-essay developer-rated set: within one level 100% in every run; exact agreement 64–83% and QWK 0.67–0.86 across repeated runs of the same template, so a set this small can't separate small template changes. The evaluator now runs at temperature 0 (`EVAL_LLM_TEMPERATURE`) to reduce run-to-run variation.

## Schools, supports, privacy and operations (2026-11-04)

- **Schools:** `learning_organizations`, `learning_org_members` (invited → active → removed, by verified email) and an audit log. School profiles are reached only through active membership: admins see all of the school's students; teachers see students they added or have in their classes. Removing a member ends access immediately, even to students they created. Roster import (names and years only) creates profiles under the school's authority, adds them to a class, and returns printable sign-in codes. School and personal students can't be mixed in one class.
- **Supports (not diagnoses):** English as an additional language (simpler feedback language, no lower ratings for grammar), read-aloud, larger text, and dictation through the browser's speech recognition. Dictated pieces are marked, conventions are not rated, and no spelling evidence is recorded.
- **Privacy:** emails, phone numbers and street addresses are replaced with placeholders before text goes to the AI, and quotes are still matched against the original. `GET /v1/learning/maintenance/retention` (Vercel Cron, `CRON_SECRET`) removes audit events older than 24 months, and removes profiles inactive for `RETENTION_INACTIVE_MONTHS` (off unless set).
- **Second look:** evaluations carry automatic notes (a short piece rated high for development, every skill rated 4, a level dropping 2 after revision, or a repaired AI answer). These appear in the review queue; they never change ratings.
- **Fair use:** 20 submissions per student per day, 400 per account or school per day, and 30 requests per 10 minutes per visitor for the converter's AI tools.
- **Operator tools:** `npm run db:inventory` (read-only check of the live database before deploying), `npm run content:review-sheet` (CSV for educator review), `npm run calibrate`.
- **Public pages:** how it works, for parents, for teachers, accessibility, and a prompt library (check-in and checkpoint prompts are kept out of it).
- **Accessibility:** axe-core reports no WCAG 2.2 A/AA violations on 19 pages (public and signed-in student pages), in light and dark mode. Automated checks don't replace testing with screen-reader users.

## Converter security (2026-11-03)

The converter and Stripe routes used to trust an email sent by the browser. That let anyone claim the admin account, spend another customer's words, read anyone's plan, or open another customer's Stripe billing portal. Now:

- Identity comes only from a verified Supabase session token (`OptionalSupabaseAuthGuard` for the converter, which signed-out visitors can still use for the free trial; `SupabaseAuthGuard` for billing). Emails in request bodies or query strings are ignored.
- Admin access is checked against the verified email (`backend/src/auth/admin.ts`, overridable with `ADMIN_EMAILS`).
- `/stripe/billing-portal`, `/stripe/checkout` and `/stripe/customer-state` require sign-in and act only on the signed-in user's own email; checkout records the verified user id.
- `/rewrite/genesis-scaffold` (writes records; unused by the frontend) requires sign-in.
- Customer emails are no longer written to logs.
- Paid balances are still keyed by email, so existing customers keep their words and subscriptions.
- `src/security.integration.spec.ts` replays the old attacks; all 8 fail against the previous code and pass now.

## Deploying

Backend environment variables (Vercel):

- `SUPABASE_URL`: same project URL as the frontend. **Required for the converter too**: without it, signed-in converter users get “session expired” errors.
- Deploy the frontend and backend together. Between the two deploys, signed-in converter users may briefly be treated as signed out (free trial limits).
- `LEARNING_SESSION_SECRET`: a random string of 32+ characters (enables student codes; without it code sign-in returns “not set up”).
- `CRON_SECRET` (enables the daily retention job) and optionally `RETENTION_INACTIVE_MONTHS`.
- Optional: `AI_DAILY_TOKEN_BUDGET` (raise it with a paid AI plan) and `CONTENT_REVIEWER_EMAILS` (educators who may sign off content).
- Before the first deploy, run `DATABASE_URL=… npm run db:inventory` against production: converter tables should show no differences.
- Optional: `DATABASE_CA_CERT`, `CORS_ORIGINS` (e.g. preview URLs), `EVAL_LLM_BASE_URL` / `EVAL_LLM_MODEL` / `EVAL_LLM_API_KEY`.

The first deploy runs the migration. Afterwards confirm the converter still works (schema auto-sync is now off).

## Before real children use it

1. **COPPA (US) and equivalents** (PIPEDA/provincial law in Canada, UK GDPR + Age Appropriate Design Code, Australian Privacy Act): the notice checkbox records agreement but is not verifiable parental consent. Get legal advice.
2. **Provider terms**: confirm Groq free-tier retention/training terms suit children’s writing; get a data processing agreement.
3. **Educator review**: all content is marked `pilot`. A teacher in each country should review lessons, rubrics and the alignment.
4. **Calibration**: the harness and in-app review exist, but the only benchmark so far is 16 developer-rated essays. Before claiming accuracy, have teachers rate a real, permissioned set (see `backend/calibration/README.md`) and meet the gates on a holdout.
5. **Safeguarding**: flags reach the managing adult, but there is no out-of-hours monitoring and no email or text alert yet. Decide, with legal advice, who responds to urgent flags and how quickly, especially for school accounts, and test the phrase screen on real (permissioned) writing for false positives.

## Not built yet

Other Canadian provinces and Scotland/Wales/Northern Ireland; school SSO (Clever/ClassLink); multilingual feedback; editing content in the browser (content still lives in code; review and sign-off are in the app); handwriting/photo upload for young writers; calibration samples for K–2 and 9–12 (the developer-rated set covers grades 3–8 only).
