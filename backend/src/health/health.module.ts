import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthController } from './health.controller';
import { ManuscriptEntity } from '../rewrite/entities/manuscript.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ManuscriptEntity])],
  controllers: [HealthController],
})
export class HealthModule {}
