import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

/** An immutable snapshot of a draft, frozen with the prompt and rubric versions it was written against. */
@Entity('learning_submissions')
export class SubmissionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  learnerId: string;

  @Column({ type: 'uuid' })
  draftId: string;

  @Column({ type: 'int' })
  draftRevision: number;

  @Column({ type: 'text' })
  promptId: string;

  @Column({ type: 'int' })
  promptVersion: number;

  @Column({ type: 'text' })
  rubricId: string;

  @Column({ type: 'int' })
  rubricVersion: number;

  @Column({ type: 'text' })
  text: string;

  /** 1 for the first submission on a prompt; higher numbers are revisions. */
  @Column({ type: 'int' })
  attemptNumber: number;

  /** "independent" for now; assisted modes are recorded so they never count as mastery. */
  @Column({ type: 'text', default: 'independent' })
  assistanceMode: string;

  /** "typed", "dictation" or "scribed" (an adult typed the student's words). Only typed pieces count as spelling evidence. */
  @Column({ type: 'text', default: 'typed' })
  inputMode: string;

  @Column({ type: 'text', nullable: true })
  reflection: string | null;

  /** The student chose this piece for their portfolio of best work. */
  @Column({ type: 'boolean', default: false })
  inPortfolio: boolean;

  /** The reader's answer to "Was this feedback helpful?": "yes", "somewhat" or "no". */
  @Column({ type: 'text', nullable: true })
  helpfulness: string | null;

  /** Set when the student or adult reports that the feedback seems wrong. */
  @Column({ type: 'text', nullable: true })
  feedbackReport: string | null;

  @CreateDateColumn()
  createdAt: Date;
}
