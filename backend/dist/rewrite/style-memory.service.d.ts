import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';
export interface StyleProfile {
    name: string;
    adjectiveLevel: number;
    sentenceComplexity: number;
    preferredTransitions: string[];
    toneDescriptors: string[];
    contractionRate: 'high' | 'medium' | 'low';
    vocabularyBand: 'common' | 'sophisticated' | 'academic';
}
export declare class StyleMemoryService {
    private readonly configService;
    private readonly styleRepo;
    private readonly manuscriptRepo;
    private readonly openai;
    private readonly logger;
    constructor(configService: ConfigService, styleRepo: Repository<StyleProfileEntity>, manuscriptRepo: Repository<ManuscriptEntity>);
    getStyleContext(orgId: string): Promise<string>;
    logFeedback(manuscriptId: string, aiText: string, humanText: string): Promise<void>;
    profileStyle(sampleText: string, name?: string): Promise<StyleProfile>;
}
