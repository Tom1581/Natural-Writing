import {
  BadRequestException,
  HttpException,
  HttpStatus,
  ConflictException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  EntityManager,
  In,
  IsNull,
  MoreThan,
  Repository,
} from 'typeorm';
import type { Actor } from '../auth/supabase-auth.guard';
import {
  alignmentIds,
  bandForGrade,
  DRILLS,
  getFramework,
  getLesson,
  getPrompt,
  getSkill,
  getRubric,
  LESSONS,
  localGradeLabel,
  PROMPTS,
  SKILLS,
  STANDARD_STATEMENTS,
  type AlignmentSkill,
  type FrameworkId,
  type Topic,
  type WritingPrompt,
} from './content';
import { AccessService } from './access.service';
import { buildPlan, type Plan } from './plan';
import { SafetyService } from './safety.service';
import { AuditService } from './audit.service';
import type { ValidatedFeedback } from './evaluator/feedback.types';

/** Removes a student and everything stored about them. Used by "Delete profile" and by retention. */
export async function deleteLearnerRecords(
  m: EntityManager,
  learnerId: string,
) {
  const submissionIds = (
    await m.find(SubmissionEntity, {
      where: { learnerId },
      select: { id: true },
    })
  ).map((s) => s.id);
  if (submissionIds.length) {
    await m.delete(EvaluationEntity, { submissionId: In(submissionIds) });
    await m.delete(TeacherOverrideEntity, { submissionId: In(submissionIds) });
    await m.delete(EvaluationJobEntity, { submissionId: In(submissionIds) });
  }
  await m.delete(SkillEvidenceEntity, { learnerId });
  await m.delete(SafetyFlagEntity, { learnerId });
  await m.delete(SubmissionEntity, { learnerId });
  await m.delete(DraftEntity, { learnerId });
  await m.delete(LearnerAuthorizationEntity, { learnerId });
  await m.delete(ClassMemberEntity, { learnerId });
  // Cost records stay for budgeting, but no longer point to the student.
  await m.update(AiUsageEntity, { learnerId }, { learnerId: null });
  await m.delete(LearnerEntity, { id: learnerId });
}

export const DAILY_SUBMISSIONS_PER_STUDENT = 20;
export const DAILY_SUBMISSIONS_PER_ACCOUNT = 400;
import {
  AiUsageEntity,
  DraftEntity,
  EvaluationEntity,
  EvaluationJobEntity,
  LearnerAuthorizationEntity,
  LearnerEntity,
  SkillEvidenceEntity,
  SubmissionEntity,
  TeacherOverrideEntity,
  ClassMemberEntity,
  AssignmentEntity,
  SafetyFlagEntity,
} from './entities';
import { countWords, EvaluatorService } from './evaluator/evaluator.service';
import {
  BudgetExceededError,
  ProviderError,
  RateLimitedError,
} from './evaluator/llm-client';
import { UsageService } from './usage.service';
import {
  CreateLearnerDto,
  LEARNING_NOTICE_VERSION,
  MAX_SUBMISSION_WORDS,
  OpenDraftDto,
  PreferencesDto,
  SupportsDto,
  SaveDraftDto,
  SubmitDto,
} from './learning.dto';
import { recommendNext, skillProgress } from './progress';

const LEASE_MS = 120_000;
const MAX_ATTEMPTS = 4;
/** Second-look notes that trigger an automatic second AI reading. */
const SECOND_OPINION_TRIGGERS = ['A short piece', 'Every skill was rated 4'];

export interface JobStatus {
  jobId: string;
  submissionId: string;
  state: EvaluationJobEntity['state'];
  failureCode: string | null;
  /** Seconds until the next automatic attempt, when the job is waiting. */
  retryInSeconds: number | null;
}

@Injectable()
export class LearningService {
  private readonly logger = new Logger(LearningService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @InjectRepository(DraftEntity)
    private readonly drafts: Repository<DraftEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(EvaluationJobEntity)
    private readonly jobs: Repository<EvaluationJobEntity>,
    @InjectRepository(EvaluationEntity)
    private readonly evaluations: Repository<EvaluationEntity>,
    @InjectRepository(SkillEvidenceEntity)
    private readonly evidence: Repository<SkillEvidenceEntity>,
    @InjectRepository(TeacherOverrideEntity)
    private readonly overrides: Repository<TeacherOverrideEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly classMembers: Repository<ClassMemberEntity>,
    @InjectRepository(AssignmentEntity)
    private readonly assignments: Repository<AssignmentEntity>,
    private readonly evaluator: EvaluatorService,
    private readonly access: AccessService,
    private readonly safety: SafetyService,
    private readonly usage: UsageService,
    private readonly audit: AuditService,
  ) {}

  // ─── Learners ─────────────────────────────────────────────────────────────

  async listLearners(actor: Actor) {
    return (await this.access.visibleLearners(actor)).map((l) =>
      this.presentLearner(l),
    );
  }

