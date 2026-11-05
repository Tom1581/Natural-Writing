import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** A school (or tutoring centre). Its student profiles are reached through active membership, never ownership alone. */
@Entity('learning_organizations')
export class OrganizationEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text' })
  name: string;

  /** Default curriculum for students added to this school. */
  @Column({ type: 'text', default: 'us-ccss' })
  curriculum: string;

  @Column({ type: 'text' })
  createdBySubject: string;

  @CreateDateColumn()
  createdAt: Date;
}

/**
 * A person's role in a school. Invitations are by email and become active when someone
 * signs in with that verified email. A removed member loses access immediately, including
 * to profiles and classes they created.
 */
@Entity('learning_org_members')
@Index(['organizationId', 'email'], { unique: true })
export class OrgMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Index()
  @Column({ type: 'text' })
  email: string;

  @Index()
  @Column({ type: 'text', nullable: true })
  subject: string | null;

  @Column({ type: 'text' })
  role: 'admin' | 'teacher';

  @Column({ type: 'text', default: 'invited' })
  status: 'invited' | 'active' | 'removed';

  @Column({ type: 'text' })
  invitedBySubject: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: Date, nullable: true })
  joinedAt: Date | null;

  @Column({ type: Date, nullable: true })
  removedAt: Date | null;
}

/** Who did what, for school admins and the operator. Never contains student writing. */
@Entity('learning_audit_events')
export class AuditEventEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @Column({ type: 'text' })
  actorSubject: string;

  @Column({ type: 'text' })
  action: string;

  @Column({ type: 'text', nullable: true })
  targetType: string | null;

  @Column({ type: 'text', nullable: true })
  targetId: string | null;

  /** Short, non-sensitive description (e.g. "role: teacher"). */
  @Column({ type: 'text', nullable: true })
  detail: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
