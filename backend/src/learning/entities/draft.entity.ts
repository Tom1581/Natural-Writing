import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** The student's working copy for one prompt. Saves use `revision` to avoid silent overwrites. */
@Entity('learning_drafts')
@Index(['learnerId', 'promptId'], { unique: true })
export class DraftEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  learnerId: string;

  @Column({ type: 'text' })
  promptId: string;

  @Column({ type: 'int' })
  promptVersion: number;

  @Column({ type: 'text', default: '' })
  content: string;

  /** Planning-organizer answers, keyed by question index. */
  @Column({ type: 'simple-json', nullable: true })
  planning: Record<string, string> | null;

  @Column({ type: 'int', default: 0 })
  revision: number;

  /** "Am I on track?" checks used in the current 24-hour window (free-tier budget). */
  @Column({ type: 'int', default: 0 })
  coachUses: number;

  @Column({ type: Date, nullable: true })
  coachWindowStart: Date | null;

  /** True when the coach was used since the last submission; that submission is then "coached". */
  @Column({ type: 'boolean', default: false })
  coachUsedSinceSubmit: boolean;

  /** True when dictation was used since the last submission; spelling then isn't the student's. */
  @Column({ type: 'boolean', default: false })
  dictationUsedSinceSubmit: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
