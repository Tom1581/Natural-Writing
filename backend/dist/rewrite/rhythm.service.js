"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RhythmService = void 0;
const common_1 = require("@nestjs/common");
let RhythmService = class RhythmService {
    async analyzeCadence(text) {
        const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
        const pulseMap = sentences.map((s, i) => {
            const length = s.trim().split(/\s+/).length;
            return {
                id: i,
                length,
                type: length < 10 ? 'staccato' : (length > 25 ? 'lyrical' : 'standard'),
                text: s.trim().substring(0, 30) + '...'
            };
        });
        const averageLength = pulseMap.reduce((acc, curr) => acc + curr.length, 0) / pulseMap.length;
        const variance = pulseMap.reduce((acc, curr) => acc + Math.pow(curr.length - averageLength, 2), 0) / pulseMap.length;
        return {
            pulseMap,
            metrics: {
                averageLength: Math.round(averageLength),
                rhythmicVariety: Math.round(Math.sqrt(variance) * 10) / 10,
                status: variance > 50 ? 'Dynamic' : (variance < 10 ? 'Monotone' : 'Balanced')
            }
        };
    }
};
exports.RhythmService = RhythmService;
exports.RhythmService = RhythmService = __decorate([
    (0, common_1.Injectable)()
], RhythmService);
//# sourceMappingURL=rhythm.service.js.map