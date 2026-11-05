# Measuring AI scoring accuracy

The AI's levels are only trustworthy once they agree with experienced teachers. This folder has a harness that measures that agreement, and a small starter set.

## Run it

```bash
cd backend
npm run calibrate -- --file calibration/seed-developer-rated.jsonl --split holdout
```

It runs the real evaluator (the model and template configured in `.env`) on every essay and writes `calibration/report-<split>.md`. Results are cached per essay, model and template in `calibration/.cache-*.json` (git-ignored), so a run interrupted by free-tier rate limits can simply be started again.

Each line of the input file is one essay:

```json
{"id": "t-001", "promptId": "g68-spare-room", "curriculum": "uk-eng", "gradeLevel": "7", "split": "holdout", "rater": "teacher-a", "text": "…", "human": {"purpose.claim": 3, "development.evidence": 2}}
```

- `promptId` must be a Writing Studio prompt; the essay is rated on that prompt's rubric.
- `gradeLevel` is the US-equivalent grade ("3"–"8"); England Year 7 = "6".
- `human` can rate any subset of the rubric's skills on the 1–4 scale.
- `split`: use `tune` for essays you may look at while adjusting the instructions, and `holdout` for essays you only use to measure. Never tune on the holdout set.

**Never commit real student writing.** Keep authorized data outside the repository and pass its path with `--file`.

## What the report shows

Per skill and overall: exact agreement, agreement within one level, bias (AI minus human; positive means the AI is more generous), and quadratic weighted kappa (QWK; 1 = perfect, 0 = chance). It also prints a confusion matrix and flags skills below the proposed gates: at least 90% within one level, |bias| ≤ 0.3. Report exact agreement and sample sizes alongside; a skill with a handful of ratings tells you little.

## Results so far (developer-rated, 2026-11-03)

`seed-developer-rated.jsonl` holds 16 short essays written and rated by the developer (8 tune, 8 holdout, both bands, all genres, four curricula). That is enough to catch drift such as leniency, but it is **not** evidence of validity.

| Template | Split | Exact | Within 1 | Bias | QWK | Note |
| --- | --- | --- | --- | --- | --- | --- |
| feedback-v3 | tune | 75% | 100% | −0.04 | 0.65 | Never gave level 4; nudged 2s up to 3 |
| feedback-v4 | tune | 55% | 100% | +0.36 | 0.64 | “Use the full scale”: overcorrected |
| feedback-v5 | tune | 75% | 100% | +0.17 | 0.73 | “Check descriptors in order”: kept |
| feedback-v5 | holdout | 83% | 100% | −0.02 | 0.86 | One essay failed validation twice and was held for review |
| feedback-v6 | holdout | 64% / 79% | 100% | +0.07 / +0.12 | 0.67 / 0.81 | Two runs at temperature 0.2: run-to-run variation is large |
| feedback-v6 | holdout | 79% / 86% | 100% | +0.12 / 0.00 | 0.80 / 0.87 | Two runs at temperature 0 (now the default): steadier |

Templates v6 and v7 add only safety and privacy instructions (no comments on personal disclosures; placeholders for redacted details), not scoring changes. With 8 holdout essays, differences of ±10 points between runs are normal, which is why a teacher-rated set of a few hundred pieces is the next step.

## Building a real benchmark

1. **Collect writing with permission.** Use pieces that families or schools have agreed can be used for quality checks, with names and identifying details removed.
2. **Rate independently.** Two teachers rate each piece with the Writing Studio rubric for its prompt, without seeing the AI's levels or each other's. Settle disagreements in a short discussion and record the agreed level.
3. **Cover the range.** For each grade band and genre, include weak, typical and strong pieces, multilingual learners, and writing by students using accommodations. Aim for at least 20 pieces per grade before reading much into the numbers.
4. **Keep a holdout.** Put at least a third of the pieces in `holdout` and only run it after you finish changing the instructions.
5. **Compare teacher with teacher too.** If two teachers agree only 70% of the time on a skill, the AI cannot be expected to do much better on it.

Public scored essay collections, such as the Automated Student Assessment Prize (ASAP) essays and the PERSUADE 2.0 corpus, can supply essays for teachers to rate. Their scores use different scales from this rubric, so they need re-rating rather than direct comparison. Check each collection's license for your use before downloading it.

## Accuracy from real use

Inside the app, a parent or teacher can open any piece and either adjust a level or press “Ratings look right”. Both are stored as reviews. The site operator (the `ADMIN_EMAILS` account) sees agreement per skill at `/learn/admin/quality`. Ask reviewers to check a random sample of pieces, not only the ones that look wrong, so the numbers aren't skewed.
