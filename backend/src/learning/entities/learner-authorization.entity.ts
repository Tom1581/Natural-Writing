import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** The adult's agreement to the learning notice, versioned so a changed notice can be re-accepted. */
@Entity('learning_authorizations')
export class LearnerAuthorizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @Column({ type: 'text' })
  grantedBySubject: string;

  /** "parent_guardian" or "teacher". */
  @Column({ type: 'text' })
  relationship: string;

  @Column({ type: 'text' })
  noticeVersion: string;

  @CreateDateColumn()
  grantedAt: Date;

  @Column({ type: Date, nullable: true })
  revokedAt: Date | null;
}
