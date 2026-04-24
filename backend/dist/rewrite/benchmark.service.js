"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BenchmarkService = void 0;
const common_1 = require("@nestjs/common");
let BenchmarkService = class BenchmarkService {
    async getIndustryBenchmarks() {
        return {
            domains: [
                { name: 'Enterprise Publishing', score: 0.92, status: 'stellar' },
                { name: 'Technical Docs', score: 0.85, status: 'high' },
                { name: 'Academic Research', score: 0.88, status: 'exceptional' },
                { name: 'Creative Marketing', score: 0.91, status: 'dynamic' }
            ],
            globalAverage: 0.84,
            topPerformers: [
                { orgId: 'aethel', score: 0.96 },
                { orgId: 'nexus', score: 0.94 }
            ],
            historicalTrend: [
                { month: 'Jan', avg: 0.72 },
                { month: 'Feb', avg: 0.78 },
                { month: 'Mar', avg: 0.84 }
            ]
        };
    }
};
exports.BenchmarkService = BenchmarkService;
exports.BenchmarkService = BenchmarkService = __decorate([
    (0, common_1.Injectable)()
], BenchmarkService);
//# sourceMappingURL=benchmark.service.js.map