  async createLearner(actor: Actor, dto: CreateLearnerDto) {
    this.access.requireAdult(actor);
    // The form asks for the local year (e.g. England "Year 7"); content uses the US-equivalent grade.
    const gradeLevel = getFramework(dto.curriculum)?.localToGrade[
      dto.localGrade
    ];
    if (!gradeLevel)
      throw new BadRequestException(
        'Practice for that year or grade is not available yet.',
      );
    if (
      dto.organizationId &&
      !(await this.access.membership(actor, dto.organizationId))
    ) {
      throw new NotFoundException('School not found.');
    }
    if (!dto.agreeToNotice)
      throw new BadRequestException(
        'Please read and agree to the learning notice first.',
      );
    if (dto.noticeVersion !== LEARNING_NOTICE_VERSION) {
      throw new BadRequestException(
        'The learning notice has changed. Please reload the page and review it again.',
      );
    }
    if (dto.relationship === 'self') {
      // Students under 13 need a parent or teacher (COPPA, UK Children's Code); younger students
      // can still practice as guests, where nothing is saved.
      if (dto.confirmedAge13 !== true)
        throw new BadRequestException(
          'Only students aged 13 or older can make their own profile. Ask a parent or teacher, or practice without an account.',
        );
      if (dto.organizationId)
        throw new BadRequestException('School profiles are made by teachers.');
      if (!/^\d+$/.test(gradeLevel) || Number(gradeLevel) < 7)
        throw new BadRequestException(
          'Your own profile is for Grade 7 (Year 8 in England and Australia) and up. Ask a parent or teacher to make one for you.',
        );
      if (
        await this.dataSource.getRepository(LearnerAuthorizationEntity).count({
          where: {
            grantedBySubject: actor.subject,
            relationship: 'self',
            revokedAt: IsNull(),
          },
        })
      )
        throw new BadRequestException(
          'This account already has your own profile.',
        );
    }
    if (
      (await this.learners.count({ where: { ownerSubject: actor.subject } })) >=
      40
    ) {
      throw new BadRequestException(
        'This account already has the maximum number of student profiles.',
      );
    }
    const learner = await this.dataSource.transaction(async (m) => {
      const created = await m.save(
        m.create(LearnerEntity, {
          ownerSubject: actor.subject,
          displayName: dto.displayName.trim(),
          gradeLevel,
          curriculum: dto.curriculum,
          organizationId: dto.organizationId ?? null,
          supports: dto.supports ?? null,
          accessCodeHash: null,
          accessCodeCreatedAt: null,
        }),
      );
      await m.save(
        m.create(LearnerAuthorizationEntity, {
          learnerId: created.id,
          grantedBySubject: actor.subject,
          relationship: dto.organizationId ? 'school' : dto.relationship,
          noticeVersion: dto.noticeVersion,
          revokedAt: null,
        }),
      );
      return created;
    });
    return this.presentLearner(learner);
  }

  /** Permanently deletes a learner and everything they wrote. */
  async deleteLearner(actor: Actor, learnerId: string) {
    this.access.requireAdult(actor);
    const learner = await this.access.learner(actor, learnerId);
    await this.dataSource.transaction((m) =>
      deleteLearnerRecords(m, learner.id),
    );
    await this.audit.record(actor, learner.organizationId, 'student.deleted', {
      type: 'learner',
      id: learner.id,
    });
    return { deleted: true };
  }

  async dashboard(actor: Actor, learnerId: string) {
    const learner = await this.access.learner(actor, learnerId);
    const band = this.access.bandOf(learner);
    const [rows, submissions, drafts] = await Promise.all([
      this.evidence.find({ where: { learnerId: learner.id } }),
      this.submissions.find({
        where: { learnerId: learner.id },
        order: { createdAt: 'DESC' },
      }),
      this.drafts.find({
        where: { learnerId: learner.id },
        order: { updatedAt: 'DESC' },
      }),
    ]);
    const jobs = submissions.length
      ? await this.jobs.find({
          where: { submissionId: In(submissions.map((s) => s.id)) },
        })
      : [];
    const jobBySubmission = new Map(jobs.map((j) => [j.submissionId, j]));
    const latestSubmissionByDraft = new Map<string, SubmissionEntity>();
    for (const s of submissions)
      if (!latestSubmissionByDraft.has(s.draftId))
        latestSubmissionByDraft.set(s.draftId, s);

    const attempted = [...new Set(submissions.map((s) => s.promptId))];
    const plan = await this.planFor(learner, rows, submissions);
    const recommendation = this.recommendationFromPlan(
      plan,
      recommendNext(band, rows, attempted),
    );
    const openFlags =
      actor.kind === 'adult'
        ? await this.safety.openForLearner(learner.id)
        : [];
    const skills = skillProgress(band, rows);
    const memberships = await this.classMembers.find({
      where: { learnerId: learner.id },
    });
    const assigned = memberships.length
      ? await this.assignments.find({
          where: { classId: In(memberships.map((m) => m.classId)) },
          order: { createdAt: 'DESC' },
        })
      : [];
    const checkIns = PROMPTS.filter((p) => p.band === band && p.checkIn);
    // Drills for the skills that most need sentence-level practice (level 1–2 on the latest piece).
    const drills = DRILLS.filter(
      (d) =>
        d.band === band &&
        skills.some(
          (s) =>
            s.skillId === d.skillId &&
            s.latestRating !== null &&
            s.latestRating <= 2,
        ),
    ).map((d) => ({ id: d.id, title: d.title, skillId: d.skillId }));
    return {
      learner: this.presentLearner(learner),
      checkIn: {
        done: checkIns.filter((p) => attempted.includes(p.id)).length,
        total: checkIns.length,
      },
      assignments: assigned
        .filter((a) => getPrompt(a.promptId)?.band === band)
        .map((a) => ({
          id: a.id,
          promptId: a.promptId,
          promptTitle: getPrompt(a.promptId)?.title ?? a.promptId,
          lessonId: a.lessonId,
          lessonTitle: a.lessonId
            ? (getLesson(a.lessonId)?.title ?? null)
            : null,
          note: a.note,
          dueDate: a.dueDate,
          submitted: attempted.includes(a.promptId),
        })),
      drills,
      plan,
      safetyFlags: openFlags.map((f) => this.safety.present(f)),
      recommendation: {
        ...recommendation,
        promptTitle: recommendation.promptId
          ? (getPrompt(recommendation.promptId)?.title ?? null)
          : null,
        lessonTitle: recommendation.lessonId
          ? (getLesson(recommendation.lessonId)?.title ?? null)
          : null,
      },
      skills,
      drafts: drafts.map((d) => {
        const last = latestSubmissionByDraft.get(d.id);
        return {
          id: d.id,
          promptId: d.promptId,
          promptTitle: getPrompt(d.promptId)?.title ?? d.promptId,
          words: countWords(d.content),
          updatedAt: d.updatedAt,
          hasUnsubmittedChanges:
            d.content.trim().length > 0 &&
            (!last || last.draftRevision !== d.revision),
          latestSubmissionId: last?.id ?? null,
        };
      }),
      submissions: submissions.slice(0, 20).map((s) => ({
        id: s.id,
        promptId: s.promptId,
        promptTitle: getPrompt(s.promptId)?.title ?? s.promptId,
        attemptNumber: s.attemptNumber,
        createdAt: s.createdAt,
        state: jobBySubmission.get(s.id)?.state ?? 'queued',
      })),
    };
  }

