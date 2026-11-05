import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  Headers,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  CurrentActor,
  SupabaseAuthGuard,
  type Actor,
} from '../auth/supabase-auth.guard';
import { clientIp } from '../auth/ip-rate-limit.guard';
import {
  alignmentIds,
  DRILLS,
  FRAMEWORKS,
  getDrill,
  getFramework,
  getLesson,
  getPrompt,
  getRubric,
  getSkill,
  GRADES_IN_BAND,
  LESSONS,
  localGradeLabel,
  localYearLabel,
  localYears,
  BANDS,
  bandForGrade,
  getBand,
  getExample,
  EXAMPLES,
  PROMPTS,
  RUBRICS,
  SKILLS,
  STANDARD_STATEMENTS,
  SUPPORTED_GRADES,
  type AlignmentSkill,
  type Genre,
  type GradeBand,
  type WritingPrompt,
} from './content';
import { CoachService } from './coach.service';
import {
  CreateAssignmentDto,
  CreateClassDto,
  CreateLearnerDto,
  FeedbackReportDto,
  HelpfulnessDto,
  PortfolioDto,
  ContentReviewDto,
  FocusDto,
  CreateOrgDto,
  InviteMemberDto,
  RosterImportDto,
  SupportsDto,
  PreferencesDto,
  ResolveFlagDto,
  LEARNING_NOTICE_VERSION,
  OpenDraftDto,
  OverrideDto,
  ReflectionDto,
  SaveDraftDto,
  StudentSessionDto,
  SubmitDto,
  GuestFeedbackDto,
} from './learning.dto';
import { LearningService } from './learning.service';
import { ReportService } from './report.service';
import { StudentAccessService } from './student-access.service';
import { TeachService } from './teach.service';
import { SafetyService } from './safety.service';
import { GuestService } from './guest.service';
import { QualityService } from './quality.service';
import { MetricsService } from './metrics.service';
import { ContentReviewService } from './content-review.service';
import { OrgService } from './org.service';
import { RetentionService } from './retention.service';

const validation = new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
  transform: true,
});

/** Statements for one skill in every framework, grouped by grade/year, for the grades of a band. */
function alignmentAcrossFrameworks(
  band: GradeBand,
  genre: Genre,
  skill: AlignmentSkill,
) {
  return FRAMEWORKS.map((fw) => ({
    framework: {
      id: fw.id,
      shortName: fw.shortName,
      country: fw.country,
      version: fw.version,
    },
    grades: GRADES_IN_BAND[band]
      .filter((grade) => Object.values(fw.localToGrade).includes(grade))
      .map((grade) => ({
        grade,
        label: localGradeLabel(fw.id, grade),
        note: gradeNote(fw, grade),
        statements: alignmentIds(fw.id, grade, genre, skill).map((id) => ({
          id,
          ...STANDARD_STATEMENTS[id],
        })),
      })),
  }));
}

function gradeNote(fw: (typeof FRAMEWORKS)[number], grade: string) {
  const local = localYears(fw).find((y) => fw.localToGrade[y] === grade);
  return (local && fw.gradeNotes?.[local]) || null;
}

function presentPrompt(p: WritingPrompt) {
  const rubric = getRubric(p.rubricId)!;
  return {
    ...p,
    rubric: {
      id: rubric.id,
      version: rubric.version,
      title: rubric.title,
      dimensions: rubric.dimensions.map((d) => ({
        skillId: d.skillId,
        name: getSkill(d.skillId)?.name ?? d.skillId,
        levels: d.levels,
      })),
    },
  };
}

/** Public curriculum. Contains no student data. */
@Controller('v1/learning')
export class LearningCatalogController {
  constructor(private readonly contentReviewStatus: ContentReviewService) {}

  /** Educator sign-off for an item's current version (approval count and reviewer roles only). */
  @Get('content/:id/review-status')
  async reviewStatus(@Param('id') id: string) {
    const status = await this.contentReviewStatus.publicStatus(id);
    if (!status) throw new NotFoundException('Item not found.');
    return status;
  }

