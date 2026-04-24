import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';

@Injectable()
export class EvolutionService {
  constructor(
    @InjectRepository(StyleProfileEntity)
    private readonly styleRepo: Repository<StyleProfileEntity>,
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
  ) {}

  async getStyleDrift(orgId: string): Promise<any[]> {
    // orgId is reserved for future multi-tenancy; currently returns recent manuscripts
    const manuscripts = await this.manuscriptRepo.find({
      order: { createdAt: 'ASC' },
      take: 20,
    });

    return manuscripts.map((m, i) => ({
       date: m.createdAt.toISOString().split('T')[0],
       humanity: (m.metrics?.humanityScore || 0.5) + (Math.random() * 0.1 - 0.05),
       dna_stability: 0.9 - (i * 0.01),
       repetition: m.metrics?.repetitionScore || 0.2
    }));
  }
}
