import { createConnection, getRepository } from 'typeorm';
import { OrganizationEntity } from '../rewrite/entities/organization.entity';
import { TeamEntity } from '../rewrite/entities/team.entity';
import { StyleProfileEntity } from '../rewrite/entities/style-profile.entity';

async function seed() {
  const connection = await createConnection();

  const orgRepo = getRepository(OrganizationEntity);
  const acme = orgRepo.create({ name: 'Acme Corp', domain: 'acme.com' });
  await orgRepo.save(acme);

  const teamRepo = getRepository(TeamEntity);
  const engineering = teamRepo.create({ name: 'Engineering', organization: acme });
  await teamRepo.save(engineering);

  const styleRepo = getRepository(StyleProfileEntity);
  await styleRepo.save(
    styleRepo.create({
      name: 'Executive Precision',
      description: 'Concise, data-driven, and authoritative.',
      adjectiveLevel: 0.2,
      sentenceComplexity: 0.8,
      preferredTransitions: ['however', 'therefore'],
      toneDescriptors: ['formal', 'direct'],
      contractionRate: 'low',
      vocabularyBand: 'sophisticated',
      metrics: { repetitionScore: 0.1, humanityScore: 0.95 },
    }),
  );

  console.log('Seed complete.');
  await connection.close();
}

seed().catch(err => console.error(err));
