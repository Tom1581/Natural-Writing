import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import * as crypto from 'crypto';

import { StyleProfile } from './style-memory.service';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';
import { CacheEntity } from './entities/cache.entity';
import { VersionEntity } from './entities/version.entity';
import { ProjectEntity } from './entities/project.entity';
import { UserEntity } from './entities/user.entity';
import { CommentEntity } from './entities/comment.entity';
import { UsageLogEntity } from './entities/usage-log.entity';

// Loaded lazily because text-readability is ESM-only
let rs: any;

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface AnalysisMetrics {
  // Sentence structure
  sentenceLengthMean: number;
  sentenceLengthStd: number;
  sentenceLengthVariance: number;
  burstiness: number; // CV of sentence lengths; humans ≈ 0.5–0.9, AI ≈ 0.1–0.3
  // Repetition
  repetitionScore: number;
  repeatedNGrams: { ngram: string; count: number }[];
  sentenceStarterRepetition: { starter: string; count: number }[];
  // Transitions
  transitionOveruse: number;
  // Readability
  readability: { gradeLevel: number; readingEase: number; syllableCount: number };
  // Lexical
  lexicalDiversity: { ttr: number; uniqueWords: number; complexityScore: number };
  // Style quality signals
  passiveVoice: { count: number; ratio: number };
  hedgeDensity: number;
  nominalizationDensity: number;
  semanticRedundancy: number;
  // AI-detection signals
  aiTells: { phrase: string; count: number }[];
  emDashDensity: number;
  contractionRate: number; // 0–1 (higher = more human)
  aiDetectionRisk: number; // 0–100 composite risk score
  // LLM-sourced (single call)
  humanityScore: number;
  roboticMarkers: string[];
  detectedLanguage: string;
  sentiment: { overall: number; drift: number[] };
  // Structure
  paragraphCount: number;
  sentenceCount: number;
  // Protected spans found in the text
  protectedSpans: string[];
}

export enum RewriteTone {
  NATURAL = 'natural',
  CONVERSATIONAL = 'conversational',
  FORMAL = 'formal',
  ACADEMIC = 'academic',
  BLOG = 'blog',
}

export enum RewriteStrength {
  LIGHT = 'light',
  MEDIUM = 'medium',
  STRONG = 'strong',
}

export enum SectionType {
  GENERAL = 'general',
  INTRODUCTION = 'introduction',
  NARRATIVE = 'narrative',
  DATA_DISCLOSURE = 'data_disclosure',
  CONCLUSION = 'conclusion',
  CTA = 'cta',
}

export interface RewriteOptions {
  tone: RewriteTone;
  strength: RewriteStrength;
  preserveTechnicalTerms?: boolean;
  preserveNumbers?: boolean;
  targetGradeLevel?: number;
  styleProfile?: StyleProfile;
  sectionType?: SectionType;
  intent?: number; // 0 = inform, 1 = persuade
  humanization?: number; // 0.0–1.0: how aggressively to remove AI tells (default 0.5)
}

