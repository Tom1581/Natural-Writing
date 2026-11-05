import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SupabaseAuthGuard } from '../auth/supabase-auth.guard';
import { LEARNING_ENTITIES } from './entities';
import { MeteredEvalClient } from './evaluator/metered-client';
import { MetricsService } from './metrics.service';
import { UsageService } from './usage.service';
import { ContentReviewService } from './content-review.service';
import { EvaluatorService } from './evaluator/evaluator.service';
import {
  EVAL_LLM_CLIENT,
  EVAL_LLM_PROVIDER,
  OpenAiCompatibleEvalClient,
} from './evaluator/llm-client';
import { AccessService } from './access.service';
import { CoachService } from './coach.service';
import { GuestService } from './guest.service';
import {
  GuestController,
  LearningCatalogController,
  LearningController,
  StudentSessionController,
  MaintenanceController,
} from './learning.controller';
import { LearningService } from './learning.service';
import { ReportService } from './report.service';
import { StudentAccessService } from './student-access.service';
import { TeachService } from './teach.service';
import { SafetyService } from './safety.service';
import { QualityService } from './quality.service';
import { OrgService } from './org.service';
import { AuditService } from './audit.service';
import { RetentionService } from './retention.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature(LEARNING_ENTITIES)],
  controllers: [
    LearningCatalogController,
    StudentSessionController,
    GuestController,
    LearningController,
    MaintenanceController,
  ],
  providers: [
    LearningService,
    AccessService,
    CoachService,
    StudentAccessService,
    TeachService,
    ReportService,
    SafetyService,
    QualityService,
    OrgService,
    AuditService,
    RetentionService,
    EvaluatorService,
    SupabaseAuthGuard,
    UsageService,
    ContentReviewService,
    MetricsService,
    GuestService,
    { provide: EVAL_LLM_PROVIDER, useClass: OpenAiCompatibleEvalClient },
    { provide: EVAL_LLM_CLIENT, useClass: MeteredEvalClient },
  ],
})
export class LearningModule {}
