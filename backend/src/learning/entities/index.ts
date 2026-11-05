import { LearnerEntity } from './learner.entity';
import { LearnerAuthorizationEntity } from './learner-authorization.entity';
import { DraftEntity } from './draft.entity';
import { SubmissionEntity } from './submission.entity';
import { EvaluationJobEntity } from './evaluation-job.entity';
import { EvaluationEntity } from './evaluation.entity';
import { SkillEvidenceEntity } from './skill-evidence.entity';
import {
  AssignmentEntity,
  ClassEntity,
  ClassMemberEntity,
} from './class.entity';
import { TeacherOverrideEntity } from './teacher-override.entity';
import { SafetyFlagEntity } from './safety-flag.entity';
import { AiUsageEntity } from './ai-usage.entity';
import { ContentReviewEntity } from './content-review.entity';
import {
  AuditEventEntity,
  OrganizationEntity,
  OrgMemberEntity,
} from './organization.entity';

export {
  LearnerEntity,
  LearnerAuthorizationEntity,
  DraftEntity,
  SubmissionEntity,
  EvaluationJobEntity,
  EvaluationEntity,
  SkillEvidenceEntity,
  ClassEntity,
  ClassMemberEntity,
  AssignmentEntity,
  TeacherOverrideEntity,
  SafetyFlagEntity,
  OrganizationEntity,
  OrgMemberEntity,
  AuditEventEntity,
  AiUsageEntity,
  ContentReviewEntity,
};

export const LEARNING_ENTITIES = [
  LearnerEntity,
  LearnerAuthorizationEntity,
  DraftEntity,
  SubmissionEntity,
  EvaluationJobEntity,
  EvaluationEntity,
  SkillEvidenceEntity,
  ClassEntity,
  ClassMemberEntity,
  AssignmentEntity,
  TeacherOverrideEntity,
  SafetyFlagEntity,
  OrganizationEntity,
  OrgMemberEntity,
  AuditEventEntity,
  AiUsageEntity,
  ContentReviewEntity,
];
