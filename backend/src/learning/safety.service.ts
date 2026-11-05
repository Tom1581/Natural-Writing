import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import type { Actor } from '../auth/supabase-auth.guard';
import { AccessService } from './access.service';
import type { FrameworkId } from './content';
import { SafetyFlagEntity } from './entities';
import type { Wellbeing } from './evaluator/validate-feedback';
import { screenText, SUPPORT } from './safety';
import { AuditService } from './audit.service';
import { LearnerEntity } from './entities';

/**
 * Wellbeing flags: raised by the phrase screen at submission and by the evaluator's separate
 * wellbeing check, shown only to the adult who manages the profile, and resolved by that adult.
 * Flags never change ratings, and the site does not promise round-the-clock monitoring.
 */
@Injectable()
export class SafetyService {
  constructor(
    @InjectRepository(SafetyFlagEntity)
    private readonly flags: Repository<SafetyFlagEntity>,
    private readonly access: AccessService,
    private readonly audit: AuditService,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
  ) {}

  async recordScreen(
    m: EntityManager,
    submissionId: string,
    learnerId: string,
    text: string,
  ) {
    const hits = screenText(text);
    if (hits.length) {
      await m.save(
        hits.map((h) =>
          m.create(SafetyFlagEntity, {
            submissionId,
            learnerId,
            source: 'screen',
            ...h,
            status: 'open',
          }),
        ),
      );
    }
  }

  async recordWellbeing(
    m: EntityManager,
    submissionId: string,
    learnerId: string,
    w: Wellbeing,
  ) {
    if (w.concern === 'none') return;
    const category = w.category === 'none' ? 'other' : w.category;
    const existing = await m.find(SafetyFlagEntity, {
      where: { submissionId, category },
    });
    if (existing.some((f) => f.level === 'urgent' || f.level === w.concern))
      return;
    await m.save(
      m.create(SafetyFlagEntity, {
        submissionId,
        learnerId,
        source: 'ai',
        level: w.concern,
        category,
        reason:
          w.reason ||
          'The feedback check noticed content an adult may want to read.',
        status: 'open',
      }),
    );
  }

  forSubmission(submissionId: string) {
    return this.flags.find({
      where: { submissionId },
      order: { createdAt: 'ASC' },
    });
  }

  openForLearner(learnerId: string) {
    return this.flags.find({
      where: { learnerId, status: 'open' },
      order: { createdAt: 'DESC' },
    });
  }

  async resolve(actor: Actor, flagId: string, note: string) {
    this.access.requireAdult(actor);
    const flag = await this.flags.findOneBy({ id: flagId });
    if (!flag || !(await this.access.canAccessLearner(actor, flag.learnerId)))
      throw new NotFoundException('Flag not found.');
    await this.flags.update(
      { id: flag.id },
      {
        status: 'resolved',
        resolvedBySubject: actor.subject,
        resolvedAt: new Date(),
        resolutionNote: note.trim(),
      },
    );
    const learner = await this.learners.findOneBy({ id: flag.learnerId });
    await this.audit.record(
      actor,
      learner?.organizationId ?? null,
      'wellbeing.resolved',
      { type: 'flag', id: flag.id },
      flag.category,
    );
    return { resolved: true };
  }

  /** What the student sees: a calm support message, never the flag itself. */
  support(curriculum: FrameworkId, flags: SafetyFlagEntity[]) {
    if (!flags.length) return null;
    const categories = [...new Set(flags.map((f) => f.category))];
    const wellbeing = categories.some((c) => c !== 'personal_info');
    return {
      wellbeing,
      personalInfo: categories.includes('personal_info'),
      ...SUPPORT[curriculum],
    };
  }

  present(f: SafetyFlagEntity) {
    return {
      id: f.id,
      submissionId: f.submissionId,
      source: f.source,
      level: f.level,
      category: f.category,
      reason: f.reason,
      status: f.status,
      resolutionNote: f.resolutionNote,
      createdAt: f.createdAt,
    };
  }
}
