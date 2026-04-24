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
exports.EvolutionService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const style_profile_entity_1 = require("./entities/style-profile.entity");
const manuscript_entity_1 = require("./entities/manuscript.entity");
let EvolutionService = class EvolutionService {
    styleRepo;
    manuscriptRepo;
    constructor(styleRepo, manuscriptRepo) {
        this.styleRepo = styleRepo;
        this.manuscriptRepo = manuscriptRepo;
    }
    async getStyleDrift(orgId) {
        const manuscripts = await this.manuscriptRepo.find({
            order: { createdAt: 'ASC' },
            take: 20,
        });
        return manuscripts.map((m, i) => ({
            date: m.createdAt.toISOString().split('T')[0],
            humanity: (m.metrics?.humanityScore || 0.5) + (Math.random() * 0.1 - 0.05),
            dna_stability: 0.9 - (i * 0.01),
            repetition: m.metrics?.repetitionScore || 0.2
        }));
    }
};
exports.EvolutionService = EvolutionService;
exports.EvolutionService = EvolutionService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(style_profile_entity_1.StyleProfileEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(manuscript_entity_1.ManuscriptEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], EvolutionService);
//# sourceMappingURL=evolution.service.js.map