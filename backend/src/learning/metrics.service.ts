import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { isAdminEmail } from '../auth/admin';
import { verifiedAdultEmail, type Actor } from '../auth/supabase-auth.guard';
import { bandForGrade, BANDS } from './content';
import {
  AiUsageEntity,
  EvaluationEntity,
  EvaluationJobEntity,
  LearnerEntity,
  SubmissionEntity,
  TeacherOverrideEntity,
} from './entities';
import { UsageService } from './usage.service';

const DAY = 86_400_000;
const dayOf = (d: Date) => new Date(d).toISOString().slice(0, 10);

/**
 * Operator metrics for deciding when the free tier is no longer enough: AI spend per day and
 * per completed piece of feedback, plus learning signals (completed loops, returning students,
 * adult corrections, helpfulness). Counts only; no student text.
 */
@Injectable()
export class MetricsService {
  constructor(
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(EvaluationEntity)
    private readonly evaluations: Repository<EvaluationEntity>,
    @InjectRepository(EvaluationJobEntity)
    private readonly jobs: Repository<EvaluationJobEntity>,
    @InjectRepository(TeacherOverrideEntity)
    private readonly overrides: Repository<TeacherOverrideEntity>,
    @InjectRepository(AiUsageEntity)
    private readonly aiUsage: Repository<AiUsageEntity>,
    private readonly usage: UsageService,
  ) {}

  async metrics(actor: Actor) {
    if (!isAdminEmail(verifiedAdultEmail(actor)))
      throw new ForbiddenException('Only the site operator can see metrics.');
    const now = Date.now();
    const since30 = new Date(now - 30 * DAY);
    const since7 = new Date(now - 7 * DAY);

    const [
      learners,
      subs30,
      evals30,
      overrides30,
      jobs,
      usage7,
      tokensToday,
      daily,
    ] = await Promise.all([
      this.learners.find({
        select: { id: true, gradeLevel: true, createdAt: true },
      }),
      this.submissions.find({
        where: { createdAt: MoreThanOrEqual(since30) },
        select: {
          id: true,
          learnerId: true,
          attemptNumber: true,
          createdAt: true,
          helpfulness: true,
          rubricId: true,
        },
      }),
      this.evaluations.find({
        where: { createdAt: MoreThanOrEqual(since30) },
        select: {
          id: true,
          submissionId: true,
          createdAt: true,
          rubricId: true,
        },
      }),
      this.overrides.find({
        where: { createdAt: MoreThanOrEqual(since30) },
        select: { id: true, kind: true },
      }),
      this.jobs.find({ select: { id: true, state: true, failureCode: true } }),
      this.aiUsage.find({
        where: { createdAt: MoreThanOrEqual(since7) },
        select: {
          purpose: true,
          promptTokens: true,
          completionTokens: true,
          outcome: true,
        },
      }),
      this.usage.tokensToday(),
      this.usage.daily(14),
    ]);

    const evaluated = new Set(evals30.map((e) => e.submissionId));
    const evaluatedSubs = subs30.filter((s) => evaluated.has(s.id));
    // A completed loop: feedback on a first draft, then an evaluated revision of it.
    const loopLearners = new Set(
      evaluatedSubs.filter((s) => s.attemptNumber > 1).map((s) => s.learnerId),
    );
    const activeLearners = new Set(subs30.map((s) => s.learnerId));
    const daysByLearner = new Map<string, Set<string>>();
    for (const s of subs30) {
      const set = daysByLearner.get(s.learnerId) ?? new Set<string>();
      set.add(dayOf(s.createdAt));
      daysByLearner.set(s.learnerId, set);
    }
    const returning = [...daysByLearner.values()].filter(
      (d) => d.size >= 2,
    ).length;

    const tokens7 = usage7.reduce(
      (n, u) => n + u.promptTokens + u.completionTokens,
      0,
    );
    const evals7 = evals30.filter(
      (e) => new Date(e.createdAt).getTime() >= since7.getTime(),
    ).length;
    const byPurpose7: Record<string, { calls: number; tokens: number }> = {};
    for (const u of usage7) {
      const p = (byPurpose7[u.purpose] ??= { calls: 0, tokens: 0 });
      p.calls += 1;
      p.tokens += u.promptTokens + u.completionTokens;
    }

    const helpful = { yes: 0, somewhat: 0, no: 0 };
    for (const s of subs30)
      if (s.helpfulness && s.helpfulness in helpful)
        helpful[s.helpfulness as keyof typeof helpful] += 1;

    const learnersByBand = Object.fromEntries(BANDS.map((b) => [b.id, 0]));
    for (const l of learners) {
      const band = bandForGrade(l.gradeLevel);
      if (band) learnersByBand[band] += 1;
    }
    const rubricBand = (id: string) =>
      id.startsWith('gk-2')
        ? 'K-2'
        : id.slice(1).split('-').slice(0, 2).join('-');
    const evaluationsByBand = Object.fromEntries(BANDS.map((b) => [b.id, 0]));
    for (const e of evals30) {
      const band = rubricBand(e.rubricId);
      if (band in evaluationsByBand) evaluationsByBand[band] += 1;
    }

    const jobStates: Record<string, number> = {};
    for (const j of jobs) {
      const key =
        j.state === 'queued' && j.failureCode === 'daily_budget'
          ? 'waiting_for_budget'
          : j.state;
      jobStates[key] = (jobStates[key] ?? 0) + 1;
    }

    return {
      generatedAt: new Date(now).toISOString(),
      ai: {
        budget: this.usage.dailyBudget,
        tokensToday,
        remainingToday: Math.max(0, this.usage.dailyBudget - tokensToday),
        tokensLast7Days: tokens7,
        tokensPerFeedbackLast7Days: evals7
          ? Math.round(tokens7 / evals7)
          : null,
        byPurposeLast7Days: byPurpose7,
        rateLimitedLast7Days: usage7.filter((u) => u.outcome === 'rate_limited')
          .length,
        daily,
      },
      learning: {
        learners: learners.length,
        learnersByBand,
        activeLearners30: activeLearners.size,
        submissions30: subs30.length,
        feedback30: evals30.length,
        evaluationsByBand30: evaluationsByBand,
        completedLoops30: loopLearners.size,
        returningLearners30: returning,
        adultCorrections30: overrides30.filter((o) => o.kind === 'correction')
          .length,
        adultConfirmations30: overrides30.filter(
          (o) => o.kind === 'confirmation',
        ).length,
        correctionRate30: evals30.length
          ? overrides30.filter((o) => o.kind === 'correction').length /
            evals30.length
          : null,
        helpfulness30: helpful,
        jobStates,
      },
    };
  }
}
