import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { VersionEntity } from './version.entity';
import { ProjectEntity } from './project.entity';
import { UserEntity } from './user.entity';
import { CommentEntity } from './comment.entity';
import { StyleProfileEntity } from './style-profile.entity';

@Entity()
export class ManuscriptEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  title: string;

  @Column('text')
  sourceText: string;

  @Column('text')
  optimizedText: string;

  @Column('json', { nullable: true })
  metrics: any;

  @Column({ nullable: true })
  tone: string;

  @Column({ nullable: true })
  strength: string;

  @Column({ nullable: true })
  targetGradeLevel: number;

  @Column({ nullable: true })
  language: string;

  @Column({ nullable: true })
  sectionType: string;

  @Column({ nullable: true })
  rating: number;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => VersionEntity, (version) => version.manuscript)
  versions: VersionEntity[];

  @ManyToOne(() => ProjectEntity, (project) => project.manuscripts, { nullable: true, onDelete: 'SET NULL' })
  project: ProjectEntity;

  @ManyToOne(() => UserEntity, (user) => user.manuscripts, { nullable: true })
  owner: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.manuscript)
  comments: CommentEntity[];

  @Column('json', { nullable: true })
  metadata: any;

  @ManyToOne(() => StyleProfileEntity, { nullable: true, onDelete: 'SET NULL' })
  styleProfile: StyleProfileEntity;
}
