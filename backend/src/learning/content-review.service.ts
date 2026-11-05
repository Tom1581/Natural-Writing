import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { isContentReviewerEmail } from '../auth/admin';
import { verifiedAdultEmail, type Actor } from '../auth/supabase-auth.guard';
import { DRILLS, LESSONS, PROMPTS, RUBRICS } from './content';
import { ContentReviewEntity } from './entities';
import type { ContentReviewDto } from './learning.dto';

type ItemType = ContentReviewDto['itemType'];

function catalogItems() {
  return [
    ...LESSONS.map((l) => ({
      itemType: 'lesson' as ItemType,
      id: l.id,
      version: l.version,
      band: l.band,
      title: l.title,
    })),
    ...PROMPTS.map((p) => ({
      itemType: 'prompt' as ItemType,
      id: p.id,
      version: p.version,
      band: p.band,
      title: p.title,
      reserved: !!(p.checkIn || p.checkpoint),
    })),
    ...RUBRICS.map((r) => ({
      itemType: 'rubric' as ItemType,
      id: r.id,
      version: r.version,
      band: r.band,
      title: r.title,
    })),
    ...DRILLS.map((d) => ({
      itemType: 'drill' as ItemType,
      id: d.id,
      version: d.version,
      band: d.band,
      title: d.title,
    })),
  ];
}

/**
 * Educator review of the catalog. A reviewer approves or requests changes on the current
 * version of an item; a new version starts unreviewed. Public pages show only the count of
 * approvals and the reviewers' roles, never their names or emails.
 */
@Injectable()
export class ContentReviewService {
  constructor(
    @InjectRepository(ContentReviewEntity)
    private readonly reviews: Repository<ContentReviewEntity>,
  ) {}

  private requireReviewer(actor: Actor) {
    if (!isContentReviewerEmail(verifiedAdultEmail(actor)))
      throw new ForbiddenException(
        'Only invited content reviewers can do this.',
      );
  }

  async queue(actor: Actor) {
    this.requireReviewer(actor);
    const all = await this.reviews.find({ order: { createdAt: 'ASC' } });
    return {
      items: catalogItems().map((item) => {
        const mine = all.filter(
          (r) => r.itemId === item.id && r.itemVersion === item.version,
        );
        const latest = mine[mine.length - 1];
        return {
          ...item,
          approvals: mine.filter((r) => r.decision === 'approve').length,
          changesRequested: mine.filter((r) => r.decision === 'changes').length,
          latestDecision: latest?.decision ?? null,
          reviews: mine.map((r) => ({
            id: r.id,
            reviewerName: r.reviewerName,
            reviewerRole: r.reviewerRole,
            decision: r.decision,
            notes: r.notes,
            createdAt: r.createdAt,
          })),
        };
      }),
    };
  }

  async add(actor: Actor, dto: ContentReviewDto) {
    this.requireReviewer(actor);
    const item = catalogItems().find(
      (i) => i.itemType === dto.itemType && i.id === dto.itemId,
    );
    if (!item)
      throw new BadRequestException('That item is not in the catalog.');
    if (dto.decision === 'changes' && !dto.notes.trim())
      throw new BadRequestException('Say what needs to change.');
    const saved = await this.reviews.save(
      this.reviews.create({
        itemType: dto.itemType,
        itemId: dto.itemId,
        itemVersion: item.version,
        reviewerSubject: actor.subject,
        reviewerName: dto.reviewerName.trim(),
        reviewerRole: dto.reviewerRole.trim(),
        decision: dto.decision,
        notes: dto.notes.trim(),
      }),
    );
    return { id: saved.id, itemVersion: saved.itemVersion };
  }

  /** Public sign-off for one item's current version: approval count, roles and latest date. */
  async publicStatus(itemId: string) {
    const item = catalogItems().find((i) => i.id === itemId);
    if (!item) return null;
    const approvals = await this.reviews.find({
      where: { itemId, itemVersion: item.version, decision: 'approve' },
      order: { createdAt: 'ASC' },
    });
    return {
      approvals: approvals.length,
      roles: [...new Set(approvals.map((a) => a.reviewerRole))],
      lastReviewed: approvals.length
        ? approvals[approvals.length - 1].createdAt
        : null,
    };
  }
}
