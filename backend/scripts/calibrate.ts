/**
 * Calibration harness: runs the real evaluator over human-rated essays and reports how well
 * the AI's levels agree with the humans', per skill.
 *
 *   npm run calibrate -- --file calibration/seed-developer-rated.jsonl --split holdout
 *
 * Input: JSON Lines, one essay per line:
 *   { "id", "promptId", "curriculum", "gradeLevel" (US-equivalent "3".."8"), "split" ("tune" | "holdout"),
 *     "rater", "text", "human": { "<skillId>": 1-4, ... } }
 * Results are cached per essay, model and template, so a rate-limited run can be resumed.
 * Never put real student writing in this repository; keep authorized data outside it.
 */
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import {
  agreementStats,
  type RatingPair,
} from '../src/learning/calibration/metrics';
import {
  getPrompt,
  getRubric,
  getSkill,
  type FrameworkId,
} from '../src/learning/content';
import { TEMPLATE_VERSION } from '../src/learning/evaluator/evaluation-prompt';
import { EvaluatorService } from '../src/learning/evaluator/evaluator.service';
import {
  OpenAiCompatibleEvalClient,
  ProviderError,
  RateLimitedError,
} from '../src/learning/evaluator/llm-client';

interface Sample {
  id: string;
  promptId: string;
  curriculum: FrameworkId;
  gradeLevel: string;
  split?: 'tune' | 'holdout';
  rater?: string;
  text: string;
  human: Record<string, number>;
}

const args = Object.fromEntries(
  process.argv
    .slice(2)
    .reduce<
      [string, string][]
    >((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1] ?? '']] : acc), []),
);
const file = args.file || 'calibration/seed-developer-rated.jsonl';
const split = args.split || 'all';
const out = args.out || `calibration/report-${split}.md`;

const env = {
  ...process.env,
  ...(dotenv.config({ path: '.env', quiet: true }).parsed ?? {}),
};
const client = new OpenAiCompatibleEvalClient(new ConfigService(env));
const evaluator = new EvaluatorService(client);
const cachePath =
  args.cache ||
  `calibration/.cache-${TEMPLATE_VERSION}-${client.model.replace(/\W+/g, '_')}.json`;
const cache: Record<string, Record<string, number | null> | 'invalid'> =
  existsSync(cachePath) ? JSON.parse(readFileSync(cachePath, 'utf8')) : {};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function rate(
  sample: Sample,
): Promise<Record<string, number | null> | 'invalid'> {
  if (cache[sample.id]) return cache[sample.id];
  const prompt = getPrompt(sample.promptId)!;
  const rubric = getRubric(prompt.rubricId)!;
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      const outcome = await evaluator.evaluate({
        prompt,
        rubric,
        gradeLevel: sample.gradeLevel,
        curriculum: sample.curriculum,
        text: sample.text,
      });
      const result =
        outcome.kind === 'complete'
          ? Object.fromEntries(
              outcome.feedback.dimensions.map((d) => [d.skillId, d.rating]),
            )
          : 'invalid';
      cache[sample.id] = result;
      writeFileSync(cachePath, JSON.stringify(cache, null, 1));
      return result;
    } catch (err) {
      if (err instanceof RateLimitedError) {
        process.stdout.write(
          `  rate limited, waiting ${err.retryAfterSeconds}s\n`,
        );
        await sleep(err.retryAfterSeconds * 1000);
      } else if (err instanceof ProviderError) {
        process.stdout.write(`  provider error (${err.message}); retrying\n`);
        await sleep(5000 * attempt);
      } else throw err;
    }
  }
  return 'invalid';
}

const pct = (v: number | null) =>
  v === null ? '–' : `${Math.round(v * 100)}%`;
const num = (v: number | null, d = 2) => (v === null ? '–' : v.toFixed(d));

