import { Repository } from 'typeorm';
import { ManuscriptEntity } from '../rewrite/entities/manuscript.entity';
export declare class HealthController {
    private readonly manuscriptRepo;
    constructor(manuscriptRepo: Repository<ManuscriptEntity>);
    check(): Promise<{
        status: string;
        details: {
            database: string;
            system: {
                uptime: number;
                memory: NodeJS.MemoryUsage;
                timestamp: string;
            };
            version: string;
        };
    }>;
    private checkDatabase;
}
