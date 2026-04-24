import { ManuscriptEntity } from './manuscript.entity';
export declare class UsageLogEntity {
    id: string;
    modelUsed: string;
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    latencyMs: number;
    createdAt: Date;
    manuscript: ManuscriptEntity;
}
