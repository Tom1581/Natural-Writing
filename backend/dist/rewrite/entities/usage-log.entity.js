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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsageLogEntity = void 0;
const typeorm_1 = require("typeorm");
const manuscript_entity_1 = require("./manuscript.entity");
let UsageLogEntity = class UsageLogEntity {
    id;
    modelUsed;
    promptTokens;
    completionTokens;
    totalTokens;
    latencyMs;
    createdAt;
    manuscript;
};
exports.UsageLogEntity = UsageLogEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], UsageLogEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], UsageLogEntity.prototype, "modelUsed", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UsageLogEntity.prototype, "promptTokens", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UsageLogEntity.prototype, "completionTokens", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UsageLogEntity.prototype, "totalTokens", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], UsageLogEntity.prototype, "latencyMs", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], UsageLogEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => manuscript_entity_1.ManuscriptEntity),
    __metadata("design:type", manuscript_entity_1.ManuscriptEntity)
], UsageLogEntity.prototype, "manuscript", void 0);
exports.UsageLogEntity = UsageLogEntity = __decorate([
    (0, typeorm_1.Entity)('usage_logs')
], UsageLogEntity);
//# sourceMappingURL=usage-log.entity.js.map