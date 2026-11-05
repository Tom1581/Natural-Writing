import { MigrationInterface, QueryRunner, Table, TableIndex } from 'typeorm';

const id = {
  name: 'id',
  type: 'uuid',
  isPrimary: true,
  isGenerated: true,
  generationStrategy: 'uuid' as const,
  default: 'gen_random_uuid()',
};
const createdAt = { name: 'createdAt', type: 'timestamp', default: 'now()' };
const updatedAt = { name: 'updatedAt', type: 'timestamp', default: 'now()' };

/** Creates the K–12 learning tables. Existing converter tables are not touched. */
export class LearningTables1793577600000 implements MigrationInterface {
  name = 'LearningTables1793577600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'learning_learners',
        columns: [
          id,
          { name: 'ownerSubject', type: 'text' },
          { name: 'displayName', type: 'text' },
          { name: 'gradeLevel', type: 'text' },
          { name: 'curriculum', type: 'text', default: "'us-ccss'" },
          { name: 'accessCodeHash', type: 'text', isNullable: true },
          { name: 'accessCodeCreatedAt', type: 'timestamp', isNullable: true },
          { name: 'sessionsPerWeek', type: 'int', default: 3 },
          { name: 'interests', type: 'text', isNullable: true },
          { name: 'focusSkillId', type: 'text', isNullable: true },
          { name: 'planStartedAt', type: 'timestamp', isNullable: true },
          { name: 'drillCompletions', type: 'text', isNullable: true },
          { name: 'organizationId', type: 'uuid', isNullable: true },
          { name: 'supports', type: 'text', isNullable: true },
          createdAt,
          updatedAt,
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_learners',
      new TableIndex({ columnNames: ['ownerSubject'] }),
    );
    await queryRunner.createIndex(
      'learning_learners',
      new TableIndex({ columnNames: ['accessCodeHash'], isUnique: true }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_authorizations',
        columns: [
          id,
          { name: 'learnerId', type: 'uuid' },
          { name: 'grantedBySubject', type: 'text' },
          { name: 'relationship', type: 'text' },
          { name: 'noticeVersion', type: 'text' },
          { name: 'grantedAt', type: 'timestamp', default: 'now()' },
          { name: 'revokedAt', type: 'timestamp', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['learnerId'],
            referencedTableName: 'learning_learners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_authorizations',
      new TableIndex({ columnNames: ['learnerId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_drafts',
        columns: [
          id,
          { name: 'learnerId', type: 'uuid' },
          { name: 'promptId', type: 'text' },
          { name: 'promptVersion', type: 'int' },
          { name: 'content', type: 'text', default: "''" },
          { name: 'planning', type: 'text', isNullable: true },
          { name: 'revision', type: 'int', default: 0 },
          { name: 'coachUses', type: 'int', default: 0 },
          { name: 'coachWindowStart', type: 'timestamp', isNullable: true },
          { name: 'coachUsedSinceSubmit', type: 'boolean', default: false },
          { name: 'dictationUsedSinceSubmit', type: 'boolean', default: false },
          createdAt,
          updatedAt,
        ],
        foreignKeys: [
          {
            columnNames: ['learnerId'],
            referencedTableName: 'learning_learners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_drafts',
      new TableIndex({
        columnNames: ['learnerId', 'promptId'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_submissions',
        columns: [
          id,
          { name: 'learnerId', type: 'uuid' },
          { name: 'draftId', type: 'uuid' },
          { name: 'draftRevision', type: 'int' },
          { name: 'promptId', type: 'text' },
          { name: 'promptVersion', type: 'int' },
          { name: 'rubricId', type: 'text' },
          { name: 'rubricVersion', type: 'int' },
          { name: 'text', type: 'text' },
          { name: 'attemptNumber', type: 'int' },
          { name: 'assistanceMode', type: 'text', default: "'independent'" },
          { name: 'inputMode', type: 'text', default: "'typed'" },
          { name: 'reflection', type: 'text', isNullable: true },
          { name: 'inPortfolio', type: 'boolean', default: false },
          { name: 'helpfulness', type: 'text', isNullable: true },
          { name: 'feedbackReport', type: 'text', isNullable: true },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['learnerId'],
            referencedTableName: 'learning_learners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['draftId'],
            referencedTableName: 'learning_drafts',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_submissions',
      new TableIndex({ columnNames: ['learnerId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_evaluation_jobs',
        columns: [
          id,
          { name: 'submissionId', type: 'uuid' },
          { name: 'idempotencyKey', type: 'text' },
          { name: 'state', type: 'text', default: "'queued'" },
          { name: 'attempts', type: 'int', default: 0 },
          { name: 'nextAttemptAt', type: 'timestamp' },
          { name: 'leaseUntil', type: 'timestamp', isNullable: true },
          { name: 'failureCode', type: 'text', isNullable: true },
          createdAt,
          updatedAt,
        ],
        foreignKeys: [
          {
            columnNames: ['submissionId'],
            referencedTableName: 'learning_submissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_evaluation_jobs',
      new TableIndex({ columnNames: ['submissionId'], isUnique: true }),
    );
    await queryRunner.createIndex(
      'learning_evaluation_jobs',
      new TableIndex({ columnNames: ['idempotencyKey'], isUnique: true }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_evaluations',
        columns: [
          id,
          { name: 'submissionId', type: 'uuid' },
          { name: 'model', type: 'text' },
          { name: 'templateVersion', type: 'text' },
          { name: 'rubricId', type: 'text' },
          { name: 'rubricVersion', type: 'int' },
          { name: 'result', type: 'text' },
          { name: 'checks', type: 'text', isNullable: true },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['submissionId'],
            referencedTableName: 'learning_submissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_evaluations',
      new TableIndex({ columnNames: ['submissionId'], isUnique: true }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_skill_evidence',
        columns: [
          id,
          { name: 'learnerId', type: 'uuid' },
          { name: 'skillId', type: 'text' },
          { name: 'submissionId', type: 'uuid' },
          { name: 'promptId', type: 'text' },
          { name: 'rubricId', type: 'text' },
          { name: 'rubricVersion', type: 'int' },
          { name: 'rating', type: 'int' },
          { name: 'independent', type: 'boolean' },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['learnerId'],
            referencedTableName: 'learning_learners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['submissionId'],
            referencedTableName: 'learning_submissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_skill_evidence',
      new TableIndex({ columnNames: ['learnerId'] }),
    );
    await queryRunner.createIndex(
      'learning_skill_evidence',
      new TableIndex({
        columnNames: ['submissionId', 'skillId'],
        isUnique: true,
      }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_classes',
        columns: [
          id,
          { name: 'ownerSubject', type: 'text' },
          { name: 'name', type: 'text' },
          { name: 'organizationId', type: 'uuid', isNullable: true },
          createdAt,
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_classes',
      new TableIndex({ columnNames: ['ownerSubject'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_class_members',
        columns: [
          id,
          { name: 'classId', type: 'uuid' },
          { name: 'learnerId', type: 'uuid' },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['classId'],
            referencedTableName: 'learning_classes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['learnerId'],
            referencedTableName: 'learning_learners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_class_members',
      new TableIndex({ columnNames: ['classId', 'learnerId'], isUnique: true }),
    );
    await queryRunner.createIndex(
      'learning_class_members',
      new TableIndex({ columnNames: ['learnerId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_assignments',
        columns: [
          id,
          { name: 'classId', type: 'uuid' },
          { name: 'promptId', type: 'text' },
          { name: 'lessonId', type: 'text', isNullable: true },
          { name: 'note', type: 'text', isNullable: true },
          { name: 'dueDate', type: 'text', isNullable: true },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['classId'],
            referencedTableName: 'learning_classes',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_assignments',
      new TableIndex({ columnNames: ['classId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_overrides',
        columns: [
          id,
          { name: 'submissionId', type: 'uuid' },
          { name: 'skillId', type: 'text' },
          { name: 'kind', type: 'text', default: "'correction'" },
          { name: 'originalRating', type: 'int', isNullable: true },
          { name: 'rating', type: 'int', isNullable: true },
          { name: 'comment', type: 'text' },
          { name: 'authorSubject', type: 'text' },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['submissionId'],
            referencedTableName: 'learning_submissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_overrides',
      new TableIndex({ columnNames: ['submissionId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_safety_flags',
        columns: [
          id,
          { name: 'submissionId', type: 'uuid' },
          { name: 'learnerId', type: 'uuid' },
          { name: 'source', type: 'text' },
          { name: 'level', type: 'text' },
          { name: 'category', type: 'text' },
          { name: 'reason', type: 'text' },
          { name: 'status', type: 'text', default: "'open'" },
          { name: 'resolvedBySubject', type: 'text', isNullable: true },
          { name: 'resolvedAt', type: 'timestamp', isNullable: true },
          { name: 'resolutionNote', type: 'text', isNullable: true },
          createdAt,
        ],
        foreignKeys: [
          {
            columnNames: ['submissionId'],
            referencedTableName: 'learning_submissions',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
          {
            columnNames: ['learnerId'],
            referencedTableName: 'learning_learners',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_safety_flags',
      new TableIndex({ columnNames: ['submissionId'] }),
    );
    await queryRunner.createIndex(
      'learning_safety_flags',
      new TableIndex({ columnNames: ['learnerId'] }),
    );

    await queryRunner.createIndex(
      'learning_learners',
      new TableIndex({ columnNames: ['organizationId'] }),
    );
    await queryRunner.createIndex(
      'learning_classes',
      new TableIndex({ columnNames: ['organizationId'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_organizations',
        columns: [
          id,
          { name: 'name', type: 'text' },
          { name: 'curriculum', type: 'text', default: "'us-ccss'" },
          { name: 'createdBySubject', type: 'text' },
          createdAt,
        ],
      }),
      true,
    );
    await queryRunner.createTable(
      new Table({
        name: 'learning_org_members',
        columns: [
          id,
          { name: 'organizationId', type: 'uuid' },
          { name: 'email', type: 'text' },
          { name: 'subject', type: 'text', isNullable: true },
          { name: 'role', type: 'text' },
          { name: 'status', type: 'text', default: "'invited'" },
          { name: 'invitedBySubject', type: 'text' },
          createdAt,
          { name: 'joinedAt', type: 'timestamp', isNullable: true },
          { name: 'removedAt', type: 'timestamp', isNullable: true },
        ],
        foreignKeys: [
          {
            columnNames: ['organizationId'],
            referencedTableName: 'learning_organizations',
            referencedColumnNames: ['id'],
            onDelete: 'CASCADE',
          },
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_org_members',
      new TableIndex({
        columnNames: ['organizationId', 'email'],
        isUnique: true,
      }),
    );
    await queryRunner.createIndex(
      'learning_org_members',
      new TableIndex({ columnNames: ['organizationId'] }),
    );
    await queryRunner.createIndex(
      'learning_org_members',
      new TableIndex({ columnNames: ['email'] }),
    );
    await queryRunner.createIndex(
      'learning_org_members',
      new TableIndex({ columnNames: ['subject'] }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'learning_audit_events',
        columns: [
          id,
          { name: 'organizationId', type: 'uuid', isNullable: true },
          { name: 'actorSubject', type: 'text' },
          { name: 'action', type: 'text' },
          { name: 'targetType', type: 'text', isNullable: true },
          { name: 'targetId', type: 'text', isNullable: true },
          { name: 'detail', type: 'text', isNullable: true },
          createdAt,
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_audit_events',
      new TableIndex({ columnNames: ['organizationId'] }),
    );

    // Token counts per AI call, for the daily budget and cost tracking. No text is stored.
    await queryRunner.createTable(
      new Table({
        name: 'learning_ai_usage',
        columns: [
          id,
          { name: 'purpose', type: 'text' },
          { name: 'learnerId', type: 'uuid', isNullable: true },
          { name: 'ownerKey', type: 'text', isNullable: true },
          { name: 'model', type: 'text' },
          { name: 'promptTokens', type: 'int', default: 0 },
          { name: 'completionTokens', type: 'int', default: 0 },
          { name: 'measured', type: 'boolean', default: true },
          { name: 'outcome', type: 'text' },
          createdAt,
        ],
      }),
      true,
    );
    await queryRunner.createTable(
      new Table({
        name: 'learning_content_reviews',
        columns: [
          id,
          { name: 'itemType', type: 'text' },
          { name: 'itemId', type: 'text' },
          { name: 'itemVersion', type: 'int' },
          { name: 'reviewerSubject', type: 'text' },
          { name: 'reviewerName', type: 'text' },
          { name: 'reviewerRole', type: 'text' },
          { name: 'decision', type: 'text' },
          { name: 'notes', type: 'text', default: "''" },
          createdAt,
        ],
      }),
      true,
    );
    await queryRunner.createIndex(
      'learning_content_reviews',
      new TableIndex({ columnNames: ['itemId'] }),
    );
    for (const column of ['learnerId', 'ownerKey', 'createdAt'])
      await queryRunner.createIndex(
        'learning_ai_usage',
        new TableIndex({ columnNames: [column] }),
      );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    for (const table of [
      'learning_content_reviews',
      'learning_ai_usage',
      'learning_audit_events',
      'learning_org_members',
      'learning_organizations',
      'learning_safety_flags',
      'learning_overrides',
      'learning_assignments',
      'learning_class_members',
      'learning_classes',
      'learning_skill_evidence',
      'learning_evaluations',
      'learning_evaluation_jobs',
      'learning_submissions',
      'learning_drafts',
      'learning_authorizations',
      'learning_learners',
    ]) {
      await queryRunner.dropTable(table, true);
    }
  }
}