  // ─── Drafts ───────────────────────────────────────────────────────────────

  async openDraft(actor: Actor, dto: OpenDraftDto) {
    const learner = await this.access.learner(actor, dto.learnerId);
    const prompt = getPrompt(dto.promptId);
    if (!prompt)
      throw new NotFoundException('That writing prompt does not exist.');
    if (prompt.band !== this.access.bandOf(learner))
      throw new ForbiddenException(
        'That prompt is for a different grade band.',
      );

    let draft = await this.drafts.findOne({
      where: { learnerId: learner.id, promptId: prompt.id },
    });
    if (!draft) {
      try {
        draft = await this.drafts.save(
          this.drafts.create({
            learnerId: learner.id,
            promptId: prompt.id,
            promptVersion: prompt.version,
            content: '',
            planning: null,
            revision: 0,
          }),
        );
      } catch {
        // Two tabs opened the same prompt at once; the unique index kept one draft.
        draft = await this.drafts.findOneOrFail({
          where: { learnerId: learner.id, promptId: prompt.id },
        });
      }
    }
    return this.presentDraft(draft);
  }

  async getDraft(actor: Actor, draftId: string) {
    return this.presentDraft(await this.access.draft(actor, draftId));
  }

  /** Saves only if the client edited the latest revision; otherwise 409 with the newer copy. */
  async saveDraft(actor: Actor, draftId: string, dto: SaveDraftDto) {
    const draft = await this.access.draft(actor, draftId);
    const planning = dto.planning
      ? this.cleanPlanning(dto.planning)
      : draft.planning;
    const result = await this.drafts
      .createQueryBuilder()
      .update(DraftEntity)
      .set({
        content: dto.content,
        planning: planning,
        revision: dto.expectedRevision + 1,
        ...(dto.usedDictation ? { dictationUsedSinceSubmit: true } : {}),
      })
      .where('id = :id AND revision = :rev', {
        id: draft.id,
        rev: dto.expectedRevision,
      })
      .execute();
    if (!result.affected) {
      const current = await this.drafts.findOneByOrFail({ id: draft.id });
      throw new ConflictException({
        message:
          'This draft was changed somewhere else (another tab or device).',
        current: this.presentDraft(current),
      });
    }
    return {
      id: draft.id,
      revision: dto.expectedRevision + 1,
      savedAt: new Date(),
    };
  }

  // ─── Submissions and evaluation jobs ─────────────────────────────────────

