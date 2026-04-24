import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class StyleProfileEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('float')
  adjectiveLevel: number;

  @Column('float')
  sentenceComplexity: number;

  @Column('simple-array')
  preferredTransitions: string[];

  @Column('simple-array')
  toneDescriptors: string[];

  @Column()
  contractionRate: string;

  @Column()
  vocabularyBand: string;

  @Column('json', { nullable: true })
  metrics: any;

  @CreateDateColumn()
  createdAt: Date;
}
