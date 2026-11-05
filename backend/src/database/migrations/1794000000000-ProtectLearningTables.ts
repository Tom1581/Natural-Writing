import { MigrationInterface, QueryRunner } from 'typeorm';

const learningTables = [
  'learning_ai_usage',
  'learning_assignments',
  'learning_audit_events',
  'learning_authorizations',
  'learning_class_members',
  'learning_classes',
  'learning_content_reviews',
  'learning_drafts',
  'learning_evaluation_jobs',
  'learning_evaluations',
  'learning_learners',
  'learning_org_members',
  'learning_organizations',
  'learning_overrides',
  'learning_safety_flags',
  'learning_skill_evidence',
  'learning_submissions',
] as const;

/** Learning records are accessed only through the API, never Supabase's Data API. */
export class ProtectLearningTables1794000000000 implements MigrationInterface {
  name = 'ProtectLearningTables1794000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const table of learningTables) {
      await queryRunner.query(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY`);
      await queryRunner.query(
        `REVOKE ALL ON TABLE public."${table}" FROM anon, authenticated`,
      );
    }
  }

  // Deliberately retain access restrictions if this migration is rolled back.
  public async down(): Promise<void> {}
}
