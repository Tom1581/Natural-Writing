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
exports.GenesisService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const style_profile_entity_1 = require("./entities/style-profile.entity");
const manuscript_entity_1 = require("./entities/manuscript.entity");
let GenesisService = class GenesisService {
    styleRepo;
    manuscriptRepo;
    constructor(styleRepo, manuscriptRepo) {
        this.styleRepo = styleRepo;
        this.manuscriptRepo = manuscriptRepo;
    }
    async scaffoldOrganization(orgId, orgName) {
        const defaultProfile = this.styleRepo.create({
            name: `${orgName} Core Identity`,
            description: 'The foundational voice for the organization.',
            adjectiveLevel: 0.3,
            sentenceComplexity: 0.6,
            preferredTransitions: ['however', 'therefore', 'as a result'],
            toneDescriptors: ['professional', 'clear', 'authoritative'],
            contractionRate: 'low',
            vocabularyBand: 'sophisticated',
            metrics: { repetitionScore: 0.2, humanityScore: 0.9 },
        });
        await this.styleRepo.save(defaultProfile);
        const welcomeManuscript = this.manuscriptRepo.create({
            title: `Welcome to ${orgName} workspace`,
            sourceText: `Welcome to your Natural Writing workspace for ${orgName}. Paste any text into the editor and click Improve Text to get started.`,
            optimizedText: `Welcome to your Natural Writing workspace for ${orgName}. To get started, paste any piece of writing into the editor and click Improve Text. The AI will analyse the text and suggest improvements while preserving your key data points.`,
            styleProfile: defaultProfile,
        });
        await this.manuscriptRepo.save(welcomeManuscript);
        return {
            status: 'Workspace created',
            scaffoldedEntities: {
                styleProfiles: [defaultProfile.id],
                manuscripts: [welcomeManuscript.id],
            },
        };
    }
};
exports.GenesisService = GenesisService;
exports.GenesisService = GenesisService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(style_profile_entity_1.StyleProfileEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(manuscript_entity_1.ManuscriptEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], GenesisService);
//# sourceMappingURL=genesis.service.js.map