import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ManuscriptEntity } from './entities/manuscript.entity';

@Injectable()
export class OracleService {
  constructor(
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
  ) {}

  async projectROI(orgId: string): Promise<any> {
    // orgId is reserved for future multi-tenancy; currently queries all manuscripts
    const manuscripts = await this.manuscriptRepo.find();
    
    // Simulated Business Intelligence logic
    const totalManuscripts = manuscripts.length;
    const avgHumanity = manuscripts.reduce((acc, curr) => acc + (curr.metrics?.humanityScore || 0.5), 0) / (totalManuscripts || 1);
    
    // Time saved calculation: assuming 4 hours per optimized manuscript
    const timeSavedHours = totalManuscripts * 4;
    const costSavings = timeSavedHours * 100; // Assume $100/hr enterprise labor cost

    return {
       metrics: {
          totalManuscripts,
          timeSavedHours,
          costSavings,
          avgHumanity: Math.round(avgHumanity * 100) / 100,
          projectedReach: totalManuscripts * 5000 // Simulated reach projection
       },
       projectionData: [
          { month: 'Jan', value: 1200 },
          { month: 'Feb', value: 2100 },
          { month: 'Mar', value: 3800 },
          { month: 'Apr', value: 5200 },
          { month: 'May', value: 7400 }
       ]
    };
  }
}