  @Get('catalog')
  catalog() {
    return {
      noticeVersion: LEARNING_NOTICE_VERSION,
      supportedGrades: SUPPORTED_GRADES,
      bands: BANDS,
      frameworks: FRAMEWORKS.map((f) => ({
        id: f.id,
        country: f.country,
        shortName: f.shortName,
        name: f.name,
        version: f.version,
        gradeWord: f.gradeWord,
        localGrades: localYears(f),
        localGradeLabels: Object.fromEntries(
          localYears(f).map((y) => [y, localYearLabel(f, y)]),
        ),
        gradeNotes: f.gradeNotes ?? {},
        localToGrade: f.localToGrade,
      })),
      skills: SKILLS,
      rubrics: RUBRICS.map((r) => ({
        id: r.id,
        version: r.version,
        band: r.band,
        genre: r.genre,
        title: r.title,
      })),
      // Check-in and checkpoint prompts stay out of public listings so students meet them fresh.
      prompts: PROMPTS.map((p) => ({
        id: p.id,
        band: p.band,
        genre: p.genre,
        title: p.title,
        task: p.checkIn || p.checkpoint ? null : p.task,
        topics: p.topics ?? [],
        targetSkills: p.targetSkills,
        checkIn: !!p.checkIn,
        checkpoint: !!p.checkpoint,
        review: p.review,
      })),
      lessons: LESSONS.map((l) => ({
        id: l.id,
        band: l.band,
        skillId: l.skillId,
        title: l.title,
        minutes: l.minutes,
        objective: l.objective,
        review: l.review,
      })),
      examples: EXAMPLES.map((e) => ({
        id: e.id,
        rubricId: e.rubricId,
        band: e.band,
        genre: e.genre,
        title: e.title,
        writer: e.writer,
      })),
      drills: DRILLS.map((d) => ({
        id: d.id,
        band: d.band,
        skillId: d.skillId,
        title: d.title,
        description: d.description,
        items: d.items.length,
      })),
    };
  }

  @Get('lessons/:id')
  lesson(@Param('id') id: string) {
    const lesson = getLesson(id);
    if (!lesson) throw new NotFoundException('Lesson not found.');
    const practice = getPrompt(lesson.practicePromptId)!;
    return {
      ...lesson,
      skill: getSkill(lesson.skillId),
      practicePrompt: {
        id: practice.id,
        title: practice.title,
        genre: practice.genre,
      },
      drills: DRILLS.filter(
        (d) => d.band === lesson.band && d.skillId === lesson.skillId,
      ).map((d) => ({ id: d.id, title: d.title })),
      alignment: alignmentAcrossFrameworks(
        lesson.band,
        practice.genre,
        lesson.skillId as AlignmentSkill,
      ),
    };
  }

  @Get('prompts/:id')
  prompt(@Param('id') id: string) {
    const prompt = getPrompt(id);
    if (!prompt) throw new NotFoundException('Prompt not found.');
    return presentPrompt(prompt);
  }

  @Get('drills/:id')
  drill(@Param('id') id: string) {
    const drill = getDrill(id);
    if (!drill) throw new NotFoundException('Practice set not found.');
    const lesson = LESSONS.find(
      (l) => l.band === drill.band && l.skillId === drill.skillId,
    );
    return {
      ...drill,
      skill: getSkill(drill.skillId),
      lesson: lesson ? { id: lesson.id, title: lesson.title } : null,
      alignment: alignmentAcrossFrameworks(
        drill.band,
        'opinion',
        drill.skillId as AlignmentSkill,
      ),
    };
  }

