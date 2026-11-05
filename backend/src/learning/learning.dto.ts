import {
  IsBoolean,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ArrayMaxSize,
  ArrayMinSize,
  IsEmail,
  Matches,
  ValidateNested,
  Max,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TOPICS, type FrameworkId } from './content';

/** Version of the adult-facing learning notice at /learn/privacy. Bump when it changes. */
export const LEARNING_NOTICE_VERSION = '2026-11-05';

export const MAX_DRAFT_CHARS = 12000;
export const MAX_SUBMISSION_WORDS = 1200;

export class CreateLearnerDto {
  @IsString()
  @Length(1, 40)
  displayName: string;

  @IsIn(['us-ccss', 'ca-on', 'uk-eng', 'au-ac9'])
  curriculum: FrameworkId;

  /** The grade or year as the school names it locally (England "7" = Year 7). */
  @IsString()
  @MaxLength(3)
  localGrade: string;

  /** "self" is a student aged 13 or older making their own profile (see createLearner). */
  @IsIn(['parent_guardian', 'teacher', 'self'])
  relationship: string;

  /** Required for "self": the student confirms they are 13 or older. */
  @IsOptional()
  @IsBoolean()
  confirmedAge13?: boolean;

  /** Create the profile inside a school the adult belongs to. */
  @IsOptional()
  @IsUUID()
  organizationId?: string;

  @IsOptional()
  @IsObject()
  supports?: Supports;

  /** Must be true: the adult agrees to the learning notice for this student. */
  @IsBoolean()
  agreeToNotice: boolean;

  @IsString()
  noticeVersion: string;
}

export class OpenDraftDto {
  @IsUUID()
  learnerId: string;

  @IsString()
  @MaxLength(80)
  promptId: string;
}

export class SaveDraftDto {
  @IsString()
  @MaxLength(MAX_DRAFT_CHARS)
  content: string;

  @IsOptional()
  @IsObject()
  planning?: Record<string, string>;

  @IsInt()
  @Min(0)
  expectedRevision: number;

  /** The student used speech-to-text in this draft. */
  @IsOptional()
  @IsBoolean()
  usedDictation?: boolean;
}

export class SubmitDto {
  @IsUUID()
  draftId: string;

  @IsInt()
  @Min(1)
  expectedRevision: number;

  @IsString()
  @Length(8, 80)
  idempotencyKey: string;

  /** An adult typed the student's words exactly as they were said (a scribe). */
  @IsOptional()
  @IsBoolean()
  scribed?: boolean;
}

/** Feedback without an account: nothing is stored, so the text and prompt come with the request. */
export class GuestFeedbackDto {
  @IsString()
  @MaxLength(80)
  promptId: string;

  @IsString()
  @MaxLength(MAX_DRAFT_CHARS)
  text: string;

  @IsIn(['us-ccss', 'ca-on', 'uk-eng', 'au-ac9'])
  curriculum: FrameworkId;

  /** US-equivalent grade (K–12); must fall in the prompt's band. Defaults to the band's middle grade. */
  @IsOptional()
  @IsString()
  @MaxLength(2)
  grade?: string;

  @IsOptional()
  @IsBoolean()
  scribed?: boolean;
}

export class ReflectionDto {
  @IsString()
  @Length(1, 1000)
  text: string;
}

export class ContentReviewDto {
  @IsIn(['lesson', 'prompt', 'rubric', 'drill'])
  itemType: 'lesson' | 'prompt' | 'rubric' | 'drill';

  @IsString()
  @Length(1, 80)
  itemId: string;

  @IsIn(['approve', 'changes', 'comment'])
  decision: 'approve' | 'changes' | 'comment';

  @IsString()
  @Length(0, 4000)
  notes: string;

  @IsString()
  @Length(1, 80)
  reviewerName: string;

  /** For example "Grade 4 teacher, Ontario". Shown publicly with approvals. */
  @IsString()
  @Length(3, 120)
  reviewerRole: string;
}

export class PortfolioDto {
  @IsBoolean()
  include: boolean;
}

export class HelpfulnessDto {
  @IsIn(['yes', 'somewhat', 'no'])
  value: 'yes' | 'somewhat' | 'no';
}

export class FeedbackReportDto {
  @IsString()
  @Length(1, 500)
  reason: string;
}

export class CreateClassDto {
  @IsString()
  @Length(1, 60)
  name: string;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}

export class CreateAssignmentDto {
  @IsString()
  @MaxLength(80)
  promptId: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lessonId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  note?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  dueDate?: string;
}

export class OverrideDto {
  /** A rubric skill id, or "overall" for a general comment. */
  @IsString()
  @MaxLength(60)
  skillId: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(4)
  rating?: number | null;

  @IsString()
  @Length(1, 600)
  comment: string;
}

export class StudentSessionDto {
  @IsString()
  @Length(8, 30)
  code: string;
}

export class PreferencesDto {
  @IsOptional()
  @IsInt()
  @Min(2)
  @Max(4)
  sessionsPerWeek?: number;

  @IsOptional()
  @IsIn(TOPICS, { each: true })
  interests?: string[];
}

export class FocusDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  skillId?: string | null;
}

export class ResolveFlagDto {
  @IsString()
  @Length(1, 600)
  note: string;
}

export interface Supports {
  eal?: boolean;
  readAloud?: boolean;
  largerText?: boolean;
  dictation?: boolean;
}

export class SupportsDto {
  @IsOptional()
  @IsBoolean()
  eal?: boolean;

  @IsOptional()
  @IsBoolean()
  readAloud?: boolean;

  @IsOptional()
  @IsBoolean()
  largerText?: boolean;

  @IsOptional()
  @IsBoolean()
  dictation?: boolean;
}

export class CreateOrgDto {
  @IsString()
  @Length(2, 100)
  name: string;

  @IsIn(['us-ccss', 'ca-on', 'uk-eng', 'au-ac9'])
  curriculum: FrameworkId;
}

export class InviteMemberDto {
  @IsEmail()
  @MaxLength(200)
  email: string;

  @IsIn(['admin', 'teacher'])
  role: 'admin' | 'teacher';
}

export class RosterStudentDto {
  @IsString()
  @Length(1, 40)
  displayName: string;

  @IsString()
  @MaxLength(3)
  localGrade: string;
}

export class RosterImportDto {
  @IsOptional()
  @IsUUID()
  classId?: string;

  @IsOptional()
  @IsIn(['us-ccss', 'ca-on', 'uk-eng', 'au-ac9'])
  curriculum?: FrameworkId;

  @ValidateNested({ each: true })
  @Type(() => RosterStudentDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(60)
  students: RosterStudentDto[];

  /** The adult confirms the school has authorized this use under its own policies. */
  @IsBoolean()
  agreeToNotice: boolean;

  @IsString()
  noticeVersion: string;
}
