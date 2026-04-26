import { Entity, PrimaryGeneratedColumn, Column, UpdateDateColumn } from 'typeorm';

@Entity('free_usage')
export class FreeUsageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  email: string | null;

  @Column({ type: 'text', nullable: true })
  ipAddress: string | null;

  @Column({ type: 'int', default: 0 })
  wordsUsed: number;

  @UpdateDateColumn()
  updatedAt: Date;
}