  /** An annotated model piece with the task it answers and the rubric's skill names. */
  @Get('examples/:id')
  example(@Param('id') id: string) {
    const example = getExample(id);
    if (!example) throw new NotFoundException('Example not found.');
    const prompt = getPrompt(example.promptId)!;
    const rubric = getRubric(example.rubricId)!;
    return {
      ...example,
      prompt: {
        id: prompt.id,
        title: prompt.title,
        task: prompt.task,
        sources: prompt.sources ?? [],
        picture: prompt.picture ?? null,
      },
      rubric: {
        id: rubric.id,
        title: rubric.title,
        dimensions: rubric.dimensions.map((d) => ({
          skillId: d.skillId,
          name: getSkill(d.skillId)?.name ?? d.skillId,
          levels: d.levels,
        })),
      },
      others: EXAMPLES.filter(
        (e) => e.band === example.band && e.id !== example.id,
      ).map((e) => ({ id: e.id, title: e.title, genre: e.genre })),
    };
  }

  /** One rubric in full, with its scored examples and where it is used. */
  @Get('rubrics/:id')
  rubric(@Param('id') id: string) {
    const rubric = getRubric(id);
    if (!rubric) throw new NotFoundException('Rubric not found.');
    const skillIds = rubric.dimensions.map((d) => d.skillId);
    return {
      ...rubric,
      bandInfo: getBand(rubric.band),
      dimensions: rubric.dimensions.map((d) => ({
        ...d,
        name: getSkill(d.skillId)?.name ?? d.skillId,
        studentGoal: getSkill(d.skillId)?.studentGoal ?? '',
      })),
      // Reserved prompts stay unnamed so students meet them fresh.
      prompts: PROMPTS.filter(
        (p) => p.rubricId === rubric.id && !p.checkIn && !p.checkpoint,
      ).map((p) => ({ id: p.id, title: p.title })),
      lessons: LESSONS.filter(
        (l) => l.band === rubric.band && skillIds.includes(l.skillId),
      ).map((l) => ({ id: l.id, title: l.title, skillId: l.skillId })),
      examples: EXAMPLES.filter((e) => e.rubricId === rubric.id).map((e) => ({
        id: e.id,
        title: e.title,
      })),
    };
  }

  /**
   * Everything public about one grade (US-equivalent "K".."12"): its band, the goals each
   * rubric sets, and the official statements for that grade in every framework.
   */
  @Get('grades/:grade')
  grade(@Param('grade') grade: string) {
    const band = bandForGrade(grade);
    if (!band) throw new NotFoundException('Grade not found.');
    const rubrics = RUBRICS.filter((r) => r.band === band);
    const visible = (p: WritingPrompt) => !p.checkIn && !p.checkpoint;
    return {
      grade,
      band: getBand(band),
      rubrics: rubrics.map((r) => ({
        id: r.id,
        genre: r.genre,
        title: r.title,
        goals: r.dimensions.map((d) => ({
          skillId: d.skillId,
          name: getSkill(d.skillId)?.name ?? d.skillId,
          meets: d.levels[3],
          beyond: d.levels[4],
        })),
        words: PROMPTS.find((p) => p.rubricId === r.id)?.suggestedWords ?? null,
      })),
      lessons: LESSONS.filter((l) => l.band === band).map((l) => ({
        id: l.id,
        title: l.title,
        skillId: l.skillId,
        minutes: l.minutes,
        objective: l.objective,
      })),
      prompts: PROMPTS.filter((p) => p.band === band && visible(p)).map(
        (p) => ({ id: p.id, title: p.title, genre: p.genre, task: p.task }),
      ),
      drills: DRILLS.filter((d) => d.band === band).map((d) => ({
        id: d.id,
        title: d.title,
        description: d.description,
      })),
      examples: EXAMPLES.filter((e) => e.band === band).map((e) => ({
        id: e.id,
        title: e.title,
        genre: e.genre,
      })),
      frameworks: FRAMEWORKS.filter((fw) =>
        Object.values(fw.localToGrade).includes(grade),
      ).map((fw) => {
        const local = localYears(fw).find((y) => fw.localToGrade[y] === grade)!;
        return {
          id: fw.id,
          country: fw.country,
          shortName: fw.shortName,
          name: fw.name,
          local,
          label: localYearLabel(fw, local),
          note: fw.gradeNotes?.[local] ?? null,
          genres: rubrics.map((r) => ({
            genre: r.genre,
            skills: [...r.dimensions.map((d) => d.skillId), 'revision'].map(
              (skillId) => ({
                skillId,
                name:
                  skillId === 'revision'
                    ? 'Revising and editing'
                    : (getSkill(skillId)?.name ?? skillId),
                statements: alignmentIds(
                  fw.id,
                  grade,
                  r.genre,
                  skillId as AlignmentSkill,
                ).map((sid) => ({ id: sid, ...STANDARD_STATEMENTS[sid] })),
              }),
            ),
          })),
        };
      }),
    };
  }

