import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { StyleProfile } from './style-memory.service';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';
import { CacheEntity } from './entities/cache.entity';
import { VersionEntity } from './entities/version.entity';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from './entities/user.entity';
import { CommentEntity } from './entities/comment.entity';
import { UsageLogEntity } from './entities/usage-log.entity';
import { FreeUsageEntity } from './entities/free-usage.entity';
import { BillingAccountEntity } from './entities/billing-account.entity';
export interface AnalysisMetrics {
    sentenceLengthMean: number;
    sentenceLengthStd: number;
    sentenceLengthVariance: number;
    burstiness: number;
    repetitionScore: number;
    repeatedNGrams: {
        ngram: string;
        count: number;
    }[];
    sentenceStarterRepetition: {
        starter: string;
        count: number;
    }[];
    transitionOveruse: number;
    readability: {
        gradeLevel: number;
        readingEase: number;
        syllableCount: number;
    };
    lexicalDiversity: {
        ttr: number;
        uniqueWords: number;
        complexityScore: number;
    };
    passiveVoice: {
        count: number;
        ratio: number;
    };
    hedgeDensity: number;
    nominalizationDensity: number;
    semanticRedundancy: number;
    aiTells: {
        phrase: string;
        count: number;
    }[];
    emDashDensity: number;
    contractionRate: number;
    aiDetectionRisk: number;
    humanityScore: number;
    roboticMarkers: string[];
    detectedLanguage: string;
    sentiment: {
        overall: number;
        drift: number[];
    };
    paragraphCount: number;
    sentenceCount: number;
    protectedSpans: string[];
}
export declare enum RewriteTone {
    NATURAL = "natural",
    CONVERSATIONAL = "conversational",
    FORMAL = "formal",
    ACADEMIC = "academic",
    BLOG = "blog"
}
export declare enum RewriteStrength {
    LIGHT = "light",
    MEDIUM = "medium",
    STRONG = "strong"
}
export declare enum SectionType {
    GENERAL = "general",
    INTRODUCTION = "introduction",
    NARRATIVE = "narrative",
    DATA_DISCLOSURE = "data_disclosure",
    CONCLUSION = "conclusion",
    CTA = "cta"
}
export interface RewriteOptions {
    tone: RewriteTone;
    strength: RewriteStrength;
    preserveTechnicalTerms?: boolean;
    preserveNumbers?: boolean;
    targetGradeLevel?: number;
    styleProfile?: StyleProfile;
    sectionType?: SectionType;
    intent?: number;
    humanization?: number;
}
export declare const PRESET_PERSONAS: Record<string, any>;
export declare class RewriteService {
    private readonly configService;
    private readonly profileRepo;
    private readonly manuscriptRepo;
    private readonly cacheRepo;
    private readonly versionRepo;
    private readonly projectRepo;
    private readonly userRepo;
    private readonly commentRepo;
    private readonly usageLogRepo;
    private readonly freeUsageRepo;
    private readonly billingAccountRepo;
    private readonly logger;
    private openai;
    constructor(configService: ConfigService, profileRepo: Repository<StyleProfileEntity>, manuscriptRepo: Repository<ManuscriptEntity>, cacheRepo: Repository<CacheEntity>, versionRepo: Repository<VersionEntity>, projectRepo: Repository<ProjectEntity>, userRepo: Repository<UserEntity>, commentRepo: Repository<CommentEntity>, usageLogRepo: Repository<UsageLogEntity>, freeUsageRepo: Repository<FreeUsageEntity>, billingAccountRepo: Repository<BillingAccountEntity>);
    private loadReadability;
    private extractProtectedSpans;
    private splitSentences;
    private splitParagraphs;
    private computeRepeatedNGrams;
    private computeSentenceStarterRepetition;
    private estimatePassiveVoice;
    private computeHedgeDensity;
    private computeNominalizationDensity;
    private computeSemanticRedundancy;
    private computeJaccardSimilarity;
    private computeAITells;
    private computeEmDashDensity;
    private computeContractionRate;
    private computeBurstiness;
    private computeAIDetectionRisk;
    private scoreCandidateLocally;
    analyze(text: string): Promise<AnalysisMetrics>;
    private buildHumanizationInstructions;
    private readonly FREE_WORD_LIMIT;
    private static readonly ADMIN_EMAILS;
    private resolvePaidTier;
    private checkPaidQuota;
    getAccessStatus(email: string): Promise<{
        tier: string | null;
        wordsRemaining: number;
        totalWordsPurchased: number;
        freeWordsUsed: number;
        freeWordsLimit: number;
        unlimitedActive: boolean;
        subscriptionStatus: string | null;
        canManageBilling: boolean;
    }>;
    private checkFreeQuota;
    processText(text: string, options: RewriteOptions, userEmail?: string | null, subscriptionTier?: string | null, ipAddress?: string): Promise<{
        id: string;
        bestVersion: string;
        alternatives: string[];
        metrics: AnalysisMetrics;
        outputMetrics: AnalysisMetrics;
        humanizationDelta: number;
    }>;
    getHistory(): Promise<ManuscriptEntity[]>;
    getVersions(manuscriptId: string): Promise<VersionEntity[]>;
    saveVersion(manuscriptId: string, label?: string): Promise<VersionEntity>;
    getProjects(): Promise<ProjectEntity[]>;
    createProject(name: string, description?: string): Promise<ProjectEntity>;
    assignToProject(manuscriptId: string, projectId: string): Promise<void>;
    chatWithManuscript(query: string, manuscriptContent: string): Promise<string>;
    refineSentence(sentence: string, context: string, mode: string): Promise<string[]>;
    spawnReaders(text: string): Promise<any[]>;
    analyzeEngagement(text: string): Promise<any>;
    synthesizeMasterpiece(text: string, options: any): Promise<any>;
    getPlatformStats(): Promise<any>;
    getFreeUsage(email: string): Promise<{
        wordsUsed: number;
        limit: number;
    }>;
    getProfiles(): Promise<StyleProfileEntity[]>;
    saveProfile(profile: StyleProfile): Promise<StyleProfileEntity>;
    updateRating(id: string, rating: number): Promise<void>;
    updateManuscript(id: string, optimizedText: string): Promise<void>;
    createComment(manuscriptId: string, data: any): Promise<CommentEntity>;
    getComments(manuscriptId: string): Promise<CommentEntity[]>;
    generateOutline(topic: string, template: string): Promise<string>;
    calculateConsistency(metrics: AnalysisMetrics, profile: StyleProfile): {
        score: number;
        drift: string[];
    };
    predictStyle(manuscriptContent: string): Promise<any>;
    generateMetadata(manuscriptId: string): Promise<any>;
    searchHistory(query: string): Promise<ManuscriptEntity[]>;
    auditProjectConsistency(projectId: string): Promise<any>;
    private globalSmooth;
    private createHash;
    private getFromCache;
    private setCache;
    private humanizeFallback;
    generateDraft(paperType: string, wordCount: string, prompt: string): Promise<{
        text: string;
    }>;
    private buildHumanizeSystemPrompt;
    private callGroq;
    private callGemini;
    private callOpenAI;
}
