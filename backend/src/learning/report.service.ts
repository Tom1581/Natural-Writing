import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { Actor } from '../auth/supabase-auth.guard';
import { AccessService } from './access.service';
import {
  alignmentIds,
  getFramework,
  getPrompt,
  RUBRICS,
  STANDARD_STATEMENTS,
  type AlignmentSkill,
  type FrameworkId,
} from './content';
import {
  DraftEntity,
  EvaluationEntity,
  LearnerAuthorizationEntity,
  SkillEvidenceEntity,
  SubmissionEntity,
  TeacherOverrideEntity,
} from './entities';
import { countWords } from './evaluator/evaluator.service';
import { LearningService } from './learning.service';
import { AuditService } from './audit.service';
import { skillProgress } from './progress';

@Injectable()
export class ReportService {
  constructor(
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(EvaluationEntity)
    private readonly evaluations: Repository<EvaluationEntity>,
    @InjectRepository(SkillEvidenceEntity)
    private readonly evidence: Repository<SkillEvidenceEntity>,
    @InjectRepository(TeacherOverrideEntity)
    private readonly overrides: Repository<TeacherOverrideEntity>,
    @InjectRepository(DraftEntity)
    private readonly drafts: Repository<DraftEntity>,
    @InjectRepository(LearnerAuthorizationEntity)
    private readonly authorizations: Repository<LearnerAuthorizationEntity>,
    private readonly access: AccessService,
    private readonly learning: LearningService,
    private readonly audit: AuditService,
  ) {}

  /** A plain-language progress report, with each skill linked to the student's own curriculum. */
  async report(actor: Actor, learnerId: string) {
    const learner = await this.access.learner(actor, learnerId);
    const band = this.access.bandOf(learner);
    const framework = learner.curriculum as FrameworkId;
    const [rows, subs] = await Promise.all([
      this.evidence.find({ where: { learnerId: learner.id } }),
      this.submissions.find({
        where: { learnerId: learner.id },
        order: { createdAt: 'ASC' },
      }),
    ]);
    const evals = subs.length
      ? await this.evaluations.find({
          where: { submissionId: In(subs.map((s) => s.id)) },
        })
      : [];
    const progress = skillProgress(band, rows);

    const rubrics = RUBRICS.filter((r) => r.band === band);
    const skills = progress.map((p) => {
      // Union of the statements this skill is assessed against, across the genres of this band.
      const ids = [
        ...new Set(
          rubrics
            .filter((r) => r.dimensions.some((d) => d.skillId === p.skillId))
            .flatMap((r) =>
              alignmentIds(
                framework,
                learner.gradeLevel,
                r.genre,
                p.skillId as AlignmentSkill,
              ),
            ),
        ),
      ];
      const history = rows
        .filter((r) => r.skillId === p.skillId)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
        .map((r) => ({
          rating: r.rating,
          independent: r.independent,
          date: r.createdAt,
          promptTitle: getPrompt(r.promptId)?.title ?? r.promptId,
        }));
      return {
        ...p,
        history,
        standards: ids.map((id) => STANDARD_STATEMENTS[id]),
      };
    });

    const pieces = subs.map((s) => {
      const ev = evals.find((e) => e.submissionId === s.id);
      return {
        submissionId: s.id,
        promptTitle: getPrompt(s.promptId)?.title ?? s.promptId,
        genre: getPrompt(s.promptId)?.genre ?? null,
        attemptNumber: s.attemptNumber,
        assistanceMode: s.assistanceMode,
        words: countWords(s.text),
        date: s.createdAt,
        summary: ev?.result.summary ?? null,
        nextStep: ev?.result.nextSteps[0] ?? null,
        reflection: s.reflection,
      };
    });

    return {
      learner: this.learning.presentLearner(learner),
      framework: getFramework(framework),
      generatedAt: new Date(),
      totals: {
        pieces: subs.filter((s) => s.attemptNumber === 1).length,
        revisions: subs.filter((s) => s.attemptNumber > 1).length,
        words: subs.reduce((n, s) => n + countWords(s.text), 0),
        reflections: subs.filter((s) => s.reflection).length,
        firstActivity: subs[0]?.createdAt ?? null,
      },
      skills,
      pieces: pieces.reverse(),
      note: 'Levels describe individual pieces of writing on a practice rubric. They are not school grades, a grade-level score, or a diagnosis.',
    };
  }

  /** Everything stored about one student, for the adult who manages the profile. */
  async export(actor: Actor, learnerId: string) {
    this.access.requireAdult(actor);
    const learner = await this.access.learner(actor, learnerId);
    await this.audit.record(actor, learner.organizationId, 'student.exported', {
      type: 'learner',
      id: learner.id,
    });
    const subs = await this.submissions.find({
      where: { learnerId: learner.id },
      order: { createdAt: 'ASC' },
    });
    const ids = subs.map((s) => s.id);
    const [drafts, evals, ovs, rows, auths] = await Promise.all([
      this.drafts.find({ where: { learnerId: learner.id } }),
      ids.length
        ? this.evaluations.find({ where: { submissionId: In(ids) } })
        : Promise.resolve([] as EvaluationEntity[]),
      ids.length
        ? this.overrides.find({ where: { submissionId: In(ids) } })
        : Promise.resolve([] as TeacherOverrideEntity[]),
      this.evidence.find({ where: { learnerId: learner.id } }),
      this.authorizations.find({ where: { learnerId: learner.id } }),
    ]);
    return {
      exportedAt: new Date(),
      learner: this.learning.presentLearner(learner),
      authorizations: auths.map((a) => ({
        relationship: a.relationship,
        noticeVersion: a.noticeVersion,
        grantedAt: a.grantedAt,
        revokedAt: a.revokedAt,
      })),
      drafts: drafts.map((d) => ({
        promptId: d.promptId,
        content: d.content,
        planning: d.planning,
        updatedAt: d.updatedAt,
      })),
      submissions: subs.map((s) => ({
        id: s.id,
        promptId: s.promptId,
        attemptNumber: s.attemptNumber,
        assistanceMode: s.assistanceMode,
        text: s.text,
        reflection: s.reflection,
        createdAt: s.createdAt,
        feedback: evals.find((e) => e.submissionId === s.id)?.result ?? null,
        corrections: ovs
          .filter((o) => o.submissionId === s.id)
          .map((o) => ({
            skillId: o.skillId,
            rating: o.rating,
            comment: o.comment,
            createdAt: o.createdAt,
          })),
      })),
      skillEvidence: rows.map((r) => ({
        skillId: r.skillId,
        promptId: r.promptId,
        rating: r.rating,
        independent: r.independent,
        createdAt: r.createdAt,
      })),
    };
  }
}