  /** Full alignment for one framework: grade/year → genre → skill → official statements. */
  @Get('curriculum/:framework')
  curriculum(@Param('framework') frameworkId: string) {
    const fw = getFramework(frameworkId);
    if (!fw) throw new NotFoundException('Curriculum not found.');
    return {
      framework: fw,
      grades: localYears(fw).map((local) => {
        const grade = fw.localToGrade[local];
        const band = bandForGrade(grade)!;
        return {
          grade,
          local,
          label: localYearLabel(fw, local),
          note: fw.gradeNotes?.[local] ?? null,
          band,
          genres: RUBRICS.filter((r) => r.band === band).map((r) => ({
            genre: r.genre,
            rubricTitle: r.title,
            skills: [...r.dimensions.map((d) => d.skillId), 'revision'].map(
              (skillId) => ({
                skillId,
                name:
                  skillId === 'revision'
                    ? 'Revising and editing'
                    : (getSkill(skillId)?.name ?? skillId),
                lessons: LESSONS.filter(
                  (l) => l.band === band && l.skillId === skillId,
                ).map((l) => ({ id: l.id, title: l.title })),
                statements: alignmentIds(
                  fw.id,
                  grade,
                  r.genre,
                  skillId as AlignmentSkill,
                ).map((id) => ({ id, ...STANDARD_STATEMENTS[id] })),
              }),
            ),
          })),
        };
      }),
    };
  }
}

/** Daily maintenance, called by Vercel Cron with the CRON_SECRET bearer token. */
@Controller('v1/learning/maintenance')
export class MaintenanceController {
  constructor(private readonly retention: RetentionService) {}

  @Get('retention')
  run(@Headers('authorization') authorization?: string) {
    this.retention.authorize(authorization);
    return this.retention.run();
  }
}

/** Student sign-in with a code from a parent or teacher. No adult session needed. */
@Controller('v1/learning')
@UsePipes(validation)
export class StudentSessionController {
  constructor(private readonly studentAccess: StudentAccessService) {}

  @Post('student-sessions')
  @HttpCode(200)
  start(@Body() dto: StudentSessionDto, @Req() req: Request) {
    return this.studentAccess.startSession(dto.code, clientIp(req));
  }
}

/** Feedback without an account. Nothing is stored; see GuestService. */
@Controller('v1/learning')
@UsePipes(validation)
export class GuestController {
  constructor(private readonly guest: GuestService) {}

  @Post('guest/feedback')
  @HttpCode(200)
  feedback(@Body() dto: GuestFeedbackDto, @Req() req: Request) {
    return this.guest.feedback(dto, clientIp(req));
  }
}

/** Student work and adult tools. Every route requires a verified session and checks ownership. */
@Controller('v1/learning')
@UseGuards(SupabaseAuthGuard)
@UsePipes(validation)
export class LearningController {
  constructor(
    private readonly learning: LearningService,
    private readonly coach: CoachService,
    private readonly studentAccess: StudentAccessService,
    private readonly teach: TeachService,
    private readonly reports: ReportService,
    private readonly safety: SafetyService,
    private readonly quality: QualityService,
    private readonly metrics: MetricsService,
    private readonly reviewService: ContentReviewService,
    private readonly orgs: OrgService,
  ) {}

