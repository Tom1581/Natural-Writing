import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManuscriptEntity } from '../rewrite/entities/manuscript.entity';

@Controller('health')
export class HealthController {
  constructor(
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
  ) {}

  @Get()
  async check() {
    const dbStatus = await this.checkDatabase();
    const systemStatus = {
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date().toISOString(),
    };

    return {
      status: dbStatus ? 'up' : 'degraded',
      details: {
        database: dbStatus ? 'healthy' : 'disconnected',
        system: systemStatus,
        version: 'v13.0 Apex',
      },
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      await this.manuscriptRepo.query('SELECT 1');
      return true;
    } catch (e) {
      return false;
    }
  }
}
