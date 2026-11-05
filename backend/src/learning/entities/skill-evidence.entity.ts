import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** One rated skill observation from one evaluated submission. */
@Entity('learning_skill_evidence')
@Index(['submissionId', 'skillId'], { unique: true })
export class SkillEvidenceEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @Column({ type: 'text' })
  skillId: string;

  @Column({ type: 'uuid' })
  submissionId: string;

  @Column({ type: 'text' })
  promptId: string;

  @Column({ type: 'text' })
  rubricId: string;

  @Column({ type: 'int' })
  rubricVersion: number;

  @Column({ type: 'int' })
  rating: number;

  /**
   * True only for a first, unassisted attempt on a prompt. Revisions of the same
   * draft are revision practice and never count as an independent demonstration.
   */
  @Column({ type: 'boolean' })
  independent: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
