import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * An educator's review of one version of a catalog item (lesson, prompt, rubric or practice
 * set). Content lives in code; reviews live here, so sign-off never needs a deploy and every
 * decision keeps its reviewer, version and date.
 */
@Entity('learning_content_reviews')
export class ContentReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  itemType: 'lesson' | 'prompt' | 'rubric' | 'drill';

  @Index()
  @Column({ type: 'text' })
  itemId: string;

  @Column({ type: 'int' })
  itemVersion: number;

  @Column({ type: 'text' })
  reviewerSubject: string;

  /** Shown publicly only as the role, e.g. "Grade 4 teacher, Ontario". */
  @Column({ type: 'text' })
  reviewerName: string;

  @Column({ type: 'text' })
  reviewerRole: string;

  /** "approve", "changes" (needs changes) or "comment". */
  @Column({ type: 'text' })
  decision: string;

  @Column({ type: 'text', default: '' })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;
}
