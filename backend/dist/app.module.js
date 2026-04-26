"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const rewrite_module_1 = require("./rewrite/rewrite.module");
const stripe_module_1 = require("./stripe/stripe.module");
const style_profile_entity_1 = require("./rewrite/entities/style-profile.entity");
const manuscript_entity_1 = require("./rewrite/entities/manuscript.entity");
const cache_entity_1 = require("./rewrite/entities/cache.entity");
const version_entity_1 = require("./rewrite/entities/version.entity");
const project_entity_1 = require("./rewrite/entities/project.entity");
const user_entity_1 = require("./rewrite/entities/user.entity");
const comment_entity_1 = require("./rewrite/entities/comment.entity");
const usage_log_entity_1 = require("./rewrite/entities/usage-log.entity");
const free_usage_entity_1 = require("./rewrite/entities/free-usage.entity");
const billing_account_entity_1 = require("./rewrite/entities/billing-account.entity");
const config_2 = require("@nestjs/config");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                useFactory: (_configService) => ({
                    type: 'sqlite',
                    database: 'database.sqlite',
                    entities: [style_profile_entity_1.StyleProfileEntity, manuscript_entity_1.ManuscriptEntity, cache_entity_1.CacheEntity, version_entity_1.VersionEntity, project_entity_1.ProjectEntity, user_entity_1.UserEntity, comment_entity_1.CommentEntity, usage_log_entity_1.UsageLogEntity, free_usage_entity_1.FreeUsageEntity, billing_account_entity_1.BillingAccountEntity],
                    synchronize: true,
                    logging: ['error', 'warn'],
                }),
                inject: [config_2.ConfigService],
            }),
            rewrite_module_1.RewriteModule,
            stripe_module_1.StripeModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map