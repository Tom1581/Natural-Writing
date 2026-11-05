import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** A teacher's group of student profiles. Only the adult who owns the profiles can add them. */
@Entity('learning_classes')
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'text' })
  ownerSubject: string;

  @Column({ type: 'text' })
  name: string;

  /** Set for school classes; only active members of the school can reach them. */
  @Index()
  @Column({ type: 'uuid', nullable: true })
  organizationId: string | null;

  @CreateDateColumn()
  createdAt: Date;
}

@Entity('learning_class_members')
@Index(['classId', 'learnerId'], { unique: true })
export class ClassMemberEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  classId: string;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @CreateDateColumn()
  createdAt: Date;
}

/** A prompt (optionally with its lesson) assigned to a class. */
@Entity('learning_assignments')
export class AssignmentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  classId: string;

  @Column({ type: 'text' })
  promptId: string;

  @Column({ type: 'text', nullable: true })
  lessonId: string | null;

  @Column({ type: 'text', nullable: true })
  note: string | null;

  /** Calendar date (YYYY-MM-DD); guidance only, nothing locks. */
  @Column({ type: 'text', nullable: true })
  dueDate: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
