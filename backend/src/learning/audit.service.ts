import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Actor } from '../auth/supabase-auth.guard';
import { AuditEventEntity } from './entities';

/** Records sensitive actions (exports, deletions, codes, corrections, membership changes). No student text. */
@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditEventEntity)
    private readonly events: Repository<AuditEventEntity>,
  ) {}

  async record(
    actor: Actor,
    organizationId: string | null,
    action: string,
    target?: { type: string; id: string },
    detail?: string,
  ) {
    await this.events.save(
      this.events.create({
        organizationId,
        actorSubject: actor.subject,
        action,
        targetType: target?.type ?? null,
        targetId: target?.id ?? null,
        detail: detail ? detail.slice(0, 200) : null,
      }),
    );
  }

  forOrganization(organizationId: string, limit = 200) {
    return this.events.find({
      where: { organizationId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }
}
