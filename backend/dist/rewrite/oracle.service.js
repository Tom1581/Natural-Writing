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
exports.OracleService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const manuscript_entity_1 = require("./entities/manuscript.entity");
let OracleService = class OracleService {
    manuscriptRepo;
    constructor(manuscriptRepo) {
        this.manuscriptRepo = manuscriptRepo;
    }
    async projectROI(orgId) {
        const manuscripts = await this.manuscriptRepo.find();
        const totalManuscripts = manuscripts.length;
        const avgHumanity = manuscripts.reduce((acc, curr) => acc + (curr.metrics?.humanityScore || 0.5), 0) / (totalManuscripts || 1);
        const timeSavedHours = totalManuscripts * 4;
        const costSavings = timeSavedHours * 100;
        return {
            metrics: {
                totalManuscripts,
                timeSavedHours,
                costSavings,
                avgHumanity: Math.round(avgHumanity * 100) / 100,
                projectedReach: totalManuscripts * 5000
            },
            projectionData: [
                { month: 'Jan', value: 1200 },
                { month: 'Feb', value: 2100 },
                { month: 'Mar', value: 3800 },
                { month: 'Apr', value: 5200 },
                { month: 'May', value: 7400 }
            ]
        };
    }
};
exports.OracleService = OracleService;
exports.OracleService = OracleService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(manuscript_entity_1.ManuscriptEntity)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], OracleService);
//# sourceMappingURL=oracle.service.js.map