export const PRESET_PERSONAS: Record<string, any> = {
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

// ─── Constants ────────────────────────────────────────────────────────────────

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

// Phrases that strongly signal AI generation — covers marketing, academic, and educational styles.
const AI_TELL_PHRASES = [
  // ── Marketing / blog AI tells ──────────────────────────────────────────────
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
  // ── Academic / educational AI tells (GPT's most common patterns) ──────────
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
  // ── Structural AI filler patterns ─────────────────────────────────────────
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
// Quick detection via a single regex; word-boundaries on each side
const AI_TELL_REGEX = new RegExp(
  '\\b(?:' + AI_TELL_PHRASES.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|') + ')\\b',
  'gi',
);

// Common contractions and their expanded forms — used to measure contraction rate.
const CONTRACTION_REGEX = /\b(?:don't|doesn't|didn't|won't|wouldn't|can't|cannot|couldn't|shouldn't|isn't|aren't|wasn't|weren't|hasn't|haven't|hadn't|it's|that's|there's|here's|what's|who's|you're|we're|they're|you've|we've|they've|I've|you'll|we'll|they'll|I'll|he's|she's|let's|I'd|you'd|we'd|they'd|I'm)\b/gi;
// be-verb / auxiliary candidates that could have been contracted
const CONTRACTIBLE_REGEX = /\b(?:it is|that is|there is|here is|what is|who is|you are|we are|they are|you have|we have|they have|I have|you will|we will|they will|I will|he is|she is|let us|I would|you would|we would|they would|I am|do not|does not|did not|will not|would not|cannot|could not|should not|is not|are not|was not|were not|has not|have not|had not)\b/gi;

const SECTION_GUIDES: Record<SectionType, string> = {
  [SectionType.INTRODUCTION]: 'Strong hook, clarity of purpose, and thematic momentum.',
  [SectionType.NARRATIVE]: 'Optimize for flow, rhythm, and varying sentence starts.',
  [SectionType.DATA_DISCLOSURE]: 'Absolute precision, neutral tone, clarity of numbers and facts.',
  [SectionType.CONCLUSION]: 'Synthesize key points with a resonant final thought.',
  [SectionType.CTA]: 'Elevate urgency and clarity of action without sounding aggressive.',
  [SectionType.GENERAL]: 'Balance naturalness, clarity, and engagement.',
};

// ─── Service ──────────────────────────────────────────────────────────────────

@Injectable()
export class RewriteService {
  private readonly logger = new Logger(RewriteService.name);
  private openai: OpenAI;

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(StyleProfileEntity)
    private readonly profileRepo: Repository<StyleProfileEntity>,
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
    @InjectRepository(CacheEntity)
    private readonly cacheRepo: Repository<CacheEntity>,
    @InjectRepository(VersionEntity)
    private readonly versionRepo: Repository<VersionEntity>,
    @InjectRepository(ProjectEntity)
    private readonly projectRepo: Repository<ProjectEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(CommentEntity)
    private readonly commentRepo: Repository<CommentEntity>,
    @InjectRepository(UsageLogEntity)
    private readonly usageLogRepo: Repository<UsageLogEntity>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      this.logger.error(
        '⛔  OPENAI_API_KEY is not set in backend/.env. ' +
        'Get a key at https://platform.openai.com/api-keys and add it to backend/.env as OPENAI_API_KEY=sk-...',
      );
    }
    this.openai = new OpenAI({ apiKey });
    this.loadReadability();
  }

  private async loadReadability() {
    rs = await import('text-readability');
  }

  // ─── NLP Helpers (all local, no OpenAI) ───────────────────────────────────

  private extractProtectedSpans(text: string): string[] {
    const spans: string[] = [];

    // Numbers: integers, decimals, percentages, currencies
    const nums = text.match(/[$€£¥]?\d[\d,\.]*%?/g) || [];
    spans.push(...nums.filter(n => n.length > 1));

    // Dates
    const dates = text.match(
      /\b(?:\d{1,2}[-\/]\d{1,2}[-\/]\d{2,4}|\d{4}[-\/]\d{1,2}[-\/]\d{1,2}|(?:January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\.?\s+\d{1,2},?\s+\d{4}|\d{1,2}\s+(?:January|February|March|April|May|June|July|August|September|October|November|December)[a-z]*\s+\d{4})\b/gi,
    ) || [];
    spans.push(...dates);

    // URLs
    const urls = text.match(/https?:\/\/[^\s<>"']+/g) || [];
    spans.push(...urls);

    // Email addresses
    const emails = text.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g) || [];
    spans.push(...emails);

    // Citations: [1], [Author, 2023], (Author et al., 2023)
    const citations = text.match(/\[\d+\]|\[[\w\s,&.]+,?\s*\d{4}\]|\([\w\s,&.]+et al\.,?\s*\d{4}\)|\([\w\s,&.]+,?\s*\d{4}[a-z]?\)/g) || [];
    spans.push(...citations);

    // HTML tags
    const tags = text.match(/<[a-zA-Z][^>]*\/?>/g) || [];
    spans.push(...tags);

    // Sequences of 2+ capitalized words (proper names)
    const names = text.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+\b/g) || [];
    spans.push(...names);

    return [...new Set(spans)];
  }

  private splitSentences(text: string): string[] {
    // Strip HTML tags before splitting
    const plain = text.replace(/<[^>]+>/g, ' ');
    return plain.split(/(?<=[.!?])\s+(?=[A-Z"'])/).filter(s => s.trim().length > 3);
  }

  private splitParagraphs(text: string): string[] {
    const plain = text.replace(/<\/p>/gi, '\n').replace(/<[^>]+>/g, '');
    return plain.split(/\n{2,}|\n/).filter(p => p.trim().length > 0);
  }

  private computeRepeatedNGrams(
    words: string[],
    n: number,
  ): { ngram: string; count: number }[] {
    if (words.length < n) return [];
    const counts = new Map<string, number>();
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

  private computeSentenceStarterRepetition(
    sentences: string[],
  ): { starter: string; count: number }[] {
    const counts = new Map<string, number>();
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

  private estimatePassiveVoice(sentences: string[]): { count: number; ratio: number } {
    // be-verb immediately or closely followed by a past participle ending in -ed
    const beVerb = /\b(is|are|was|were|be|been|being|am)\b/i;
    const pastPart = /\b\w+ed\b/i;
    let count = 0;
    for (const s of sentences) {
      if (beVerb.test(s) && pastPart.test(s)) count++;
    }
    return { count, ratio: sentences.length > 0 ? count / sentences.length : 0 };
  }

  private computeHedgeDensity(text: string): number {
    const lower = text.toLowerCase();
    const hits = HEDGE_PHRASES.filter(p => lower.includes(p)).length;
    const wordCount = (text.match(/\b\w+\b/g) || []).length;
    return wordCount > 0 ? hits / wordCount : 0;
  }

  private computeNominalizationDensity(text: string): number {
    const pattern = /\b\w+(?:tion|tions|ment|ments|ness|nesses|ity|ities|ism|isms|ist|ists)\b/gi;
    const matches = text.match(pattern) || [];
    const wordCount = (text.match(/\b\w+\b/g) || []).length;
    return wordCount > 0 ? matches.length / wordCount : 0;
  }

  private computeSemanticRedundancy(sentences: string[]): number {
    if (sentences.length < 2) return 0;
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

  private computeJaccardSimilarity(text1: string, text2: string): number {
    const a = new Set((text1.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
    const b = new Set((text2.toLowerCase().match(/\b[a-z]{4,}\b/g) || []));
    const inter = [...a].filter(w => b.has(w)).length;
    const union = new Set([...a, ...b]).size;
    return union > 0 ? inter / union : 0;
  }

  // ─── AI-detection signals ──────────────────────────────────────────────────

  private computeAITells(text: string): { phrase: string; count: number }[] {
    const counts = new Map<string, number>();
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

  private computeEmDashDensity(text: string): number {
    const emDashes = (text.match(/—|--/g) || []).length;
    const wordCount = (text.match(/\b\w+\b/g) || []).length;
    return wordCount > 0 ? emDashes / wordCount : 0;
  }

  /** Fraction of contractible constructions that are actually contracted. */
  private computeContractionRate(text: string): number {
    const contractions = (text.match(CONTRACTION_REGEX) || []).length;
    const contractible = (text.match(CONTRACTIBLE_REGEX) || []).length;
    const total = contractions + contractible;
    return total > 0 ? contractions / total : 0.5; // neutral when no candidates
  }

  /** Coefficient of variation of sentence lengths: std / mean. */
  private computeBurstiness(sentenceLengths: number[]): number {
    if (sentenceLengths.length < 2) return 0;
    const mean = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    if (mean === 0) return 0;
    const variance = sentenceLengths.reduce((a, b) => a + (b - mean) ** 2, 0) / sentenceLengths.length;
    return Math.sqrt(variance) / mean;
  }

  /** Composite AI-detection risk score (0–100). Higher = more AI-like. */
  private computeAIDetectionRisk(m: {
    wordCount: number;
    aiTellCount: number;
    burstiness: number;
    contractionRate: number;
    transitionOveruse: number;
    nominalizationDensity: number;
    hedgeDensity: number;
    emDashDensity: number;
    passiveRatio: number;
  }): number {
    const aiTellRate = m.wordCount > 0 ? m.aiTellCount / m.wordCount : 0;

    // Each signal is normalised 0–1 (1 = strongly AI-like)
    // Tell density: even 1 tell per 50 words is a strong flag. Multiplier lowered so phrase
    // volume (not just rate) contributes — full saturation at ~1 tell per 12 words.
    const tellSignal = Math.min(aiTellRate * 80, 1);

    // Burstiness: AI writes very uniform sentence lengths. Human CV ≈ 0.45+, AI ≈ 0.1–0.25.
    // Threshold tightened from 0.7 → 0.5 so midrange AI text isn't let off.
    const burstSignal = Math.max(0, Math.min(1, 1 - m.burstiness / 0.5));

    // No contractions = formal AI academic style. Humans use contractions even in essays.
    const contractionSignal = Math.max(0, Math.min(1, 1 - m.contractionRate * 2));

    // Transition overuse (furthermore, moreover, additionally, therefore, thus…)
    const transitionSignal = Math.min(m.transitionOveruse * 3, 1);

    // Nominalizations ("the implementation of", "the assessment of")
    const nominalizationSignal = Math.min(m.nominalizationDensity * 8, 1);

    // Hedge density ("it is important to note", "it is essential that")
    const hedgeSignal = Math.min(m.hedgeDensity * 30, 1);

    // Passive voice — AI academic writing overuses it
    const passiveSignal = Math.min(m.passiveRatio * 2, 1);

    // Weighted composite
    const raw =
      0.30 * tellSignal +
      0.20 * burstSignal +
      0.15 * contractionSignal +
      0.13 * transitionSignal +
      0.10 * nominalizationSignal +
      0.07 * hedgeSignal +
      0.05 * passiveSignal;

    // Lift the floor when AI-tell phrases are clearly present so ChatGPT papers
    // can't score low just because sentence structure happened to vary.
    const floor = tellSignal > 0.5 ? 0.15 : tellSignal > 0.2 ? 0.08 : 0;
    return Math.min(99, Math.round(Math.max(raw, raw + floor) * 100));
  }

  /**
   * Deterministically score a rewrite candidate.
   * Returns 0 if any protected span is missing (hard reject).
   * `humanization` (0–1) shifts the weighting toward anti-AI-tell metrics.
   */
  private scoreCandidateLocally(
    candidate: string,
    original: string,
    protectedSpans: string[],
    humanization: number = 0.5,
  ): number {
    // Hard reject: missing protected content
    for (const span of protectedSpans) {
      if (!candidate.includes(span)) return 0;
    }

    const sentences = this.splitSentences(candidate);
    const sentenceLengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
    const wordCount = (candidate.match(/\b\w+\b/g) || []).length;

    const passive = this.estimatePassiveVoice(sentences).ratio;
    const hedge = Math.min(this.computeHedgeDensity(candidate) * 15, 1);
    const nom = Math.min(this.computeNominalizationDensity(candidate) * 4, 1);
    const redundancy = this.computeSemanticRedundancy(sentences);
    const similarity = this.computeJaccardSimilarity(candidate, original);

    // AI-detection signals
    const aiTellCount = this.computeAITells(candidate).reduce((s, t) => s + t.count, 0);
    const aiTellRate = wordCount > 0 ? Math.min(aiTellCount / wordCount * 200, 1) : 0;
    const burstiness = this.computeBurstiness(sentenceLengths);
    const burstinessScore = Math.max(0, Math.min(1, burstiness / 0.7)); // 0.7 ≈ human target
    const contractionRate = this.computeContractionRate(candidate);
    const emDash = Math.min(this.computeEmDashDensity(candidate) * 150, 1);

    // Base quality weight vs. AI-detection weight scales with humanization slider.
    // At humanization = 0: mostly quality. At humanization = 1: heavy anti-AI weight.
    const aiWeight = 0.25 + 0.35 * humanization; // 0.25 → 0.60
    const qualityWeight = 1 - aiWeight;

    const qualityScore =
      (1 - passive) * 0.20 +
      (1 - hedge) * 0.15 +
      (1 - nom) * 0.15 +
      (1 - redundancy) * 0.20 +
      Math.min(similarity * 1.5, 1) * 0.30;

    const aiResistanceScore =
      (1 - aiTellRate) * 0.35 +
      burstinessScore * 0.25 +
      contractionRate * 0.15 +
      (1 - emDash) * 0.10 +
      (1 - redundancy) * 0.15;

    return Math.max(0, qualityScore * qualityWeight + aiResistanceScore * aiWeight);
  }

  // ─── Core Analysis ────────────────────────────────────────────────────────

  async analyze(text: string): Promise<AnalysisMetrics> {
    const cacheHash = this.createHash({ action: 'analyze_v2', text });
    const cached = await this.getFromCache<AnalysisMetrics>(cacheHash);
    if (cached) return cached;

    const sentences = this.splitSentences(text);
    const paragraphs = this.splitParagraphs(text);
    const words = (text.toLowerCase().match(/\b[a-z]+\b/g) || []);

    // Sentence length stats
    const lengths = sentences.map(s => (s.match(/\b\w+\b/g) || []).length);
    const mean = lengths.reduce((a, b) => a + b, 0) / (lengths.length || 1);
    const variance = lengths.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (lengths.length || 1);
    const std = Math.sqrt(variance);

    // Transition density
    let transitionCount = 0;
    const lowerText = text.toLowerCase();
    for (const t of TRANSITION_WORDS) {
      transitionCount += (lowerText.match(new RegExp(`\\b${t}\\b`, 'g')) || []).length;
    }
    const transitionDensity = transitionCount / (sentences.length || 1);

    // Lexical diversity
    const uniqueWords = new Set(words).size;
    const ttr = words.length > 0 ? uniqueWords / words.length : 0;

    // Readability (text-readability may not be loaded yet on first cold start)
    let gradeLevel = 10, readingEase = 60, syllableCount = 0;
    try {
      if (rs) {
        gradeLevel = rs.fleschKincaidGradeLevel(text);
        readingEase = rs.fleschReadingEase(text);
        syllableCount = rs.syllableCount(text);
      }
    } catch { /* fallback to defaults */ }

    // Local NLP metrics
    const repeatedBigrams = this.computeRepeatedNGrams(words, 2);
    const repeatedTrigrams = this.computeRepeatedNGrams(words, 3);
    const repeatedNGrams = [...repeatedTrigrams, ...repeatedBigrams].slice(0, 10);
    const sentenceStarterRepetition = this.computeSentenceStarterRepetition(sentences);
    const passiveVoice = this.estimatePassiveVoice(sentences);
    const hedgeDensity = this.computeHedgeDensity(text);
    const nominalizationDensity = this.computeNominalizationDensity(text);
    const semanticRedundancy = this.computeSemanticRedundancy(sentences);
    const protectedSpans = this.extractProtectedSpans(text);

    // AI-detection signals
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

    // Single LLM call for subjective/contextual metrics
    let humanityScore = 0.5;
    let roboticMarkers: string[] = [];
    let detectedLanguage = 'en';
    let sentimentDrift: number[] = paragraphs.map(() => 0.5);
    let sentimentOverall = 0.5;

    try {
      const content = await this.callOpenAI(
        [
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
        ],
        true,
      );
      const r = JSON.parse(content);
      humanityScore = r.humanityScore ?? 0.5;
      roboticMarkers = r.roboticMarkers ?? [];
      detectedLanguage = r.language || 'en';
      sentimentDrift = r.sentimentDrift || sentimentDrift;
      sentimentOverall = r.sentimentOverall ?? 0.5;
    } catch {
      // Use defaults; analysis still has full local metrics
    }

    const metrics: AnalysisMetrics = {
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

  // ─── Core Rewrite ─────────────────────────────────────────────────────────

  /**
   * Build the humanization instruction block for the system prompt.
   * Scales intensity from "polish" (0.0) to "aggressive humanization" (1.0).
   */
  private buildHumanizationInstructions(humanization: number, detectedAITells: string[]): string {
    if (humanization <= 0.05) return '';

    const level =
      humanization >= 0.8 ? 'AGGRESSIVE'
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
    if (humanization >= 0.4) rules.push(...strongRules);
    if (humanization >= 0.75) rules.push(...aggressiveRules);

    const tellsHint =
      detectedAITells.length > 0
        ? `\nAI-TELL PHRASES DETECTED IN INPUT — rewrite or remove these: ${detectedAITells.slice(0, 12).map(p => `"${p}"`).join(', ')}.`
        : '';

    return `
HUMANIZATION LEVEL: ${level} (${percentage}%). The input reads like AI-generated text; the output must read like a specific human wrote it.
${rules.map(r => `  • ${r}`).join('\n')}${tellsHint}`;
  }

  /** Public entry point called by the controller. */
  async processText(
    text: string,
    options: RewriteOptions,
  ): Promise<{
    id: string;
    bestVersion: string;
    alternatives: string[];
    metrics: AnalysisMetrics;
    outputMetrics: AnalysisMetrics;
    humanizationDelta: number;
  }> {
    const startTime = Date.now();
    const humanization = Math.max(0, Math.min(1, options.humanization ?? 0.5));

    // Analyse input first
    const metrics = await this.analyze(text);
    const { detectedLanguage, protectedSpans } = metrics;

    const cacheHash = this.createHash({ action: 'rewrite_v3', text, options, humanization });
    const cached = await this.getFromCache<any>(cacheHash);

    let bestVersion: string;
    let alternatives: string[];
    let manuscriptId: string;

    if (cached) {
      bestVersion = cached.bestVersion;
      alternatives = cached.alternatives;
      manuscriptId = cached.id;
    } else {
      const sectionGuide = SECTION_GUIDES[options.sectionType || SectionType.GENERAL];
      const spanConstraint =
        protectedSpans.length > 0
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

      let candidates: string[] = [];
      const aiKeyMissing =
        !this.configService.get<string>('OPENAI_API_KEY') ||
        this.configService.get<string>('OPENAI_API_KEY') === 'your_openai_api_key_here';

      if (!aiKeyMissing) {
        try {
          const raw = await this.callOpenAI(
            [{ role: 'system', content: systemPrompt }, { role: 'user', content: text }],
            true,
          );
          const parsed = JSON.parse(raw);
          candidates = (parsed.candidates || []).map((c: any) =>
            typeof c === 'string' ? c : c.text,
          );
        } catch (err: any) {
          this.logger.warn(`OpenAI unavailable (${err?.message}), falling back to rule-based humanizer.`);
        }
      } else {
        this.logger.warn('No OpenAI key — using rule-based humanizer fallback.');
      }

      // If OpenAI produced nothing or is unavailable, use the local rule-based fallback
      if (candidates.length === 0) {
        const fallback = this.humanizeFallback(text, humanization, options.tone, options.strength);
        candidates = [fallback];
      }

      // Deterministic ranking, weighted by humanization slider
      const scored = candidates
        .map(c => ({ text: c, score: this.scoreCandidateLocally(c, text, protectedSpans, humanization) }))
        .filter(c => c.score > 0)
        .sort((a, b) => b.score - a.score);

      const ranked = scored.length > 0 ? scored : candidates.map(c => ({ text: c, score: 0 }));
      bestVersion = ranked[0].text;

      if (!aiKeyMissing && text.replace(/<[^>]+>/g, '').length > 1200) {
        try { bestVersion = await this.globalSmooth(bestVersion); } catch { /* skip if unavailable */ }
      }

      alternatives = ranked.slice(1).map(c => c.text);

      const manuscript = await this.manuscriptRepo.save({
        sourceText: text,
        optimizedText: bestVersion,
        metrics: metrics as any,
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

    // Re-analyse output so the frontend can show before/after AI-risk
    const outputMetrics = await this.analyze(bestVersion);
    const humanizationDelta = metrics.aiDetectionRisk - outputMetrics.aiDetectionRisk;

    const latencyMs = Date.now() - startTime;
    await this.usageLogRepo.save({
      modelUsed: 'gpt-4o',
      promptTokens: text.length / 4,
      completionTokens: bestVersion.length / 4,
      totalTokens: (text.length + bestVersion.length) / 4,
      latencyMs,
      manuscript: { id: manuscriptId } as any,
    });

    return { id: manuscriptId, bestVersion, alternatives, metrics, outputMetrics, humanizationDelta };
  }

  // ─── Additional Public Methods ─────────────────────────────────────────────

  async getHistory(): Promise<ManuscriptEntity[]> {
    return this.manuscriptRepo.find({ order: { createdAt: 'DESC' }, take: 50 });
  }

  async getVersions(manuscriptId: string): Promise<VersionEntity[]> {
    return this.versionRepo.find({
      where: { manuscript: { id: manuscriptId } },
      order: { createdAt: 'DESC' },
    });
  }

  async saveVersion(manuscriptId: string, label?: string): Promise<VersionEntity> {
    const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId } });
    if (!manuscript) throw new Error('Manuscript not found');
    return this.versionRepo.save({
      content: manuscript.optimizedText,
      metrics: manuscript.metrics,
      label: label || `Snapshot ${new Date().toLocaleString()}`,
      manuscript,
    });
  }

  async getProjects(): Promise<ProjectEntity[]> {
    return this.projectRepo.find({
      relations: ['manuscripts'],
      order: { createdAt: 'DESC' },
    });
  }

  async createProject(name: string, description?: string): Promise<ProjectEntity> {
    const project = this.projectRepo.create({ name, description });
    return this.projectRepo.save(project);
  }

  async assignToProject(manuscriptId: string, projectId: string): Promise<void> {
    const project = await this.projectRepo.findOne({ where: { id: projectId } });
    if (!project) throw new Error('Project not found');
    await this.manuscriptRepo.update(manuscriptId, { project });
  }

  async chatWithManuscript(query: string, manuscriptContent: string): Promise<string> {
    const systemPrompt = `You are a professional writing coach with full access to the manuscript below.
If the user asks for a rewrite, return the rewritten HTML.
If the user asks a question, give a concise, actionable stylistic answer (2–4 sentences max).
MANUSCRIPT:\n${manuscriptContent.substring(0, 6000)}`;

    return this.callOpenAI(
      [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: query },
      ],
      false,
    );
  }

  async refineSentence(sentence: string, context: string, mode: string): Promise<string[]> {
    const cacheHash = this.createHash({ action: 'refine', sentence, context, mode });
    const cached = await this.getFromCache<string[]>(cacheHash);
    if (cached) return cached;

    const raw = await this.callOpenAI(
      [
        {
          role: 'system',
          content: `Rewrite the sentence to be ${mode}. Context: ${context.substring(0, 500)}
Return JSON: {"variations": ["...", "...", "..."]}`,
        },
        { role: 'user', content: sentence },
      ],
      true,
    );

    const variations = JSON.parse(raw).variations || [];
    await this.setCache(cacheHash, variations);
    return variations;
  }

  async spawnReaders(text: string): Promise<any[]> {
    const personas = [
      { id: 'exec', name: 'Skeptical Executive', tray: 'Time-poor, results-focused, hates jargon.' },
      { id: 'academic', name: 'Academic Peer', tray: 'Deep focus, values precision and evidence.' },
      { id: 'general', name: 'General Reader', tray: 'Seeks clarity, narrative flow, and simple truth.' },
    ];

    return Promise.all(
      personas.map(async p => {
        const prompt = `You are the ${p.name}. Perspective: ${p.tray}
Read this text and give 3 concise bullet-point observations about its clarity, tone, and impact.
TEXT: ${text.substring(0, 4000)}`;
        const feedback = await this.callOpenAI([{ role: 'system', content: prompt }], false);
        return { ...p, feedback };
      }),
    );
  }

  async analyzeEngagement(text: string): Promise<any> {
    const prompt = `Find sections likely to lose reader attention. Identify drop-off zones by sentence index.
Return JSON: {"overallScore": 0-100, "heatMap": [{"index": <sentence_index>, "intensity": 0.0-1.0, "reason": "..."}]}
TEXT: ${text.substring(0, 4000)}`;

    const raw = await this.callOpenAI([{ role: 'system', content: prompt }], true);
    return JSON.parse(raw);
  }

  async synthesizeMasterpiece(text: string, options: any): Promise<any> {
    const systemPrompts = [
      { id: 'flow', name: 'Flow Editor', strength: 'natural rhythm and transitions', prompt: `Rewrite for maximum flow and readability: ${text.substring(0, 3000)}` },
      { id: 'precision', name: 'Precision Editor', strength: 'word choice and nuance', prompt: `Rewrite for precise, exact word choice: ${text.substring(0, 3000)}` },
      { id: 'narrative', name: 'Narrative Editor', strength: 'storytelling and engagement', prompt: `Rewrite with compelling narrative structure: ${text.substring(0, 3000)}` },
    ];

    const drafts = await Promise.all(
      systemPrompts.map(async p => ({
        ...p,
        draft: await this.callOpenAI([{ role: 'system', content: p.prompt }], false),
      })),
    );

    const synthesisPrompt = `You have three improved versions of a manuscript. Synthesize the best elements from each into a single superior version that combines natural flow, precise word choice, and compelling narrative.
Version 1 (Flow): ${drafts[0].draft.substring(0, 1500)}
Version 2 (Precision): ${drafts[1].draft.substring(0, 1500)}
Version 3 (Narrative): ${drafts[2].draft.substring(0, 1500)}
${options?.styleProfile ? `Match style: ${JSON.stringify(options.styleProfile)}` : ''}
Preserve all HTML tags.`;

    const masterpiece = await this.callOpenAI([{ role: 'system', content: synthesisPrompt }], false);
    return { masterpiece, votes: drafts.map(d => ({ id: d.id, name: d.name, strength: d.strength })) };
  }

  async getPlatformStats(): Promise<any> {
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

  async getProfiles(): Promise<StyleProfileEntity[]> {
    return this.profileRepo.find({ order: { createdAt: 'DESC' } });
  }

  async saveProfile(profile: StyleProfile): Promise<StyleProfileEntity> {
    return this.profileRepo.save(profile as any);
  }

  async updateRating(id: string, rating: number): Promise<void> {
    await this.manuscriptRepo.update(id, { rating });
  }

  async updateManuscript(id: string, optimizedText: string): Promise<void> {
    const analysis = await this.analyze(optimizedText);
    await this.manuscriptRepo.update(id, { optimizedText, metrics: analysis as any });
  }

  async createComment(manuscriptId: string, data: any): Promise<CommentEntity> {
    const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId } });
    if (!manuscript) throw new Error('Manuscript not found');
    return this.commentRepo.save(
      this.commentRepo.create({
        content: data.content,
        selectionData: data.selectionData,
        authorName: data.authorName || 'Collaborator',
        manuscript,
      }),
    );
  }

  async getComments(manuscriptId: string): Promise<CommentEntity[]> {
    return this.commentRepo.find({
      where: { manuscript: { id: manuscriptId }, isResolved: false },
      order: { createdAt: 'ASC' },
    });
  }

  async generateOutline(topic: string, template: string): Promise<string> {
    return this.callOpenAI(
      [
        {
          role: 'system',
          content: 'You are a manuscript architect. Return valid HTML using h1, h2, ul, p elements only.',
        },
        {
          role: 'user',
          content: `Generate a structured HTML outline for: "${topic}". Template style: ${template}. Include placeholder paragraph text under each heading.`,
        },
      ],
      false,
    );
  }

  calculateConsistency(metrics: AnalysisMetrics, profile: StyleProfile): { score: number; drift: string[] } {
    const drift: string[] = [];
    let totalDiff = 0;

    const adjDiff = Math.abs(metrics.repetitionScore - profile.adjectiveLevel);
    if (adjDiff > 0.3) drift.push('Adjective density mismatch');
    totalDiff += adjDiff;

    const complexityScore = Math.min(metrics.sentenceLengthMean / 25, 1);
    const compDiff = Math.abs(complexityScore - profile.sentenceComplexity);
    if (compDiff > 0.3) drift.push('Sentence complexity mismatch');
    totalDiff += compDiff;

    return { score: Math.max(0, 1 - totalDiff / 2), drift };
  }

  async predictStyle(manuscriptContent: string): Promise<any> {
    const profiles = await this.profileRepo.find();
    const profileList = profiles.map(p => p.name).join(', ');
    const raw = await this.callOpenAI(
      [
        {
          role: 'user',
          content: `Which of these style profiles best matches this text: ${profileList}?
Return JSON: {"match": "Profile Name", "confidence": 0.0-1.0, "reason": "..."}
TEXT: ${manuscriptContent.substring(0, 2000)}`,
        },
      ],
      true,
    );
    return JSON.parse(raw);
  }

  async generateMetadata(manuscriptId: string): Promise<any> {
    const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId } });
    if (!manuscript) throw new Error('Manuscript not found');

    const raw = await this.callOpenAI(
      [
        {
          role: 'user',
          content: `Generate publishing metadata for this content. Return JSON:
{"seoTitle":"...","seoDescription":"...","viralHooks":["...","..."],"readingTime":"..."}
CONTENT: ${manuscript.optimizedText.substring(0, 3000)}`,
        },
      ],
      true,
    );

    const metadata = JSON.parse(raw);
    manuscript.metadata = metadata;
    await this.manuscriptRepo.save(manuscript);
    return metadata;
  }

  async searchHistory(query: string): Promise<ManuscriptEntity[]> {
    const history = await this.manuscriptRepo.find({ order: { createdAt: 'DESC' }, take: 100 });
    try {
      const raw = await this.callOpenAI(
        [
          {
            role: 'system',
            content: `Filter this manuscript list by the user's query. Return a JSON array of matching UUIDs only.
QUERY: ${query}`,
          },
          {
            role: 'user',
            content: JSON.stringify(
              history.map(m => ({ id: m.id, title: m.title, tone: m.tone, language: m.language })),
            ),
          },
        ],
        true,
      );
      const ids = JSON.parse(raw);
      return history.filter(m => ids.includes(m.id));
    } catch {
      return history.filter(m => m.title?.toLowerCase().includes(query.toLowerCase()));
    }
  }

  async auditProjectConsistency(projectId: string): Promise<any> {
    const project = await this.projectRepo.findOne({
      where: { id: projectId },
      relations: ['manuscripts'],
    });
    if (!project) throw new Error('Project not found');
    const mss = project.manuscripts.filter(m => m.metrics);
    if (mss.length < 2) return { score: 1, outliers: [] };

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

  // ─── Private Helpers ──────────────────────────────────────────────────────

  private async globalSmooth(text: string): Promise<string> {
    try {
      return await this.callOpenAI(
        [
          {
            role: 'system',
            content: 'Perform a final smoothing pass: unify tone across paragraphs, remove repetitive transitions, and ensure consistent voice. Preserve all HTML tags.',
          },
          { role: 'user', content: text },
        ],
        false,
      );
    } catch {
      return text;
    }
  }

  private createHash(data: any): string {
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private async getFromCache<T>(hash: string): Promise<T | null> {
    const cached = await this.cacheRepo.findOneBy({ hash });
    return cached ? (JSON.parse(cached.value) as T) : null;
  }

  private async setCache(hash: string, value: any): Promise<void> {
    await this.cacheRepo.save({ hash, value: JSON.stringify(value) });
  }

  /**
   * Rule-based humanizer — runs entirely locally with zero external dependencies.
   * Used when OpenAI is unavailable. Quality is lower than GPT-4o but measurably
   * reduces AI-detection risk by targeting the highest-weight signals.
   */
  private humanizeFallback(
    text: string,
    humanization: number,
    tone: string,
    strength: string,
  ): string {
    let result = text.replace(/<[^>]+>/g, ' ').trim();
    const isFormal = tone === 'formal' || tone === 'academic';
    const aggressive = humanization > 0.5 || strength === 'strong';

    // ── 1. Phrase-level + word-level AI-tell replacements ─────────────────────
    // Ordered longest-first so sub-phrases don't partially match.
    const REPLACEMENTS: [RegExp, string][] = [
      // ── Multi-word academic patterns ──────────────────────────────────────
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
      // ELD — context-aware (longest patterns first)
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
      // ── Marketing tells ───────────────────────────────────────────────────
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
      // ── Word-level academic vocabulary swap (past tense listed first) ────────
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
      // participate in → take part in (avoids "join in in")
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
      // Preteach — preserve gerund/past forms separately
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

    // ── 2. Contraction injection ───────────────────────────────────────────────
    if (!isFormal) {
      const CONTRACTIONS: [RegExp, string][] = [
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

    // ── 3. Sentence-level structural rewriting ────────────────────────────────
    // Split on sentence endings, preserving the punctuation
    const rawSentences = result
      .replace(/([.!?])\s+([A-Z"'])/g, '$1\n$2')
      .split('\n')
      .map(s => s.trim())
      .filter(s => s.length > 2);

    // Parenthetical asides to inject into long sentences
    const PARENTHETICALS = [
      '—and this matters more than it sounds—',
      '—something a lot of people overlook—',
      '—which isn\'t always easy to pull off—',
      '—in real classrooms, at least—',
      '—this is the tricky part—',
      '—teachers see this firsthand—',
      '—worth pausing on—',
    ];

    // Varied human-sounding openers to break the AI subject-first pattern
    const OPENERS_FORMAL   = ['Beyond that,', 'Worth noting:', 'In practice,', 'Building on that,', 'Here\'s what that means:'];
    const OPENERS_INFORMAL = ['Here\'s the thing—', 'Put differently,', 'Think about it:', 'Basically,', 'In practice,', 'Truth is,', 'The tricky part?'];
    const OPENERS = isFormal ? OPENERS_FORMAL : OPENERS_INFORMAL;

    // Context-aware short punch sentences — create burstiness
    const getPunch = (s: string): string => {
      const lower = s.toLowerCase();
      if (lower.includes('english') && lower.includes('learn')) return "That skill-building takes time.";
      if (lower.includes('teach') || lower.includes('teacher'))  return "Every teacher knows it.";
      if (lower.includes('student'))                              return "Students feel the difference.";
      if (lower.includes('speak') || lower.includes('oral'))      return "Spoken language counts.";
      if (lower.includes('lab') || lower.includes('chem'))        return "Hands-on beats lecture every time.";
      if (lower.includes('read') || lower.includes('write'))      return "Literacy compounds over time.";
      if (lower.includes('understand') || lower.includes('grasp')) return "That clarity sticks.";
      if (lower.includes('vocabular') || lower.includes('words')) return "Words are the building blocks.";
      if (lower.includes('academ'))                               return "Academic growth is slow but real.";
      return "That's the part that sticks.";
    };

    const CONJ_BREAKS: Record<string, string> = {
      and:      '. And',
      but:      '. But',
      while:    '. Meanwhile,',
      although: '. Even so,',
      whereas:  '. By contrast,',
      however:  '. Even still,',
      yet:      '. And yet,',
      since:    '. Because of this,',
      because:  ". That's because",
      though:   '. That said,',
    };

    const rewritten: string[] = [];

    for (let i = 0; i < rawSentences.length; i++) {
      let s = rawSentences[i].trim();
      const wc = (s.match(/\b\w+\b/g) || []).length;

      // a. Split long compound sentences (>20 words) at conjunctions/semicolons
      if (wc > 20) {
        const split1 = s.replace(
          /,\s+(and|but|while|although|whereas|yet|since|because|though)\s+/gi,
          (full: string, conj: string, offset: number, str: string) => {
            // Only split at ", and" when what follows looks like a new subject clause
            // (starts with pronoun, "the", or capitalized subject noun — not a gerund/adjective list item)
            const afterConj = str.slice(offset + full.length);
            const startsNewClause = /^(?:the |a |an |this |these |that |those |it |they |he |she |we |you |I |[A-Z][a-z]+s?\s+(?:can|will|should|must|have|had|were|was|are|is))/i.test(afterConj);
            if (conj.toLowerCase() === 'and' && !startsNewClause) return full; // keep as-is for list items
            const br = CONJ_BREAKS[conj.toLowerCase()];
            return br ? `${br} ` : `. ${conj.charAt(0).toUpperCase() + conj.slice(1)} `;
          },
        );
        if (split1 !== s) {
          s = split1;
        } else {
          s = s.replace(/;\s+/g, '. ');
        }
      }

      // b. Inject varied opener at every 4th sentence (not the first)
      if (i > 0 && i % 4 === 0 && wc >= 5) {
        const opener = OPENERS[Math.floor(i / 4) % OPENERS.length];
        if (!/^(also|but|so|and|yet|still|even|here|put|think|basic|truth|in prac|beyond|worth|building|that's)/i.test(s)) {
          s = opener + ' ' + s.charAt(0).toLowerCase() + s.slice(1);
        }
      }

      // c. Inject parenthetical em-dash aside into long sentences (aggressive mode)
      if (aggressive && wc > 18 && i % 3 === 1) {
        const aside = PARENTHETICALS[i % PARENTHETICALS.length];
        // Find a comma roughly in the middle of the sentence
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

      // d. Adverbial fronting: move prepositional phrases to front of some sentences
      if (aggressive && i % 6 === 2 && !s.startsWith('In ') && !s.startsWith('When ') && !s.startsWith('For ')) {
        s = s.replace(
          /^((?:Teachers|Students|Learners|Researchers|Schools)\s+(?:can|should|must|will|use|rely)[\w\s]+?)\s+(in|during|when|throughout|within)\s+([^,.]+?(?:classroom|lesson|session|school|setting)[^,.]*)([,.])/i,
          (_, _subj, prep, place, punc) => {
            const front = `${prep.charAt(0).toUpperCase() + prep.slice(1)} ${place}${punc}`;
            return front + ' ' + _.charAt(0).toLowerCase() + _.slice(1).replace(/\s+(in|during|when|throughout|within)\s+[^,.]+?(?:classroom|lesson|session|school|setting)[^,.]*([,.])/i, '$2');
          },
        );
      }

      // e. Cleanup duplicate connectors from phrase substitutions
      s = s.replace(/^(Also,?\s*){2,}/i, 'Also, ');
      s = s.replace(/^(So\s*){2,}/i, 'So ');
      s = s.replace(/^(And\s*){2,}/i, 'And ');
      s = s.replace(/^(Beyond that,?\s*){2,}/i, 'Beyond that, ');
      s = s.replace(/^\s*[,;]\s*/, '');

      rewritten.push(s);

      // f. After every 4th long sentence, drop a short punchy follow-up for burstiness
      if (humanization > 0.3 && wc > 18 && i % 4 === 3 && i < rawSentences.length - 1) {
        rewritten.push(getPunch(s));
      }
    }

    // ── 4. Final cleanup ──────────────────────────────────────────────────────
    result = rewritten.join(' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/,\s*,/g, ',')
      .replace(/\.\s*\./g, '.')
      .replace(/!\s*!/g, '!')
      .replace(/\s+([.,!?])/g, '$1')
      .replace(/([.,])\s*([.,])/g, '$1')
      .replace(/^\s*[,;]\s*/gm, '')
      // Fix doubled prepositions from phrase substitutions
      .replace(/\b(in|on|at|to|of|for|with|by)\s+\1\b/gi, '$1')
      .replace(/\btake part in in\b/gi, 'take part in')
      .replace(/\bjoin in in\b/gi, 'join in')
      // Fix word-order issues from multi-word replacement insertions
      .replace(/\bintroduc(?:e|ing) first ([\w\s]+?) (?:such as|like)\b/gi, 'introducing $1 first—like')
      .replace(/\bcover(?:ing)? first ([\w\s]+?) (?:such as|like)\b/gi, 'covering $1 first, like')
      // Fix subject-verb agreement when singular "teaching/method" follows plural verb
      .replace(/\bEnglish-support teaching are\b/gi, 'English-support teaching is')
      .replace(/\bEnglish-language support are\b/gi, 'English-language support is')
      // Fix repeated connectors
      .replace(/(Also,?\s*){2,}/gi, 'Also, ')
      .replace(/(So\s*){2,}/gi, 'So ')
      .replace(/(And\s*){2,}/gi, 'And ')
      .replace(/\bAnd\b(?=\s+And\b)/gi, 'Also')
      // Fix "And" at start of sentence that has a capital — make lowercase "and"
      .replace(/\. And ([a-z])/g, '. And $1')
      .trim();

    return result;
  }

  private async callOpenAI(messages: any[], json = false, retries = 3): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key is not configured. Add OPENAI_API_KEY=sk-... to backend/.env and restart the server.');
    }
    let lastError: any;
    for (let i = 0; i < retries; i++) {
      try {
        const response = await this.openai.chat.completions.create(
          {
            model: 'gpt-4o',
            messages,
            response_format: json ? { type: 'json_object' } : undefined,
          },
          { timeout: 30000 },
        );
        return response.choices[0].message.content ?? '';
      } catch (error: any) {
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
}
