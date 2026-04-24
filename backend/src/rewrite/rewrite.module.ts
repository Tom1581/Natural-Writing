import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RewriteController } from './rewrite.controller';
import { RewriteService } from './rewrite.service';
import { StyleMemoryService } from './style-memory.service';
import { SemanticService } from './semantic.service';
import { RhythmService } from './rhythm.service';
import { EvolutionService } from './evolution.service';
import { OracleService } from './oracle.service';
import { GenesisService } from './genesis.service';
import { BenchmarkService } from './benchmark.service';
import { ComplianceService } from './compliance.service';
import { FinalityService } from './finality.service';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';
import { CacheEntity } from './entities/cache.entity';
import { VersionEntity } from './entities/version.entity';
import { UsageLogEntity } from './entities/usage-log.entity';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from './entities/user.entity';
import { CommentEntity } from './entities/comment.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([StyleProfileEntity, ManuscriptEntity, CacheEntity, VersionEntity, UsageLogEntity, ProjectEntity, UserEntity, CommentEntity]),
  ],
  controllers: [RewriteController],
  providers: [RewriteService, StyleMemoryService, SemanticService, RhythmService, EvolutionService, OracleService, GenesisService, BenchmarkService, ComplianceService, FinalityService],
  exports: [RewriteService, StyleMemoryService, SemanticService, RhythmService, EvolutionService, OracleService, GenesisService, BenchmarkService, ComplianceService, FinalityService],
})
export class RewriteModule {}
