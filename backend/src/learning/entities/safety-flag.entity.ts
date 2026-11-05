import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export type SafetyCategory =
  | 'self_harm'
  | 'abuse'
  | 'threat'
  | 'personal_info'
  | 'other';

/**
 * A wellbeing concern raised about a piece of writing, for the adult who manages the profile.
 * It never changes a rating, and stores no student text: only the category and a short reason.
 */
@Entity('learning_safety_flags')
export class SafetyFlagEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  submissionId: string;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  /** "screen" (phrase screen at submission) or "ai" (the evaluator's wellbeing check). */
  @Column({ type: 'text' })
  source: 'screen' | 'ai';

  @Column({ type: 'text' })
  level: 'possible' | 'urgent';

  @Column({ type: 'text' })
  category: SafetyCategory;

  @Column({ type: 'text' })
  reason: string;

  @Column({ type: 'text', default: 'open' })
  status: 'open' | 'resolved';

  @Column({ type: 'text', nullable: true })
  resolvedBySubject: string | null;

  @Column({ type: Date, nullable: true })
  resolvedAt: Date | null;

  @Column({ type: 'text', nullable: true })
  resolutionNote: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
