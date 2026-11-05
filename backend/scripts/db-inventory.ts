/**
 * Read-only inventory of the live database, to run before the first Writing Studio deploy:
 *
 *   DATABASE_URL=postgres://... npm run db:inventory
 *
 * It lists tables and approximate row counts, whether the learning tables and the migrations
 * table exist, and the schema changes the code would expect. It never writes: the session is
 * set to read-only, and pending changes are only printed, not applied.
 */
import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { LEARNING_ENTITIES } from '../src/learning/entities';
import { BillingAccountEntity } from '../src/rewrite/entities/billing-account.entity';
import { CacheEntity } from '../src/rewrite/entities/cache.entity';
import { CommentEntity } from '../src/rewrite/entities/comment.entity';
import { FreeUsageEntity } from '../src/rewrite/entities/free-usage.entity';
import { ManuscriptEntity } from '../src/rewrite/entities/manuscript.entity';
import { OrganizationEntity } from '../src/rewrite/entities/organization.entity';
import { ProjectEntity } from '../src/rewrite/entities/project.entity';
import { StyleProfileEntity } from '../src/rewrite/entities/style-profile.entity';
import { TeamEntity } from '../src/rewrite/entities/team.entity';
import { UsageLogEntity } from '../src/rewrite/entities/usage-log.entity';
import { UserEntity } from '../src/rewrite/entities/user.entity';
import { VersionEntity } from '../src/rewrite/entities/version.entity';

dotenv.config({ path: '.env', quiet: true });
const url = process.env.DATABASE_URL?.trim();
if (!url) {
  console.error('Set DATABASE_URL to the database you want to inspect.');
  process.exit(1);
}

(async () => {
  const ds = new DataSource({
    type: 'postgres',
    url,
    // Supabase requires TLS; a local test database can opt out with ?sslmode=disable.
    ssl: /sslmode=disable/.test(url)
      ? false
      : process.env.DATABASE_CA_CERT
        ? {
            ca: process.env.DATABASE_CA_CERT.replace(/\\n/g, '\n'),
            rejectUnauthorized: true,
          }
        : { rejectUnauthorized: false },
    entities: [
      StyleProfileEntity,
      ManuscriptEntity,
      CacheEntity,
      VersionEntity,
      ProjectEntity,
      UserEntity,
      CommentEntity,
      UsageLogEntity,
      FreeUsageEntity,
      BillingAccountEntity,
      OrganizationEntity,
      TeamEntity,
      ...LEARNING_ENTITIES,
    ],
    synchronize: false,
    migrationsRun: false,
    // One connection, so the read-only setting below covers every query; and no extension installs.
    extra: { max: 1 },
    installExtensions: false,
  });
  await ds.initialize();
  try {
    await ds.query('SET SESSION CHARACTERISTICS AS TRANSACTION READ ONLY');
    const tables: { table: string; rows: string }[] = await ds.query(
      `SELECT c.relname AS table, c.reltuples::bigint AS rows FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
       WHERE n.nspname = 'public' AND c.relkind = 'r' ORDER BY c.relname`,
    );
    console.log('\nTables in public schema (approximate rows):');
    for (const t of tables) console.log(`  ${t.table.padEnd(32)} ${t.rows}`);

    const names = new Set(tables.map((t) => t.table));
    const learning = LEARNING_ENTITIES.map((e) => ds.getMetadata(e).tableName);
    console.log(
      `\nLearning tables present: ${learning.filter((t) => names.has(t)).length} of ${learning.length}`,
    );
    console.log(
      `Migrations table present: ${names.has('migrations') ? 'yes' : 'no (created on first deploy)'}`,
    );
    if (names.has('migrations'))
      console.log(
        await ds.query(
          'SELECT name, timestamp FROM migrations ORDER BY timestamp',
        ),
      );

    const pending = (await ds.driver.createSchemaBuilder().log()).upQueries.map(
      (q) => q.query,
    );
    const converter = pending.filter((q) => !/"learning_/.test(q));
    console.log(
      `\nSchema differences for converter tables (should be none before deploying): ${converter.length}`,
    );
    for (const q of converter) console.log(`  ${q}`);
    console.log(
      `Schema statements for learning tables: ${pending.length - converter.length} (the learning migration creates these on deploy).`,
    );
  } finally {
    await ds.destroy();
  }
})().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
