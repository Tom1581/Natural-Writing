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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var StyleMemoryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.StyleMemoryService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const openai_1 = __importDefault(require("openai"));
const style_profile_entity_1 = require("./entities/style-profile.entity");
const manuscript_entity_1 = require("./entities/manuscript.entity");
let StyleMemoryService = StyleMemoryService_1 = class StyleMemoryService {
    configService;
    styleRepo;
    manuscriptRepo;
    openai;
    logger = new common_1.Logger(StyleMemoryService_1.name);
    constructor(configService, styleRepo, manuscriptRepo) {
        this.configService = configService;
        this.styleRepo = styleRepo;
        this.manuscriptRepo = manuscriptRepo;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        this.openai = new openai_1.default({ apiKey });
    }
    async getStyleContext(orgId) {
        const profiles = await this.styleRepo.find();
        return profiles.map(p => `${p.name}: ${p.description || ''}`).join('\n');
    }
    async logFeedback(manuscriptId, aiText, humanText) {
        const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId }, relations: ['styleProfile'] });
        if (!manuscript || !manuscript.styleProfile)
            return;
        const aiLength = aiText.split(' ').length;
        const humanLength = humanText.split(' ').length;
        const profile = manuscript.styleProfile;
        if (!profile.metrics)
            profile.metrics = { repetitionScore: 0.5 };
        if (humanLength < aiLength) {
            profile.metrics.repetitionScore = Math.max(0, profile.metrics.repetitionScore - 0.01);
        }
        else {
            profile.metrics.repetitionScore = Math.min(1, profile.metrics.repetitionScore + 0.01);
        }
        await this.styleRepo.save(profile);
        console.log(`Singularity Back-propagation: Style DNA evolved for ${profile.name}`);
    }
    async profileStyle(sampleText, name = 'Current Writer') {
        try {
            const response = await this.openai.chat.completions.create({
                model: 'gpt-4o',
                messages: [
                    {
                        role: 'system',
                        content: `Analyze the author's writing style. Extract a detailed stylistic profile.
            Return JSON: {
              "name": "${name}",
              "adjectiveLevel": 0.0-1.0,
              "sentenceComplexity": 0.0-1.0,
              "preferredTransitions": ["..."],
              "toneDescriptors": ["..."],
              "contractionRate": "high"|"medium"|"low",
              "vocabularyBand": "common"|"sophisticated"|"academic"
            }`
                    },
                    { role: 'user', content: sampleText }
                ],
                response_format: { type: 'json_object' }
            });
            return JSON.parse(response.choices[0].message.content ?? '{}');
        }
        catch (error) {
            this.logger.error('Error profiling style:', error);
            throw error;
        }
    }
};
exports.StyleMemoryService = StyleMemoryService;
exports.StyleMemoryService = StyleMemoryService = StyleMemoryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(style_profile_entity_1.StyleProfileEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(manuscript_entity_1.ManuscriptEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository])
], StyleMemoryService);
//# sourceMappingURL=style-memory.service.js.map