  async submit(actor: Actor, dto: SubmitDto) {
    const draft = await this.access.draft(actor, dto.draftId);

    const existingJob = await this.jobs.findOne({
      where: { idempotencyKey: dto.idempotencyKey },
    });
    if (existingJob) {
      const existing = await this.submissions.findOneBy({
        id: existingJob.submissionId,
      });
      if (
        existing?.draftId === draft.id &&
        existing.draftRevision === dto.expectedRevision
      ) {
        return this.jobStatus(existingJob);
      }
      throw new ConflictException(
        'This submission key was already used for different writing.',
      );
    }

    if (draft.revision !== dto.expectedRevision) {
      throw new ConflictException(
        'Your latest changes are not saved yet. Wait for "Saved", then submit again.',
      );
    }
    await this.enforceDailyLimits(draft.learnerId);
    const words = countWords(draft.content);
    if (words === 0)
      throw new BadRequestException('Write something before you submit.');
    if (words > MAX_SUBMISSION_WORDS)
      throw new BadRequestException(
        `Please keep this piece under ${MAX_SUBMISSION_WORDS} words.`,
      );

    // The same saved revision submitted twice (double click, two tabs) maps to one submission.
    const sameRevision = await this.submissions.findOne({
      where: { draftId: draft.id, draftRevision: draft.revision },
    });
    if (sameRevision) {
      const job = await this.jobs.findOneByOrFail({
        submissionId: sameRevision.id,
      });
      return this.jobStatus(job);
    }

    const learner = await this.learners.findOneByOrFail({
      id: draft.learnerId,
    });
    await this.access.requireAuthorization(learner.id);
    const prompt = getPrompt(draft.promptId)!;
    const rubric = getRubric(prompt.rubricId)!;

    const job = await this.dataSource.transaction(async (m) => {
      const attemptNumber =
        (await m.count(SubmissionEntity, {
          where: { learnerId: learner.id, promptId: prompt.id },
        })) + 1;
      const submission = await m.save(
        m.create(SubmissionEntity, {
          learnerId: learner.id,
          draftId: draft.id,
          draftRevision: draft.revision,
          promptId: prompt.id,
          promptVersion: draft.promptVersion,
          rubricId: rubric.id,
          rubricVersion: rubric.version,
          text: draft.content,
          attemptNumber,
          // "Am I on track?" hints are welcome practice, but that piece is then not independent evidence.
          assistanceMode: draft.coachUsedSinceSubmit
            ? 'coached'
            : 'independent',
          inputMode: dto.scribed
            ? 'scribed'
            : draft.dictationUsedSinceSubmit
              ? 'dictation'
              : 'typed',
          reflection: null,
          feedbackReport: null,
        }),
      );
      await m.update(
        DraftEntity,
        { id: draft.id },
        { coachUsedSinceSubmit: false, dictationUsedSinceSubmit: false },
      );
      // Runs even if the AI is unavailable later, so concerning writing always reaches an adult.
      await this.safety.recordScreen(
        m,
        submission.id,
        learner.id,
        draft.content,
      );
      return m.save(
        m.create(EvaluationJobEntity, {
          submissionId: submission.id,
          idempotencyKey: dto.idempotencyKey,
          state: 'queued',
          attempts: 0,
          nextAttemptAt: new Date(),
          leaseUntil: null,
          failureCode: null,
        }),
      );
    });
    return this.jobStatus(job);
  }

  async getJob(actor: Actor, jobId: string) {
    return this.jobStatus(await this.access.job(actor, jobId));
  }

  /**
   * Runs the job inside this request if it is due. The client calls this after submitting
   * and again after `retryInSeconds`, so work never depends on a background task surviving
   * a serverless response.
   */
  async processJob(actor: Actor, jobId: string) {
    const job = await this.access.job(actor, jobId);
    await this.runJob(job.id);
    return this.jobStatus(await this.jobs.findOneByOrFail({ id: job.id }));
  }

