import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, OneToMany } from 'typeorm';
import { ManuscriptEntity } from './manuscript.entity';
import { ProjectEntity } from './project.entity';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ default: 'contributor' })
  role: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => ManuscriptEntity, (manuscript) => manuscript.owner)
  manuscripts: ManuscriptEntity[];

  @OneToMany(() => ProjectEntity, (project) => project.owner)
  projects: ProjectEntity[];
}
