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
exports.VersionEntity = void 0;
const typeorm_1 = require("typeorm");
const manuscript_entity_1 = require("./manuscript.entity");
let VersionEntity = class VersionEntity {
    id;
    content;
    metrics;
    label;
    createdAt;
    manuscript;
};
exports.VersionEntity = VersionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], VersionEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], VersionEntity.prototype, "content", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], VersionEntity.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Snapshot' }),
    __metadata("design:type", String)
], VersionEntity.prototype, "label", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VersionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => manuscript_entity_1.ManuscriptEntity, (manuscript) => manuscript.versions, { onDelete: 'CASCADE' }),
    __metadata("design:type", manuscript_entity_1.ManuscriptEntity)
], VersionEntity.prototype, "manuscript", void 0);
exports.VersionEntity = VersionEntity = __decorate([
    (0, typeorm_1.Entity)()
], VersionEntity);
//# sourceMappingURL=version.entity.js.map