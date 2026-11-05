import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

/** A student profile. Owned by the adult (parent/guardian or teacher) who created it. */
@Entity('learning_learners')
export class LearnerEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /** Supabase user id of the adult who manages this learner. */
  @Index()
  @Column({ type: 'text' })
  ownerSubject: string;

  /** Friendly name only; a legal name is not needed. */
  @Column({ type: 'text' })
  displayName: string;

  /** Enrolled school grade ("3".."8"). Never overwritten by observed skill. */
  @Column({ type: 'text' })
  gradeLevel: string;

  /** Curriculum framework the student follows: us-ccss, ca-on, uk-eng or au-ac9. */
  @Column({ type: 'text', default: 'us-ccss' })
  curriculum: string;

  /** SHA-256 of the student's sign-in code. The code itself is shown once and never stored. */
  @Index({ unique: true })
  @Column({ type: 'text', nullable: true })
  accessCodeHash: string | null;

  @Column({ type: Date, nullable: true })
  accessCodeCreatedAt: Date | null;

  /** Practice sessions per week the plan is built for (2–4). */
  @Column({ type: 'int', default: 3 })
  sessionsPerWeek: number;

  /** Optional interest tags (from a fixed list) used to choose prompts. */
  @Column({ type: 'simple-json', nullable: true })
  interests: string[] | null;

  /** A skill a parent or teacher chose as the main goal, overriding the automatic choice. */
  @Column({ type: 'text', nullable: true })
  focusSkillId: string | null;

  @Column({ type: Date, nullable: true })
  planStartedAt: Date | null;

  /** Practice-set id → completion time (ISO). */
  @Column({ type: 'simple-json', nullable: true })
  drillCompletions: Record<string, string> | null;

  /** Set for school-managed profiles; access then depends on active school membership. */
  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  /**
   * Learning supports, not diagnoses: { eal, readAloud, largerText, dictation }. "eal" (English as
   * an additional language) adds scaffolding to feedback; it never lowers a rating.
   */
  @Column({ type: 'simple-json', nullable: true })
  supports: {
    eal?: boolean;
    readAloud?: boolean;
    largerText?: boolean;
    dictation?: boolean;
  } | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