  /** Claims and runs one job. Safe to call concurrently: only one caller wins the lease. */
  async runJob(jobId: string): Promise<void> {
    const now = new Date();
    const claim = await this.jobs
      .createQueryBuilder()
      .update(EvaluationJobEntity)
      .set({
        state: 'running',
        leaseUntil: new Date(now.getTime() + LEASE_MS),
        attempts: () => '"attempts" + 1',
      })
      .where('id = :id', { id: jobId })
      .andWhere(
        `(("state" = 'queued' AND "nextAttemptAt" <= :now) OR ("state" = 'running' AND "leaseUntil" < :now))`,
        { now },
      )
      .execute();
    if (!claim.affected) return;

    const job = await this.jobs.findOneByOrFail({ id: jobId });
    const finish = (patch: Partial<EvaluationJobEntity>) =>
      this.jobs.update({ id: job.id }, { leaseUntil: null, ...patch });

    const submission = await this.submissions.findOneBy({
      id: job.submissionId,
    });
    const learner = submission
      ? await this.learners.findOneBy({ id: submission.learnerId })
      : null;
    if (!submission || !learner)
      return void (await finish({
        state: 'failed',
        failureCode: 'submission_missing',
      }));
    if (!(await this.access.hasAuthorization(learner.id)))
      return void (await finish({
        state: 'failed',
        failureCode: 'authorization_revoked',
      }));

    const prompt = getPrompt(submission.promptId);
    const rubric = getRubric(submission.rubricId);
    if (!prompt || !rubric || rubric.version !== submission.rubricVersion) {
      return void (await finish({
        state: 'failed',
        failureCode: 'content_version_unavailable',
      }));
    }

    const input = {
      prompt,
      rubric,
      gradeLevel: learner.gradeLevel,
      curriculum: learner.curriculum as FrameworkId,
      text: submission.text,
      eal: !!learner.supports?.eal,
      dictated: submission.inputMode === 'dictation',
      scribed: submission.inputMode === 'scribed',
    };
    const owner = {
      learnerId: learner.id,
      ownerKey: learner.organizationId ?? learner.ownerSubject,
    };
    try {
      const outcome = await this.usage.withContext(
        { purpose: 'evaluation', ...owner },
        () => this.evaluator.evaluate(input),
      );
      if (outcome.kind === 'not_scored')
        return void (await finish({
          state: 'not_scored',
          failureCode: outcome.code,
        }));
      if (outcome.kind === 'invalid') {
        if (job.attempts < MAX_ATTEMPTS)
          return void (await finish({
            state: 'queued',
            failureCode: outcome.code,
            nextAttemptAt: new Date(Date.now() + 3_000),
          }));
        return void (await finish({
          state: 'needs_review',
          failureCode: outcome.code,
        }));
      }

      const checks = await this.secondLookChecks(
        submission,
        prompt,
        outcome.feedback,
        outcome.repaired,
      );
      // A surprising result gets an independent second reading when today's budget allows.
      // It only adds a note for the reviewing adult; the student's levels never change.
      if (
        checks?.some((c) =>
          SECOND_OPINION_TRIGGERS.some((t) => c.startsWith(t)),
        ) &&
        (await this.usage.remainingToday()) > this.usage.dailyBudget * 0.25
      ) {
        const note = await this.secondOpinion(input, owner, outcome.feedback);
        if (note) checks.push(note);
      }

      // Revisions of one draft, or assisted work, never count as independent evidence.
      const independent =
        submission.attemptNumber === 1 &&
        submission.assistanceMode === 'independent';
      await this.dataSource.transaction(async (m) => {
        if (
          await m.findOneBy(EvaluationEntity, { submissionId: submission.id })
        )
          return;
        await m.save(
          m.create(EvaluationEntity, {
            submissionId: submission.id,
            model: outcome.model,
            templateVersion: outcome.templateVersion,
            rubricId: rubric.id,
            rubricVersion: rubric.version,
            result: outcome.feedback,
            checks,
          }),
        );
        // Dictated or adult-typed pieces never count as spelling evidence.
        const rated = outcome.feedback.dimensions.filter(
          (d) =>
            d.rating !== null &&
            !(
              submission.inputMode !== 'typed' &&
              d.skillId === 'conventions.mechanics'
            ),
        );
        if (rated.length) {
          await m.save(
            rated.map((d) =>
              m.create(SkillEvidenceEntity, {
                learnerId: learner.id,
                skillId: d.skillId,
                submissionId: submission.id,
                promptId: submission.promptId,
                rubricId: rubric.id,
                rubricVersion: rubric.version,
                rating: d.rating!,
                independent,
              }),
            ),
          );
        }
        await this.safety.recordWellbeing(
          m,
          submission.id,
          learner.id,
          outcome.wellbeing,
        );
        await m.update(
          EvaluationJobEntity,
          { id: job.id },
          { state: 'complete', failureCode: null, leaseUntil: null },
        );
      });
    } catch (err) {
      if (err instanceof BudgetExceededError) {
        // Today's AI budget is spent: the writing is saved and gets feedback when it resets.
        await finish({
          state: 'queued',
          attempts: job.attempts - 1,
          failureCode: 'daily_budget',
          nextAttemptAt: new Date(Date.now() + err.retryAfterSeconds * 1000),
        });
        return;
      }
      if (err instanceof RateLimitedError) {
        // Waiting for the free tier to refill is not the job's fault; don't spend an attempt.
        await finish({
          state: 'queued',
          attempts: job.attempts - 1,
          failureCode: 'rate_limited',
          nextAttemptAt: new Date(Date.now() + err.retryAfterSeconds * 1000),
        });
        return;
      }
      this.logger.warn(
        `[evaluate] job ${job.id} attempt ${job.attempts} failed: ${err instanceof Error ? err.message : err}`,
      );
      if (err instanceof ProviderError && job.attempts < MAX_ATTEMPTS) {
        await finish({
          state: 'queued',
          failureCode: 'provider_unavailable',
          nextAttemptAt: new Date(Date.now() + 10_000 * job.attempts),
        });
        return;
      }
      await finish({
        state: 'failed',
        failureCode:
          err instanceof ProviderError
            ? 'provider_unavailable'
            : 'internal_error',
      });
    }
  }

  /** Lets the student try again after a failure, without losing the submission. */
  async retryJob(actor: Actor, jobId: string) {
    const job = await this.access.job(actor, jobId);
    if (job.state === 'failed' || job.state === 'needs_review') {
      await this.jobs.update(
        { id: job.id },
        {
          state: 'queued',
          attempts: 0,
          nextAttemptAt: new Date(),
          failureCode: null,
        },
      );
    }
    return this.processJob(actor, jobId);
  }

