import { RewriteService, RewriteOptions } from './rewrite.service';
import { StyleMemoryService } from './style-memory.service';
import { SemanticService } from './semantic.service';
import { RhythmService } from './rhythm.service';
import { EvolutionService } from './evolution.service';
import { OracleService } from './oracle.service';
import { GenesisService } from './genesis.service';
import { BenchmarkService } from './benchmark.service';
import { ComplianceService } from './compliance.service';
import { FinalityService } from './finality.service';
export declare class RewriteController {
    private readonly rewriteService;
    private readonly styleMemoryService;
    private readonly semanticService;
    private readonly rhythmService;
    private readonly evolutionService;
    private readonly oracleService;
    private readonly genesisService;
    private readonly benchmarkService;
    private readonly complianceService;
    private readonly finalityService;
    constructor(rewriteService: RewriteService, styleMemoryService: StyleMemoryService, semanticService: SemanticService, rhythmService: RhythmService, evolutionService: EvolutionService, oracleService: OracleService, genesisService: GenesisService, benchmarkService: BenchmarkService, complianceService: ComplianceService, finalityService: FinalityService);
    performFinalityAudit(): Promise<any>;
    performComplianceCheck(text: string): Promise<any>;
    getIndustryBenchmarks(): Promise<any>;
    getHistory(): Promise<import("./entities/manuscript.entity").ManuscriptEntity[]>;
    getPlatformStats(): Promise<any>;
    getProjects(): Promise<import("./entities/project.entity").ProjectEntity[]>;
    getOracleProjection(orgId: string): Promise<any>;
    getStyleDrift(orgId: string): Promise<any[]>;
    getRhythmAnalysis(text: string): Promise<any>;
    semanticSearch(query: string, orgId: string): Promise<any[]>;
    getSemanticMap(orgId: string): Promise<any>;
    processText(body: {
        text: string;
        options: RewriteOptions;
    }): Promise<{
        id: string;
        bestVersion: string;
        alternatives: string[];
        metrics: import("./rewrite.service").AnalysisMetrics;
        outputMetrics: import("./rewrite.service").AnalysisMetrics;
        humanizationDelta: number;
    }>;
    scaffold(body: {
        orgId: string;
        orgName: string;
    }): Promise<any>;
    logFeedback(body: {
        manuscriptId: string;
        aiText: string;
        humanText: string;
    }): Promise<void>;
    createProject(body: {
        name: string;
        description?: string;
    }): Promise<import("./entities/project.entity").ProjectEntity>;
    chat(body: {
        query: string;
        content: string;
    }): Promise<string>;
    profileStyle(body: {
        text: string;
        name?: string;
    }): Promise<import("./style-memory.service").StyleProfile>;
    refineSentence(body: {
        sentence: string;
        context: string;
        mode: string;
    }): Promise<string[]>;
    getVersions(manuscriptId: string): Promise<import("./entities/version.entity").VersionEntity[]>;
    spawnReaders(id: string, body: {
        content: string;
    }): Promise<any[]>;
    predictEngagement(id: string, body: {
        content: string;
    }): Promise<any>;
    synthesize(id: string, body: {
        content: string;
        options?: any;
    }): Promise<any>;
}
