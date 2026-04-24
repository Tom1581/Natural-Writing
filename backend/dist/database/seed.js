"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const organization_entity_1 = require("../rewrite/entities/organization.entity");
const team_entity_1 = require("../rewrite/entities/team.entity");
const style_profile_entity_1 = require("../rewrite/entities/style-profile.entity");
async function seed() {
    const connection = await (0, typeorm_1.createConnection)();
    const orgRepo = (0, typeorm_1.getRepository)(organization_entity_1.OrganizationEntity);
    const acme = orgRepo.create({ name: 'Acme Corp', domain: 'acme.com' });
    await orgRepo.save(acme);
    const teamRepo = (0, typeorm_1.getRepository)(team_entity_1.TeamEntity);
    const engineering = teamRepo.create({ name: 'Engineering', organization: acme });
    await teamRepo.save(engineering);
    const styleRepo = (0, typeorm_1.getRepository)(style_profile_entity_1.StyleProfileEntity);
    await styleRepo.save(styleRepo.create({
        name: 'Executive Precision',
        description: 'Concise, data-driven, and authoritative.',
        adjectiveLevel: 0.2,
        sentenceComplexity: 0.8,
        preferredTransitions: ['however', 'therefore'],
        toneDescriptors: ['formal', 'direct'],
        contractionRate: 'low',
        vocabularyBand: 'sophisticated',
        metrics: { repetitionScore: 0.1, humanityScore: 0.95 },
    }));
    console.log('Seed complete.');
    await connection.close();
}
seed().catch(err => console.error(err));
//# sourceMappingURL=seed.js.map