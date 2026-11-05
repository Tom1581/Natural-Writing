/**
 * Writes a review sheet (CSV) of every lesson, prompt, practice set and rubric, for educators
 * to check before content is marked approved:
 *
 *   npm run content:review-sheet > content-review.csv
 *
 * Reviewers fill in the last columns. Approval is then recorded in the content files
 * (review.status = 'approved' with reviewer and date) and checked by validateCatalog().
 */
import {
  DRILLS,
  LESSONS,
  PROMPTS,
  RUBRICS,
  getSkill,
} from '../src/learning/content';

const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
const rows: unknown[][] = [
  [
    'type',
    'id',
    'version',
    'band',
    'genre_or_skill',
    'title',
    'status',
    'reviewer',
    'review_date',
    'content',
    'reviewer_decision (approve/revise)',
    'reviewer_notes',
  ],
];
for (const r of RUBRICS) {
  rows.push([
    'rubric',
    r.id,
    r.version,
    r.band,
    r.genre,
    r.title,
    r.review.status,
    r.review.reviewer,
    r.review.date,
    r.dimensions
      .map(
        (d) =>
          `${getSkill(d.skillId)?.name}: 1) ${d.levels[1]} 2) ${d.levels[2]} 3) ${d.levels[3]} 4) ${d.levels[4]}`,
      )
      .join(' | '),
    '',
    '',
  ]);
}
for (const l of LESSONS) {
  rows.push([
    'lesson',
    l.id,
    l.version,
    l.band,
    getSkill(l.skillId)?.name,
    l.title,
    l.review.status,
    l.review.reviewer,
    l.review.date,
    [
      l.objective,
      ...l.explanation,
      `Model: ${l.model.text}`,
      `Non-example: ${l.nonExample.text}`,
      `Question: ${l.guided.question}`,
    ].join(' | '),
    '',
    '',
  ]);
}
for (const p of PROMPTS) {
  const role = p.checkIn
    ? 'check-in'
    : p.checkpoint
      ? 'checkpoint'
      : 'practice';
  rows.push([
    `prompt (${role})`,
    p.id,
    p.version,
    p.band,
    p.genre,
    p.title,
    p.review.status,
    p.review.reviewer,
    p.review.date,
    [
      p.task,
      ...(p.sources ?? []).map((src) => `Source (${src.title}): ${src.text}`),
      p.picture ? `Pictures: ${p.picture.description}` : '',
      p.adultGuide ? `Adult guide: ${p.adultGuide}` : '',
      `Checklist: ${p.successCriteria.join('; ')}`,
    ]
      .filter(Boolean)
      .join(' | '),
    '',
    '',
  ]);
}
for (const d of DRILLS) {
  rows.push([
    'practice set',
    d.id,
    d.version,
    d.band,
    getSkill(d.skillId)?.name,
    d.title,
    d.review.status,
    d.review.reviewer,
    d.review.date,
    d.items.map((i) => i.prompt).join(' | '),
    '',
    '',
  ]);
}
process.stdout.write(rows.map((r) => r.map(esc).join(',')).join('\n') + '\n');
