import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StyleProfileEntity } from './entities/style-profile.entity';
import { ManuscriptEntity } from './entities/manuscript.entity';

@Injectable()
export class GenesisService {
  constructor(
    @InjectRepository(StyleProfileEntity)
    private readonly styleRepo: Repository<StyleProfileEntity>,
    @InjectRepository(ManuscriptEntity)
    private readonly manuscriptRepo: Repository<ManuscriptEntity>,
  ) {}

  async scaffoldOrganization(orgId: string, orgName: string): Promise<any> {
    const defaultProfile = this.styleRepo.create({
      name: `${orgName} Core Identity`,
      description: 'The foundational voice for the organization.',
      adjectiveLevel: 0.3,
      sentenceComplexity: 0.6,
      preferredTransitions: ['however', 'therefore', 'as a result'],
      toneDescriptors: ['professional', 'clear', 'authoritative'],
      contractionRate: 'low',
      vocabularyBand: 'sophisticated',
      metrics: { repetitionScore: 0.2, humanityScore: 0.9 },
    });
    await this.styleRepo.save(defaultProfile);

    const welcomeManuscript = this.manuscriptRepo.create({
      title: `Welcome to ${orgName} workspace`,
      sourceText: `Welcome to your Natural Writing workspace for ${orgName}. Paste any text into the editor and click Improve Text to get started.`,
      optimizedText: `Welcome to your Natural Writing workspace for ${orgName}. To get started, paste any piece of writing into the editor and click Improve Text. The AI will analyse the text and suggest improvements while preserving your key data points.`,
      styleProfile: defaultProfile,
    });
    await this.manuscriptRepo.save(welcomeManuscript);

    return {
      status: 'Workspace created',
      scaffoldedEntities: {
        styleProfiles: [defaultProfile.id],
        manuscripts: [welcomeManuscript.id],
      },
    };
  }
}