  async getSubmission(actor: Actor, submissionId: string) {
    const submission = await this.access.submission(actor, submissionId);
    const [job, evaluation, previous] = await Promise.all([
      this.jobs.findOneBy({ submissionId: submission.id }),
      this.evaluations.findOneBy({ submissionId: submission.id }),
      submission.attemptNumber > 1
        ? this.submissions.findOne({
            where: {
              learnerId: submission.learnerId,
              promptId: submission.promptId,
              attemptNumber: submission.attemptNumber - 1,
            },
          })
        : Promise.resolve(null),
    ]);
    const previousEvaluation = previous
      ? await this.evaluations.findOneBy({ submissionId: previous.id })
      : null;
    const draft = await this.drafts.findOneBy({ id: submission.draftId });
    const learner = await this.learners.findOneByOrFail({
      id: submission.learnerId,
    });
    const band = this.access.bandOf(learner);
    const prompt = getPrompt(submission.promptId);

    const [overrides, flags] = await Promise.all([
      this.overrides.find({
        where: { submissionId: submission.id },
        order: { createdAt: 'ASC' },
      }),
      this.safety.forSubmission(submission.id),
    ]);
    const rubric = getRubric(submission.rubricId);
    const framework = learner.curriculum as FrameworkId;
    const alignment = rubric
      ? rubric.dimensions.map((d) => ({
          skillId: d.skillId,
          statements: alignmentIds(
            framework,
            learner.gradeLevel,
            rubric.genre,
            d.skillId as AlignmentSkill,
          ).map((id) => STANDARD_STATEMENTS[id]),
        }))
      : [];
    const nextSkill = evaluation?.result.nextSteps[0]?.skillId;
    const lesson = nextSkill
      ? LESSONS.find((l) => l.band === band && l.skillId === nextSkill)
      : undefined;

    return {
      id: submission.id,
      learnerId: submission.learnerId,
      draftId: submission.draftId,
      prompt: prompt
        ? {
            id: prompt.id,
            title: prompt.title,
            task: prompt.task,
            band: prompt.band,
            genre: prompt.genre,
            picture: prompt.picture ?? null,
          }
        : null,
      text: submission.text,
      attemptNumber: submission.attemptNumber,
      assistanceMode: submission.assistanceMode,
      createdAt: submission.createdAt,
      reflection: submission.reflection,
      learner: this.presentLearner(learner),
      feedbackReported: !!submission.feedbackReport,
      draftChangedSinceSubmission:
        !!draft && draft.revision !== submission.draftRevision,
      job: job ? this.jobStatus(job) : null,
      feedback: evaluation
        ? {
            ...evaluation.result,
            model: evaluation.model,
            rubricId: evaluation.rubricId,
            rubricVersion: evaluation.rubricVersion,
            createdAt: evaluation.createdAt,
          }
        : null,
      previousRatings: previousEvaluation
        ? Object.fromEntries(
            previousEvaluation.result.dimensions.map((d) => [
              d.skillId,
              d.rating,
            ]),
          )
        : null,
      suggestedLesson: lesson ? { id: lesson.id, title: lesson.title } : null,
      skillNames: Object.fromEntries(SKILLS.map((sk) => [sk.id, sk.name])),
      // Latest correction per skill wins; "overall" holds general comments. Confirmations
      // (an adult agreeing with the AI) are counted for accuracy but not shown as changes.
      overrides: overrides
        .filter((o) => o.kind !== 'confirmation')
        .map((o) => ({
          skillId: o.skillId,
          originalRating: o.originalRating,
          rating: o.rating,
          comment: o.comment,
          createdAt: o.createdAt,
        })),
      reviewedByAdult: overrides.length > 0,
      helpfulness: submission.helpfulness,
      inPortfolio: submission.inPortfolio,
      inputMode: submission.inputMode,
      // Automatic consistency notes for the reviewing adult.
      checks: actor.kind === 'adult' ? (evaluation?.checks ?? []) : [],
      alignment,
      // The student sees a support message; only the managing adult sees the flags themselves.
      support: this.safety.support(learner.curriculum as FrameworkId, flags),
      safetyFlags:
        actor.kind === 'adult' ? flags.map((f) => this.safety.present(f)) : [],
    };
  }

  async saveReflection(actor: Actor, submissionId: string, text: string) {
    const submission = await this.access.submission(actor, submissionId);
    await this.submissions.update(
      { id: submission.id },
      { reflection: text.trim() },
    );
    return { saved: true };
  }

  /** Adds a piece to, or removes it from, the student's portfolio of best work. */
  async setPortfolio(actor: Actor, submissionId: string, include: boolean) {
    const submission = await this.access.submission(actor, submissionId);
    await this.submissions.update(
      { id: submission.id },
      { inPortfolio: include },
    );
    return { inPortfolio: include };
  }

  /**
   * The portfolio: pieces the student chose, each with its prompt, levels and reflection,
   * newest first. Visible to the student and the adults who can see their work.
   */
  async portfolio(actor: Actor, learnerId: string) {
    const learner = await this.access.learner(actor, learnerId);
    const pieces = await this.submissions.find({
      where: { learnerId: learner.id, inPortfolio: true },
      order: { createdAt: 'DESC' },
    });
    const evals = pieces.length
      ? await this.evaluations.find({
          where: { submissionId: In(pieces.map((p) => p.id)) },
        })
      : [];
    const overrides = pieces.length
      ? await this.overrides.find({
          where: { submissionId: In(pieces.map((p) => p.id)) },
          order: { createdAt: 'ASC' },
        })
      : [];
    return {
      learner: this.presentLearner(learner),
      pieces: pieces.map((p) => {
        const prompt = getPrompt(p.promptId);
        const evaluation = evals.find((e) => e.submissionId === p.id);
        const levels = (evaluation?.result.dimensions ?? []).map((d) => {
          const corrected = overrides
            .filter(
              (o) =>
                o.submissionId === p.id &&
                o.skillId === d.skillId &&
                o.kind === 'correction',
            )
            .pop();
          return {
            skillId: d.skillId,
            name: getSkill(d.skillId)?.name ?? d.skillId,
            rating: corrected?.rating ?? d.rating,
          };
        });
        return {
          submissionId: p.id,
          createdAt: p.createdAt,
          attemptNumber: p.attemptNumber,
          prompt: prompt
            ? { id: prompt.id, title: prompt.title, genre: prompt.genre }
            : null,
          text: p.text,
          reflection: p.reflection,
          summary: evaluation?.result.summary ?? null,
          levels,
        };
      }),
    };
  }

  /** "Was this feedback helpful?" One answer per submission; a later answer replaces it. */
  async setHelpfulness(
    actor: Actor,
    submissionId: string,
    value: 'yes' | 'somewhat' | 'no',
  ) {
    const submission = await this.access.submission(actor, submissionId);
    await this.submissions.update(
      { id: submission.id },
      { helpfulness: value },
    );
    return { helpfulness: value };
  }

  async reportFeedback(actor: Actor, submissionId: string, reason: string) {
    const submission = await this.access.submission(actor, submissionId);
    await this.submissions.update(
      { id: submission.id },
      { feedbackReport: reason.trim() },
    );
    return { reported: true };
  }