(async () => {
  const samples = readFileSync(file, 'utf8')
    .split('\n')
    .filter((l) => l.trim())
    .map((l) => JSON.parse(l) as Sample)
    .filter((s) => split === 'all' || s.split === split);

  for (const s of samples) {
    const prompt = getPrompt(s.promptId);
    if (!prompt) throw new Error(`${s.id}: unknown prompt ${s.promptId}`);
    const skills = getRubric(prompt.rubricId)!.dimensions.map((d) => d.skillId);
    for (const k of Object.keys(s.human))
      if (!skills.includes(k))
        throw new Error(`${s.id}: ${k} is not on rubric ${prompt.rubricId}`);
  }

  const bySkill = new Map<string, RatingPair[]>();
  const byBand = new Map<string, RatingPair[]>();
  let invalid = 0;
  for (const [i, s] of samples.entries()) {
    process.stdout.write(
      `[${i + 1}/${samples.length}] ${s.id} ${s.promptId}\n`,
    );
    const ai = await rate(s);
    if (ai === 'invalid') {
      invalid++;
      continue;
    }
    const band = getPrompt(s.promptId)!.band;
    for (const [skillId, human] of Object.entries(s.human)) {
      const rating = ai[skillId];
      if (typeof rating !== 'number') continue;
      bySkill.set(skillId, [
        ...(bySkill.get(skillId) ?? []),
        { ai: rating, human },
      ]);
      byBand.set(band, [...(byBand.get(band) ?? []), { ai: rating, human }]);
    }
  }

  const all = [...bySkill.values()].flat();
  const overall = agreementStats(all);
  const raters = [...new Set(samples.map((s) => s.rater ?? 'unknown'))].join(
    ', ',
  );
  const row = (name: string, st: ReturnType<typeof agreementStats>) =>
    `| ${name} | ${st.n} | ${pct(st.exact)} | ${pct(st.adjacent)} | ${num(st.meanBias)} | ${num(st.qwk)} |`;
  const flags = [...bySkill.entries()]
    .map(([k, list]) => [k, agreementStats(list)] as const)
    .filter(
      ([, st]) => (st.adjacent ?? 1) < 0.9 || Math.abs(st.meanBias ?? 0) > 0.3,
    );

  const md = [
    `# Calibration report: ${split}`,
    '',
    `Model \`${client.model}\`, template \`${TEMPLATE_VERSION}\`, ${samples.length} essays (${invalid} without valid feedback), raters: ${raters}.`,
    `Generated ${new Date().toISOString()}.`,
    '',
    '| Skill | Ratings | Exact | Within 1 | Bias (AI − human) | QWK |',
    '| --- | --- | --- | --- | --- | --- |',
    ...[...bySkill.entries()].map(([k, list]) =>
      row(getSkill(k)?.name ?? k, agreementStats(list)),
    ),
    row('**All skills**', overall),
    '',
    '| Band | Ratings | Exact | Within 1 | Bias | QWK |',
    '| --- | --- | --- | --- | --- | --- |',
    ...[...byBand.entries()].map(([b, list]) =>
      row(`Grades ${b}`, agreementStats(list)),
    ),
    '',
    '## Against the proposed gates',
    `- Within one level, all skills: ${pct(overall.adjacent)} (target ≥ 90%).`,
    `- Skills below 90% within one level or with |bias| > 0.3: ${flags.length ? flags.map(([k, st]) => `${getSkill(k)?.name ?? k} (${pct(st.adjacent)}, bias ${num(st.meanBias)})`).join('; ') : 'none'}.`,
    '',
    'Confusion matrix (rows = human level 1–4, columns = AI level 1–4):',
    '',
    '```',
    ...overall.confusion.map(
      (r, i) => `${i + 1}: ${r.map((c) => String(c).padStart(3)).join(' ')}`,
    ),
    '```',
    '',
    raters.includes('developer')
      ? '> These essays were rated by the developer, not by independent teachers. Use this to catch obvious drift (for example, leniency), not as evidence of validity.'
      : '',
  ].join('\n');
  writeFileSync(out, md);
  process.stdout.write(`\n${md}\n\nWrote ${out}\n`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
