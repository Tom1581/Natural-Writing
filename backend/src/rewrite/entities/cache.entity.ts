import { Entity, Column, PrimaryColumn, CreateDateColumn } from 'typeorm';

@Entity()
export class CacheEntity {
  @PrimaryColumn()
  hash: string;

  @Column('text')
  value: string;

  @CreateDateColumn()
  createdAt: Date;
}
