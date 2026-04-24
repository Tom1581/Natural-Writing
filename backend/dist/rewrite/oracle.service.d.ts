import { Repository } from 'typeorm';
import { ManuscriptEntity } from './entities/manuscript.entity';
export declare class OracleService {
    private readonly manuscriptRepo;
    constructor(manuscriptRepo: Repository<ManuscriptEntity>);
    projectROI(orgId: string): Promise<any>;
}
