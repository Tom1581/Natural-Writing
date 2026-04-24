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
exports.SemanticService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manuscript_entity_1 = require("./entities/manuscript.entity");
let SemanticService = class SemanticService {
    manuscriptRepo;
    constructor(manuscriptRepo) {
        this.manuscriptRepo = manuscriptRepo;
    }
    async search(query, orgId) {
        const manuscripts = await this.manuscriptRepo.find();
        const ranked = manuscripts.map(m => {
            const score = this.calculateConceptualScore(query, m.optimizedText || m.sourceText);
            return { ...m, similarity: score };
        });
        return ranked
            .filter(m => m.similarity > 0.1)
            .sort((a, b) => b.similarity - a.similarity);
    }
    calculateConceptualScore(query, text) {
        const words = query.toLowerCase().split(' ');
        let matches = 0;
        words.forEach(w => {
            if (text.toLowerCase().includes(w))
                matches++;
        });
        return matches / words.length;
    }
    async getSemanticMap(orgId) {
        const manuscripts = await this.manuscriptRepo.find();
        return manuscripts.map((m, i) => ({
            id: m.id,
            title: m.title || 'Untitled',
            x: Math.cos(i) * 100,
            y: Math.sin(i * 1.5) * 100,
            group: i % 3 === 0 ? 'Style' : (i % 2 === 0 ? 'Narrative' : 'Data'),
        }));
    }
};
exports.SemanticService = SemanticService;
exports.SemanticService = SemanticService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(manuscript_entity_1.ManuscriptEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], SemanticService);
//# sourceMappingURL=semantic.service.js.map