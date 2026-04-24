"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewriteModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const rewrite_controller_1 = require("./rewrite.controller");
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
const style_profile_entity_1 = require("./entities/style-profile.entity");
const manuscript_entity_1 = require("./entities/manuscript.entity");
const cache_entity_1 = require("./entities/cache.entity");
const version_entity_1 = require("./entities/version.entity");
const usage_log_entity_1 = require("./entities/usage-log.entity");
const project_entity_1 = require("./entities/project.entity");
const user_entity_1 = require("./entities/user.entity");
const comment_entity_1 = require("./entities/comment.entity");
let RewriteModule = class RewriteModule {
};
exports.RewriteModule = RewriteModule;
exports.RewriteModule = RewriteModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            typeorm_1.TypeOrmModule.forFeature([style_profile_entity_1.StyleProfileEntity, manuscript_entity_1.ManuscriptEntity, cache_entity_1.CacheEntity, version_entity_1.VersionEntity, usage_log_entity_1.UsageLogEntity, project_entity_1.ProjectEntity, user_entity_1.UserEntity, comment_entity_1.CommentEntity]),
        ],
        controllers: [rewrite_controller_1.RewriteController],
        providers: [rewrite_service_1.RewriteService, style_memory_service_1.StyleMemoryService, semantic_service_1.SemanticService, rhythm_service_1.RhythmService, evolution_service_1.EvolutionService, oracle_service_1.OracleService, genesis_service_1.GenesisService, benchmark_service_1.BenchmarkService, compliance_service_1.ComplianceService, finality_service_1.FinalityService],
        exports: [rewrite_service_1.RewriteService, style_memory_service_1.StyleMemoryService, semantic_service_1.SemanticService, rhythm_service_1.RhythmService, evolution_service_1.EvolutionService, oracle_service_1.OracleService, genesis_service_1.GenesisService, benchmark_service_1.BenchmarkService, compliance_service_1.ComplianceService, finality_service_1.FinalityService],
    })
], RewriteModule);
//# sourceMappingURL=rewrite.module.js.map