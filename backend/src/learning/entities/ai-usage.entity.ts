import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

/**
 * One call to the AI provider, for cost tracking and the daily budget. Stores token counts
 * and who the call was for, never the text that was sent.
 */
@Entity('learning_ai_usage')
export class AiUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** "evaluation", "repair", "second_opinion" or "coach". */
  @Column({ type: 'text' })
  purpose: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  learnerId: string | null;

  /** The school (organization id) or adult account the student belongs to. */
  @Index()
  @Column({ type: 'text', nullable: true })
  ownerKey: string | null;

  @Column({ type: 'text' })
  model: string;

  @Column({ type: 'int', default: 0 })
  promptTokens: number;

  @Column({ type: 'int', default: 0 })
  completionTokens: number;

  /** True when the provider reported the counts; false when they were estimated from length. */
  @Column({ type: 'boolean', default: true })
  measured: boolean;

  /** "ok", "rate_limited" or "error". */
  @Column({ type: 'text' })
  outcome: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}