  private cleanPlanning(planning: Record<string, string>) {
    const out: Record<string, string> = {};
    for (const [key, value] of Object.entries(planning).slice(0, 10)) {
      if (/^\d{1,2}$/.test(key) && typeof value === 'string')
        out[key] = value.slice(0, 1000);
    }
    return out;
  }

  // ─── Two-week plan ────────────────────────────────────────────────────────

  private async planFor(
    learner: LearnerEntity,
    rows: SkillEvidenceEntity[],
    submissions: SubmissionEntity[],
  ): Promise<Plan> {
    const plan = buildPlan({
      band: this.access.bandOf(learner),
      rows,
      attempts: submissions.map((s) => ({
        promptId: s.promptId,
        attemptNumber: s.attemptNumber,
        createdAt: s.createdAt,
      })),
      sessionsPerWeek: learner.sessionsPerWeek ?? 3,
      interests: (learner.interests ?? []) as Topic[],
      focusSkillId: learner.focusSkillId,
      planStartedAt: learner.planStartedAt
        ? new Date(learner.planStartedAt)
        : null,
      drillCompletions: learner.drillCompletions ?? {},
      now: new Date(),
    });
    // The plan's start is fixed the first time it is shown after the check-in.
    if (
      plan.status !== 'check_in' &&
      !learner.planStartedAt &&
      plan.startedAt
    ) {
      await this.learners.update(
        { id: learner.id },
        { planStartedAt: plan.startedAt },
      );
      learner.planStartedAt = plan.startedAt;
    }
    return plan;
  }

  private recommendationFromPlan(
    plan: Plan,
    fallback: ReturnType<typeof recommendNext>,
  ) {
    const next = plan.next;
    if (!next) return fallback;
    const kind =
      next.kind === 'check_in'
        ? 'check_in'
        : next.kind === 'lesson'
          ? 'lesson'
          : 'prompt';
    return {
      kind,
      promptId: next.promptId,
      lessonId: next.lessonId,
      skillId: next.skillId,
      reason: next.reason,
    } as ReturnType<typeof recommendNext>;
  }

  async getPlan(actor: Actor, learnerId: string) {
    const learner = await this.access.learner(actor, learnerId);
    const [rows, submissions] = await Promise.all([
      this.evidence.find({ where: { learnerId: learner.id } }),
      this.submissions.find({ where: { learnerId: learner.id } }),
    ]);
    return {
      learner: this.presentLearner(learner),
      preferences: {
        sessionsPerWeek: learner.sessionsPerWeek,
        interests: learner.interests ?? [],
        focusSkillId: learner.focusSkillId,
      },
      plan: await this.planFor(learner, rows, submissions),
    };
  }

  /** Students and adults can both change practice preferences; they never change consent or grade. */
  async updatePreferences(
    actor: Actor,
    learnerId: string,
    dto: PreferencesDto,
  ) {
    const learner = await this.access.learner(actor, learnerId);
    await this.learners.update(
      { id: learner.id },
      {
        ...(dto.sessionsPerWeek !== undefined
          ? { sessionsPerWeek: dto.sessionsPerWeek }
          : {}),
        ...(dto.interests !== undefined
          ? { interests: [...new Set(dto.interests)] }
          : {}),
      },
    );
    return this.getPlan(actor, learnerId);
  }

  /** A parent or teacher chooses the main goal (or clears it); the plan restarts around it. */
  async setFocus(actor: Actor, learnerId: string, skillId: string | null) {
    this.access.requireAdult(actor);
    const learner = await this.access.learner(actor, learnerId);
    const band = this.access.bandOf(learner);
    if (
      skillId &&
      !LESSONS.some((l) => l.band === band && l.skillId === skillId)
    ) {
      throw new BadRequestException(
        'Choose a skill that has a lesson for this grade.',
      );
    }
    await this.learners.update(
      { id: learner.id },
      { focusSkillId: skillId, planStartedAt: null },
    );
    return this.getPlan(actor, learnerId);
  }

  async restartPlan(actor: Actor, learnerId: string) {
    const learner = await this.access.learner(actor, learnerId);
    await this.learners.update({ id: learner.id }, { planStartedAt: null });
    return this.getPlan(actor, learnerId);
  }

  async completeDrill(actor: Actor, learnerId: string, drillId: string) {
    const learner = await this.access.learner(actor, learnerId);
    if (!DRILLS.some((d) => d.id === drillId))
      throw new NotFoundException('Practice set not found.');
    await this.learners.update(
      { id: learner.id },
      {
        drillCompletions: {
          ...(learner.drillCompletions ?? {}),
          [drillId]: new Date().toISOString(),
        },
      },
    );
    return { recorded: true };
  }

