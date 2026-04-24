import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { ManuscriptEntity } from './manuscript.entity';

@Entity()
export class CommentEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column('json')
  selectionData: {
    from: number;
    to: number;
    text: string;
  };

  @Column()
  authorName: string;

  @Column({ default: false })
  isResolved: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ManuscriptEntity, (manuscript) => manuscript.comments, { onDelete: 'CASCADE' })
  manuscript: ManuscriptEntity;
}
