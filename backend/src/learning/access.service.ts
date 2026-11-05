import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, IsNull, Repository } from 'typeorm';
import type { Actor } from '../auth/supabase-auth.guard';
import { bandForGrade, type GradeBand } from './content';
import {
  ClassEntity,
  ClassMemberEntity,
  DraftEntity,
  EvaluationJobEntity,
  LearnerAuthorizationEntity,
  LearnerEntity,
  OrgMemberEntity,
  SubmissionEntity,
} from './entities';

/**
 * The one place that decides who may touch which record.
 * - Personal profiles: only the adult who created them.
 * - School profiles: active school admins, and active teachers for profiles they created
 *   or that are in one of their classes. A removed teacher loses access at once, even to
 *   profiles they created, because school access never rests on ownership alone.
 * - A student session: only its own profile.
 * Records outside those limits return 404, so IDs can't be probed for existence.
 */
@Injectable()
export class AccessService {
  constructor(
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @InjectRepository(LearnerAuthorizationEntity)
    private readonly authorizations: Repository<LearnerAuthorizationEntity>,
    @InjectRepository(DraftEntity)
    private readonly drafts: Repository<DraftEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(EvaluationJobEntity)
    private readonly jobs: Repository<EvaluationJobEntity>,
    @InjectRepository(OrgMemberEntity)
    private readonly members: Repository<OrgMemberEntity>,
    @InjectRepository(ClassEntity)
    private readonly classes: Repository<ClassEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly classMembers: Repository<ClassMemberEntity>,
  ) {}

  /** Parent/teacher-only actions: creating or deleting profiles, codes, classes, overrides, exports. */
  requireAdult(actor: Actor) {
    if (actor.kind !== 'adult')
      throw new ForbiddenException('Ask your parent or teacher to do this.');
  }

  /** The actor's active role in a school, or null. */
  async membership(actor: Actor, organizationId: string) {
    if (actor.kind !== 'adult') return null;
    return this.members.findOneBy({
      organizationId,
      subject: actor.subject,
      status: 'active',
    });
  }

  private async canAdultReach(
    actor: Actor,
    learner: LearnerEntity,
  ): Promise<boolean> {
    if (!learner.organizationId) return learner.ownerSubject === actor.subject;
    const m = await this.membership(actor, learner.organizationId);
    if (!m) return false;
    if (m.role === 'admin' || learner.ownerSubject === actor.subject)
      return true;
    const myClasses = await this.classes.find({
      where: {
        ownerSubject: actor.subject,
        organizationId: learner.organizationId,
      },
      select: { id: true },
    });
    return (
      myClasses.length > 0 &&
      this.classMembers.existsBy({
        learnerId: learner.id,
        classId: In(myClasses.map((c) => c.id)),
      })
    );
  }

  async canAccessLearner(actor: Actor, learnerId: string) {
    if (actor.kind === 'learner') return actor.learnerId === learnerId;
    const learner = await this.learners.findOneBy({ id: learnerId });
    return !!learner && this.canAdultReach(actor, learner);
  }

  async learner(actor: Actor, learnerId: string) {
    const learner = await this.learners.findOneBy({ id: learnerId });
    const allowed =
      learner &&
      (actor.kind === 'learner'
        ? actor.learnerId === learner.id
        : await this.canAdultReach(actor, learner));
    if (!learner || !allowed)
      throw new NotFoundException('Student profile not found.');
    return learner;
  }

  /** Profiles an actor can see: personal + reachable school profiles for an adult, only themself for a student. */
  async visibleLearners(actor: Actor) {
    if (actor.kind === 'learner') {
      const self = await this.learners.findOneBy({ id: actor.learnerId });
      return self ? [self] : [];
    }
    const personal = await this.learners.find({
      where: { ownerSubject: actor.subject, organizationId: IsNull() },
      order: { createdAt: 'ASC' },
    });
    const memberships = await this.members.find({
      where: { subject: actor.subject, status: 'active' },
    });
    const school: LearnerEntity[] = [];
    for (const m of memberships) {
      if (m.role === 'admin') {
        school.push(
          ...(await this.learners.find({
            where: { organizationId: m.organizationId },
            order: { createdAt: 'ASC' },
          })),
        );
        continue;
      }
      const own = await this.learners.find({
        where: {
          organizationId: m.organizationId,
          ownerSubject: actor.subject,
        },
      });
      const myClasses = await this.classes.find({
        where: {
          ownerSubject: actor.subject,
          organizationId: m.organizationId,
        },
        select: { id: true },
      });
      const inClasses = myClasses.length
        ? (
            await this.classMembers.find({
              where: { classId: In(myClasses.map((c) => c.id)) },
            })
          ).map((cm) => cm.learnerId)
        : [];
      const extra = inClasses.length
        ? await this.learners.find({
            where: { id: In(inClasses), organizationId: m.organizationId },
          })
        : [];
      school.push(...own, ...extra);
    }
    const seen = new Set<string>();
    return [...personal, ...school].filter((l) =>
      seen.has(l.id) ? false : (seen.add(l.id), true),
    );
  }

  async draft(actor: Actor, draftId: string) {
    const draft = await this.drafts.findOneBy({ id: draftId });
    if (!draft || !(await this.canAccessLearner(actor, draft.learnerId)))
      throw new NotFoundException('Draft not found.');
    return draft;
  }

  async submission(actor: Actor, submissionId: string) {
    const submission = await this.submissions.findOneBy({ id: submissionId });
    if (
      !submission ||
      !(await this.canAccessLearner(actor, submission.learnerId))
    ) {
      throw new NotFoundException('Submission not found.');
    }
    return submission;
  }

  async job(actor: Actor, jobId: string) {
    const job = await this.jobs.findOneBy({ id: jobId });
    if (!job) throw new NotFoundException('Feedback request not found.');
    await this.submission(actor, job.submissionId).catch(() => {
      throw new NotFoundException('Feedback request not found.');
    });
    return job;
  }

  /** A class the adult may manage: their own personal class, or a school class while they are an active member. */
  async manageableClass(actor: Actor, classId: string) {
    this.requireAdult(actor);
    const cls = await this.classes.findOneBy({ id: classId });
    if (!cls) throw new NotFoundException('Class not found.');
    if (!cls.organizationId) {
      if (cls.ownerSubject !== actor.subject)
        throw new NotFoundException('Class not found.');
      return cls;
    }
    const m = await this.membership(actor, cls.organizationId);
    if (!m || (m.role !== 'admin' && cls.ownerSubject !== actor.subject))
      throw new NotFoundException('Class not found.');
    return cls;
  }

  hasAuthorization(learnerId: string) {
    return this.authorizations.existsBy({ learnerId, revokedAt: IsNull() });
  }

  async requireAuthorization(learnerId: string) {
    if (!(await this.hasAuthorization(learnerId))) {
      throw new ForbiddenException(
        'An adult needs to agree to the learning notice before this student can get feedback.',
      );
    }
  }

  bandOf(learner: LearnerEntity): GradeBand {
    const band = bandForGrade(learner.gradeLevel);
    if (!band)
      throw new ForbiddenException(
        'Practice for this grade is not available yet.',
      );
    return band;
  }
}
