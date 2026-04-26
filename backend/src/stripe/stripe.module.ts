import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeService } from './stripe.service';
import { StripeController } from './stripe.controller';
import { BillingAccountEntity } from '../rewrite/entities/billing-account.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BillingAccountEntity])],
  providers: [StripeService],
  controllers: [StripeController],
  exports: [StripeService],
})
export class StripeModule {}
