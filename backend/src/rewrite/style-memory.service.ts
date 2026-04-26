import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import OpenAI from 'openai';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';

export interface StyleProfile {
  name: string;
  adjectiveLevel: number; // 0-1
  sentenceComplexity: number; // 0-1
  preferredTransitions: string[];
  toneDescriptors: string[];
  contractionRate: 'high' | 'medium' | 'low';
  vocabularyBand: 'common' | 'sophisticated' | 'academic';
}

@Injectable()
export class StyleMemoryService {
  private readonly openai: OpenAI | null;
  private readonly logger = new Logger(StyleMemoryService.name);

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(StyleProfileEntity)
    private readonly styleRepo: Repository<StyleProfileEntity>,
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
  ) {
    const apiKey = this.configService.get<string>('OPENAI_API_KEY');
    this.openai = apiKey && apiKey !== 'your_openai_api_key_here' ? new OpenAI({ apiKey }) : null;
  }

  async getStyleContext(orgId: string): Promise<string> {
    const profiles = await this.styleRepo.find();
    return profiles.map(p => `${p.name}: ${p.description || ''}`).join('\n');
  }

  async logFeedback(manuscriptId: string, aiText: string, humanText: string): Promise<void> {
    const manuscript = await this.manuscriptRepo.findOne({ where: { id: manuscriptId }, relations: ['styleProfile'] });
    if (!manuscript || !manuscript.styleProfile) return;

    // Simulated back-propagation: Adjust profile metrics based on human delta
    const aiLength = aiText.split(' ').length;
    const humanLength = humanText.split(' ').length;
    
    const profile = manuscript.styleProfile;
    if (!profile.metrics) profile.metrics = { repetitionScore: 0.5 };
    
    if (humanLength < aiLength) {
       profile.metrics.repetitionScore = Math.max(0, profile.metrics.repetitionScore - 0.01);
    } else {
       profile.metrics.repetitionScore = Math.min(1, profile.metrics.repetitionScore + 0.01);
    }

    await this.styleRepo.save(profile);
    console.log(`Singularity Back-propagation: Style DNA evolved for ${profile.name}`);
  }

  async profileStyle(sampleText: string, name: string = 'Current Writer'): Promise<StyleProfile> {
    if (!this.openai) {
      return this.profileStyleLocally(sampleText, name);
    }

    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `Analyze the author's writing style. Extract a detailed stylistic profile.
            Return JSON: {
              "name": "${name}",
              "adjectiveLevel": 0.0-1.0,
              "sentenceComplexity": 0.0-1.0,
              "preferredTransitions": ["..."],
              "toneDescriptors": ["..."],
              "contractionRate": "high"|"medium"|"low",
              "vocabularyBand": "common"|"sophisticated"|"academic"
            }`
          },
          { role: 'user', content: sampleText }
        ],
        response_format: { type: 'json_object' }
      });

      return JSON.parse(response.choices[0].message.content ?? '{}');
    } catch (error) {
      this.logger.error('Error profiling style:', error);
      throw error;
    }
  }

  private profileStyleLocally(sampleText: string, name: string): StyleProfile {
    const words = sampleText.trim().split(/\s+/).filter(Boolean);
    const sentences = sampleText.split(/[.!?]+/).map(s => s.trim()).filter(Boolean);
    const avgSentenceLength = sentences.length ? words.length / sentences.length : 0;
    const contractions = (sampleText.match(/\b\w+'(?:t|re|ve|ll|d|m|s)\b/gi) || []).length;
    const adjectiveHints = (sampleText.match(/\b\w+(?:ive|ous|ful|less|able|al|ic)\b/gi) || []).length;

    return {
      name,
      adjectiveLevel: Math.min(1, adjectiveHints / Math.max(words.length, 1) * 10),
      sentenceComplexity: Math.min(1, avgSentenceLength / 28),
      preferredTransitions: ['however', 'also', 'because'],
      toneDescriptors: avgSentenceLength > 24 ? ['formal', 'analytical'] : ['clear', 'conversational'],
      contractionRate: contractions / Math.max(sentences.length, 1) > 0.25 ? 'high' : contractions > 0 ? 'medium' : 'low',
      vocabularyBand: avgSentenceLength > 24 ? 'academic' : avgSentenceLength > 16 ? 'sophisticated' : 'common',
    };
  }
}
