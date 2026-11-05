import { ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isAdminEmail } from '../auth/admin';
import { verifiedAdultEmail, type Actor } from '../auth/supabase-auth.guard';
import { getSkill } from './content';
import {
  EvaluationJobEntity,
  SafetyFlagEntity,
  SubmissionEntity,
  TeacherOverrideEntity,
} from './entities';
import { agreementStats } from './calibration/metrics';

/**
 * Site-wide quality numbers for the operator: how often adults agree with the AI's levels,
 * how often feedback fails or is reported, and how many wellbeing flags are open.
 * Aggregates only; no student text or names.
 */
@Injectable()
export class QualityService {
  constructor(
    @InjectRepository(TeacherOverrideEntity)
    private readonly overrides: Repository<TeacherOverrideEntity>,
    @InjectRepository(EvaluationJobEntity)
    private readonly jobs: Repository<EvaluationJobEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(SafetyFlagEntity)
    private readonly flags: Repository<SafetyFlagEntity>,
  ) {}

  async summary(actor: Actor) {
    if (!isAdminEmail(verifiedAdultEmail(actor)))
      throw new ForbiddenException(
        'Only the site operator can see quality data.',
      );

    const reviews = await this.overrides.find({
      where: [{ kind: 'correction' }, { kind: 'confirmation' }],
    });
    // The latest review per submission and skill is the adult's final judgment.
    const latest = new Map<string, TeacherOverrideEntity>();
    for (const r of reviews.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime(),
    ))
      latest.set(`${r.submissionId}|${r.skillId}`, r);
    const pairs = [...latest.values()].filter(
      (r) => r.originalRating !== null && r.rating !== null,
    );
    const bySkill = new Map<string, { ai: number; human: number }[]>();
    for (const r of pairs)
      bySkill.set(r.skillId, [
        ...(bySkill.get(r.skillId) ?? []),
        { ai: r.originalRating!, human: r.rating! },
      ]);

    const [jobs, totalSubmissions, reported, flags] = await Promise.all([
      this.jobs.find({ select: { state: true } }),
      this.submissions.count(),
      this.submissions
        .createQueryBuilder('s')
        .where('s."feedbackReport" IS NOT NULL')
        .getCount(),
      this.flags.find({
        select: { category: true, level: true, status: true, source: true },
      }),
    ]);
    const count = <T extends string>(items: T[]) =>
      items.reduce<Record<string, number>>(
        (acc, k) => ({ ...acc, [k]: (acc[k] ?? 0) + 1 }),
        {},
      );

    return {
      reviewedPieces: new Set(pairs.map((p) => p.submissionId)).size,
      agreement: {
        overall: agreementStats(
          pairs.map((p) => ({ ai: p.originalRating!, human: p.rating! })),
        ),
        bySkill: [...bySkill.entries()].map(([skillId, list]) => ({
          skillId,
          name: getSkill(skillId)?.name ?? skillId,
          ...agreementStats(list),
        })),
      },
      submissions: totalSubmissions,
      jobs: count(jobs.map((j) => j.state)),
      feedbackReports: reported,
      safetyFlags: {
        open: flags.filter((f) => f.status === 'open').length,
        byCategory: count(flags.map((f) => f.category)),
        bySource: count(flags.map((f) => f.source)),
      },
      note: 'Agreement uses pieces an adult reviewed (confirmed or corrected). Targets: at least 90% within one level, with exact agreement and bias reported alongside.',
    };
  }
}
