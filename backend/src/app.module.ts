import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const rawDatabaseUrl = configService.get<string>('DATABASE_URL')?.trim();
        const entities = [StyleProfileEntity, ManuscriptEntity, CacheEntity, VersionEntity, ProjectEntity, UserEntity, CommentEntity, UsageLogEntity, FreeUsageEntity, BillingAccountEntity];
        let databaseUrl: string | null = null;

        if (rawDatabaseUrl) {
          try {
            const parsed = new URL(rawDatabaseUrl);
            const hasCompleteHost = parsed.hostname.includes('.');
            if (parsed.protocol.startsWith('postgres') && hasCompleteHost) {
              databaseUrl = rawDatabaseUrl;
            } else {
              console.warn(
                `Ignoring invalid DATABASE_URL host "${parsed.hostname}". Falling back to SQLite.`,
              );
            }
          } catch {
            console.warn('Ignoring malformed DATABASE_URL. Falling back to SQLite.');
          }
        }

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
})
export class AppModule {}
