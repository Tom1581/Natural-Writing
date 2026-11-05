import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, LessThan, MoreThan, Repository } from 'typeorm';
import {
  AiUsageEntity,
  AuditEventEntity,
  DraftEntity,
  LearnerEntity,
  SubmissionEntity,
} from './entities';
import { deleteLearnerRecords } from './learning.service';

/**
 * Retention: removes student profiles with no activity for RETENTION_INACTIVE_MONTHS months
 * (off unless set), and audit events older than 24 months. Called daily by Vercel Cron with
 * `Authorization: Bearer <CRON_SECRET>`. Without RETENTION_INACTIVE_MONTHS it only reports.
 */
@Injectable()
export class RetentionService {
  private readonly logger = new Logger(RetentionService.name);

  constructor(
    private readonly config: ConfigService,
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @InjectRepository(SubmissionEntity)
    private readonly submissions: Repository<SubmissionEntity>,
    @InjectRepository(DraftEntity)
    private readonly drafts: Repository<DraftEntity>,
    @InjectRepository(AuditEventEntity)
    private readonly audit: Repository<AuditEventEntity>,
    @InjectRepository(AiUsageEntity)
    private readonly aiUsage: Repository<AiUsageEntity>,
  ) {}

  authorize(header: string | undefined) {
    const secret = this.config.get<string>('CRON_SECRET');
    if (!secret || header !== `Bearer ${secret}`)
      throw new UnauthorizedException('Not allowed.');
  }

  async run(now = new Date()) {
    const months = Number(
      this.config.get<string>('RETENTION_INACTIVE_MONTHS') || 0,
    );
    const auditCutoff = new Date(now.getTime() - 730 * 86_400_000);
    const removedAudit =
      (await this.audit.delete({ createdAt: LessThan(auditCutoff) }))
        .affected ?? 0;
    // AI cost records are kept for about 13 months, long enough to compare a full school year.
    const usageCutoff = new Date(now.getTime() - 400 * 86_400_000);
    const removedUsage =
      (await this.aiUsage.delete({ createdAt: LessThan(usageCutoff) }))
        .affected ?? 0;

    const inactive: string[] = [];
    if (months > 0) {
      const cutoff = new Date(now.getTime() - months * 30 * 86_400_000);
      for (const l of await this.learners.find({
        where: { createdAt: LessThan(cutoff) },
        select: { id: true },
      })) {
        const recent =
          (await this.submissions.existsBy({
            learnerId: l.id,
            createdAt: MoreThan(cutoff),
          })) ||
          (await this.drafts.existsBy({
            learnerId: l.id,
            updatedAt: MoreThan(cutoff),
          }));
        if (!recent) inactive.push(l.id);
      }
      for (const id of inactive)
        await this.dataSource.transaction((m) => deleteLearnerRecords(m, id));
    }
    this.logger.log(
      `retention: ${inactive.length} inactive profiles removed, ${removedAudit} old audit events removed`,
    );
    return {
      inactiveMonths: months || null,
      removedProfiles: inactive.length,
      removedAuditEvents: removedAudit,
      removedUsageRecords: removedUsage,
    };
  }
}
