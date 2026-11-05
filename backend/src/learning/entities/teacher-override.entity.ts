import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/**
 * An adult's correction of an AI rating, or a general comment (skillId "overall", rating null).
 * Append-only: the original AI evaluation is never changed; the latest override per skill wins.
 */
@Entity('learning_overrides')
export class TeacherOverrideEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({ type: 'text' })
  skillId: string;

  /**
   * "correction": the adult changed the level. "confirmation": the adult checked the AI level
   * and agreed (used to measure AI accuracy). "comment": a general note (skillId "overall").
   */
  @Column({ type: 'text', default: 'correction' })
  kind: 'correction' | 'confirmation' | 'comment';

  @Column({ type: 'int', nullable: true })
  originalRating: number | null;

  @Column({ type: 'int', nullable: true })
  rating: number | null;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'text' })
  authorSubject: string;

  @CreateDateColumn()
  createdAt: Date;
}
