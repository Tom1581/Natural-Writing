import { Repository } from 'typeorm';
import { ManuscriptEntity } from './entities/manuscript.entity';
export declare class SemanticService {
    private readonly manuscriptRepo;
    constructor(manuscriptRepo: Repository<ManuscriptEntity>);
    search(query: string, orgId: string): Promise<any[]>;
    private calculateConceptualScore;
    getSemanticMap(orgId: string): Promise<any>;
}
