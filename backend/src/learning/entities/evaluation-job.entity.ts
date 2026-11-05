import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export type EvaluationJobState =
  | 'queued'
  | 'running'
  | 'complete'
  | 'not_scored'
  | 'needs_review'
  | 'failed';

/**
 * Durable record of an evaluation request. The row exists before any model call,
 * so a crash, timeout or rate limit never loses a submission; it is retried instead.
 */
@Entity('learning_evaluation_jobs')
export class EvaluationJobEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  submissionId: string;

  /** Client-supplied key; the same key on the same draft returns the same job. */
  @Index({ unique: true })
  @Column({ type: 'text' })
  idempotencyKey: string;

  @Column({ type: 'text', default: 'queued' })
  state: EvaluationJobState;

  @Column({ type: 'int', default: 0 })
  attempts: number;

  @Column({ type: Date })
  nextAttemptAt: Date;

  @Column({ type: Date, nullable: true })
  leaseUntil: Date | null;

  /** Machine-readable reason for not_scored / needs_review / failed. Never contains student text. */
  @Column({ type: 'text', nullable: true })
  failureCode: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
