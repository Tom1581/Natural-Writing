import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewriteModule } from './rewrite/rewrite.module';
import { StripeModule } from './stripe/stripe.module';
import { StyleProfileEntity } from './rewrite/entities/style-profile.entity';
import { ManuscriptEntity } from './rewrite/entities/manuscript.entity';
import { CacheEntity } from './rewrite/entities/cache.entity';
import { VersionEntity } from './rewrite/entities/version.entity';
import { ProjectEntity } from './rewrite/entities/project.entity';
import { UserEntity } from './rewrite/entities/user.entity';
import { CommentEntity } from './rewrite/entities/comment.entity';
import { UsageLogEntity } from './rewrite/entities/usage-log.entity';
import { FreeUsageEntity } from './rewrite/entities/free-usage.entity';
import { BillingAccountEntity } from './rewrite/entities/billing-account.entity';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (_configService: ConfigService) => ({
        type: 'sqlite',
        database: 'database.sqlite',
        entities: [StyleProfileEntity, ManuscriptEntity, CacheEntity, VersionEntity, ProjectEntity, UserEntity, CommentEntity, UsageLogEntity, FreeUsageEntity, BillingAccountEntity],
        synchronize: true, // Auto-scaffold for immediate double-check
        logging: ['error', 'warn'],
      }),
      inject: [ConfigService],
    }),
    RewriteModule,
    StripeModule,
  ],
})
export class AppModule {}
