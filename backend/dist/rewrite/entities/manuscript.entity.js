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
exports.ManuscriptEntity = void 0;
const typeorm_1 = require("typeorm");
const version_entity_1 = require("./version.entity");
const project_entity_1 = require("./project.entity");
const user_entity_1 = require("./user.entity");
const comment_entity_1 = require("./comment.entity");
const style_profile_entity_1 = require("./style-profile.entity");
let ManuscriptEntity = class ManuscriptEntity {
    id;
    title;
    sourceText;
    optimizedText;
    metrics;
    tone;
    strength;
    targetGradeLevel;
    language;
    sectionType;
    rating;
    createdAt;
    versions;
    project;
    owner;
    comments;
    metadata;
    styleProfile;
};
exports.ManuscriptEntity = ManuscriptEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "sourceText", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "optimizedText", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ManuscriptEntity.prototype, "metrics", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "tone", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "strength", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ManuscriptEntity.prototype, "targetGradeLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "language", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ManuscriptEntity.prototype, "sectionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], ManuscriptEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ManuscriptEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => version_entity_1.VersionEntity, (version) => version.manuscript),
    __metadata("design:type", Array)
], ManuscriptEntity.prototype, "versions", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => project_entity_1.ProjectEntity, (project) => project.manuscripts, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", project_entity_1.ProjectEntity)
], ManuscriptEntity.prototype, "project", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.UserEntity, (user) => user.manuscripts, { nullable: true }),
    __metadata("design:type", user_entity_1.UserEntity)
], ManuscriptEntity.prototype, "owner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => comment_entity_1.CommentEntity, (comment) => comment.manuscript),
    __metadata("design:type", Array)
], ManuscriptEntity.prototype, "comments", void 0);
__decorate([
    (0, typeorm_1.Column)('json', { nullable: true }),
    __metadata("design:type", Object)
], ManuscriptEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => style_profile_entity_1.StyleProfileEntity, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", style_profile_entity_1.StyleProfileEntity)
], ManuscriptEntity.prototype, "styleProfile", void 0);
exports.ManuscriptEntity = ManuscriptEntity = __decorate([
    (0, typeorm_1.Entity)()
], ManuscriptEntity);
//# sourceMappingURL=manuscript.entity.js.map