"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewriteController = void 0;
const common_1 = require("@nestjs/common");
const rewrite_service_1 = require("./rewrite.service");
const style_memory_service_1 = require("./style-memory.service");
const semantic_service_1 = require("./semantic.service");
const rhythm_service_1 = require("./rhythm.service");
const evolution_service_1 = require("./evolution.service");
const oracle_service_1 = require("./oracle.service");
const genesis_service_1 = require("./genesis.service");
const benchmark_service_1 = require("./benchmark.service");
const compliance_service_1 = require("./compliance.service");
const finality_service_1 = require("./finality.service");
let RewriteController = class RewriteController {
    rewriteService;
    styleMemoryService;
    semanticService;
    rhythmService;
    evolutionService;
    oracleService;
    genesisService;
    benchmarkService;
    complianceService;
    finalityService;
    constructor(rewriteService, styleMemoryService, semanticService, rhythmService, evolutionService, oracleService, genesisService, benchmarkService, complianceService, finalityService) {
        this.rewriteService = rewriteService;
        this.styleMemoryService = styleMemoryService;
        this.semanticService = semanticService;
        this.rhythmService = rhythmService;
        this.evolutionService = evolutionService;
        this.oracleService = oracleService;
        this.genesisService = genesisService;
        this.benchmarkService = benchmarkService;
        this.complianceService = complianceService;
        this.finalityService = finalityService;
    }
    performFinalityAudit() {
        return this.finalityService.performFinalityAudit();
    }
    performComplianceCheck(text) {
        return this.complianceService.performComplianceCheck(text);
    }
    getIndustryBenchmarks() {
        return this.benchmarkService.getIndustryBenchmarks();
    }
    getHistory() {
        return this.rewriteService.getHistory();
    }
    getPlatformStats() {
        return this.rewriteService.getPlatformStats();
    }
    getProjects() {
        return this.rewriteService.getProjects();
    }
    getOracleProjection(orgId) {
        return this.oracleService.projectROI(orgId);
    }
    getStyleDrift(orgId) {
        return this.evolutionService.getStyleDrift(orgId);
    }
    getRhythmAnalysis(text) {
        return this.rhythmService.analyzeCadence(text);
    }
    semanticSearch(query, orgId) {
        return this.semanticService.search(query, orgId);
    }
    getSemanticMap(orgId) {
        return this.semanticService.getSemanticMap(orgId);
    }
    processText(body) {
        return this.rewriteService.processText(body.text, body.options);
    }
    scaffold(body) {
        return this.genesisService.scaffoldOrganization(body.orgId, body.orgName);
    }
    logFeedback(body) {
        return this.styleMemoryService.logFeedback(body.manuscriptId, body.aiText, body.humanText);
    }
    createProject(body) {
        return this.rewriteService.createProject(body.name, body.description);
    }
    async chat(body) {
        const reply = await this.rewriteService.chatWithManuscript(body.query, body.content);
        return reply;
    }
    profileStyle(body) {
        return this.styleMemoryService.profileStyle(body.text, body.name);
    }
    refineSentence(body) {
        return this.rewriteService.refineSentence(body.sentence, body.context, body.mode);
    }
    getVersions(manuscriptId) {
        return this.rewriteService.getVersions(manuscriptId);
    }
    spawnReaders(id, body) {
        return this.rewriteService.spawnReaders(body.content);
    }
    predictEngagement(id, body) {
        return this.rewriteService.analyzeEngagement(body.content);
    }
    synthesize(id, body) {
        return this.rewriteService.synthesizeMasterpiece(body.content, body.options);
    }
};
exports.RewriteController = RewriteController;
__decorate([
    (0, common_1.Get)('finality-audit'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "performFinalityAudit", null);
__decorate([
    (0, common_1.Get)('compliance-check'),
    __param(0, (0, common_1.Query)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "performComplianceCheck", null);
__decorate([
    (0, common_1.Get)('industry-benchmarks'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getIndustryBenchmarks", null);
__decorate([
    (0, common_1.Get)('history'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getHistory", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getPlatformStats", null);
__decorate([
    (0, common_1.Get)('projects'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getProjects", null);
__decorate([
    (0, common_1.Get)('oracle-projection'),
    __param(0, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getOracleProjection", null);
__decorate([
    (0, common_1.Get)('style-drift'),
    __param(0, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getStyleDrift", null);
__decorate([
    (0, common_1.Get)('rhythm-analysis'),
    __param(0, (0, common_1.Query)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getRhythmAnalysis", null);
__decorate([
    (0, common_1.Get)('semantic-search'),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "semanticSearch", null);
__decorate([
    (0, common_1.Get)('semantic-map'),
    __param(0, (0, common_1.Query)('orgId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getSemanticMap", null);
__decorate([
    (0, common_1.Post)('process'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "processText", null);
__decorate([
    (0, common_1.Post)('genesis-scaffold'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "scaffold", null);
__decorate([
    (0, common_1.Post)('log-feedback'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "logFeedback", null);
__decorate([
    (0, common_1.Post)('projects'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "createProject", null);
__decorate([
    (0, common_1.Post)('chat'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RewriteController.prototype, "chat", null);
__decorate([
    (0, common_1.Post)('profile-style'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "profileStyle", null);
__decorate([
    (0, common_1.Post)('refine-sentence'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "refineSentence", null);
__decorate([
    (0, common_1.Get)('versions/:manuscriptId'),
    __param(0, (0, common_1.Param)('manuscriptId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "getVersions", null);
__decorate([
    (0, common_1.Post)(':id/spawn-readers'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "spawnReaders", null);
__decorate([
    (0, common_1.Post)(':id/predict-engagement'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "predictEngagement", null);
__decorate([
    (0, common_1.Post)(':id/synthesize'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], RewriteController.prototype, "synthesize", null);
exports.RewriteController = RewriteController = __decorate([
    (0, common_1.Controller)('rewrite'),
    __metadata("design:paramtypes", [rewrite_service_1.RewriteService,
        style_memory_service_1.StyleMemoryService,
        semantic_service_1.SemanticService,
        rhythm_service_1.RhythmService,
        evolution_service_1.EvolutionService,
        oracle_service_1.OracleService,
        genesis_service_1.GenesisService,
        benchmark_service_1.BenchmarkService,
        compliance_service_1.ComplianceService,
        finality_service_1.FinalityService])
], RewriteController);
//# sourceMappingURL=rewrite.controller.js.map