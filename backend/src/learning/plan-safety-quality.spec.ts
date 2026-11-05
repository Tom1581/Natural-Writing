import { LESSONS, PROMPTS } from './content';
import { agreementStats, quadraticWeightedKappa } from './calibration/metrics';
import { anchorQuote, parseWellbeing } from './evaluator/validate-feedback';
import { redactPersonalDetails } from './privacy';
import { buildPlan, type PlanInput } from './plan';
import type { EvidenceRow } from './progress';
import { screenText } from './safety';

describe('content targets from the plan', () => {
  it('has 12 lessons and 36 prompts per band, 12 per genre, with reserved checkpoints', () => {
    for (const band of ['3-5', '6-8'] as const) {
      expect(LESSONS.filter((l) => l.band === band)).toHaveLength(12);
      expect(PROMPTS.filter((p) => p.band === band)).toHaveLength(36);
      for (const genre of ['opinion', 'informative', 'narrative'] as const) {
        const inGenre = PROMPTS.filter(
          (p) => p.band === band && p.genre === genre,
        );
        expect(inGenre).toHaveLength(12);
        expect(
          inGenre.filter((p) => p.checkpoint).length,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });
});

describe('safety screen', () => {
  it('treats first-person statements about the writer as urgent', () => {
    expect(screenText('Sometimes I want to die and nobody notices.')).toEqual([
      expect.objectContaining({ category: 'self_harm', level: 'urgent' }),
    ]);
    expect(screenText('My dad hits me when he is angry.')).toEqual([
      expect.objectContaining({ category: 'abuse', level: 'urgent' }),
    ]);
    // "He hit me" alone is common in stories and games; that judgment is left to the AI and the adult.
    expect(
      screenText('Then he hit me with a snowball and we both laughed.'),
    ).toEqual([]);
    expect(screenText("I'm going to bring a knife to school.")).toEqual([
      expect.objectContaining({ category: 'threat', level: 'urgent' }),
    ]);
    expect(
      screenText(
        "In the last minute I'll shoot the ball and we will kill it on the scoreboard.",
      ),
    ).toEqual([]);
  });

  it('marks unclear mentions as possible and leaves ordinary stories alone', () => {
    expect(
      screenText('The story was about a knight who thought about suicide.'),
    ).toEqual([
      expect.objectContaining({ category: 'self_harm', level: 'possible' }),
    ]);
    expect(
      screenText(
        'The dragon roared and the knight fought bravely until the storm passed.',
      ),
    ).toEqual([]);
    expect(
      screenText(
        'We should open the library at lunch because the cafeteria is loud.',
      ),
    ).toEqual([]);
  });

  it('notices personal details', () => {
    expect(screenText('Call me at 555-123-4567.')).toEqual([
      expect.objectContaining({ category: 'personal_info' }),
    ]);
    expect(screenText('I live at 42 Maple Road near the park.')).toEqual([
      expect.objectContaining({ category: 'personal_info' }),
    ]);
  });

  it('reads a missing or malformed AI wellbeing field as no concern', () => {
    expect(parseWellbeing(undefined)).toEqual({
      concern: 'none',
      category: 'none',
      reason: '',
    });
    expect(parseWellbeing({ concern: 'panic', category: 'x' }).concern).toBe(
      'none',
    );
    expect(
      parseWellbeing({ concern: 'urgent', category: 'nonsense', reason: 'r' }),
    ).toEqual({ concern: 'urgent', category: 'other', reason: 'r' });
  });
});

describe('agreement metrics', () => {
  it('computes exact, adjacent, bias and kappa', () => {
    const perfect = [1, 2, 3, 4, 2, 3].map((v) => ({ ai: v, human: v }));
    expect(agreementStats(perfect)).toMatchObject({
      n: 6,
      exact: 1,
      adjacent: 1,
      meanBias: 0,
      qwk: 1,
    });
    const lenient = [
      { ai: 3, human: 2 },
      { ai: 4, human: 3 },
      { ai: 3, human: 3 },
      { ai: 2, human: 1 },
    ];
    const s = agreementStats(lenient);
    expect(s.exact).toBe(0.25);
    expect(s.adjacent).toBe(1);
    expect(s.meanBias).toBe(0.75);
    expect(s.qwk!).toBeGreaterThan(0);
    expect(s.qwk!).toBeLessThan(1);
    expect(quadraticWeightedKappa([{ ai: 3, human: 3 }])).toBeNull();
  });
});

describe('two-week plan', () => {
  const day = (n: number) => new Date(Date.UTC(2026, 10, n, 15));
  const ev = (
    skillId: string,
    promptId: string,
    rating: number,
    d: number,
  ): EvidenceRow => ({
    skillId,
    promptId,
    rating,
    independent: true,
    createdAt: day(d),
  });
  const checkIns = (d = 1) => [
    { promptId: 'g68-choice-period', attemptNumber: 1, createdAt: day(d) },
    { promptId: 'g68-wrong-message', attemptNumber: 1, createdAt: day(d) },
  ];
  const rows = [
    ev('purpose.claim', 'g68-choice-period', 3, 1),
    ev('development.evidence', 'g68-choice-period', 1, 1),
    ev('organization.structure', 'g68-choice-period', 2, 1),
    ev('development.detail', 'g68-wrong-message', 3, 1),
  ];
  const input = (over: Partial<PlanInput> = {}): PlanInput => ({
    band: '6-8',
    rows,
    attempts: checkIns(),
    sessionsPerWeek: 3,
    interests: [],
    focusSkillId: null,
    planStartedAt: day(2),
    drillCompletions: {},
    now: day(3),
    ...over,
  });

  it('starts with the check-in until both pieces are written', () => {
    const plan = buildPlan(
      input({ attempts: [checkIns()[0]], rows: rows.slice(0, 3) }),
    );
    expect(plan.status).toBe('check_in');
    expect(plan.next?.promptId).toBe('g68-wrong-message');
  });

  it('targets the weakest skill, keeps a maintenance goal and ends with an unseen checkpoint', () => {
    const plan = buildPlan(input());
    expect(plan.status).toBe('active');
    expect(plan.mainGoal?.skillId).toBe('development.evidence');
    expect(plan.maintenance?.skillId).toBeTruthy();
    expect(plan.maintenance?.skillId).not.toBe('development.evidence');
    expect(plan.items).toHaveLength(6);
    expect(plan.items[0]).toMatchObject({
      kind: 'lesson',
      lessonId: expect.any(String),
    });
    const last = plan.items.at(-1)!;
    expect(last.kind).toBe('checkpoint');
    expect(PROMPTS.find((p) => p.id === last.promptId)?.checkpoint).toBe(true);
    expect(plan.items.filter((i) => i.week === 1).length).toBe(3);
  });

  it('follows an adult’s chosen focus and the chosen number of sessions', () => {
    const plan = buildPlan(
      input({ focusSkillId: 'word_choice.precision', sessionsPerWeek: 2 }),
    );
    expect(plan.mainGoal?.skillId).toBe('word_choice.precision');
    expect(plan.focusSetByAdult).toBe(true);
    expect(plan.items).toHaveLength(4);
  });

  it('stays stable as work is done, ticking items off instead of replacing them', () => {
    const before = buildPlan(input());
    const lesson = before.items[0];
    const after = buildPlan(
      input({
        attempts: [
          ...checkIns(),
          { promptId: lesson.promptId!, attemptNumber: 1, createdAt: day(3) },
        ],
      }),
    );
    expect(after.items.map((i) => i.key)).toEqual(
      before.items.map((i) => i.key),
    );
    expect(after.items[0].done).toBe(true);
    expect(after.next?.key).toBe(before.items[1].key);
  });

  it('never offers the same prompt twice, as an item or as an alternative', () => {
    const plan = buildPlan(input({ sessionsPerWeek: 4 }));
    const ids = plan.items
      .flatMap((i) => [i.promptId, i.alternative?.promptId])
      .filter(Boolean);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('counts work written in the same second the plan started', () => {
    const start = new Date(Date.UTC(2026, 10, 2, 15, 0, 0, 829));
    const sameSecond = new Date(Date.UTC(2026, 10, 2, 15, 0, 0, 0));
    const first = buildPlan(input({ planStartedAt: start }));
    const item = first.items.find((i) => i.kind === 'prompt')!;
    const after = buildPlan(
      input({
        planStartedAt: start,
        attempts: [
          ...checkIns(),
          { promptId: item.promptId!, attemptNumber: 1, createdAt: sameSecond },
        ],
      }),
    );
    expect(after.items.find((i) => i.key === item.key)?.done).toBe(true);
  });

  it('prefers prompts that match the student’s interests', () => {
    const plan = buildPlan(input({ interests: ['animals'] }));
    const prompt = plan.items.find(
      (i) => i.kind === 'prompt' && i.key === 'prompt:main-1',
    );
    expect(PROMPTS.find((p) => p.id === prompt?.promptId)?.topics).toContain(
      'animals',
    );
  });

  it('is complete when two weeks have passed', () => {
    expect(buildPlan(input({ now: day(20) })).status).toBe('complete');
  });
});

describe('privacy redaction before the AI', () => {
  it('replaces emails, phone numbers and street addresses', () => {
    expect(
      redactPersonalDetails(
        'Email me at sam.lee@example.com or call 555-123-4567.',
      ),
    ).toBe('Email me at [email address] or call [phone number].');
    expect(
      redactPersonalDetails(
        'I live at 42 Maple Road and my friend lives at 7 Oak Street.',
      ),
    ).toBe(
      'I live at [street address] and my friend lives at [street address].',
    );
    expect(redactPersonalDetails('In 2020 we planted 12 trees on Main.')).toBe(
      'In 2020 we planted 12 trees on Main.',
    );
  });

  it('still anchors a quote that spans a redacted detail', () => {
    const text = 'You can reach me at 555-123-4567 if the club needs help.';
    const a = anchorQuote(
      text,
      'You can reach me at [phone number] if the club needs help',
    )!;
    expect(text.slice(a.start, a.end)).toBe('if the club needs help');
  });
});
