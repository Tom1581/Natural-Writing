import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { RewriteModule } from './rewrite/rewrite.module';
import { StripeModule } from './stripe/stripe.module';
import { HealthModule } from './health/health.module';
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
    ThrottlerModule.forRoot([
      { name: 'short',  ttl: 60000,  limit: 20  }, // 20 requests per minute per IP (all routes)
      { name: 'rewrite', ttl: 60000, limit: 8   }, // 8 rewrite requests per minute (applied per endpoint)
    ]),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const databaseUrl = configService.get<string>('DATABASE_URL');
        const entities = [StyleProfileEntity, ManuscriptEntity, CacheEntity, VersionEntity, ProjectEntity, UserEntity, CommentEntity, UsageLogEntity, FreeUsageEntity, BillingAccountEntity];

        if (databaseUrl) {
          return {
            type: 'postgres',
            url: databaseUrl,
            entities,
            synchronize: true,
            logging: ['error', 'warn'],
            ssl: { rejectUnauthorized: false },
          };
        }

        return {
          type: 'sqlite',
          database: configService.get<string>('DATABASE_PATH') || 'database.sqlite',
          entities,
          synchronize: true,
          logging: ['error', 'warn'],
        };
      },
      inject: [ConfigService],
    }),
    RewriteModule,
    StripeModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: ThrottlerGuard }, // applies 'short' limit globally
  ],
})
export class AppModule {}
