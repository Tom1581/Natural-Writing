import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('billing_accounts')
export class BillingAccountEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', unique: true })
  email: string;

  @Column({ type: 'text', nullable: true })
  packTier: string | null;

  @Column({ type: 'int', default: 0 })
  wordBalance: number;

  @Column({ type: 'int', default: 0 })
  lifetimeWordsPurchased: number;

  @Column({ type: 'boolean', default: false })
  unlimitedActive: boolean;

  @Column({ type: 'text', nullable: true })
  subscriptionStatus: string | null;

  @Column({ type: 'text', nullable: true })
  stripeCustomerId: string | null;

  @Column({ type: 'text', nullable: true })
  stripeSubscriptionId: string | null;

  @Column({ type: 'text', nullable: true })
  lastCheckoutSessionId: string | null;

  @Column({ type: 'text', nullable: true })
  lastPaymentIntentId: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
