import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { ManuscriptEntity } from './manuscript.entity';

@Entity('usage_logs')
export class UsageLogEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  modelUsed: string;

  @Column('float')
  promptTokens: number;

  @Column('float')
  completionTokens: number;

  @Column('float')
  totalTokens: number;

  @Column('float')
  latencyMs: number;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => ManuscriptEntity)
  manuscript: ManuscriptEntity;
}
