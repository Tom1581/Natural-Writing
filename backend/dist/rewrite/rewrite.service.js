"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var RewriteService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RewriteService = exports.PRESET_PERSONAS = exports.SectionType = exports.RewriteStrength = exports.RewriteTone = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const openai_1 = __importDefault(require("openai"));
const crypto = __importStar(require("crypto"));
const style_profile_entity_1 = require("./entities/style-profile.entity");
const manuscript_entity_1 = require("./entities/manuscript.entity");
const cache_entity_1 = require("./entities/cache.entity");
const version_entity_1 = require("./entities/version.entity");
const project_entity_1 = require("./entities/project.entity");
const user_entity_1 = require("./entities/user.entity");
const comment_entity_1 = require("./entities/comment.entity");
const usage_log_entity_1 = require("./entities/usage-log.entity");
let rs;
var RewriteTone;
(function (RewriteTone) {
    RewriteTone["NATURAL"] = "natural";
    RewriteTone["CONVERSATIONAL"] = "conversational";
    RewriteTone["FORMAL"] = "formal";
    RewriteTone["ACADEMIC"] = "academic";
    RewriteTone["BLOG"] = "blog";
})(RewriteTone || (exports.RewriteTone = RewriteTone = {}));
var RewriteStrength;
(function (RewriteStrength) {
    RewriteStrength["LIGHT"] = "light";
    RewriteStrength["MEDIUM"] = "medium";
    RewriteStrength["STRONG"] = "strong";
})(RewriteStrength || (exports.RewriteStrength = RewriteStrength = {}));
var SectionType;
(function (SectionType) {
    SectionType["GENERAL"] = "general";
    SectionType["INTRODUCTION"] = "introduction";
    SectionType["NARRATIVE"] = "narrative";
    SectionType["DATA_DISCLOSURE"] = "data_disclosure";
    SectionType["CONCLUSION"] = "conclusion";
    SectionType["CTA"] = "cta";
})(SectionType || (exports.SectionType = SectionType = {}));
exports.PRESET_PERSONAS = {
    economist: {
        name: 'The Economist Analytical',
        adjectiveLevel: 0.2,
        sentenceComplexity: 0.8,
        vocabularyDepth: 0.9,
        tone: 'formal',
        description: 'Cold, analytical, high-density data flow with sharp wit.',
    },
    nature: {
        name: 'Nature Journal Academic',
        adjectiveLevel: 0.1,
        sentenceComplexity: 0.9,
        vocabularyDepth: 1.0,
        tone: 'academic',
        description: 'Precise, dense, and rigorously objective.',
    },
    vogue: {
        name: 'Vogue Descriptive',
        adjectiveLevel: 0.8,
        sentenceComplexity: 0.6,
        vocabularyDepth: 0.8,
        tone: 'blog',
        description: 'Lush, evocative, sensory-focused narrative.',
    },
    quartz: {
        name: 'Quartz Global Tech',
        adjectiveLevel: 0.3,
        sentenceComplexity: 0.5,
        vocabularyDepth: 0.7,
        tone: 'blog',
        description: 'Punchy, modern, accessible but deeply insightful.',
    },
};
const TRANSITION_WORDS = [
    'additionally', 'furthermore', 'moreover', 'in conclusion', 'consequently',
    'as a result', 'it is important to note', 'therefore', 'however', 'nonetheless',
    'in addition', 'on the other hand', 'that being said', 'having said that',
    'in other words', 'to summarize', 'in summary', 'to conclude',
];
const HEDGE_PHRASES = [
    'it seems', 'it appears', 'perhaps', 'arguably', 'might be', 'could be',
    'may be', 'possibly', 'somewhat', 'rather', 'fairly', 'quite', 'relatively',
    'in some ways', 'to some extent', 'generally speaking', 'one could argue',
    'there is a sense in which', 'in a sense', 'sort of', 'kind of',
    'more or less', 'to a degree', 'in many cases', 'in some cases',
    'tends to', 'can sometimes', 'often seems',
];
const AI_TELL_PHRASES = [
    'delve into', 'delves into', 'delving into', 'delve deeper',
    'dive into', 'dive deep', 'deep dive',
    'navigate the', 'navigating the', 'navigating complex', 'navigate this',
    'embark on', 'embarking on', 'embark upon',
    'unlock the', 'unlocking the', 'unleash the',
    'empower', 'empowers', 'empowering',
    'leverage', 'leverages', 'leveraging',
    'spearhead', 'spearheaded', 'spearheading',
    'revolutionize', 'revolutionizing', 'revolutionized',
    'streamline', 'streamlines', 'streamlining',
    'pave the way', 'paving the way',
    'shed light on', 'sheds light on',
    'unveil', 'unveils', 'unveiling',
    'tapestry of', 'rich tapestry', 'intricate tapestry',
    'landscape of', 'changing landscape', 'evolving landscape',
    'realm of', 'within the realm',
    'paradigm shift', 'new paradigm',
    'synergy', 'synergies', 'synergistic',
    'ecosystem of',
    'seamless', 'seamlessly',
    'robust', 'robustness',
    'vibrant', 'holistic', 'multifaceted',
    'cutting-edge', 'state-of-the-art',
    'ever-evolving', 'ever-changing', 'ever-growing',
    'game-changer', 'game-changing', 'groundbreaking',
    'plays a crucial role', 'play a crucial role', 'plays an important role',
    'plays a vital role', 'play a vital role',
    'plays a key role', 'play a key role',
    'is essential to', 'are essential to', 'is essential for', 'are essential for',
    'is critical to', 'are critical to',
    'significant impact', 'significant role', 'significant benefit',
    'wide range of', 'wide variety of', 'broad range of',
    'various aspects', 'various factors', 'various strategies', 'various ways',
    'in order to', 'in order for',
    'it is important to', 'it is essential to', 'it is necessary to', 'it is vital to',
    'it is crucial to', 'it is critical to',
    'research has shown', 'studies have shown', 'research suggests', 'evidence suggests',
    'provides an opportunity', 'provide an opportunity',
    'this approach', 'this strategy', 'this method', 'these strategies',
    'a key component', 'a key factor', 'a key aspect', 'a key element',
    'effective strategies', 'effective approach', 'effective way',
    'students are able to', 'students can', 'learners are able to',
    'by doing so', 'in doing so',
    'not only', 'not only does', 'not only can',
    'overall', 'as a whole',
    'on the other hand', 'on one hand',
    'it is worth noting', "it's worth noting",
    'it should be noted', 'it is important to note',
    'as previously mentioned', 'as mentioned earlier', 'as noted above',
    'in conclusion', 'to summarize', 'in summary', 'to conclude',
    'at the heart of', 'at its core', 'in essence',
    'furthermore', 'moreover', 'additionally', 'consequently',
    'nevertheless', 'nonetheless',
    'therefore', 'thus', 'hence',
    'ultimately',
    'in today\'s', 'in this digital age', 'in the modern era',
    'crucial', 'imperative', 'paramount', 'quintessential',
    'foster', 'fosters', 'fostering',
    'optimize', 'optimizes', 'optimizing',
    'by providing', 'by ensuring', 'by allowing', 'by enabling',
    'this ensures', 'this allows', 'this enables', 'this helps',
    'both', 'not only', 'as well as',
    'the importance of', 'the role of', 'the impact of', 'the significance of',
    'serves as', 'serve as',
    'as such',
    'move forward', 'going forward',
];
const AI_TELL_REGEX = new RegExp('\\b(?:' + AI_TELL_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b', 'gi');
const CONTRACTION_REGEX = /\b(?:don't|doesn't|didn't|won't|wouldn't|can't|cannot|couldn't|shouldn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|it's|that's|there's|here's|what's|who's|you're|we're|they're|you've|we've|they've|I've|you'll|we'll|they'll|I'll|he's|she's|let's|I'd|you'd|we'd|they'd|I'm)\b/gi;
const CONTRACTIBLE_REGEX = /\b(?:it is|that is|there is|here is|what is|who is|you are|we are|they are|you have|we have|they have|I have|you will|we will|they will|I will|he is|she is|let us|I would|you would|we would|they would|I am|do not|does not|did not|will not|would not|cannot|could not|should not|is not|are not|was not|were not|has not|have not|had not)\b/gi;
const SECTION_GUIDES = {
    [SectionType.INTRODUCTION]: 'Strong hook, clarity of purpose, and thematic momentum.',
    [SectionType.NARRATIVE]: 'Optimize for flow, rhythm, and varying sentence starts.',
    [SectionType.DATA_DISCLOSURE]: 'Absolute precision, neutral tone, clarity of numbers and facts.',
    [SectionType.CONCLUSION]: 'Synthesize key points with a resonant final thought.',
    [SectionType.CTA]: 'Elevate urgency and clarity of action without sounding aggressive.',
    [SectionType.GENERAL]: 'Balance naturalness, clarity, and engagement.',
};
let RewriteService = RewriteService_1 = class RewriteService {
    configService;
    profileRepo;
    manuscriptRepo;
    cacheRepo;
    versionRepo;
    projectRepo;
    userRepo;
    commentRepo;
    usageLogRepo;
    logger = new common_1.Logger(RewriteService_1.name);
    openai;
    constructor(configService, profileRepo, manuscriptRepo, cacheRepo, versionRepo, projectRepo, userRepo, commentRepo, usageLogRepo) {
        this.configService = configService;
        this.profileRepo = profileRepo;
        this.manuscriptRepo = manuscriptRepo;
        this.cacheRepo = cacheRepo;
        this.versionRepo = versionRepo;
        this.projectRepo = projectRepo;
        this.userRepo = userRepo;
        this.commentRepo = commentRepo;
        this.usageLogRepo = usageLogRepo;
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            this.logger.error('⛔  OPENAI_API_KEY is not set in backend/.env. ' +
                'Get a key at https://platform.openai.com/api-keys and add it to backend/.env as OPENAI_API_KEY=sk-...');
        }
        this.openai = new openai_1.default({ apiKey });
        this.loadReadability();
    }
    async loadReadability() {
        rs = await import('text-readability');
    }
    extractProtectedSpans(text) {
        const spans = [];
        const nums = text.match(/[$€£¥]?\d[\d,\.]*%?/g) || [];
        spans.push(...nums.filter(n => n.length > 1));
        const dates = text.match(/\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+\d{4})\b/gi) || [];
        spans.push(...dates);
        const urls = text.match(/https?:\/\/[^\s<>"']+/g) || [];
        spans.push(...urls);
        const emails = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g) || [];
        spans.push(...emails);
        const citations = text.match(/\[\d+\]|\[[\w\s,&.]+,?\s*\d{4}\]|\([\w\s,&.]+et al\.,?\s*\d{4}\)|\([\w\s,&.]+,?\s*\d{4}[a-z]?\)/g) || [];
        spans.push(...citations);
        const tags = text.match(/<[a-zA-Z][^>]*\/?>/g) || [];
        spans.push(...tags);
        const names = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
        spans.push(...names);
        return [...new Set(spans)];
    }
    splitSentences(text) {
        const plain = text.replace(/<[^>]+>/g, ' ');
        return plain.split(/(?<=[.!?])\s+(?=[A-Z"'])/).filter(s => s.trim().length > 3);
    }
    splitParagraphs(text) {
        const plain = text.replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '');
        return plain.split(/\n{2,}|\n/).filter(p => p.trim().length > 0);
    }
    computeRepeatedNGrams(words, n) {
        if (words.length < n)
            return [];
        const counts = new Map();
        for (let i = 0; i <= words.length - n; i++) {
            const ngram = words.slice(i, i + n).join(' ');
            counts.set(ngram, (counts.get(ngram) || 0) + 1);
        }
        return Array.from(counts.entries())
            .filter(([, c]) => c > 1)
            .map(([ngram, count]) => ({ ngram, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);
    }
    computeSentenceStarterRepetition(sentences) {
        const counts = new Map();
        for (const sent of sentences) {
            const words = sent.trim().toLowerCase().match(/\b[a-z]+\b/g) || [];
            if (words.length > 0) {
                const starter = words.slice(0, 2).join(' ');
                counts.set(starter, (counts.get(starter) || 0) + 1);
            }
        }
        return Array.from(counts.entries())
            .filter(([, c]) => c > 1)
            .map(([starter, count]) => ({ starter, count }))
            .sort((a, b) => b.count - a.count);
    }
    estimatePassiveVoice(sentences) {
        const beVerb = /\b(is|are|was|were|be|been|being|am)\b/i;
        const pastPart = /\b\w+ed\b/i;
        let count = 0;
        for (const s of sentences) {
            if (beVerb.test(s) && pastPart.test(s))
                count++;
        }
        return { count, ratio: sentences.length > 0 ? count / sentences.length : 0 };
    }
    computeHedgeDensity(text) {
        const lower = text.toLowerCase();
        const hits = HEDGE_PHRASES.filter(p => lower.includes(p)).length;
        const wordCount = (text.match(/\b\w+\b/g) || []).length;
        return wordCount > 0 ? hits / wordCount : 0;
    }
    computeNominalizationDensity(text) {
        const pattern = /\b\w+(?:tion|tions|ment|ments|ness|nesses|ity|ities|ism|isms|ist|ists)\b/gi;
        const matches = text.match(pattern) || [];
        const wordCount = (text.match(/\b\w+\b/g) || []).length;
        return wordCount > 0 ? matches.length / wordCount : 0;
    }
    computeSemanticRedundancy(sentences) {
        if (sentences.length < 2)
            return 0;
        let total = 0;
        for (let i = 1; i < sentences.length; i++) {
            const a = new Set((sentences[i - 1].toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
            const b = new Set((sentences[i].toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
            const inter = [...a].filter(w => b.has(w)).length;
            const union = new Set([...a, ...b]).size;
            total += union > 0 ? inter / union : 0;
        }
        return total / (sentences.length - 1);
    }
    computeJaccardSimilarity(text1, text2) {
        const a = new Set((text1.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
        const b = new Set((text2.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
        const inter = [...a].filter(w => b.has(w)).length;
        const union = new Set([...a, ...b]).size;
        return union > 0 ? inter / union : 0;
    }
    computeAITells(text) {
        const counts = new Map();
        const matches = text.match(AI_TELL_REGEX) || [];
        for (const m of matches) {
            const key = m.toLowerCase();
            counts.set(key, (counts.get(key) || 0) + 1);
        }
        return Array.from(counts.entries())
            .map(([phrase, count]) => ({ phrase, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 15);
    }
    computeEmDashDensity(text) {
        const emDashes = (text.match(/—|--/g) || []).length;
        const wordCount = (text.match(/\b\w+\b/g) || []).length;
        return wordCount > 0 ? emDashes / wordCount : 0;
    }
    computeContractionRate(text) {
        const contractions = (text.match(CONTRACTION_REGEX) || []).length;
        const contractible = (text.match(CONTRACTIBLE_REGEX) || []).length;
        const total = contractions + contractible;
        return total > 0 ? contractions / total : 0.5;
    }
    computeBurstiness(sentenceLengths) {
        if (sentenceLengths.length < 2)
            return 0;
        const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
        if (mean === 0)
            return 0;
        const variance = sentenceLengths.reduce((a, b) => a + (b - mean) ** 2, 0) / sentenceLengths.length;
        return Math.sqrt(variance) / mean;
    }
    computeAIDetectionRisk(m) {
        const aiTellRate = m.wordCount > 0 ? m.aiTellCount / m.wordCount : 0;
        const tellSignal = Math.min(aiTellRate * 80, 1);
        const burstSignal = Math.max(0, Math.min(1, 1 - m.burstiness / 0.5));
        const contractionSignal = Math.max(0, Math.min(1, 1 - m.contractionRate * 2));
        const transitionSignal = Math.min(m.transitionOveruse * 3, 1);
        const nominalizationSignal = Math.min(m.nominalizationDensity * 8, 1);
        const hedgeSignal = Math.min(m.hedgeDensity * 30, 1);
        const passiveSignal = Math.min(m.passiveRatio * 2, 1);
        const raw = 0.30 * tellSignal +
            0.20 * burstSignal +
            0.15 * contractionSignal +
            0.13 * transitionSignal +
            0.10 * nominalizationSignal +
            0.07 * hedgeSignal +
            0.05 * passiveSignal;
        const floor = tellSignal > 0.5 ? 0.15 : tellSignal > 0.2 ? 0.08 : 0;
        return Math.min(99, Math.round(Math.max(raw, raw + floor) * 100));
    }
    scoreCandidateLocally(candidate, original, protectedSpans, humanization = 0.5) {
        for (const span of protectedSpans) {
            if (!candidate.includes(span))
                return 0;
        }
        const sentences = this.splitSentences(candidate);
        const sentenceLengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
        const wordCount = (candidate.match(/\b\w+\b/g) || []).length;
        const passive = this.estimatePassiveVoice(sentences).ratio;
        const hedge = Math.min(this.computeHedgeDensity(candidate) * 15, 1);
        const nom = Math.min(this.computeNominalizationDensity(candidate) * 4, 1);
        const redundancy = this.computeSemanticRedundancy(sentences);
        const similarity = this.computeJaccardSimilarity(candidate, original);
        const aiTellCount = this.computeAITells(candidate).reduce((s, t) => s + t.count, 0);
        const aiTellRate = wordCount > 0 ? Math.min(aiTellCount / wordCount * 200, 1) : 0;
        const burstiness = this.computeBurstiness(sentenceLengths);
        const burstinessScore = Math.max(0, Math.min(1, burstiness / 0.7));
        const contractionRate = this.computeContractionRate(candidate);
        const emDash = Math.min(this.computeEmDashDensity(candidate) * 150, 1);
        const aiWeight = 0.25 + 0.35 * humanization;
        const qualityWeight = 1 - aiWeight;
        const qualityScore = (1 - passive) * 0.20 +
            (1 - hedge) * 0.15 +
            (1 - nom) * 0.15 +
            (1 - redundancy) * 0.20 +
            Math.min(similarity * 1.5, 1) * 0.30;
        const aiResistanceScore = (1 - aiTellRate) * 0.35 +
            burstinessScore * 0.25 +
            contractionRate * 0.15 +
            (1 - emDash) * 0.10 +
            (1 - redundancy) * 0.15;
        return Math.max(0, qualityScore * qualityWeight + aiResistanceScore * aiWeight);
    }
    async analyze(text) {
        const cacheHash = this.createHash({ action: 'analyze_v2', text });
        const cached = await this.getFromCache(cacheHash);
        if (cached)
            return cached;
        const sentences = this.splitSentences(text);
        const paragraphs = this.splitParagraphs(text);
        const words = (text.toLowerCase().match(/\b[a-z]+\b/g) || []);
        const lengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
        const mean = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
        const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (lengths.length || 1);
        const std = Math.sqrt(variance);
        let transitionCount = 0;
        const lowerText = text.toLowerCase();
        for (const t of TRANSITION_WORDS) {
            transitionCount += (lowerText.match(new RegExp(`\\b${t}\\b`, 'g')) || []).length;
        }
        const transitionDensity = transitionCount / (sentences.length || 1);
        const uniqueWords = new Set(words).size;
        const ttr = words.length > 0 ? uniqueWords / words.length : 0;
        let gradeLevel = 10, readingEase = 60, syllableCount = 0;
        try {
            if (rs) {
                gradeLevel = rs.fleschKincaidGradeLevel(text);
                readingEase = rs.fleschReadingEase(text);
                syllableCount = rs.syllableCount(text);
            }
        }
        catch { }
        const repeatedBigrams = this.computeRepeatedNGrams(words, 2);
        const repeatedTrigrams = this.computeRepeatedNGrams(words, 3);
        const repeatedNGrams = [...repeatedTrigrams, ...repeatedBigrams].slice(0, 10);
        const sentenceStarterRepetition = this.computeSentenceStarterRepetition(sentences);
        const passiveVoice = this.estimatePassiveVoice(sentences);
        const hedgeDensity = this.computeHedgeDensity(text);
        const nominalizationDensity = this.computeNominalizationDensity(text);
        const semanticRedundancy = this.computeSemanticRedundancy(sentences);
        const protectedSpans = this.extractProtectedSpans(text);
        const aiTells = this.computeAITells(text);
        const aiTellCount = aiTells.reduce((s, t) => s + t.count, 0);
        const emDashDensity = this.computeEmDashDensity(text);
        const contractionRate = this.computeContractionRate(text);
        const burstiness = this.computeBurstiness(lengths);
        const aiDetectionRisk = this.computeAIDetectionRisk({
            wordCount: words.length,
            aiTellCount,
            burstiness,
            contractionRate,
            transitionOveruse: transitionDensity,
            nominalizationDensity,
            hedgeDensity,
            emDashDensity,
            passiveRatio: passiveVoice.ratio,
        });
        let humanityScore = 0.5;
        let roboticMarkers = [];
        let detectedLanguage = 'en';
        let sentimentDrift = paragraphs.map(() => 0.5);
        let sentimentOverall = 0.5;
        try {
            const content = await this.callOpenAI([
                {
                    role: 'system',
                    content: `Analyze text quality. Respond with JSON only:
{
  "humanityScore": 0.0-1.0,
  "roboticMarkers": ["phrase that sounds AI-generated", ...],
  "language": "ISO 639-1 code",
  "sentimentDrift": [0.0-1.0 per paragraph],
  "sentimentOverall": 0.0-1.0
}`,
                },
                { role: 'user', content: text.substring(0, 4000) },
            ], true);
            const r = JSON.parse(content);
            humanityScore = r.humanityScore ?? 0.5;
            roboticMarkers = r.roboticMarkers ?? [];
            detectedLanguage = r.language || 'en';
            sentimentDrift = r.sentimentDrift || sentimentDrift;
            sentimentOverall = r.sentimentOverall ?? 0.5;
        }
        catch {
        }
        const metrics = {
            sentenceLengthMean: mean,
            sentenceLengthStd: std,
            sentenceLengthVariance: variance,
            burstiness,
            repetitionScore: 1 - ttr,
            repeatedNGrams,
            sentenceStarterRepetition,
            transitionOveruse: transitionDensity,
            readability: { gradeLevel, readingEase, syllableCount },
            lexicalDiversity: { ttr, uniqueWords, complexityScore: Math.min(uniqueWords / 100, 1) },
            passiveVoice,
            hedgeDensity,
            nominalizationDensity,
            semanticRedundancy,
            aiTells,
            emDashDensity,
            contractionRate,
            aiDetectionRisk,
            humanityScore,
            roboticMarkers,
            detectedLanguage,
            sentiment: { overall: sentimentOverall, drift: sentimentDrift },
            paragraphCount: paragraphs.length,
            sentenceCount: sentences.length,
            protectedSpans,
        };
        await this.setCache(cacheHash, metrics);
        return metrics;
    }
    buildHumanizationInstructions(humanization, detectedAITells) {
        if (humanization <= 0.05)
            return '';
        const level = humanization >= 0.8 ? 'AGGRESSIVE'
            : humanization >= 0.5 ? 'STRONG'
                : humanization >= 0.25 ? 'MODERATE'
                    : 'LIGHT';
        const percentage = Math.round(humanization * 100);
        const commonRules = [
            'Write like a thoughtful person speaking, not a corporate report.',
            'Vary sentence length deliberately: mix short punchy sentences with longer ones.',
            'Use contractions naturally (it\'s, don\'t, you\'re) unless the tone is strictly formal.',
            'Start consecutive sentences differently — no two in a row opening the same way.',
            'Replace bland AI verbs (delve, leverage, foster, navigate, unlock, empower) with concrete alternatives.',
        ];
        const strongRules = [
            'Remove filler openers like "It is important to note", "In essence", "Ultimately", "At its core".',
            'Cut formulaic transitions (Furthermore, Moreover, Additionally) — let ideas connect naturally.',
            'Avoid abstract framings: "landscape of", "realm of", "world of", "tapestry of", "journey".',
            'Replace nominalizations with verbs ("the implementation of X" → "implementing X").',
            'Prefer specific concrete nouns over vague abstractions (robust, seamless, vibrant, holistic).',
            'Limit em-dashes — use sparingly like a human writer.',
        ];
        const aggressiveRules = [
            'Introduce mild imperfection: occasional sentence fragments, parentheticals, or first-person asides if the tone allows.',
            'Break predictable parallel structures. If three points appear identical in form, vary them.',
            'Use specific examples or concrete details instead of general claims.',
            'Cut any sentence that could appear verbatim in a hundred other articles.',
        ];
        const rules = [...commonRules];
        if (humanization >= 0.4)
            rules.push(...strongRules);
        if (humanization >= 0.75)
            rules.push(...aggressiveRules);
        const tellsHint = detectedAITells.length > 0
            ? `\nAI-TELL PHRASES DETECTED IN INPUT — rewrite or remove these: ${detectedAITells.slice(0, 12).map(p => `"${p}"`).join(', ')}.`
            : '';
        return `
HUMANIZATION LEVEL: ${level} (${percentage}%). The input reads like AI-generated text; the output must read like a specific human wrote it.
${rules.map(r => `  • ${r}`).join('\n')}${tellsHint}`;
    }
    async processText(text, options) {
        const startTime = Date.now();
        const humanization = Math.max(0, Math.min(1, options.humanization ?? 0.5));
        const metrics = await this.analyze(text);
        const { detectedLanguage, protectedSpans } = metrics;
        const cacheHash = this.createHash({ action: 'rewrite_v3', text, options, humanization });
        const cached = await this.getFromCache(cacheHash);
        let bestVersion;
        let alternatives;
        let manuscriptId;
        if (cached) {
            bestVersion = cached.bestVersion;
            alternatives = cached.alternatives;
            manuscriptId = cached.id;
        }
        else {
            const sectionGuide = SECTION_GUIDES[options.sectionType || SectionType.GENERAL];
            const spanConstraint = protectedSpans.length > 0
                ? `\nPROTECTED SPANS — copy these verbatim into every candidate:\n${protectedSpans.map(s => `  • ${s}`).join('\n')}`
                : '';
            const detectedAITells = metrics.aiTells.map(t => t.phrase);
            const humanizationBlock = this.buildHumanizationInstructions(humanization, detectedAITells);
            const systemPrompt = `You are a professional human editor who makes AI-generated text sound genuinely human.
INPUT LANGUAGE: ${detectedLanguage}
TARGET TONE: ${options.tone}
EDIT STRENGTH: ${options.strength} (light=minimal, medium=reword, strong=restructure)
SECTION FOCUS: ${sectionGuide}
INTENT: ${(options.intent ?? 0) > 0.5 ? 'persuasive' : 'informative'}
INPUT AI-DETECTION RISK: ${metrics.aiDetectionRisk}/100 — your rewrite should materially lower this.
${options.styleProfile ? `MATCH STYLE: ${JSON.stringify(options.styleProfile)}` : ''}${spanConstraint}${humanizationBlock}

RULES:
- Preserve all HTML tags in their exact semantic positions.
- Never alter proper names, numbers, dates, URLs, or citations.
- Return JSON: {"candidates": [{"text": "..."}, {"text": "..."}, {"text": "..."}]}
- Provide 3–5 distinct candidates; vary approach (sentence rhythm, opener, voice).`;
            let candidates = [];
            const aiKeyMissing = !this.configService.get('OPENAI_API_KEY') ||
                this.configService.get('OPENAI_API_KEY') === 'your_openai_api_key_here';
            if (!aiKeyMissing) {
                try {
                    const raw = await this.callOpenAI([{ role: 'system', content: systemPrompt }, { role: 'user', content: text }], true);
                    const parsed = JSON.parse(raw);
                    candidates = (parsed.candidates || []).map((c) => typeof c === 'string' ? c : c.text);
                }
                catch (err) {
                    this.logger.warn(`OpenAI unavailable (${err?.message}), falling back to rule-based humanizer.`);
                }
            }
            else {
                this.logger.warn('No OpenAI key — using rule-based humanizer fallback.');
            }
            if (candidates.length === 0) {
                const fallback = this.humanizeFallback(text, humanization, options.tone, options.strength);
                candidates = [fallback];
            }
            const scored = candidates
                .map(c => ({ text: c, score: this.scoreCandidateLocally(c, text, protectedSpans, humanization) }))
                .filter(c => c.score > 0)
                .sort((a, b) => b.score - a.score);
            const ranked = scored.length > 0 ? scored : candidates.map(c => ({ text: c, score: 0 }));
            bestVersion = ranked[0].text;
            if (!aiKeyMissing && text.replace(/<[^>]+>/g, '').length > 1200) {
                try {
                    bestVersion = await this.globalSmooth(bestVersion);
                }
                catch { }
            }
            alternatives = ranked.slice(1).map(c => c.text);
            const manuscript = await this.manuscriptRepo.save({
                sourceText: text,
                optimizedText: bestVersion,
                metrics: metrics,
                tone: options.tone,
                strength: options.strength,
                targetGradeLevel: options.targetGradeLevel,
                language: detectedLanguage,
                sectionType: options.sectionType || SectionType.GENERAL,
                title: text.replace(/<[^>]+>/g, '').slice(0, 60) + (text.length > 60 ? '…' : ''),
            });
            manuscriptId = manuscript.id;
            await this.setCache(cacheHash, { id: manuscriptId, bestVersion, alternatives });
        }
        const outputMetrics = await this.analyze(bestVersion);
        const humanizationDelta = metrics.aiDetectionRisk - outputMetrics.aiDetectionRisk;
        const latencyMs = Date.now() - startTime;
        await this.usageLogRepo.save({
            modelUsed: 'gpt-4o',
            promptTokens: text.length / 4,
            completionTokens: bestVersion.length / 4,
            totalTokens: (text.length + bestVersion.length) / 4,
            latencyMs,
            manuscript: { id: manuscriptId },
        });
        return { id: manuscriptId, bestVersion, alternatives, metrics, outputMetrics, humanizationDelta };
    }
    async getHistory() {
        return this.manuscriptRepo.find({ order: { createdAt: 'DESC' }, take: 50 });
    }
    async getVersions(manuscriptId) {
        return this.versionRepo.find({
            where: { manuscript: { id: manuscriptId } },
            order: { createdAt: 'DESC' },
        });
    }
    async saveVersion(manuscriptId, label) {
        const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId } });
        if (!manuscript)
            throw new Error('Manuscript not found');
        return this.versionRepo.save({
            content: manuscript.optimizedText,
            metrics: manuscript.metrics,
            label: label || `Snapshot ${new Date().toLocaleString()}`,
            manuscript,
        });
    }
    async getProjects() {
        return this.projectRepo.find({
            relations: ['manuscripts'],
            order: { createdAt: 'DESC' },
        });
    }
    async createProject(name, description) {
        const project = this.projectRepo.create({ name, description });
        return this.projectRepo.save(project);
    }
    async assignToProject(manuscriptId, projectId) {
        const project = await this.projectRepo.findOne({ where: { id: projectId } });
        if (!project)
            throw new Error('Project not found');
        await this.manuscriptRepo.update(manuscriptId, { project });
    }
    async chatWithManuscript(query, manuscriptContent) {
        const systemPrompt = `You are a professional writing coach with full access to the manuscript below.
If the user asks for a rewrite, return the rewritten HTML.
If the user asks a question, give a concise, actionable stylistic answer (2–4 sentences max).
MANUSCRIPT:\n${manuscriptContent.substring(0, 6000)}`;
        return this.callOpenAI([
            { role: 'system', content: systemPrompt },
            { role: 'user', content: query },
        ], false);
    }
    async refineSentence(sentence, context, mode) {
        const cacheHash = this.createHash({ action: 'refine', sentence, context, mode });
        const cached = await this.getFromCache(cacheHash);
        if (cached)
            return cached;
        const raw = await this.callOpenAI([
            {
                role: 'system',
                content: `Rewrite the sentence to be ${mode}. Context: ${context.substring(0, 500)}
Return JSON: {"variations": ["...", "...", "..."]}`,
            },
            { role: 'user', content: sentence },
        ], true);
        const variations = JSON.parse(raw).variations || [];
        await this.setCache(cacheHash, variations);
        return variations;
    }
    async spawnReaders(text) {
        const personas = [
            { id: 'exec', name: 'Skeptical Executive', tray: 'Time-poor, results-focused, hates jargon.' },
            { id: 'academic', name: 'Academic Peer', tray: 'Deep focus, values precision and evidence.' },
            { id: 'general', name: 'General Reader', tray: 'Seeks clarity, narrative flow, and simple truth.' },
        ];
        return Promise.all(personas.map(async (p) => {
            const prompt = `You are the ${p.name}. Perspective: ${p.tray}
Read this text and give 3 concise bullet-point observations about its clarity, tone, and impact.
TEXT: ${text.substring(0, 4000)}`;
            const feedback = await this.callOpenAI([{ role: 'system', content: prompt }], false);
            return { ...p, feedback };
        }));
    }
    async analyzeEngagement(text) {
        const prompt = `Find sections likely to lose reader attention. Identify drop-off zones by sentence index.
Return JSON: {"overallScore": 0-100, "heatMap": [{"index": <sentence_index>, "intensity": 0.0-1.0, "reason": "..."}]}
TEXT: ${text.substring(0, 4000)}`;
        const raw = await this.callOpenAI([{ role: 'system', content: prompt }], true);
        return JSON.parse(raw);
    }
    async synthesizeMasterpiece(text, options) {
        const systemPrompts = [
            { id: 'flow', name: 'Flow Editor', strength: 'natural rhythm and transitions', prompt: `Rewrite for maximum flow and readability: ${text.substring(0, 3000)}` },
            { id: 'precision', name: 'Precision Editor', strength: 'word choice and nuance', prompt: `Rewrite for precise, exact word choice: ${text.substring(0, 3000)}` },
            { id: 'narrative', name: 'Narrative Editor', strength: 'storytelling and engagement', prompt: `Rewrite with compelling narrative structure: ${text.substring(0, 3000)}` },
        ];
        const drafts = await Promise.all(systemPrompts.map(async (p) => ({
            ...p,
            draft: await this.callOpenAI([{ role: 'system', content: p.prompt }], false),
        })));
        const synthesisPrompt = `You have three improved versions of a manuscript. Synthesize the best elements from each into a single superior version that combines natural flow, precise word choice, and compelling narrative.
Version 1 (Flow): ${drafts[0].draft.substring(0, 1500)}
Version 2 (Precision): ${drafts[1].draft.substring(0, 1500)}
Version 3 (Narrative): ${drafts[2].draft.substring(0, 1500)}
${options?.styleProfile ? `Match style: ${JSON.stringify(options.styleProfile)}` : ''}
Preserve all HTML tags.`;
        const masterpiece = await this.callOpenAI([{ role: 'system', content: synthesisPrompt }], false);
        return { masterpiece, votes: drafts.map(d => ({ id: d.id, name: d.name, strength: d.strength })) };
    }
    async getPlatformStats() {
        const totalManuscripts = await this.manuscriptRepo.count();
        const tokensResult = await this.usageLogRepo
            .createQueryBuilder('log')
            .select('SUM(log.totalTokens)', 'sum')
            .getRawOne();
        const latencyResult = await this.usageLogRepo
            .createQueryBuilder('log')
            .select('AVG(log.latencyMs)', 'avg')
            .getRawOne();
        return {
            totalManuscripts,
            totalTokens: Math.round(parseFloat(tokensResult?.sum || '0')),
            avgLatencyMs: Math.round(parseFloat(latencyResult?.avg || '0')),
            throughput: (totalManuscripts / 7).toFixed(1),
        };
    }
    async getProfiles() {
        return this.profileRepo.find({ order: { createdAt: 'DESC' } });
    }
    async saveProfile(profile) {
        return this.profileRepo.save(profile);
    }
    async updateRating(id, rating) {
        await this.manuscriptRepo.update(id, { rating });
    }
    async updateManuscript(id, optimizedText) {
        const analysis = await this.analyze(optimizedText);
        await this.manuscriptRepo.update(id, { optimizedText, metrics: analysis });
    }
    async createComment(manuscriptId, data) {
        const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId } });
        if (!manuscript)
            throw new Error('Manuscript not found');
        return this.commentRepo.save(this.commentRepo.create({
            content: data.content,
            selectionData: data.selectionData,
            authorName: data.authorName || 'Collaborator',
            manuscript,
        }));
    }
    async getComments(manuscriptId) {
        return this.commentRepo.find({
            where: { manuscript: { id: manuscriptId }, isResolved: false },
            order: { createdAt: 'ASC' },
        });
    }
    async generateOutline(topic, template) {
        return this.callOpenAI([
            {
                role: 'system',
                content: 'You are a manuscript architect. Return valid HTML using h1, h2, ul, p elements only.',
            },
            {
                role: 'user',
                content: `Generate a structured HTML outline for: "${topic}". Template style: ${template}. Include placeholder paragraph text under each heading.`,
            },
        ], false);
    }
    calculateConsistency(metrics, profile) {
        const drift = [];
        let totalDiff = 0;
        const adjDiff = Math.abs(metrics.repetitionScore - profile.adjectiveLevel);
        if (adjDiff > 0.3)
            drift.push('Adjective density mismatch');
        totalDiff += adjDiff;
        const complexityScore = Math.min(metrics.sentenceLengthMean / 25, 1);
        const compDiff = Math.abs(complexityScore - profile.sentenceComplexity);
        if (compDiff > 0.3)
            drift.push('Sentence complexity mismatch');
        totalDiff += compDiff;
        return { score: Math.max(0, 1 - totalDiff / 2), drift };
    }
    async predictStyle(manuscriptContent) {
        const profiles = await this.profileRepo.find();
        const profileList = profiles.map(p => p.name).join(', ');
        const raw = await this.callOpenAI([
            {
                role: 'user',
                content: `Which of these style profiles best matches this text: ${profileList}?
Return JSON: {"match": "Profile Name", "confidence": 0.0-1.0, "reason": "..."}
TEXT: ${manuscriptContent.substring(0, 2000)}`,
            },
        ], true);
        return JSON.parse(raw);
    }
    async generateMetadata(manuscriptId) {
        const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId } });
        if (!manuscript)
            throw new Error('Manuscript not found');
        const raw = await this.callOpenAI([
            {
                role: 'user',
                content: `Generate publishing metadata for this content. Return JSON:
{"seoTitle":"...","seoDescription":"...","viralHooks":["...","..."],"readingTime":"..."}
CONTENT: ${manuscript.optimizedText.substring(0, 3000)}`,
            },
        ], true);
        const metadata = JSON.parse(raw);
        manuscript.metadata = metadata;
        await this.manuscriptRepo.save(manuscript);
        return metadata;
    }
    async searchHistory(query) {
        const history = await this.manuscriptRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
        try {
            const raw = await this.callOpenAI([
                {
                    role: 'system',
                    content: `Filter this manuscript list by the user's query. Return a JSON array of matching UUIDs only.
QUERY: ${query}`,
                },
                {
                    role: 'user',
                    content: JSON.stringify(history.map(m => ({ id: m.id, title: m.title, tone: m.tone, language: m.language }))),
                },
            ], true);
            const ids = JSON.parse(raw);
            return history.filter(m => ids.includes(m.id));
        }
        catch {
            return history.filter(m => m.title?.toLowerCase().includes(query.toLowerCase()));
        }
    }
    async auditProjectConsistency(projectId) {
        const project = await this.projectRepo.findOne({
            where: { id: projectId },
            relations: ['manuscripts'],
        });
        if (!project)
            throw new Error('Project not found');
        const mss = project.manuscripts.filter(m => m.metrics);
        if (mss.length < 2)
            return { score: 1, outliers: [] };
        const meanHumanity = mss.reduce((acc, m) => acc + (m.metrics.humanityScore || 0), 0) / mss.length;
        const outliers = mss.filter(m => Math.abs((m.metrics.humanityScore || 0) - meanHumanity) > 0.15);
        return {
            consistencyScore: 1 - outliers.length / mss.length,
            meanHumanityScore: meanHumanity,
            outliers: outliers.map(m => ({
                id: m.id,
                title: m.title || 'Untitled',
                deviation: (m.metrics.humanityScore || 0) - meanHumanity,
            })),
            totalManuscripts: mss.length,
        };
    }
    async globalSmooth(text) {
        try {
            return await this.callOpenAI([
                {
                    role: 'system',
                    content: 'Perform a final smoothing pass: unify tone across paragraphs, remove repetitive transitions, and ensure consistent voice. Preserve all HTML tags.',
                },
                { role: 'user', content: text },
            ], false);
        }
        catch {
            return text;
        }
    }
    createHash(data) {
        return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
    }
    async getFromCache(hash) {
        const cached = await this.cacheRepo.findOneBy({ hash });
        return cached ? JSON.parse(cached.value) : null;
    }
    async setCache(hash, value) {
        await this.cacheRepo.save({ hash, value: JSON.stringify(value) });
    }
    humanizeFallback(text, humanization, tone, strength) {
        let result = text.replace(/<[^>]+>/g, ' ').trim();
        const isFormal = tone === 'formal' || tone === 'academic';
        const aggressive = humanization > 0.5 || strength === 'strong';
        const REPLACEMENTS = [
            [/\bplays? (?:a |an )?(?:crucial|vital|key|important|significant|central) role\b/gi, 'matters a great deal'],
            [/\bis (?:essential|critical|vital|crucial|necessary) (?:to|for)\b/gi, 'is needed for'],
            [/\bare (?:essential|critical|vital|crucial|necessary) (?:to|for)\b/gi, 'are needed for'],
            [/\bit is (?:important|essential|necessary|vital|crucial|critical) to\b/gi, 'you really need to'],
            [/\bit is worth noting(?: that)?\b/gi, 'worth noting—'],
            [/\bit should be noted(?: that)?\b/gi, ''],
            [/\bit is important to note(?: that)?\b/gi, ''],
            [/\bas previously mentioned\b/gi, ''],
            [/\bas mentioned (?:earlier|above)\b/gi, ''],
            [/\bresearch has shown(?: that)?\b/gi, 'research shows'],
            [/\bstudies have shown(?: that)?\b/gi, 'studies show'],
            [/\bevidence suggests(?: that)?\b/gi, 'the evidence points to'],
            [/\bprovides? an opportunity\b/gi, 'opens a door'],
            [/\bstudents are able to\b/gi, 'students can'],
            [/\blearners are able to\b/gi, 'learners can'],
            [/\bmultilingual learners?\b/gi, 'students learning English'],
            [/\bEnglish Language (?:Development|Learners?)\b/gi, 'English learning'],
            [/\bELD strategies\b/gi, 'English-support methods'],
            [/\bELD (?:instruction|support|teaching)\b/gi, 'English-language teaching'],
            [/\bsupport ELD\b/gi, 'help English learners'],
            [/\bELD\b/gi, 'English learning'],
            [/\ba key (?:component|factor|aspect|element)\b/gi, 'one important part'],
            [/\beffective strategies\b/gi, 'solid methods'],
            [/\bwide (?:range|variety) of\b/gi, 'many kinds of'],
            [/\bbroad range of\b/gi, 'a whole range of'],
            [/\bvarious (?:aspects|factors|strategies|ways|elements|components)\b/gi, 'several'],
            [/\bsignificant(?:ly)? impact\b/gi, 'real impact'],
            [/\bon the other hand\b/gi, 'on the flip side'],
            [/\bin order to\b/gi, 'to'],
            [/\bby doing so\b/gi, 'that way'],
            [/\bin doing so\b/gi, 'doing that'],
            [/\bin conclusion,?\s*/gi, 'All told, '],
            [/\bto (?:summarize|conclude),?\s*/gi, 'To wrap up, '],
            [/\bin summary,?\s*/gi, 'Stepping back, '],
            [/\bat the heart of\b/gi, 'at the core of'],
            [/\bat its core,?\s*/gi, ''],
            [/\bin essence,?\s*/gi, ''],
            [/\bfurthermore,?\s*/gi, 'Beyond that, '],
            [/\bmoreover,?\s*/gi, 'On top of that, '],
            [/\badditionally,?\s*/gi, 'And '],
            [/\bconsequently,?\s*/gi, 'Because of that, '],
            [/\bnevertheless,?\s*/gi, 'Even so, '],
            [/\bnonetheless,?\s*/gi, 'Still, '],
            [/\btherefore,?\s*/gi, 'So '],
            [/\bthus,?\s*/gi, 'So '],
            [/\bhence,?\s*/gi, 'Which means '],
            [/\bultimately,?\s*/gi, 'When you step back, '],
            [/\bcrucially,?\s*/gi, 'Critically, '],
            [/\bthe (?:importance|role|impact|significance) of\b/gi, 'why'],
            [/\bby (?:providing|ensuring|allowing|enabling)\b/gi, 'by giving'],
            [/\bthis (?:ensures|enables|allows|helps)\b/gi, 'this means'],
            [/\bas well as\b/gi, 'and also'],
            [/\bnot only\b/gi, 'also'],
            [/\bin today's (?:world|society|classroom|context)?\b/gi, 'nowadays,'],
            [/\bin this digital age\b/gi, 'these days'],
            [/\bthis approach\b/gi, 'this way of doing things'],
            [/\bthese strategies\b/gi, 'these methods'],
            [/\bgoing forward\b/gi, 'moving ahead'],
            [/\bas such,?\s*/gi, ''],
            [/\bserves? as\b/gi, 'acts as'],
            [/\bparamount\b/gi, 'critical'],
            [/\bquintessential\b/gi, 'defining'],
            [/\bimperative\b/gi, 'essential'],
            [/\bdelve(?:s|ing)? into\b/gi, 'dig into'],
            [/\bdive(?:s)? (?:deep )?into\b/gi, 'get into'],
            [/\bnavigate(?:s|ing)? (?:the|this|these|a|an)\b/gi, 'work through'],
            [/\bnavigate(?:s|ing)?\b/gi, 'handle'],
            [/\bembark(?:ing|s)? (?:on|upon)\b/gi, 'kick off'],
            [/\bunlock(?:ing|s)? the\b/gi, 'tap into'],
            [/\bpave the way\b/gi, 'set things up'],
            [/\bshed light on\b/gi, 'shed some light on'],
            [/\btapestry of\b/gi, 'blend of'],
            [/\blandscape of\b/gi, 'world of'],
            [/\brealm of\b/gi, 'space of'],
            [/\bparadigm shift\b/gi, 'big change'],
            [/\bsynerg(?:y|ies|istic)\b/gi, 'combined effort'],
            [/\bseamlessly?\b/gi, 'without a hitch'],
            [/\brobust\b/gi, 'strong'],
            [/\bvibrant\b/gi, 'active'],
            [/\bholistic\b/gi, 'whole-picture'],
            [/\bmultifaceted\b/gi, 'layered'],
            [/\bcutting-edge\b/gi, 'up-to-date'],
            [/\bstate-of-the-art\b/gi, 'top-tier'],
            [/\bever-evolving\b/gi, 'always changing'],
            [/\bgame-changing\b/gi, 'meaningful'],
            [/\bgroundbreaking\b/gi, 'fresh'],
            [/\butilized\b/gi, 'used'],
            [/\butilize(?:s)?\b/gi, 'use'],
            [/\butilizing\b/gi, 'using'],
            [/\butilization\b/gi, 'use'],
            [/\bfacilitated\b/gi, 'helped'],
            [/\bfacilitate(?:s)?\b/gi, 'help'],
            [/\bfacilitating\b/gi, 'helping'],
            [/\bfacilitation\b/gi, 'help'],
            [/\bdemonstrated\b/gi, 'showed'],
            [/\bdemonstrate(?:s)?\b/gi, 'show'],
            [/\bdemonstrating\b/gi, 'showing'],
            [/\bdemonstration\b/gi, 'example'],
            [/\benhanced\b/gi, 'improved'],
            [/\benhance(?:s)?\b/gi, 'improve'],
            [/\benhancing\b/gi, 'improving'],
            [/\benhancement\b/gi, 'improvement'],
            [/\bprior to\b/gi, 'before'],
            [/\bsubsequently\b/gi, 'after that'],
            [/\bregarding\b/gi, 'about'],
            [/\bproficiency\b/gi, 'fluency'],
            [/\bproficient(?:ly)?\b/gi, 'fluent'],
            [/\binquiry\b/gi, 'investigation'],
            [/\bintegrated\b/gi, 'combined'],
            [/\bintegrate(?:s)?\b/gi, 'combine'],
            [/\bintegrating\b/gi, 'combining'],
            [/\bintegration\b/gi, 'combination'],
            [/\bacquired\b/gi, 'picked up'],
            [/\bacquire(?:s)?\b/gi, 'pick up'],
            [/\bacquiring\b/gi, 'picking up'],
            [/\bacquisition\b/gi, 'learning'],
            [/\binstruction\b/gi, 'teaching'],
            [/\binstructional\b/gi, 'classroom'],
            [/\bexplicit (?:instruction|support|teaching)\b/gi, 'clear, hands-on teaching'],
            [/\bexplicit\b/gi, 'clear'],
            [/\bsubstantially?\b/gi, 'quite a bit'],
            [/\bnumerous\b/gi, 'many'],
            [/\bcommunicated\b/gi, 'shared'],
            [/\bcommunicate(?:s)?\b/gi, 'share'],
            [/\bcommunicating\b/gi, 'sharing'],
            [/\bcommunication\b/gi, 'back-and-forth'],
            [/\bparticipated\b/gi, 'took part'],
            [/\bparticipate(?:s)?\b/gi, 'take part'],
            [/\bparticipating\b/gi, 'taking part'],
            [/\bparticipation\b/gi, 'involvement'],
            [/\bincorporated\b/gi, 'brought in'],
            [/\bincorporate(?:s)?\b/gi, 'bring in'],
            [/\bincorporating\b/gi, 'bringing in'],
            [/\bcomprehension\b/gi, 'understanding'],
            [/\bvocabulary\b/gi, 'words'],
            [/\bconcepts\b/gi, 'ideas'],
            [/\bconcept\b/gi, 'idea'],
            [/\bstrategies\b/gi, 'methods'],
            [/\bstrategy\b/gi, 'method'],
            [/\bexhibited\b/gi, 'showed'],
            [/\bexhibit(?:s)?\b/gi, 'show'],
            [/\bexhibiting\b/gi, 'showing'],
            [/\bfostered\b/gi, 'grew'],
            [/\bfoster(?:s)?\b/gi, 'grow'],
            [/\bfostering\b/gi, 'growing'],
            [/\bspearheaded\b/gi, 'led'],
            [/\bspearhead(?:s)?\b/gi, 'lead'],
            [/\bspearheading\b/gi, 'leading'],
            [/\bstreamlined\b/gi, 'simplified'],
            [/\bstreamline(?:s)?\b/gi, 'simplify'],
            [/\bstreamlining\b/gi, 'simplifying'],
            [/\boptimized\b/gi, 'fine-tuned'],
            [/\boptimize(?:s)?\b/gi, 'fine-tune'],
            [/\boptimizing\b/gi, 'fine-tuning'],
            [/\bempowered\b/gi, 'helped'],
            [/\bempower(?:s)?\b/gi, 'help'],
            [/\bempowering\b/gi, 'helping'],
            [/\bleveraged\b/gi, 'drew on'],
            [/\bleverage(?:s)?\b/gi, 'draw on'],
            [/\bleveraging\b/gi, 'drawing on'],
            [/\bsupport(?:s)? (?:the development of|students'?)\b/gi, 'help build'],
            [/\bpre-?taught\b/gi, 'introduced first'],
            [/\bpre-?teaching\b/gi, 'introducing first'],
            [/\bpre-?teach(?:es)?\b/gi, 'introduce first'],
            [/\bscaffolding\b/gi, 'step-by-step support'],
            [/\bscaffolded\b/gi, 'supported step by step'],
            [/\bscaffold(?:s)?\b/gi, 'support'],
        ];
        for (const [pattern, replacement] of REPLACEMENTS) {
            result = result.replace(pattern, replacement);
        }
        if (!isFormal) {
            const CONTRACTIONS = [
                [/\bit is\b/g, "it's"],
                [/\bthat is\b/g, "that's"],
                [/\bthere is\b/g, "there's"],
                [/\bhere is\b/g, "here's"],
                [/\bdo not\b/g, "don't"],
                [/\bdoes not\b/g, "doesn't"],
                [/\bdid not\b/g, "didn't"],
                [/\bwill not\b/g, "won't"],
                [/\bcannot\b/g, "can't"],
                [/\bcan not\b/g, "can't"],
                [/\bwould not\b/g, "wouldn't"],
                [/\bshould not\b/g, "shouldn't"],
                [/\bcould not\b/g, "couldn't"],
                [/\bare not\b/g, "aren't"],
                [/\bwas not\b/g, "wasn't"],
                [/\bwere not\b/g, "weren't"],
                [/\bhas not\b/g, "hasn't"],
                [/\bhave not\b/g, "haven't"],
                [/\byou are\b/g, "you're"],
                [/\bthey are\b/g, "they're"],
                [/\bwe are\b/g, "we're"],
                [/\bI am\b/g, "I'm"],
                [/\bhe is\b/g, "he's"],
                [/\bshe is\b/g, "she's"],
                [/\bwho is\b/g, "who's"],
                [/\bwhat is\b/g, "what's"],
                [/\bI have\b/g, "I've"],
                [/\bthey have\b/g, "they've"],
                [/\bwe have\b/g, "we've"],
                [/\bwould have\b/g, "would've"],
                [/\bshould have\b/g, "should've"],
            ];
            for (const [pattern, contraction] of CONTRACTIONS) {
                result = result.replace(pattern, contraction);
            }
        }
        const rawSentences = result
            .replace(/([.!?])\s+([A-Z"'])/g, '$1\n$2')
            .split('\n')
            .map(s => s.trim())
            .filter(s => s.length > 2);
        const PARENTHETICALS = [
            '—and this matters more than it sounds—',
            '—something a lot of people overlook—',
            '—which isn\'t always easy to pull off—',
            '—in real classrooms, at least—',
            '—this is the tricky part—',
            '—teachers see this firsthand—',
            '—worth pausing on—',
        ];
        const OPENERS_FORMAL = ['Beyond that,', 'Worth noting:', 'In practice,', 'Building on that,', 'Here\'s what that means:'];
        const OPENERS_INFORMAL = ['Here\'s the thing—', 'Put differently,', 'Think about it:', 'Basically,', 'In practice,', 'Truth is,', 'The tricky part?'];
        const OPENERS = isFormal ? OPENERS_FORMAL : OPENERS_INFORMAL;
        const getPunch = (s) => {
            const lower = s.toLowerCase();
            if (lower.includes('english') && lower.includes('learn'))
                return "That skill-building takes time.";
            if (lower.includes('teach') || lower.includes('teacher'))
                return "Every teacher knows it.";
            if (lower.includes('student'))
                return "Students feel the difference.";
            if (lower.includes('speak') || lower.includes('oral'))
                return "Spoken language counts.";
            if (lower.includes('lab') || lower.includes('chem'))
                return "Hands-on beats lecture every time.";
            if (lower.includes('read') || lower.includes('write'))
                return "Literacy compounds over time.";
            if (lower.includes('understand') || lower.includes('grasp'))
                return "That clarity sticks.";
            if (lower.includes('vocabular') || lower.includes('words'))
                return "Words are the building blocks.";
            if (lower.includes('academ'))
                return "Academic growth is slow but real.";
            return "That's the part that sticks.";
        };
        const CONJ_BREAKS = {
            and: '. And',
            but: '. But',
            while: '. Meanwhile,',
            although: '. Even so,',
            whereas: '. By contrast,',
            however: '. Even still,',
            yet: '. And yet,',
            since: '. Because of this,',
            because: ". That's because",
            though: '. That said,',
        };
        const rewritten = [];
        for (let i = 0; i < rawSentences.length; i++) {
            let s = rawSentences[i].trim();
            const wc = (s.match(/\b\w+\b/g) || []).length;
            if (wc > 20) {
                const split1 = s.replace(/,\s+(and|but|while|although|whereas|yet|since|because|though)\s+/gi, (full, conj, offset, str) => {
                    const afterConj = str.slice(offset + full.length);
                    const startsNewClause = /^(?:the |a |an |this |these |that |those |it |they |he |she |we |you |I |[A-Z][a-z]+s?\s+(?:can|will|should|must|have|had|were|was|are|is))/i.test(afterConj);
                    if (conj.toLowerCase() === 'and' && !startsNewClause)
                        return full;
                    const br = CONJ_BREAKS[conj.toLowerCase()];
                    return br ? `${br} ` : `. ${conj.charAt(0).toUpperCase() + conj.slice(1)} `;
                });
                if (split1 !== s) {
                    s = split1;
                }
                else {
                    s = s.replace(/;\s+/g, '. ');
                }
            }
            if (i > 0 && i % 4 === 0 && wc >= 5) {
                const opener = OPENERS[Math.floor(i / 4) % OPENERS.length];
                if (!/^(also|but|so|and|yet|still|even|here|put|think|basic|truth|in prac|beyond|worth|building|that's)/i.test(s)) {
                    s = opener + ' ' + s.charAt(0).toLowerCase() + s.slice(1);
                }
            }
            if (aggressive && wc > 18 && i % 3 === 1) {
                const aside = PARENTHETICALS[i % PARENTHETICALS.length];
                let insertIdx = -1;
                let commaCount = 0;
                for (let k = 0; k < s.length; k++) {
                    if (s[k] === ',') {
                        commaCount++;
                        if (k > s.length * 0.3 && k < s.length * 0.75) {
                            insertIdx = k;
                            break;
                        }
                    }
                }
                if (insertIdx > 0) {
                    s = s.slice(0, insertIdx) + ` ${aside}` + s.slice(insertIdx);
                }
            }
            if (aggressive && i % 6 === 2 && !s.startsWith('In ') && !s.startsWith('When ') && !s.startsWith('For ')) {
                s = s.replace(/^((?:Teachers|Students|Learners|Researchers|Schools)\s+(?:can|should|must|will|use|rely)[\w\s]+?)\s+(in|during|when|throughout|within)\s+([^,.]+?(?:classroom|lesson|session|school|setting)[^,.]*)([,.])/i, (_, _subj, prep, place, punc) => {
                    const front = `${prep.charAt(0).toUpperCase() + prep.slice(1)} ${place}${punc}`;
                    return front + ' ' + _.charAt(0).toLowerCase() + _.slice(1).replace(/\s+(in|during|when|throughout|within)\s+[^,.]+?(?:classroom|lesson|session|school|setting)[^,.]*([,.])/i, '$2');
                });
            }
            s = s.replace(/^(Also,?\s*){2,}/i, 'Also, ');
            s = s.replace(/^(So\s*){2,}/i, 'So ');
            s = s.replace(/^(And\s*){2,}/i, 'And ');
            s = s.replace(/^(Beyond that,?\s*){2,}/i, 'Beyond that, ');
            s = s.replace(/^\s*[,;]\s*/, '');
            rewritten.push(s);
            if (humanization > 0.3 && wc > 18 && i % 4 === 3 && i < rawSentences.length - 1) {
                rewritten.push(getPunch(s));
            }
        }
        result = rewritten.join(' ')
            .replace(/\s{2,}/g, ' ')
            .replace(/,\s*,/g, ',')
            .replace(/\.\s*\./g, '.')
            .replace(/!\s*!/g, '!')
            .replace(/\s+([.,!?])/g, '$1')
            .replace(/([.,])\s*([.,])/g, '$1')
            .replace(/^\s*[,;]\s*/gm, '')
            .replace(/\b(in|on|at|to|of|for|with|by)\s+\1\b/gi, '$1')
            .replace(/\btake part in in\b/gi, 'take part in')
            .replace(/\bjoin in in\b/gi, 'join in')
            .replace(/\bintroduc(?:e|ing) first ([\w\s]+?) (?:such as|like)\b/gi, 'introducing $1 first—like')
            .replace(/\bcover(?:ing)? first ([\w\s]+?) (?:such as|like)\b/gi, 'covering $1 first, like')
            .replace(/\bEnglish-support teaching are\b/gi, 'English-support teaching is')
            .replace(/\bEnglish-language support are\b/gi, 'English-language support is')
            .replace(/(Also,?\s*){2,}/gi, 'Also, ')
            .replace(/(So\s*){2,}/gi, 'So ')
            .replace(/(And\s*){2,}/gi, 'And ')
            .replace(/\bAnd\b(?=\s+And\b)/gi, 'Also')
            .replace(/\. And ([a-z])/g, '. And $1')
            .trim();
        return result;
    }
    async callOpenAI(messages, json = false, retries = 3) {
        const apiKey = this.configService.get('OPENAI_API_KEY');
        if (!apiKey || apiKey === 'your_openai_api_key_here') {
            throw new Error('OpenAI API key is not configured. Add OPENAI_API_KEY=sk-... to backend/.env and restart the server.');
        }
        let lastError;
        for (let i = 0; i < retries; i++) {
            try {
                const response = await this.openai.chat.completions.create({
                    model: 'gpt-4o',
                    messages,
                    response_format: json ? { type: 'json_object' } : undefined,
                }, { timeout: 30000 });
                return response.choices[0].message.content ?? '';
            }
            catch (error) {
                lastError = error;
                const msg = error?.message || '';
                if (msg.includes('401') || msg.includes('Incorrect API key') || msg.includes('invalid_api_key')) {
                    throw new Error('Invalid OpenAI API key. Check OPENAI_API_KEY in backend/.env.');
                }
                this.logger.warn(`OpenAI attempt ${i + 1}/${retries} failed: ${msg}. Retrying in ${2 ** i}s…`);
                await new Promise(r => setTimeout(r, 2 ** i * 1000));
            }
        }
        throw lastError;
    }
};
exports.RewriteService = RewriteService;
exports.RewriteService = RewriteService = RewriteService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(style_profile_entity_1.StyleProfileEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(manuscript_entity_1.ManuscriptEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(cache_entity_1.CacheEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(version_entity_1.VersionEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(project_entity_1.ProjectEntity)),
    __param(6, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(7, (0, typeorm_1.InjectRepository)(comment_entity_1.CommentEntity)),
    __param(8, (0, typeorm_1.InjectRepository)(usage_log_entity_1.UsageLogEntity)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository])
], RewriteService);
//# sourceMappingURL=rewrite.service.js.map