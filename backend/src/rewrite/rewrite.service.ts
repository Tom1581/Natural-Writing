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
import { FreeUsageEntity } from './entities/free-usage.entity';
import { BillingAccountEntity } from './entities/billing-account.entity';
import { humanizeDocument, HumanizerUnavailableError, stripHtml } from './humanizer';

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
  'in order to',
  'it is important to', 'it is essential to', 'it is necessary to', 'it is vital to',
  'it is crucial to', 'it is critical to',
  'research has shown', 'studies have shown', 'research suggests', 'evidence suggests',
  'provides an opportunity', 'provide an opportunity',
  'a key component', 'a key factor', 'a key aspect', 'a key element',
  'effective strategies', 'effective approach', 'effective way',
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
  'the importance of', 'the significance of',
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
  private openai: OpenAI | null;

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
    @InjectRepository(FreeUsageEntity)
    private readonly freeUsageRepo: Repository<FreeUsageEntity>,
    @InjectRepository(BillingAccountEntity)
    private readonly billingAccountRepo: Repository<BillingAccountEntity>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      this.logger.warn(
        'OPENAI_API_KEY is not set. OpenAI-specific rewrite modes will be unavailable until it is configured.',
      );
      this.openai = null;
    } else {
      this.openai = new OpenAI({ apiKey });
    }
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
    const plain = stripHtml(text);
    return plain.split(/(?<=[.!?])\s+(?=[A-Z"'])/).filter(s => s.trim().length > 3);
  }

  private splitParagraphs(text: string): string[] {
    const plain = stripHtml(text.replace(/<\/p>/gi, '\n'));
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

  private readonly FREE_WORD_LIMIT = 400;

  private static readonly ADMIN_EMAILS = ['a15817348@gmail.com'];

  private resolvePaidTier(account: BillingAccountEntity | null): string | null {
    if (!account) return null;
    if (account.unlimitedActive) return 'unlimited';
    if (account.wordBalance > 0) return account.packTier || 'starter';
    return null;
  }

  private async checkPaidQuota(
    account: BillingAccountEntity,
    incomingWords: number,
  ): Promise<void> {
    if (account.unlimitedActive) return;

    if (account.wordBalance < incomingWords) {
      const { HttpException } = await import('@nestjs/common');
      throw new HttpException(
        {
          statusCode: 402,
          error: 'Paid balance exceeded',
          message: `This rewrite needs ${incomingWords} words, but your paid balance has ${account.wordBalance} words remaining.`,
          wordsRemaining: account.wordBalance,
          requiredWords: incomingWords,
          tier: account.packTier,
        },
        402,
      );
    }
  }

  async getAccessStatus(email: string): Promise<{
    tier: string | null;
    wordsRemaining: number;
    totalWordsPurchased: number;
    freeWordsUsed: number;
    freeWordsLimit: number;
    unlimitedActive: boolean;
    subscriptionStatus: string | null;
    canManageBilling: boolean;
  }> {
    const normalizedEmail = email.trim().toLowerCase();
    const [freeRow, billing] = await Promise.all([
      this.freeUsageRepo.findOne({ where: { email: normalizedEmail } }),
      this.billingAccountRepo.findOne({ where: { email: normalizedEmail } }),
    ]);

    return {
      tier: this.resolvePaidTier(billing),
      wordsRemaining: billing?.wordBalance ?? 0,
      totalWordsPurchased: billing?.lifetimeWordsPurchased ?? 0,
      freeWordsUsed: freeRow?.wordsUsed ?? 0,
      freeWordsLimit: this.FREE_WORD_LIMIT,
      unlimitedActive: billing?.unlimitedActive ?? false,
      subscriptionStatus: billing?.subscriptionStatus ?? null,
      canManageBilling: !!billing?.unlimitedActive,
    };
  }

  /** Check free quota and throw 402 if exceeded; returns updated row for post-increment. */
  private async checkFreeQuota(
    email: string | null,
    ipAddress: string,
    incomingWords: number,
    subscriptionTier: string | null,
  ): Promise<FreeUsageEntity | null> {
    if (email && RewriteService.ADMIN_EMAILS.includes(email.trim().toLowerCase())) return null; // admin — unlimited
    if (subscriptionTier) return null; // paid access handled elsewhere

    const where = email ? { email } : { ipAddress };
    let row = await this.freeUsageRepo.findOne({ where: where as any });

    if (!row) {
      row = await this.freeUsageRepo.save(this.freeUsageRepo.create({
        email: email ?? null,
        ipAddress: email ? null : ipAddress,
        wordsUsed: 0,
      }));
    }

    if (row.wordsUsed + incomingWords > this.FREE_WORD_LIMIT) {
      const { HttpException } = await import('@nestjs/common');
      throw new HttpException(
        {
          statusCode: 402,
          error: 'Free quota exceeded',
          message: `Free trial allows ${this.FREE_WORD_LIMIT} words total. You have used ${row.wordsUsed}. Subscribe to continue.`,
          wordsUsed: row.wordsUsed,
          limit: this.FREE_WORD_LIMIT,
        },
        402,
      );
    }

    return row;
  }

  /** Public entry point called by the controller. */
  async processText(
    text: string,
    options: RewriteOptions,
    userEmail: string | null = null,
    subscriptionTier: string | null = null,
    ipAddress: string = 'unknown',
  ): Promise<{
    id: string;
    bestVersion: string;
    alternatives: string[];
    metrics: AnalysisMetrics;
    outputMetrics: AnalysisMetrics;
    humanizationDelta: number;
    unchangedParagraphs: number;
    academicStyle: boolean;
  }> {
    const startTime = Date.now();
    const humanization = Math.max(0, Math.min(1, options.humanization ?? 0.5));

    const BACKEND_ADMIN_EMAILS = ['a15817348@gmail.com'];
    const isAdmin =
      subscriptionTier === 'admin' ||
      (!!userEmail && BACKEND_ADMIN_EMAILS.includes(userEmail.trim().toLowerCase()));

    const plain = stripHtml(text);
    const incomingWords = plain.trim().split(/\s+/).filter(Boolean).length;
    const billingAccount = userEmail
      ? await this.billingAccountRepo.findOne({ where: { email: userEmail.trim().toLowerCase() } })
      : null;
    const paidTier = this.resolvePaidTier(billingAccount);

    // ── Quota gate & word tracking (skip entirely for admin) ─────────────────
    let usageRow: FreeUsageEntity | null = null;
    if (!isAdmin) {
      if (paidTier && billingAccount) {
        await this.checkPaidQuota(billingAccount, incomingWords);
      } else if (!subscriptionTier) {
        // Free user — gate at 400 words and get row for tracking
        usageRow = await this.checkFreeQuota(userEmail, ipAddress, incomingWords, subscriptionTier);
      }
    }

    // Analyse input
    const metrics = await this.analyze(text);
    const { detectedLanguage } = metrics;

    const cacheHash = this.createHash({ action: 'rewrite_v17_paper_safe', text, options, humanization });
    const cached = await this.getFromCache<any>(cacheHash);

    let bestVersion: string;
    let alternatives: string[];
    let manuscriptId: string;
    let unchangedParagraphs = 0;
    let academicStyle = false;

    if (cached) {
      bestVersion = cached.bestVersion;
      alternatives = cached.alternatives;
      manuscriptId = cached.id;
      unchangedParagraphs = cached.unchangedParagraphs ?? 0;
      academicStyle = cached.academicStyle ?? false;
    } else {
      // ── AI humanizer: paragraph-level rewrite with validation ─────────────
      try {
        const result = await humanizeDocument(
          text,
          { tone: options.tone, strength: options.strength, humanization },
          (system, user, maxTokens) => this.completeHumanizer(system, user, maxTokens),
          {
            concurrency: 6,
            // Leave headroom under the serverless timeout for analysis and DB writes.
            deadline: Date.now() + 40_000,
            onAttempt: info => {
              if (info.error || info.problems.length) {
                this.logger.warn(`[humanize] paragraph ${info.block} attempt ${info.attempt}: ${info.error ?? info.problems.join('; ')}`);
              }
            },
          },
        );
        bestVersion = result.text;
        unchangedParagraphs = result.kept;
        academicStyle = result.academicStyle;
        this.logger.log(`[humanize] rewrote ${result.rewritten}/${result.total} paragraphs`);
      } catch (err) {
        if (err instanceof HumanizerUnavailableError) {
          const { HttpException } = await import('@nestjs/common');
          throw new HttpException(
            {
              statusCode: 503,
              error: 'Rewrite service busy',
              message: 'Our writing models are busy right now. Please try again in a minute. No words were deducted.',
            },
            503,
          );
        }
        throw err;
      }
      alternatives = [];

      const manuscript = await this.manuscriptRepo.save({
        sourceText: text,
        optimizedText: bestVersion,
        metrics: metrics as any,
        tone: options.tone,
        strength: options.strength,
        targetGradeLevel: options.targetGradeLevel,
        language: detectedLanguage,
        sectionType: options.sectionType || SectionType.GENERAL,
        title: plain.slice(0, 60) + (plain.length > 60 ? '…' : ''),
      });
      manuscriptId = manuscript.id;

      await this.setCache(cacheHash, { id: manuscriptId, bestVersion, alternatives, unchangedParagraphs, academicStyle });
    }

    // ── Increment word usage counter (non-admin only) ────────────────────────
    if (!isAdmin && billingAccount && paidTier && paidTier !== 'unlimited') {
      billingAccount.wordBalance = Math.max(0, billingAccount.wordBalance - incomingWords);
      await this.billingAccountRepo.save(billingAccount);
    } else if (!isAdmin && usageRow) {
      usageRow.wordsUsed += incomingWords;
      await this.freeUsageRepo.save(usageRow);
    }

    // Re-analyse output so the frontend can show before/after AI-risk
    const outputMetrics = await this.analyze(bestVersion);
    const humanizationDelta = metrics.aiDetectionRisk - outputMetrics.aiDetectionRisk;

    const latencyMs = Date.now() - startTime;
    await this.usageLogRepo.save({
      modelUsed: 'llm-humanizer',
      promptTokens: text.length / 4,
      completionTokens: bestVersion.length / 4,
      totalTokens: (text.length + bestVersion.length) / 4,
      latencyMs,
      manuscript: { id: manuscriptId } as any,
    });

    return { id: manuscriptId, bestVersion, alternatives, metrics, outputMetrics, humanizationDelta, unchangedParagraphs, academicStyle };
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

  async getFreeUsage(email: string): Promise<{ wordsUsed: number; limit: number }> {
    const row = await this.freeUsageRepo.findOne({ where: { email } });
    return { wordsUsed: row?.wordsUsed ?? 0, limit: this.FREE_WORD_LIMIT };
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

  async generateDraft(paperType: string, wordCount: string, prompt: string): Promise<{ text: string }> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const typeLabel: Record<string, string> = {
      essay: 'essay', research: 'research paper', report: 'report',
      blog: 'blog post', email: 'professional email', summary: 'summary',
      analysis: 'analysis', proposal: 'proposal',
    };
    const label = typeLabel[paperType] ?? paperType;
    const fullPrompt = `You are an AI writing assistant. Write a ${label} of approximately ${wordCount} words about the following topic. Use proper structure, transitions, and formal language appropriate for the document type. Output ONLY the content itself — no meta-commentary, no preamble, no closing notes.\n\nTopic: ${prompt.trim()}`;

    const callGemini = async (model: string): Promise<string> => {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: fullPrompt }] }],
            generationConfig: { temperature: 0.75, maxOutputTokens: 4096 },
          }),
        },
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({})) as any;
        throw new Error(`Gemini error (${model}) ${res.status}: ${err?.error?.message || 'unknown'}`);
      }
      const data = await res.json() as any;
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) throw new Error(`No content from Gemini (${model})`);
      return text.trim();
    };

    const models = [
      this.configService.get<string>('GEMINI_DRAFT_MODEL') || 'gemini-3.1-flash-lite',
      this.configService.get<string>('GEMINI_DRAFT_FALLBACK_MODEL') || 'gemini-2.5-flash',
      'gemini-2.5-flash-lite',
    ];

    let lastError: unknown;
    for (const model of models) {
      try {
        return { text: await callGemini(model) };
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError instanceof Error ? lastError : new Error('Gemini draft generation failed');
  }

  private groqBlockedUntil = 0;

  /**
   * One humanizer completion: Groq first (fast), then Gemini, then the optional
   * extra provider when both are rate-limited or failing.
   */
  private async completeHumanizer(system: string, user: string, maxTokens: number): Promise<string> {
    if (this.configService.get<string>('GROQ_API_KEY') && Date.now() >= this.groqBlockedUntil) {
      try {
        return await this.callGroqChat(system, user, maxTokens);
      } catch (err) {
        this.logger.warn(`[humanize] Groq failed, using Gemini: ${err instanceof Error ? err.message : err}`);
      }
    }
    if (!this.configService.get<string>('EXTRA_LLM_BASE_URL')) {
      return this.callGeminiChat(system, user, maxTokens);
    }
    try {
      return await this.callGeminiChat(system, user, maxTokens);
    } catch (err) {
      this.logger.warn(`[humanize] Gemini failed, using the extra provider: ${err instanceof Error ? err.message : err}`);
      return this.callExtraChat(system, user, maxTokens);
    }
  }

  /**
   * Overflow capacity from any OpenAI-compatible endpoint (Cerebras, OpenRouter,
   * Mistral, GitHub Models, or a self-hosted llama-server), set with
   * EXTRA_LLM_BASE_URL (for example https://api.cerebras.ai/v1), EXTRA_LLM_MODEL,
   * and EXTRA_LLM_API_KEY.
   */
  private async callExtraChat(system: string, user: string, maxTokens: number): Promise<string> {
    const baseUrl = this.configService.get<string>('EXTRA_LLM_BASE_URL');
    const model = this.configService.get<string>('EXTRA_LLM_MODEL');
    if (!baseUrl || !model) throw new Error('EXTRA_LLM_BASE_URL and EXTRA_LLM_MODEL must both be set');
    const apiKey = this.configService.get<string>('EXTRA_LLM_API_KEY');

    const res = await fetch(`${baseUrl.replace(/\/+$/, '')}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(apiKey ? { Authorization: `Bearer ${apiKey}` } : {}),
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: maxTokens,
      }),
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(`Extra provider error ${res.status} (${model}): ${err?.error?.message || 'unknown'}`);
    }
    const data = await res.json() as any;
    const choice = data?.choices?.[0];
    if (choice?.finish_reason === 'length') throw new Error(`Extra provider output truncated (${model})`);
    const result = choice?.message?.content;
    if (!result) throw new Error(`No content returned from the extra provider (${model})`);
    return String(result).trim();
  }

  private async callGroqChat(system: string, user: string, maxTokens: number): Promise<string> {
    const apiKey = this.configService.get<string>('GROQ_API_KEY');
    if (!apiKey) throw new Error('GROQ_API_KEY not set');
    const model = this.configService.get<string>('GROQ_HUMANIZE_MODEL') || 'openai/gpt-oss-120b';
    // gpt-oss reasoning tokens count against max_completion_tokens; keep reasoning short and hidden.
    const reasoning = /gpt-oss/i.test(model) ? { reasoning_effort: 'low', include_reasoning: false } : {};

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: user },
        ],
        temperature: 0.9,
        top_p: 0.95,
        max_completion_tokens: maxTokens,
        ...reasoning,
      }),
      signal: AbortSignal.timeout(30000),
    });

    if (res.status === 429) {
      // The org shares one tokens-per-minute budget; stop hammering it until it refills.
      const retryAfter = Number(res.headers.get('retry-after')) || 10;
      this.groqBlockedUntil = Date.now() + Math.min(retryAfter, 60) * 1000;
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({})) as any;
      throw new Error(`Groq API error ${res.status} (${model}): ${err?.error?.message || 'unknown'}`);
    }

    const data = await res.json() as any;
    const choice = data?.choices?.[0];
    if (choice?.finish_reason === 'length') throw new Error(`Groq output truncated (${model})`);
    const result = choice?.message?.content;
    if (!result) throw new Error(`No content returned from Groq (${model})`);
    return result.trim();
  }

  private async callGeminiChat(system: string, user: string, maxTokens: number): Promise<string> {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY not set');

    const models = [...new Set([
      this.configService.get<string>('GEMINI_HUMANIZE_MODEL') || 'gemini-3.1-flash-lite',
      this.configService.get<string>('GEMINI_HUMANIZE_FALLBACK_MODEL') || 'gemini-2.5-flash-lite',
    ])];

    let lastError: unknown;
    for (const model of models) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: system }] },
              contents: [{ role: 'user', parts: [{ text: user }] }],
              generationConfig: { temperature: 0.9, maxOutputTokens: maxTokens },
            }),
            signal: AbortSignal.timeout(25000),
          },
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({})) as any;
          throw new Error(`Gemini API error (${model}) ${res.status}: ${err?.error?.message || 'unknown'}`);
        }
        const data = await res.json() as any;
        const candidate = data?.candidates?.[0];
        if (candidate?.finishReason === 'MAX_TOKENS') throw new Error(`Gemini output truncated (${model})`);
        const result = (candidate?.content?.parts ?? []).map((p: any) => p.text ?? '').join('');
        if (!result) throw new Error(`No content returned from Gemini (${model})`);
        return result.trim();
      } catch (error) {
        lastError = error;
        this.logger.warn(`[humanize] ${error instanceof Error ? error.message : error}`);
      }
    }
    throw lastError instanceof Error ? lastError : new Error('Gemini humanize failed');
  }

  private async callOpenAI(messages: any[], json = false, retries = 3): Promise<string> {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    if (!apiKey || apiKey === 'your_openai_api_key_here') {
      throw new Error('OpenAI API key is not configured. Add OPENAI_API_KEY=sk-... to backend/.env and restart the server.');
    }
    if (!this.openai) {
      this.openai = new OpenAI({ apiKey });
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
