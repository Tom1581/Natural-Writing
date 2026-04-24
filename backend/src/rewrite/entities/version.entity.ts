import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, ManyToOne } from 'typeorm';
import { ManuscriptEntity } from './manuscript.entity';

@Entity()
export class VersionEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('text')
  content: string;

  @Column('json', { nullable: true })
  metrics: any;

  @Column({ default: 'Snapshot' })
  label: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ManuscriptEntity, (manuscript) => manuscript.versions, { onDelete: 'CASCADE' })
  manuscript: ManuscriptEntity;
}
