import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import type { Actor } from '../auth/supabase-auth.guard';
import { AccessService } from './access.service';
import {
  bandForGrade,
  getLesson,
  getPrompt,
  getRubric,
  getSkill,
} from './content';
import {
  AssignmentEntity,
  ClassEntity,
  ClassMemberEntity,
  EvaluationEntity,
  EvaluationJobEntity,
  LearnerEntity,
  SkillEvidenceEntity,
  SubmissionEntity,
  TeacherOverrideEntity,
  SafetyFlagEntity,
  OrgMemberEntity,
} from './entities';
import {
  CreateAssignmentDto,
  CreateClassDto,
  OverrideDto,
} from './learning.dto';
import { LearningService } from './learning.service';
import { AuditService } from './audit.service';
import { skillProgress } from './progress';

/** Classes, assignments, a review queue and rating corrections for the adult who owns the profiles. */
@Injectable()
export class TeachService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(ClassEntity)
    private readonly classes: Repository<ClassEntity>,
    @InjectRepository(ClassMemberEntity)
    private readonly members: Repository<ClassMemberEntity>,
    @InjectRepository(AssignmentEntity)
    private readonly assignments: Repository<AssignmentEntity>,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(EvaluationEntity)
    private readonly evaluations: Repository<EvaluationEntity>,
    @InjectRepository(EvaluationJobEntity)
    private readonly jobs: Repository<EvaluationJobEntity>,
    @InjectRepository(SkillEvidenceEntity)
    private readonly evidence: Repository<SkillEvidenceEntity>,
    @InjectRepository(TeacherOverrideEntity)
    private readonly overrides: Repository<TeacherOverrideEntity>,
    @InjectRepository(SafetyFlagEntity)
    private readonly flags: Repository<SafetyFlagEntity>,
    @InjectRepository(OrgMemberEntity)
    private readonly orgMembers: Repository<OrgMemberEntity>,
    private readonly access: AccessService,
    private readonly learning: LearningService,
    private readonly audit: AuditService,
  ) {}

  private ownedClass(actor: Actor, classId: string) {
    return this.access.manageableClass(actor, classId);
  }

  async listClasses(actor: Actor) {
    this.access.requireAdult(actor);
    // Personal classes, plus school classes the adult can manage while an active member.
    const memberships = await this.orgMembers.find({
      where: { subject: actor.subject, status: 'active' },
    });
    const adminOrgs = memberships
      .filter((m) => m.role === 'admin')
      .map((m) => m.organizationId);
    const teacherOrgs = memberships.map((m) => m.organizationId);
    const all = await this.classes.find({
      where: [
        { ownerSubject: actor.subject },
        ...(adminOrgs.length ? [{ organizationId: In(adminOrgs) }] : []),
      ],
      order: { createdAt: 'ASC' },
    });
    const rows = all.filter(
      (c) => !c.organizationId || teacherOrgs.includes(c.organizationId),
    );
    const counts = rows.length
      ? await this.members.find({
          where: { classId: In(rows.map((c) => c.id)) },
        })
      : [];
    return rows.map((c) => ({
      id: c.id,
      name: c.name,
      organizationId: c.organizationId,
      students: counts.filter((m) => m.classId === c.id).length,
      createdAt: c.createdAt,
    }));
  }

  async createClass(actor: Actor, dto: CreateClassDto) {
    this.access.requireAdult(actor);
    if (
      (await this.classes.count({ where: { ownerSubject: actor.subject } })) >=
      20
    ) {
      throw new BadRequestException('You can have up to 20 classes.');
    }
    if (
      dto.organizationId &&
      !(await this.access.membership(actor, dto.organizationId))
    ) {
      throw new NotFoundException('School not found.');
    }
    const cls = await this.classes.save(
      this.classes.create({
        ownerSubject: actor.subject,
        name: dto.name.trim(),
        organizationId: dto.organizationId ?? null,
      }),
    );
    return {
      id: cls.id,
      name: cls.name,
      students: 0,
      createdAt: cls.createdAt,
    };
  }

  async deleteClass(actor: Actor, classId: string) {
    const cls = await this.ownedClass(actor, classId);
    await this.dataSource.transaction(async (m) => {
      await m.delete(AssignmentEntity, { classId: cls.id });
      await m.delete(ClassMemberEntity, { classId: cls.id });
      await m.delete(ClassEntity, { id: cls.id });
    });
    return { deleted: true };
  }

  async addMember(actor: Actor, classId: string, learnerId: string) {
    const cls = await this.ownedClass(actor, classId);
    const learner = await this.access.learner(actor, learnerId);
    // School classes hold only that school's students; personal classes only personal profiles.
    if ((learner.organizationId ?? null) !== (cls.organizationId ?? null)) {
      throw new BadRequestException(
        'This student belongs to a different school or account.',
      );
    }
    if (
      !(await this.members.existsBy({ classId: cls.id, learnerId: learner.id }))
    ) {
      await this.members.save(
        this.members.create({ classId: cls.id, learnerId: learner.id }),
      );
    }
    return { added: true };
  }

  async removeMember(actor: Actor, classId: string, learnerId: string) {
    const cls = await this.ownedClass(actor, classId);
    await this.members.delete({ classId: cls.id, learnerId });
    return { removed: true };
  }

  async classDetail(actor: Actor, classId: string) {
    const cls = await this.ownedClass(actor, classId);
    const memberRows = await this.members.find({ where: { classId: cls.id } });
    const learnerRows = memberRows.length
      ? await this.learners.find({
          where: { id: In(memberRows.map((m) => m.learnerId)) },
        })
      : [];
    const evidenceRows = learnerRows.length
      ? await this.evidence.find({
          where: { learnerId: In(learnerRows.map((l) => l.id)) },
        })
      : [];
    const assignmentRows = await this.assignments.find({
      where: { classId: cls.id },
      order: { createdAt: 'DESC' },
    });
    const submitted = learnerRows.length
      ? await this.submissions.find({
          where: { learnerId: In(learnerRows.map((l) => l.id)) },
          select: { learnerId: true, promptId: true },
        })
      : [];

    const students = learnerRows
      .sort((a, b) => a.displayName.localeCompare(b.displayName))
      .map((l) => {
        const band = bandForGrade(l.gradeLevel);
        return {
          learner: this.learning.presentLearner(l),
          skills: band
            ? skillProgress(
                band,
                evidenceRows.filter((e) => e.learnerId === l.id),
              )
            : [],
        };
      });

    // Class picture: how many students are at each level, per skill. Shown as counts, never averaged.
    const skillIds = [
      ...new Set(students.flatMap((s) => s.skills.map((k) => k.skillId))),
    ];
    const distribution = skillIds.map((skillId) => {
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, notYet: 0 };
      for (const s of students) {
        const k = s.skills.find((x) => x.skillId === skillId);
        if (!k || k.latestRating === null) counts.notYet += 1;
        else counts[k.latestRating as 1 | 2 | 3 | 4] += 1;
      }
      return { skillId, name: getSkill(skillId)?.name ?? skillId, counts };
    });

    return {
      id: cls.id,
      name: cls.name,
      students,
      distribution,
      assignments: assignmentRows.map((a) => ({
        id: a.id,
        promptId: a.promptId,
        promptTitle: getPrompt(a.promptId)?.title ?? a.promptId,
        band: getPrompt(a.promptId)?.band ?? null,
        lessonId: a.lessonId,
        lessonTitle: a.lessonId ? (getLesson(a.lessonId)?.title ?? null) : null,
        note: a.note,
        dueDate: a.dueDate,
        submittedCount: new Set(
          submitted
            .filter((s) => s.promptId === a.promptId)
            .map((s) => s.learnerId),
        ).size,
        createdAt: a.createdAt,
      })),
    };
  }

  async createAssignment(
    actor: Actor,
    classId: string,
    dto: CreateAssignmentDto,
  ) {
    const cls = await this.ownedClass(actor, classId);
    const prompt = getPrompt(dto.promptId);
    if (!prompt)
      throw new BadRequestException('Choose a prompt from the catalog.');
    if (dto.lessonId) {
      const lesson = getLesson(dto.lessonId);
      if (!lesson || lesson.band !== prompt.band)
        throw new BadRequestException(
          'The lesson must be for the same grade band as the prompt.',
        );
    }
    const a = await this.assignments.save(
      this.assignments.create({
        classId: cls.id,
        promptId: prompt.id,
        lessonId: dto.lessonId ?? null,
        note: dto.note?.trim() || null,
        dueDate: dto.dueDate ?? null,
      }),
    );
    return { id: a.id };
  }

  async deleteAssignment(actor: Actor, assignmentId: string) {
    this.access.requireAdult(actor);
    const a = await this.assignments.findOneBy({ id: assignmentId });
    if (!a) throw new NotFoundException('Assignment not found.');
    await this.ownedClass(actor, a.classId);
    await this.assignments.delete({ id: a.id });
    return { deleted: true };
  }

  /** Recent submissions for the adult's students, with items that need a human look first. */
  async reviewQueue(actor: Actor, classId?: string) {
    this.access.requireAdult(actor);
    let learnerRows = await this.access.visibleLearners(actor);
    if (classId) {
      const cls = await this.ownedClass(actor, classId);
      const ids = new Set(
        (await this.members.find({ where: { classId: cls.id } })).map(
          (m) => m.learnerId,
        ),
      );
      learnerRows = learnerRows.filter((l) => ids.has(l.id));
    }
    if (!learnerRows.length) return [];
    const subs = await this.submissions.find({
      where: { learnerId: In(learnerRows.map((l) => l.id)) },
      order: { createdAt: 'DESC' },
      take: 100,
    });
    if (!subs.length) return [];
    const ids = subs.map((s) => s.id);
    const [jobs, evals, ovs, flags] = await Promise.all([
      this.jobs.find({ where: { submissionId: In(ids) } }),
      this.evaluations.find({ where: { submissionId: In(ids) } }),
      this.overrides.find({ where: { submissionId: In(ids) } }),
      this.flags.find({ where: { submissionId: In(ids), status: 'open' } }),
    ]);
    const items = subs.map((s) => {
      const job = jobs.find((j) => j.submissionId === s.id);
      const ev = evals.find((e) => e.submissionId === s.id);
      const learner = learnerRows.find((l) => l.id === s.learnerId)!;
      const flagged = flags.filter((f) => f.submissionId === s.id);
      const reasons = [
        ...(flagged.some((f) => f.category !== 'personal_info')
          ? ['Wellbeing check: please read this piece']
          : []),
        ...(flagged.some((f) => f.category === 'personal_info')
          ? ['May contain personal details']
          : []),
        ...(s.feedbackReport ? ['Student reported the feedback'] : []),
        ...(ev?.checks?.length ? ['Worth a second look'] : []),
        ...(job && (job.state === 'needs_review' || job.state === 'failed')
          ? ['Feedback could not be produced']
          : []),
      ];
      return {
        submissionId: s.id,
        learner: { id: learner.id, displayName: learner.displayName },
        promptTitle: getPrompt(s.promptId)?.title ?? s.promptId,
        attemptNumber: s.attemptNumber,
        assistanceMode: s.assistanceMode,
        createdAt: s.createdAt,
        state: job?.state ?? 'queued',
        ratings: ev
          ? Object.fromEntries(
              ev.result.dimensions.map((d) => [d.skillId, d.rating]),
            )
          : null,
        reviewed: ovs.some((o) => o.submissionId === s.id),
        needsAttention: reasons,
        wellbeing: flagged.some((f) => f.category !== 'personal_info'),
      };
    });
    // Wellbeing first, then anything else needing a look, then newest.
    return items.sort(
      (a, b) =>
        Number(b.wellbeing) - Number(a.wellbeing) ||
        Number(b.needsAttention.length > 0) -
          Number(a.needsAttention.length > 0),
    );
  }

  /**
   * An adult checked the AI levels and agrees. Stored as confirmations so AI accuracy can be
   * measured on reviewed work, not only on the pieces someone disagreed with.
   */
  async confirm(actor: Actor, submissionId: string) {
    this.access.requireAdult(actor);
    const submission = await this.access.submission(actor, submissionId);
    const evaluation = await this.evaluations.findOneBy({
      submissionId: submission.id,
    });
    if (!evaluation)
      throw new BadRequestException('There is no feedback to confirm yet.');
    const existing = new Set(
      (
        await this.overrides.find({ where: { submissionId: submission.id } })
      ).map((o) => o.skillId),
    );
    const rows = evaluation.result.dimensions
      .filter((d) => d.rating !== null && !existing.has(d.skillId))
      .map((d) =>
        this.overrides.create({
          submissionId: submission.id,
          skillId: d.skillId,
          kind: 'confirmation',
          originalRating: d.rating,
          rating: d.rating,
          comment: 'Confirmed by an adult reviewer',
          authorSubject: actor.subject,
        }),
      );
    if (rows.length) await this.overrides.save(rows);
    const owner = await this.learners.findOneBy({ id: submission.learnerId });
    await this.audit.record(
      actor,
      owner?.organizationId ?? null,
      'feedback.confirmed',
      { type: 'submission', id: submission.id },
    );
    return { confirmed: rows.length };
  }

  /**
   * Records an adult's correction (append-only) and updates the student's skill evidence so
   * progress and recommendations follow the corrected level. The AI result itself is kept.
   */
  async override(actor: Actor, submissionId: string, dto: OverrideDto) {
    this.access.requireAdult(actor);
    const submission = await this.access.submission(actor, submissionId);
    const rubric = getRubric(submission.rubricId);
    const isOverall = dto.skillId === 'overall';
    if (
      !isOverall &&
      !rubric?.dimensions.some((d) => d.skillId === dto.skillId)
    ) {
      throw new BadRequestException('That skill is not on this rubric.');
    }
    if (isOverall && dto.rating !== null && dto.rating !== undefined)
      throw new BadRequestException('A general comment has no level.');
    const evaluation = await this.evaluations.findOneBy({
      submissionId: submission.id,
    });
    const original =
      evaluation?.result.dimensions.find((d) => d.skillId === dto.skillId)
        ?.rating ?? null;
    const rating = isOverall ? null : (dto.rating ?? null);

    await this.dataSource.transaction(async (m) => {
      await m.save(
        m.create(TeacherOverrideEntity, {
          submissionId: submission.id,
          skillId: dto.skillId,
          kind: isOverall ? 'comment' : 'correction',
          originalRating: original,
          rating,
          comment: dto.comment.trim(),
          authorSubject: actor.subject,
        }),
      );
      if (isOverall || rating === null || !rubric) return;
      const existing = await m.findOneBy(SkillEvidenceEntity, {
        submissionId: submission.id,
        skillId: dto.skillId,
      });
      if (existing)
        await m.update(SkillEvidenceEntity, { id: existing.id }, { rating });
      else {
        await m.save(
          m.create(SkillEvidenceEntity, {
            learnerId: submission.learnerId,
            skillId: dto.skillId,
            submissionId: submission.id,
            promptId: submission.promptId,
            rubricId: rubric.id,
            rubricVersion: rubric.version,
            rating,
            independent:
              submission.attemptNumber === 1 &&
              submission.assistanceMode === 'independent',
          }),
        );
      }
    });
    const owner = await this.learners.findOneBy({ id: submission.learnerId });
    await this.audit.record(
      actor,
      owner?.organizationId ?? null,
      isOverall ? 'feedback.commented' : 'feedback.corrected',
      { type: 'submission', id: submission.id },
      isOverall ? undefined : `${dto.skillId}: ${original ?? '–'} → ${rating}`,
    );
    return { saved: true };
  }
}