  @Patch('learners/:id/supports')
  supports(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SupportsDto,
  ) {
    return this.learning.updateSupports(actor, id, dto);
  }

  // ─── Schools ─────────────────────────────────────────────────────────────

  @Get('orgs')
  myOrgs(@CurrentActor() actor: Actor) {
    return this.orgs.mine(actor);
  }

  @Post('orgs')
  createOrg(@CurrentActor() actor: Actor, @Body() dto: CreateOrgDto) {
    return this.orgs.create(actor, dto);
  }

  @Get('orgs/:id')
  org(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.orgs.detail(actor, id);
  }

  @Post('orgs/:id/members')
  invite(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.orgs.invite(actor, id, dto);
  }

  @Post('orgs/:id/accept')
  @HttpCode(200)
  accept(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.orgs.accept(actor, id);
  }

  @Delete('orgs/:id/members/:memberId')
  removeOrgMember(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.orgs.remove(actor, id, memberId);
  }

  @Post('orgs/:id/roster')
  roster(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: RosterImportDto,
  ) {
    return this.orgs.importRoster(actor, id, dto);
  }

  @Get('orgs/:id/audit')
  orgAudit(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.orgs.auditLog(actor, id);
  }

  @Get('learners/:id/plan')
  plan(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.learning.getPlan(actor, id);
  }

  @Patch('learners/:id/preferences')
  preferences(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PreferencesDto,
  ) {
    return this.learning.updatePreferences(actor, id, dto);
  }

  @Patch('learners/:id/focus')
  focus(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FocusDto,
  ) {
    return this.learning.setFocus(actor, id, dto.skillId ?? null);
  }

  @Post('learners/:id/plan/restart')
  @HttpCode(200)
  restartPlan(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.restartPlan(actor, id);
  }

  @Post('learners/:id/drills/:drillId/complete')
  @HttpCode(200)
  completeDrill(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('drillId') drillId: string,
  ) {
    return this.learning.completeDrill(actor, id, drillId);
  }

  @Post('submissions/:id/confirm')
  @HttpCode(200)
  confirm(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teach.confirm(actor, id);
  }

  @Post('safety-flags/:id/resolve')
  @HttpCode(200)
  resolveFlag(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ResolveFlagDto,
  ) {
    return this.safety.resolve(actor, id, dto.note);
  }

  @Get('quality')
  qualitySummary(@CurrentActor() actor: Actor) {
    return this.quality.summary(actor);
  }

  @Get('content/reviews')
  contentReviews(@CurrentActor() actor: Actor) {
    return this.reviewService.queue(actor);
  }

  @Post('content/reviews')
  addContentReview(
    @CurrentActor() actor: Actor,
    @Body() dto: ContentReviewDto,
  ) {
    return this.reviewService.add(actor, dto);
  }

  @Get('admin/metrics')
  adminMetrics(@CurrentActor() actor: Actor) {
    return this.metrics.metrics(actor);
  }

  @Get('me')
  me(@CurrentActor() actor: Actor) {
    return {
      kind: actor.kind,
      learnerId: actor.learnerId ?? null,
      email: actor.kind === 'adult' ? actor.email : null,
    };
  }

  @Get('learners')
  listLearners(@CurrentActor() actor: Actor) {
    return this.learning.listLearners(actor);
  }

  @Post('learners')
  createLearner(@CurrentActor() actor: Actor, @Body() dto: CreateLearnerDto) {
    return this.learning.createLearner(actor, dto);
  }

  @Delete('learners/:id')
  deleteLearner(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.deleteLearner(actor, id);
  }

  @Get('learners/:id/dashboard')
  dashboard(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.dashboard(actor, id);
  }

  @Get('learners/:id/report')
  report(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.reports.report(actor, id);
  }

  @Get('learners/:id/export')
  export(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.reports.export(actor, id);
  }

  @Post('learners/:id/access-code')
  createCode(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentAccess.createCode(actor, id);
  }

