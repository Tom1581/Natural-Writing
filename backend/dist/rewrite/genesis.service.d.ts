import { Repository } from 'typeorm';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';
export declare class GenesisService {
    private readonly styleRepo;
    private readonly manuscriptRepo;
    constructor(styleRepo: Repository<StyleProfileEntity>, manuscriptRepo: Repository<ManuscriptEntity>);
    scaffoldOrganization(orgId: string, orgName: string): Promise<any>;
}
