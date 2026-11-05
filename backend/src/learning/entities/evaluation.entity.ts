import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';
import type { ValidatedFeedback } from '../evaluator/feedback.types';

/** Validated feedback for one submission, pinned to the model, template and rubric that produced it. */
@Entity('learning_evaluations')
export class EvaluationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({ type: 'text' })
  model: string;

  @Column({ type: 'text' })
  templateVersion: string;

  @Column({ type: 'text' })
  rubricId: string;

  @Column({ type: 'int' })
  rubricVersion: number;

  @Column({ type: 'simple-json' })
  result: ValidatedFeedback;

  /** Automatic consistency checks that suggest an adult take a second look. */
  @Column({ type: 'simple-json', nullable: true })
  checks: string[] | null;

  @CreateDateColumn()
  createdAt: Date;
}
