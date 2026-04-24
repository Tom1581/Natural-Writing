import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany, ManyToOne } from 'typeorm';
import { ManuscriptEntity } from './manuscript.entity';
import { UserEntity } from './user.entity';

@Entity()
export class ProjectEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ManuscriptEntity, (manuscript) => manuscript.project)
  manuscripts: ManuscriptEntity[];

  @ManyToOne(() => UserEntity, (user) => user.projects, { nullable: true })
  owner: UserEntity;
}