  /**
   * Fair-use limits that keep the free AI tier available to everyone: per student per day,
   * and per account or school per day.
   */
  private async enforceDailyLimits(learnerId: string) {
    const since = new Date(Date.now() - 86_400_000);
    const perStudent = await this.submissions.count({
      where: { learnerId, createdAt: MoreThan(since) },
    });
    if (perStudent >= DAILY_SUBMISSIONS_PER_STUDENT) {
      throw new HttpException(
        `That's ${DAILY_SUBMISSIONS_PER_STUDENT} pieces today, which is the daily limit. Your draft is saved; submit it tomorrow.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    const learner = await this.learners.findOneByOrFail({ id: learnerId });
    const siblings = await this.learners.find({
      where: learner.organizationId
        ? { organizationId: learner.organizationId }
        : { ownerSubject: learner.ownerSubject, organizationId: IsNull() },
      select: { id: true },
    });
    const perAccount = await this.submissions.count({
      where: {
        learnerId: In(siblings.map((l) => l.id)),
        createdAt: MoreThan(since),
      },
    });
    if (perAccount >= DAILY_SUBMISSIONS_PER_ACCOUNT) {
      throw new HttpException(
        'This account has reached today’s feedback limit. Drafts are saved; try again tomorrow.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  /** Cheap consistency checks that suggest an adult takes a second look. They never change ratings. */
  /** Re-reads the piece once and reports any skill where the two readings differ by 2 or more. */
  private async secondOpinion(
    input: Parameters<EvaluatorService['evaluate']>[0],
    owner: { learnerId: string; ownerKey: string | null },
    first: ValidatedFeedback,
  ): Promise<string | null> {
    try {
      const again = await this.usage.withContext(
        { purpose: 'second_opinion', ...owner },
        // A different sampling temperature makes it a genuinely independent reading.
        () => this.evaluator.evaluate({ ...input, temperature: 0.7 }),
      );
      if (again.kind !== 'complete') return null;
      const differences = first.dimensions.flatMap((d) => {
        const other = again.feedback.dimensions.find(
          (x) => x.skillId === d.skillId,
        )?.rating;
        return d.rating !== null &&
          typeof other === 'number' &&
          Math.abs(other - d.rating) >= 2
          ? [`${d.skillId} ${other} instead of ${d.rating}`]
          : [];
      });
      return differences.length
        ? `A second AI reading disagreed: ${differences.join('; ')}.`
        : 'A second AI reading agreed within one level on every skill.';
    } catch {
      // A second opinion is optional; rate limits or errors never hold up the student's feedback.
      return null;
    }
  }

  private async secondLookChecks(
    submission: SubmissionEntity,
    prompt: WritingPrompt,
    feedback: ValidatedFeedback,
    repaired: boolean,
  ) {
    const checks: string[] = [];
    const ratings = feedback.dimensions.filter((d) => d.rating !== null);
    const words = countWords(submission.text);
    if (
      words < prompt.suggestedWords.min / 2 &&
      ratings.some(
        (d) => d.skillId.startsWith('development.') && (d.rating ?? 0) >= 3,
      )
    ) {
      checks.push(
        `A short piece (${words} words) was rated 3 or 4 for development.`,
      );
    }
    if (ratings.length >= 5 && ratings.every((d) => d.rating === 4))
      checks.push('Every skill was rated 4.');
    if (submission.attemptNumber > 1) {
      const previous = await this.submissions.findOne({
        where: {
          learnerId: submission.learnerId,
          promptId: submission.promptId,
          attemptNumber: submission.attemptNumber - 1,
        },
      });
      const prevEval = previous
        ? await this.evaluations.findOneBy({ submissionId: previous.id })
        : null;
      for (const d of ratings) {
        const before = prevEval?.result.dimensions.find(
          (p) => p.skillId === d.skillId,
        )?.rating;
        if (typeof before === 'number' && before - (d.rating ?? 0) >= 2)
          checks.push(
            `${d.skillId} dropped from ${before} to ${d.rating} after revision.`,
          );
      }
    }
    if (repaired)
      checks.push('The AI needed a second try to quote the writing correctly.');
    return checks.length ? checks : null;
  }

  /** Learning supports (not diagnoses), set by the managing adult. */
  async updateSupports(actor: Actor, learnerId: string, dto: SupportsDto) {
    this.access.requireAdult(actor);
    const learner = await this.access.learner(actor, learnerId);
    await this.learners.update(
      { id: learner.id },
      { supports: { ...(learner.supports ?? {}), ...dto } },
    );
    return this.presentLearner(
      await this.learners.findOneByOrFail({ id: learner.id }),
    );
  }

  presentLearner(l: LearnerEntity) {
    return {
      id: l.id,
      displayName: l.displayName,
      gradeLevel: l.gradeLevel,
      band: bandForGrade(l.gradeLevel),
      curriculum: l.curriculum,
      gradeLabel: localGradeLabel(l.curriculum as FrameworkId, l.gradeLevel),
      hasAccessCode: !!l.accessCodeHash,
      sessionsPerWeek: l.sessionsPerWeek,
      interests: l.interests ?? [],
      focusSkillId: l.focusSkillId,
      organizationId: l.organizationId,
      supports: l.supports ?? {},
      createdAt: l.createdAt,
    };
  }

  presentDraft(d: DraftEntity) {
    return {
      id: d.id,
      learnerId: d.learnerId,
      promptId: d.promptId,
      promptVersion: d.promptVersion,
      content: d.content,
      planning: d.planning ?? {},
      revision: d.revision,
      coachUsedSinceSubmit: d.coachUsedSinceSubmit,
      updatedAt: d.updatedAt,
    };
  }

  private jobStatus(job: EvaluationJobEntity): JobStatus {
    const waitMs =
      job.state === 'queued'
        ? new Date(job.nextAttemptAt).getTime() - Date.now()
        : 0;
    return {
      jobId: job.id,
      submissionId: job.submissionId,
      state: job.state,
      failureCode: job.failureCode,
      retryInSeconds:
        job.state === 'queued'
          ? Math.max(0, Math.ceil(waitMs / 1000))
          : job.state === 'running'
            ? 3
            : null,
    };
  }
}