  @Delete('learners/:id/access-code')
  revokeCode(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.studentAccess.revokeCode(actor, id);
  }

  @Post('drafts')
  openDraft(@CurrentActor() actor: Actor, @Body() dto: OpenDraftDto) {
    return this.learning.openDraft(actor, dto);
  }

  @Get('drafts/:id')
  getDraft(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.getDraft(actor, id);
  }

  @Patch('drafts/:id')
  saveDraft(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SaveDraftDto,
  ) {
    return this.learning.saveDraft(actor, id, dto);
  }

  @Post('drafts/:id/coach')
  @HttpCode(200)
  coachDraft(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.coach.check(actor, id);
  }

  @Post('submissions')
  @HttpCode(202)
  submit(@CurrentActor() actor: Actor, @Body() dto: SubmitDto) {
    return this.learning.submit(actor, dto);
  }

  @Get('submissions/:id')
  getSubmission(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.getSubmission(actor, id);
  }

  @Post('submissions/:id/reflection')
  saveReflection(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: ReflectionDto,
  ) {
    return this.learning.saveReflection(actor, id, dto.text);
  }

  @Post('submissions/:id/portfolio')
  portfolioToggle(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PortfolioDto,
  ) {
    return this.learning.setPortfolio(actor, id, dto.include);
  }

  @Get('learners/:id/portfolio')
  portfolio(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.portfolio(actor, id);
  }

  @Post('submissions/:id/helpfulness')
  helpfulness(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: HelpfulnessDto,
  ) {
    return this.learning.setHelpfulness(actor, id, dto.value);
  }

  @Post('submissions/:id/feedback-report')
  reportFeedback(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: FeedbackReportDto,
  ) {
    return this.learning.reportFeedback(actor, id, dto.reason);
  }

  @Post('submissions/:id/overrides')
  override(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: OverrideDto,
  ) {
    return this.teach.override(actor, id, dto);
  }

  @Get('evaluation-jobs/:id')
  getJob(@CurrentActor() actor: Actor, @Param('id', ParseUUIDPipe) id: string) {
    return this.learning.getJob(actor, id);
  }

  @Post('evaluation-jobs/:id/process')
  @HttpCode(200)
  processJob(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.processJob(actor, id);
  }

  @Post('evaluation-jobs/:id/retry')
  @HttpCode(200)
  retryJob(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.learning.retryJob(actor, id);
  }

  // ─── Teacher tools ────────────────────────────────────────────────────────

  @Get('classes')
  listClasses(@CurrentActor() actor: Actor) {
    return this.teach.listClasses(actor);
  }

  @Post('classes')
  createClass(@CurrentActor() actor: Actor, @Body() dto: CreateClassDto) {
    return this.teach.createClass(actor, dto);
  }

  @Get('classes/:id')
  classDetail(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teach.classDetail(actor, id);
  }

  @Delete('classes/:id')
  deleteClass(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teach.deleteClass(actor, id);
  }

  @Post('classes/:id/members/:learnerId')
  addMember(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('learnerId', ParseUUIDPipe) learnerId: string,
  ) {
    return this.teach.addMember(actor, id, learnerId);
  }

  @Delete('classes/:id/members/:learnerId')
  removeMember(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('learnerId', ParseUUIDPipe) learnerId: string,
  ) {
    return this.teach.removeMember(actor, id, learnerId);
  }

  @Post('classes/:id/assignments')
  createAssignment(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: CreateAssignmentDto,
  ) {
    return this.teach.createAssignment(actor, id, dto);
  }

  @Delete('assignments/:id')
  deleteAssignment(
    @CurrentActor() actor: Actor,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.teach.deleteAssignment(actor, id);
  }

  @Get('review')
  review(@CurrentActor() actor: Actor, @Query('classId') classId?: string) {
    return this.teach.reviewQueue(
      actor,
      classId && /^[0-9a-f-]{36}$/i.test(classId) ? classId : undefined,
    );
  }
}
