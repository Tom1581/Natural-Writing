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
exports.StyleProfileEntity = void 0;
const typeorm_1 = require("typeorm");
let StyleProfileEntity = class StyleProfileEntity {
    id;
    name;
    description;
    adjectiveLevel;
    sentenceComplexity;
    preferredTransitions;
    toneDescriptors;
    contractionRate;
    vocabularyBand;
    metrics;
    createdAt;
};
exports.StyleProfileEntity = StyleProfileEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], StyleProfileEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StyleProfileEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], StyleProfileEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], StyleProfileEntity.prototype, "adjectiveLevel", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], StyleProfileEntity.prototype, "sentenceComplexity", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], StyleProfileEntity.prototype, "preferredTransitions", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array'),
    __metadata("design:type", Array)
], StyleProfileEntity.prototype, "toneDescriptors", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StyleProfileEntity.prototype, "contractionRate", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], StyleProfileEntity.prototype, "vocabularyBand", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], StyleProfileEntity.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], StyleProfileEntity.prototype, "createdAt", void 0);
exports.StyleProfileEntity = StyleProfileEntity = __decorate([
    (0, typeorm_1.Entity)()
], StyleProfileEntity);
//# sourceMappingURL=style-profile.entity.js.map