import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { getRepositoryToken, TypeOrmModule } from '@nestjs/typeorm';
import { SignJWT } from 'jose';
import request from 'supertest';
import type { Repository } from 'typeorm';
import { getRubric } from './content';
import {
  AiUsageEntity,
  LEARNING_ENTITIES,
  LearnerAuthorizationEntity,
  SkillEvidenceEntity,
  SubmissionEntity,
} from './entities';
import {
  EVAL_LLM_PROVIDER,
  RateLimitedError,
  type ChatMessage,
  type EvalLlmClient,
} from './evaluator/llm-client';
import { LEARNING_NOTICE_VERSION } from './learning.dto';
import { LearningModule } from './learning.module';
import { RetentionService } from './retention.service';
import { GUEST_HOURLY_LIMIT } from './guest.service';

const SECRET = 'test-secret-for-hs256-tokens-only-0123456789';
const SUPABASE_URL = 'https://example.supabase.co';

async function tokenFor(subject: string) {
  return new SignJWT({ role: 'authenticated', email: `${subject}@example.com` })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(subject)
    .setIssuer(`${SUPABASE_URL}/auth/v1`)
    .setAudience('authenticated')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(SECRET));
}

/** Scripted stand-in for the model: each call takes the next response (a string or an error). */
class FakeEvalClient implements EvalLlmClient {
  readonly model = 'fake-model';
  calls: ChatMessage[][] = [];
  script: (string | Error)[] = [];
  async completeJson(messages: ChatMessage[]) {
    this.calls.push(messages);
    const next = this.script.shift();
    if (next === undefined)
      throw new Error('FakeEvalClient: no scripted response');
    if (next instanceof Error) throw next;
    return next;
  }
}

const ESSAY =
  'The spare room should go to the art club. The note says the art club needs a dry place to store work. Paintings can be ruined by rain, so a dry room matters more for art than for tools.';

function goodOutput(text = ESSAY, rating = 3) {
  const rubric = getRubric('g6-8-argument')!;
  const quote = text.split('.')[0];
  return JSON.stringify({
    summary:
      'Your recommendation is clear. Next, explain the other club’s needs.',
    dimensions: rubric.dimensions.map((d) => ({
      skillId: d.skillId,
      evidenceState: 'observed',
      rating,
      quotes: [quote],
      reason: 'Clear for this task.',
    })),
    strengths: [
      {
        skillId: 'purpose.claim',
        quote,
        message: 'Your recommendation is easy to find.',
      },
    ],
    nextSteps: [
      {
        skillId: 'development.evidence',
        message: 'Explain why the detail matters.',
        hint: 'What would happen to the art if the room were divided?',
      },
    ],
  });
}

describe('Learning API', () => {
  let app: INestApplication;
  let fake: FakeEvalClient;
  let alice: string;
  let bob: string;
  let carol: string;

  beforeAll(async () => {
    process.env.SUPABASE_JWT_SECRET = SECRET;
    process.env.SUPABASE_URL = SUPABASE_URL;
    process.env.ADMIN_EMAILS = 'alice@example.com';
    process.env.LEARNING_SESSION_SECRET =
      'learner-session-secret-for-tests-only-0123456789';
    fake = new FakeEvalClient();
    const moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true }),
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:',
          entities: LEARNING_ENTITIES,
          synchronize: true,
        }),
        LearningModule,
      ],
    })
      .overrideProvider(EVAL_LLM_PROVIDER)
      .useValue(fake)
      .compile();
    app = moduleRef.createNestApplication();
    await app.init();
    alice = await tokenFor('alice');
    bob = await tokenFor('bob');
    carol = await tokenFor('carol');
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    fake.calls = [];
    fake.script = [];
  });

  const api = () => request(app.getHttpServer());
  const as = (token: string) => ({ Authorization: `Bearer ${token}` });

  async function createLearner(
    token: string,
    localGrade = '7',
    curriculum = 'us-ccss',
  ) {
    const res = await api().post('/v1/learning/learners').set(as(token)).send({
      displayName: 'Sam',
      curriculum,
      localGrade,
      relationship: 'parent_guardian',
      agreeToNotice: true,
      noticeVersion: LEARNING_NOTICE_VERSION,
    });
    expect(res.status).toBe(201);
    return res.body.id as string;
  }

  async function writeAndSubmit(
    token: string,
    learnerId: string,
    promptId: string,
    text: string,
    key: string,
  ) {
    const draft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(token))
        .send({ learnerId, promptId })
    ).body;
    const saved = await api()
      .patch(`/v1/learning/drafts/${draft.id}`)
      .set(as(token))
      .send({ content: text, expectedRevision: draft.revision });
    expect(saved.status).toBe(200);
    const submitted = await api()
      .post('/v1/learning/submissions')
      .set(as(token))
      .send({
        draftId: draft.id,
        expectedRevision: saved.body.revision,
        idempotencyKey: key,
      });
    expect(submitted.status).toBe(202);
    return {
      draft,
      revision: saved.body.revision as number,
      job: submitted.body,
    };
  }

  it('serves the public catalog without a session', async () => {
    const res = await api().get('/v1/learning/catalog');
    expect(res.status).toBe(200);
    expect(res.body.lessons.length).toBeGreaterThan(0);
    expect(
      (await api().get('/v1/learning/lessons/g68-explain-your-evidence')).body
        .practicePrompt.id,
    ).toBe('g68-spare-room');
  });

  it('rejects missing, forged and wrong-audience tokens', async () => {
    expect((await api().get('/v1/learning/learners')).status).toBe(401);
    const forged = await new SignJWT({ role: 'authenticated' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('alice')
      .setIssuer(`${SUPABASE_URL}/auth/v1`)
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('wrong-secret-wrong-secret-wrong-secret'));
    expect(
      (await api().get('/v1/learning/learners').set(as(forged))).status,
    ).toBe(401);
    const anon = await new SignJWT({ role: 'anon' })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('alice')
      .setIssuer(`${SUPABASE_URL}/auth/v1`)
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode(SECRET));
    expect(
      (await api().get('/v1/learning/learners').set(as(anon))).status,
    ).toBe(401);
  });

  it('requires agreeing to the current notice and a supported grade', async () => {
    const base = {
      displayName: 'Sam',
      curriculum: 'us-ccss',
      localGrade: '7',
      relationship: 'parent_guardian',
      agreeToNotice: true,
      noticeVersion: LEARNING_NOTICE_VERSION,
    };
    expect(
      (
        await api()
          .post('/v1/learning/learners')
          .set(as(alice))
          .send({ ...base, agreeToNotice: false })
      ).status,
    ).toBe(400);
    expect(
      (
        await api()
          .post('/v1/learning/learners')
          .set(as(alice))
          .send({ ...base, noticeVersion: 'old' })
      ).status,
    ).toBe(400);
    expect(
      (
        await api()
          .post('/v1/learning/learners')
          .set(as(alice))
          .send({ ...base, localGrade: '13' })
      ).status,
    ).toBe(400);
    expect(
      (
        await api()
          .post('/v1/learning/learners')
          .set(as(alice))
          .send({ ...base, ownerSubject: 'bob' })
      ).status,
    ).toBe(400);
  });

  it('keeps every learner record private to the adult who owns it', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [goodOutput()];
    const { draft, job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'iso-key-0001',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));

    expect(
      (await api().get('/v1/learning/learners').set(as(bob))).body,
    ).toEqual([]);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/dashboard`)
          .set(as(bob))
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .post('/v1/learning/drafts')
          .set(as(bob))
          .send({ learnerId, promptId: 'g68-spare-room' })
      ).status,
    ).toBe(404);
    expect(
      (await api().get(`/v1/learning/drafts/${draft.id}`).set(as(bob))).status,
    ).toBe(404);
    expect(
      (
        await api()
          .patch(`/v1/learning/drafts/${draft.id}`)
          .set(as(bob))
          .send({ content: 'x', expectedRevision: 1 })
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .get(`/v1/learning/submissions/${job.submissionId}`)
          .set(as(bob))
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
          .set(as(bob))
      ).status,
    ).toBe(404);
    expect(
      (await api().delete(`/v1/learning/learners/${learnerId}`).set(as(bob)))
        .status,
    ).toBe(404);
  });

  it('blocks prompts from another grade band', async () => {
    const learnerId = await createLearner(alice, '4');
    expect(
      (
        await api()
          .post('/v1/learning/drafts')
          .set(as(alice))
          .send({ learnerId, promptId: 'g68-spare-room' })
      ).status,
    ).toBe(403);
  });

  it('detects autosave conflicts instead of overwriting newer work', async () => {
    const learnerId = await createLearner(alice);
    const draft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(alice))
        .send({ learnerId, promptId: 'g68-choice-period' })
    ).body;
    expect(
      (
        await api()
          .patch(`/v1/learning/drafts/${draft.id}`)
          .set(as(alice))
          .send({ content: 'tab one', expectedRevision: 0 })
      ).status,
    ).toBe(200);
    const stale = await api()
      .patch(`/v1/learning/drafts/${draft.id}`)
      .set(as(alice))
      .send({ content: 'tab two', expectedRevision: 0 });
    expect(stale.status).toBe(409);
    expect(stale.body.current.content).toBe('tab one');
  });

  it('evaluates once, stores anchored feedback and records evidence exactly once', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [goodOutput()];
    const { draft, revision, job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'once-key-0001',
    );

    const again = await api()
      .post('/v1/learning/submissions')
      .set(as(alice))
      .send({
        draftId: draft.id,
        expectedRevision: revision,
        idempotencyKey: 'once-key-0001',
      });
    expect(again.body.jobId).toBe(job.jobId);
    const doubleClick = await api()
      .post('/v1/learning/submissions')
      .set(as(alice))
      .send({
        draftId: draft.id,
        expectedRevision: revision,
        idempotencyKey: 'once-key-0002',
      });
    expect(doubleClick.body.jobId).toBe(job.jobId);

    const processed = await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    expect(processed.body.state).toBe('complete');
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    // One reading, plus the automatic second reading a short, highly rated piece gets.
    // Processing the job again makes no further calls.
    expect(fake.calls).toHaveLength(2);
    expect(fake.calls[1]).toEqual(fake.calls[0]);

    const submission = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(submission.feedback.model).toBe('fake-model');
    const q = submission.feedback.dimensions[0].evidence[0];
    expect(submission.text.slice(q.start, q.end)).toBe(q.quote);
    expect(submission.suggestedLesson.id).toBe('g68-explain-your-evidence');

    const evidence = app.get<Repository<SkillEvidenceEntity>>(
      getRepositoryToken(SkillEvidenceEntity),
    );
    const rows = await evidence.find({
      where: { submissionId: job.submissionId },
    });
    expect(rows).toHaveLength(getRubric('g6-8-argument')!.dimensions.length);
    expect(rows.every((r) => r.independent)).toBe(true);
  });

  it('rejects a reused idempotency key for different writing and an unsaved revision', async () => {
    const learnerId = await createLearner(alice);
    const { draft, revision } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-group-grades',
      ESSAY,
      'reuse-key-001',
    );
    const saved = await api()
      .patch(`/v1/learning/drafts/${draft.id}`)
      .set(as(alice))
      .send({ content: `${ESSAY} More.`, expectedRevision: revision });
    expect(
      (
        await api().post('/v1/learning/submissions').set(as(alice)).send({
          draftId: draft.id,
          expectedRevision: saved.body.revision,
          idempotencyKey: 'reuse-key-001',
        })
      ).status,
    ).toBe(409);
    expect(
      (
        await api().post('/v1/learning/submissions').set(as(alice)).send({
          draftId: draft.id,
          expectedRevision: revision,
          idempotencyKey: 'stale-key-001',
        })
      ).status,
    ).toBe(409);
  });

  it('marks revisions as revision practice, not independent evidence', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [goodOutput(ESSAY, 2)];
    const first = await writeAndSubmit(
      alice,
      learnerId,
      'g68-field-day',
      ESSAY,
      'rev-key-00001',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${first.job.jobId}/process`)
      .set(as(alice));

    const revised = `${ESSAY} Dividing the room would leave the art club too little space to dry paintings.`;
    const saved = await api()
      .patch(`/v1/learning/drafts/${first.draft.id}`)
      .set(as(alice))
      .send({ content: revised, expectedRevision: first.revision });
    const second = await api()
      .post('/v1/learning/submissions')
      .set(as(alice))
      .send({
        draftId: first.draft.id,
        expectedRevision: saved.body.revision,
        idempotencyKey: 'rev-key-00002',
      });
    fake.script = [goodOutput(revised, 4)];
    await api()
      .post(`/v1/learning/evaluation-jobs/${second.body.jobId}/process`)
      .set(as(alice));

    const submission = (
      await api()
        .get(`/v1/learning/submissions/${second.body.submissionId}`)
        .set(as(alice))
    ).body;
    expect(submission.attemptNumber).toBe(2);
    expect(submission.previousRatings['development.evidence']).toBe(2);
    const evidence = app.get<Repository<SkillEvidenceEntity>>(
      getRepositoryToken(SkillEvidenceEntity),
    );
    expect(
      (
        await evidence.find({
          where: { submissionId: second.body.submissionId },
        })
      ).every((r) => !r.independent),
    ).toBe(true);
    const dash = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/dashboard`)
        .set(as(alice))
    ).body;
    expect(
      dash.skills.find((s: any) => s.skillId === 'development.evidence')
        .latestRating,
    ).toBe(2);
  });

  it('repairs invented quotes once, then retries, then asks for review without fabricating feedback', async () => {
    const learnerId = await createLearner(alice);
    const invented = goodOutput().replace(
      /The spare room should go to the art club/g,
      'Art is the most important subject',
    );
    fake.script = [invented, goodOutput()];
    const ok = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'repair-key-01',
    );
    expect(
      (
        await api()
          .post(`/v1/learning/evaluation-jobs/${ok.job.jobId}/process`)
          .set(as(alice))
      ).body.state,
    ).toBe('complete');
    expect(fake.calls[1].at(-1)!.content).toContain('is not in the student');

    const learner2 = await createLearner(alice);
    const bad = await writeAndSubmit(
      alice,
      learner2,
      'g68-spare-room',
      ESSAY,
      'repair-key-02',
    );
    fake.script = Array(8).fill(invented);
    let state = '';
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => setTimeout(r, i === 0 ? 0 : 3100));
      state = (
        await api()
          .post(`/v1/learning/evaluation-jobs/${bad.job.jobId}/process`)
          .set(as(alice))
      ).body.state;
    }
    expect(state).toBe('needs_review');
    expect(
      (
        await api()
          .get(`/v1/learning/submissions/${bad.job.submissionId}`)
          .set(as(alice))
      ).body.feedback,
    ).toBeNull();
  }, 20000);

  it('re-queues on rate limits without spending an attempt', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [new RateLimitedError(30)];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'rate-key-0001',
    );
    const res = (
      await api()
        .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
        .set(as(alice))
    ).body;
    expect(res).toMatchObject({ state: 'queued', failureCode: 'rate_limited' });
    expect(res.retryInSeconds).toBeGreaterThan(20);
    // Not due yet: a second call does not hit the provider.
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    expect(fake.calls).toHaveLength(1);
  });

  it('does not call the model for writing that is too short', async () => {
    const learnerId = await createLearner(alice);
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      'The art club.',
      'short-key-001',
    );
    const res = (
      await api()
        .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
        .set(as(alice))
    ).body;
    expect(res).toMatchObject({
      state: 'not_scored',
      failureCode: 'too_short',
    });
    expect(fake.calls).toHaveLength(0);
  });

  it('stops queued work when the adult authorization is revoked', async () => {
    const learnerId = await createLearner(alice);
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'revoke-key-01',
    );
    await app
      .get<
        Repository<LearnerAuthorizationEntity>
      >(getRepositoryToken(LearnerAuthorizationEntity))
      .update({ learnerId }, { revokedAt: new Date() });
    const res = (
      await api()
        .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
        .set(as(alice))
    ).body;
    expect(res).toMatchObject({
      state: 'failed',
      failureCode: 'authorization_revoked',
    });
    expect(fake.calls).toHaveLength(0);
  });

  it('deletes a learner and all of their writing', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [goodOutput()];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'delete-key-01',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    expect(
      (await api().delete(`/v1/learning/learners/${learnerId}`).set(as(alice)))
        .status,
    ).toBe(200);
    expect(
      (
        await api()
          .get(`/v1/learning/submissions/${job.submissionId}`)
          .set(as(alice))
      ).status,
    ).toBe(404);
    const evidence = app.get<Repository<SkillEvidenceEntity>>(
      getRepositoryToken(SkillEvidenceEntity),
    );
    expect(await evidence.count({ where: { learnerId } })).toBe(0);
  });

  it('maps a local year to the right content band (England Year 7 = US grade 6)', async () => {
    const learnerId = await createLearner(alice, '7', 'uk-eng');
    const learners = (await api().get('/v1/learning/learners').set(as(alice)))
      .body;
    const created = learners.find((l: any) => l.id === learnerId);
    expect(created).toMatchObject({
      gradeLevel: '6',
      band: '6-8',
      gradeLabel: 'Year 7',
      curriculum: 'uk-eng',
    });
    expect(
      (
        await api().post('/v1/learning/learners').set(as(alice)).send({
          displayName: 'Ana',
          curriculum: 'uk-eng',
          localGrade: 'R',
          relationship: 'parent_guardian',
          agreeToNotice: true,
          noticeVersion: LEARNING_NOTICE_VERSION,
        })
      ).status,
    ).toBe(400);
    // Kindergarten to Grade 12 in every system, named the local way.
    const named = async (curriculum: string, localGrade: string) => {
      const id = await createLearner(alice, localGrade, curriculum);
      const all = (await api().get('/v1/learning/learners').set(as(alice)))
        .body;
      return all.find((l: any) => l.id === id);
    };
    expect(await named('uk-eng', '1')).toMatchObject({
      gradeLevel: 'K',
      band: 'K-2',
      gradeLabel: 'Year 1',
    });
    expect(await named('au-ac9', 'F')).toMatchObject({
      gradeLevel: 'K',
      band: 'K-2',
      gradeLabel: 'Foundation',
    });
    expect(await named('us-ccss', 'K')).toMatchObject({
      band: 'K-2',
      gradeLabel: 'Kindergarten',
    });
    expect(await named('uk-eng', '13')).toMatchObject({
      gradeLevel: '12',
      band: '11-12',
    });
    expect(await named('ca-on', '9')).toMatchObject({ band: '9-10' });
    // Ontario's Kindergarten program has no grade-level writing expectations.
    expect(
      (
        await api().post('/v1/learning/learners').set(as(alice)).send({
          displayName: 'Kit',
          curriculum: 'ca-on',
          localGrade: 'K',
          relationship: 'parent_guardian',
          agreeToNotice: true,
          noticeVersion: LEARNING_NOTICE_VERSION,
        })
      ).status,
    ).toBe(400);
  });

  it('gives students a code-based session limited to their own profile', async () => {
    const learnerId = await createLearner(alice);
    const other = await createLearner(alice);
    const bobsLearner = await createLearner(bob);
    const { code } = (
      await api()
        .post(`/v1/learning/learners/${learnerId}/access-code`)
        .set(as(alice))
    ).body;
    expect(code).toMatch(
      /^[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}-[2-9A-HJKMNP-Z]{4}$/,
    );
    expect(
      (
        await api()
          .post(`/v1/learning/learners/${bobsLearner}/access-code`)
          .set(as(alice))
      ).status,
    ).toBe(404);

    expect(
      (
        await api()
          .post('/v1/learning/student-sessions')
          .send({ code: 'AAAA-BBBB-CCCC' })
      ).status,
    ).toBe(401);
    const session = await api()
      .post('/v1/learning/student-sessions')
      .send({ code: code.toLowerCase().replace(/-/g, ' ') });
    expect(session.status).toBe(200);
    const student = session.body.token as string;

    expect(
      (await api().get('/v1/learning/me').set(as(student))).body,
    ).toMatchObject({ kind: 'learner', learnerId });
    expect(
      (await api().get('/v1/learning/learners').set(as(student))).body.map(
        (l: any) => l.id,
      ),
    ).toEqual([learnerId]);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/dashboard`)
          .set(as(student))
      ).status,
    ).toBe(200);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${other}/dashboard`)
          .set(as(student))
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .post('/v1/learning/drafts')
          .set(as(student))
          .send({ learnerId, promptId: 'g68-spare-room' })
      ).status,
    ).toBe(201);
    // Adult-only actions are refused for a student session.
    expect(
      (
        await api().post('/v1/learning/learners').set(as(student)).send({
          displayName: 'X',
          curriculum: 'us-ccss',
          localGrade: '7',
          relationship: 'parent_guardian',
          agreeToNotice: true,
          noticeVersion: LEARNING_NOTICE_VERSION,
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await api()
          .delete(`/v1/learning/learners/${learnerId}`)
          .set(as(student))
      ).status,
    ).toBe(403);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/export`)
          .set(as(student))
      ).status,
    ).toBe(403);
    expect(
      (await api().get('/v1/learning/classes').set(as(student))).status,
    ).toBe(403);

    // A new code replaces the old one.
    await api()
      .post(`/v1/learning/learners/${learnerId}/access-code`)
      .set(as(alice));
    expect(
      (await api().post('/v1/learning/student-sessions').send({ code })).status,
    ).toBe(401);
  });

  it('coaches a draft without scoring it, is off for check-ins, and marks the submission as coached', async () => {
    const learnerId = await createLearner(alice);
    const prompt = 'g68-library-hours';
    const draft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(alice))
        .send({ learnerId, promptId: prompt })
    ).body;
    const saved = await api()
      .patch(`/v1/learning/drafts/${draft.id}`)
      .set(as(alice))
      .send({ content: ESSAY, expectedRevision: draft.revision });
    fake.script = [
      JSON.stringify({
        criteria: [0, 1, 2, 3].map((index) => ({
          index,
          status: 'partly',
          tip: 'Which detail supports this best?',
        })),
        encouragement: 'Good start.',
      }),
    ];
    const coached = await api()
      .post(`/v1/learning/drafts/${draft.id}/coach`)
      .set(as(alice));
    expect(coached.status).toBe(200);
    expect(coached.body.criteria).toHaveLength(4);
    expect(coached.body.remaining).toBe(5);

    const checkIn = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(alice))
        .send({ learnerId, promptId: 'g68-choice-period' })
    ).body;
    await api()
      .patch(`/v1/learning/drafts/${checkIn.id}`)
      .set(as(alice))
      .send({ content: ESSAY, expectedRevision: checkIn.revision });
    expect(
      (
        await api()
          .post(`/v1/learning/drafts/${checkIn.id}/coach`)
          .set(as(alice))
      ).status,
    ).toBe(403);

    const submitted = await api()
      .post('/v1/learning/submissions')
      .set(as(alice))
      .send({
        draftId: draft.id,
        expectedRevision: saved.body.revision,
        idempotencyKey: 'coach-key-001',
      });
    fake.script = [goodOutput()];
    await api()
      .post(`/v1/learning/evaluation-jobs/${submitted.body.jobId}/process`)
      .set(as(alice));
    const view = (
      await api()
        .get(`/v1/learning/submissions/${submitted.body.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.assistanceMode).toBe('coached');
    const evidence = app.get<Repository<SkillEvidenceEntity>>(
      getRepositoryToken(SkillEvidenceEntity),
    );
    expect(
      (
        await evidence.find({
          where: { submissionId: submitted.body.submissionId },
        })
      ).every((r) => !r.independent),
    ).toBe(true);
  });

  it('lets a teacher assign work, review it and correct a rating; others cannot', async () => {
    const learnerId = await createLearner(alice);
    const cls = (
      await api()
        .post('/v1/learning/classes')
        .set(as(alice))
        .send({ name: 'Room 7B' })
    ).body;
    expect(
      (
        await api()
          .post(`/v1/learning/classes/${cls.id}/members/${learnerId}`)
          .set(as(alice))
      ).status,
    ).toBe(201);
    expect(
      (
        await api()
          .post(`/v1/learning/classes/${cls.id}/members/${learnerId}`)
          .set(as(bob))
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .post(`/v1/learning/classes/${cls.id}/assignments`)
          .set(as(alice))
          .send({
            promptId: 'g68-spare-room',
            lessonId: 'g68-explain-your-evidence',
            dueDate: '2026-11-20',
          })
      ).status,
    ).toBe(201);
    expect(
      (
        await api()
          .post(`/v1/learning/classes/${cls.id}/assignments`)
          .set(as(alice))
          .send({
            promptId: 'g68-spare-room',
            lessonId: 'g35-reasons-with-examples',
          })
      ).status,
    ).toBe(400);

    const dash = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/dashboard`)
        .set(as(alice))
    ).body;
    expect(dash.assignments[0]).toMatchObject({
      promptId: 'g68-spare-room',
      dueDate: '2026-11-20',
      submitted: false,
    });
    expect(dash.checkIn).toEqual({ done: 0, total: 2 });

    fake.script = [goodOutput(ESSAY, 2)];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'teach-key-001',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    await api()
      .post(`/v1/learning/submissions/${job.submissionId}/feedback-report`)
      .set(as(alice))
      .send({ reason: 'The evidence quote was fine.' });

    const queue = (
      await api().get(`/v1/learning/review?classId=${cls.id}`).set(as(alice))
    ).body;
    expect(queue[0]).toMatchObject({
      submissionId: job.submissionId,
      needsAttention: ['Student reported the feedback'],
    });
    expect((await api().get('/v1/learning/review').set(as(bob))).body).toEqual(
      [],
    );

    expect(
      (
        await api()
          .post(`/v1/learning/submissions/${job.submissionId}/overrides`)
          .set(as(bob))
          .send({ skillId: 'development.evidence', rating: 4, comment: 'x' })
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .post(`/v1/learning/submissions/${job.submissionId}/overrides`)
          .set(as(alice))
          .send({ skillId: 'grade.equivalent', rating: 4, comment: 'x' })
      ).status,
    ).toBe(400);
    expect(
      (
        await api()
          .post(`/v1/learning/submissions/${job.submissionId}/overrides`)
          .set(as(alice))
          .send({
            skillId: 'development.evidence',
            rating: 3,
            comment: 'The second sentence does explain the detail.',
          })
      ).status,
    ).toBe(201);

    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.overrides[0]).toMatchObject({
      skillId: 'development.evidence',
      originalRating: 2,
      rating: 3,
    });
    expect(
      view.feedback.dimensions.find(
        (d: any) => d.skillId === 'development.evidence',
      ).rating,
    ).toBe(2);
    const detail = (
      await api().get(`/v1/learning/classes/${cls.id}`).set(as(alice))
    ).body;
    expect(
      detail.students[0].skills.find(
        (k: any) => k.skillId === 'development.evidence',
      ).latestRating,
    ).toBe(3);
    expect(detail.assignments[0].submittedCount).toBe(1);
    expect(
      detail.distribution.find((d: any) => d.skillId === 'development.evidence')
        .counts[3],
    ).toBe(1);
  });

  it('builds a progress report aligned to the student’s curriculum, and exports everything to the adult only', async () => {
    const learnerId = await createLearner(alice, '6', 'au-ac9');
    fake.script = [goodOutput()];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'report-key-01',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));

    const report = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/report`)
        .set(as(alice))
    ).body;
    expect(report.learner.gradeLabel).toBe('Year 6');
    expect(report.totals).toMatchObject({ pieces: 1, revisions: 0 });
    const evidenceSkill = report.skills.find(
      (k: any) => k.skillId === 'development.evidence',
    );
    expect(evidenceSkill.standards.map((st: any) => st.code)).toContain(
      'AC9E6LY06',
    );
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/report`)
          .set(as(bob))
      ).status,
    ).toBe(404);

    const exported = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/export`)
        .set(as(alice))
    ).body;
    expect(exported.submissions[0].text).toBe(ESSAY);
    expect(exported.submissions[0].feedback.summary).toBeTruthy();
  });

  it('serves curriculum alignment publicly for every framework', async () => {
    const uk = (await api().get('/v1/learning/curriculum/uk-eng')).body;
    expect(uk.grades.map((g: any) => g.label)).toEqual(
      Array.from({ length: 13 }, (_, i) => `Year ${i + 1}`),
    );
    // Years 12–13 have no national curriculum: shown with a note, aligned to KS4.
    const y13 = uk.grades.find((g: any) => g.label === 'Year 13');
    expect(y13.note).toMatch(/no national writing curriculum/);
    expect(y13.genres[0].skills[0].statements[0].id).toMatch(/^uk-eng:ks4\./);
    const au = (await api().get('/v1/learning/curriculum/au-ac9')).body;
    expect(au.grades[0]).toMatchObject({ label: 'Foundation', band: 'K-2' });
    const on = (await api().get('/v1/learning/curriculum/ca-on')).body;
    expect(on.grades.map((g: any) => g.local)).toEqual(
      Array.from({ length: 12 }, (_, i) => String(i + 1)),
    );
    const lesson = (
      await api().get('/v1/learning/lessons/g68-explain-your-evidence')
    ).body;
    expect(lesson.alignment).toHaveLength(4);
    expect((await api().get('/v1/learning/curriculum/nowhere')).status).toBe(
      404,
    );
    expect(
      (await api().get('/v1/learning/drills/d68-commas')).body.items.length,
    ).toBeGreaterThan(0);
  });

  it('serves public grade and rubric pages without reserved prompts', async () => {
    const k = (await api().get('/v1/learning/grades/K')).body;
    expect(k.band.id).toBe('K-2');
    expect(k.frameworks.map((f: any) => f.label)).toEqual([
      'Kindergarten',
      'Year 1',
      'Foundation',
    ]);
    expect(k.prompts.some((p: any) => p.id.startsWith('k2-cp-'))).toBe(false);
    const g12 = (await api().get('/v1/learning/grades/12')).body;
    const uk = g12.frameworks.find((f: any) => f.id === 'uk-eng');
    expect(uk.label).toBe('Year 13');
    expect(uk.note).toMatch(/A level/);
    expect((await api().get('/v1/learning/grades/13')).status).toBe(404);
    const rubric = (await api().get('/v1/learning/rubrics/g9-10-argument'))
      .body;
    expect(rubric.dimensions.map((d: any) => d.name)).toContain(
      'Counterclaims',
    );
    expect(rubric.anchors.length).toBeGreaterThan(0);
    expect(
      rubric.prompts.some((p: any) => p.id === 'g910-cp-phone-lockers'),
    ).toBe(false);
    expect((await api().get('/v1/learning/rubrics/nope')).status).toBe(404);
    const ex = (await api().get('/v1/learning/examples/ex-910-argument-plaza'))
      .body;
    expect(ex.prompt.sources).toHaveLength(2);
    expect(ex.rubric.dimensions.map((d: any) => d.skillId)).toContain(
      'development.counterclaim',
    );
    expect((await api().get('/v1/learning/examples/nope')).status).toBe(404);
  });

  it('flags concerning writing for the adult, shows the student support, and never changes ratings', async () => {
    const learnerId = await createLearner(alice, '7', 'uk-eng');
    const sad = `${ESSAY} Sometimes I want to die and I don't tell anyone.`;
    // AI unavailable: the phrase screen still raises the flag at submission.
    fake.script = [new RateLimitedError(60)];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      sad,
      'safety-key-01',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));

    const dash = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/dashboard`)
        .set(as(alice))
    ).body;
    expect(dash.safetyFlags).toEqual([
      expect.objectContaining({
        category: 'self_harm',
        level: 'urgent',
        source: 'screen',
        status: 'open',
      }),
    ]);
    expect(JSON.stringify(dash.safetyFlags)).not.toContain('want to die');
    const queue = (await api().get('/v1/learning/review').set(as(alice))).body;
    expect(queue[0]).toMatchObject({
      submissionId: job.submissionId,
      wellbeing: true,
    });
    expect(queue[0].needsAttention[0]).toBe(
      'Wellbeing check: please read this piece',
    );

    // The student sees support (UK helpline), not the flag.
    const { code } = (
      await api()
        .post(`/v1/learning/learners/${learnerId}/access-code`)
        .set(as(alice))
    ).body;
    const student = (
      await api().post('/v1/learning/student-sessions').send({ code })
    ).body.token;
    const studentView = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(student))
    ).body;
    expect(studentView.support).toMatchObject({
      wellbeing: true,
      emergency: '999',
    });
    expect(studentView.support.helplines[0].name).toBe('Childline');
    expect(studentView.safetyFlags).toEqual([]);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/dashboard`)
          .set(as(student))
      ).body.safetyFlags,
    ).toEqual([]);

    const flagId = dash.safetyFlags[0].id;
    expect(
      (
        await api()
          .post(`/v1/learning/safety-flags/${flagId}/resolve`)
          .set(as(bob))
          .send({ note: 'x' })
      ).status,
    ).toBe(404);
    expect(
      (
        await api()
          .post(`/v1/learning/safety-flags/${flagId}/resolve`)
          .set(as(student))
          .send({ note: 'x' })
      ).status,
    ).toBe(403);
    expect(
      (
        await api()
          .post(`/v1/learning/safety-flags/${flagId}/resolve`)
          .set(as(alice))
          .send({ note: 'Spoke with Sam and their family.' })
      ).status,
    ).toBe(200);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/dashboard`)
          .set(as(alice))
      ).body.safetyFlags,
    ).toEqual([]);
  });

  it('records the AI wellbeing judgment as a separate flag', async () => {
    const learnerId = await createLearner(alice);
    const out = JSON.parse(goodOutput());
    out.wellbeing = {
      concern: 'possible',
      category: 'other',
      reason: 'The story mentions being afraid to go home; it may be fiction.',
    };
    fake.script = [JSON.stringify(out)];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'safety-key-02',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.safetyFlags).toEqual([
      expect.objectContaining({
        source: 'ai',
        level: 'possible',
        category: 'other',
      }),
    ]);
    expect(view.feedback.wellbeing).toBeUndefined();
    expect(view.feedback.dimensions[0].rating).toBe(3);
  });

  it('builds a two-week plan after the check-in, with preferences, adult focus and drill tracking', async () => {
    const learnerId = await createLearner(alice);
    const before = (
      await api().get(`/v1/learning/learners/${learnerId}/plan`).set(as(alice))
    ).body;
    expect(before.plan.status).toBe('check_in');

    fake.script = [goodOutput(ESSAY, 2)];
    const one = await writeAndSubmit(
      alice,
      learnerId,
      'g68-choice-period',
      ESSAY,
      'plan-key-0001',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${one.job.jobId}/process`)
      .set(as(alice));
    fake.script = [goodOutput(ESSAY, 3)];
    const two = await writeAndSubmit(
      alice,
      learnerId,
      'g68-wrong-message',
      ESSAY,
      'plan-key-0002',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${two.job.jobId}/process`)
      .set(as(alice));

    const { code } = (
      await api()
        .post(`/v1/learning/learners/${learnerId}/access-code`)
        .set(as(alice))
    ).body;
    const student = (
      await api().post('/v1/learning/student-sessions').send({ code })
    ).body.token;
    const updated = (
      await api()
        .patch(`/v1/learning/learners/${learnerId}/preferences`)
        .set(as(student))
        .send({ sessionsPerWeek: 2, interests: ['animals', 'science'] })
    ).body;
    expect(updated.preferences).toEqual({
      sessionsPerWeek: 2,
      interests: ['animals', 'science'],
      focusSkillId: null,
    });
    expect(updated.plan.status).toBe('active');
    expect(updated.plan.items).toHaveLength(4);
    expect(updated.plan.items.at(-1).kind).toBe('checkpoint');
    expect(
      (
        await api()
          .patch(`/v1/learning/learners/${learnerId}/preferences`)
          .set(as(student))
          .send({ interests: ['politics'] })
      ).status,
    ).toBe(400);

    expect(
      (
        await api()
          .patch(`/v1/learning/learners/${learnerId}/focus`)
          .set(as(student))
          .send({ skillId: 'conventions.mechanics' })
      ).status,
    ).toBe(403);
    const focused = (
      await api()
        .patch(`/v1/learning/learners/${learnerId}/focus`)
        .set(as(alice))
        .send({ skillId: 'conventions.mechanics' })
    ).body;
    expect(focused.plan.mainGoal.skillId).toBe('conventions.mechanics');
    expect(focused.plan.focusSetByAdult).toBe(true);

    const drillItem = focused.plan.items.find((i: any) => i.kind === 'drill');
    expect(drillItem.done).toBe(false);
    await api()
      .post(
        `/v1/learning/learners/${learnerId}/drills/${drillItem.drillId}/complete`,
      )
      .set(as(student))
      .expect(200);
    const after = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/plan`)
        .set(as(student))
    ).body;
    expect(
      after.plan.items.find((i: any) => i.key === drillItem.key).done,
    ).toBe(true);

    const checkpoint = after.plan.items.at(-1);
    const cpDraft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(student))
        .send({ learnerId, promptId: checkpoint.promptId })
    ).body;
    await api()
      .patch(`/v1/learning/drafts/${cpDraft.id}`)
      .set(as(student))
      .send({ content: ESSAY, expectedRevision: cpDraft.revision });
    expect(
      (
        await api()
          .post(`/v1/learning/drafts/${cpDraft.id}/coach`)
          .set(as(student))
      ).status,
    ).toBe(403);

    const dash = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/dashboard`)
        .set(as(student))
    ).body;
    expect(dash.plan.next.key).toBe(after.plan.next.key);
  });

  it('measures AI-vs-adult agreement for the site operator only', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [goodOutput(ESSAY, 3)];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'quality-key-01',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    await api()
      .post(`/v1/learning/submissions/${job.submissionId}/overrides`)
      .set(as(alice))
      .send({
        skillId: 'development.evidence',
        rating: 2,
        comment: 'Needs explanation.',
      })
      .expect(201);
    expect(
      (
        await api()
          .post(`/v1/learning/submissions/${job.submissionId}/confirm`)
          .set(as(alice))
      ).body.confirmed,
    ).toBe(5);
    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.overrides).toHaveLength(1);
    expect(view.reviewedByAdult).toBe(true);

    expect((await api().get('/v1/learning/quality').set(as(bob))).status).toBe(
      403,
    );
    const q = (await api().get('/v1/learning/quality').set(as(alice))).body;
    expect(q.reviewedPieces).toBeGreaterThanOrEqual(1);
    const evidence = q.agreement.bySkill.find(
      (k: any) => k.skillId === 'development.evidence',
    );
    expect(evidence.exact).toBeLessThan(1);
    expect(q.agreement.overall.n).toBeGreaterThanOrEqual(6);
    expect(JSON.stringify(q)).not.toContain(ESSAY.slice(0, 20));
  });

  it('runs a school: invite, roster import with codes, and removing a teacher ends their access', async () => {
    const created = (
      await api()
        .post('/v1/learning/orgs')
        .set(as(alice))
        .send({ name: 'Hillside Primary', curriculum: 'uk-eng' })
    ).body;
    const orgId = created.id;
    expect(created.myRole).toBe('admin');
    await api()
      .post(`/v1/learning/orgs/${orgId}/members`)
      .set(as(alice))
      .send({ email: 'BOB@example.com', role: 'teacher' })
      .expect(201);
    expect(
      (await api().get('/v1/learning/orgs').set(as(bob))).body.invitations,
    ).toEqual([
      { organizationId: orgId, name: 'Hillside Primary', role: 'teacher' },
    ]);
    expect(
      (await api().post(`/v1/learning/orgs/${orgId}/accept`).set(as(carol)))
        .status,
    ).toBe(404);
    await api()
      .post(`/v1/learning/orgs/${orgId}/accept`)
      .set(as(bob))
      .expect(200);

    const cls = (
      await api()
        .post('/v1/learning/classes')
        .set(as(bob))
        .send({ name: 'Year 5 Oak', organizationId: orgId })
    ).body;
    expect(
      (
        await api()
          .post('/v1/learning/classes')
          .set(as(carol))
          .send({ name: 'x', organizationId: orgId })
      ).status,
    ).toBe(404);
    const roster = (
      await api()
        .post(`/v1/learning/orgs/${orgId}/roster`)
        .set(as(bob))
        .send({
          classId: cls.id,
          students: [
            { displayName: 'Ava', localGrade: '5' },
            { displayName: 'Ben', localGrade: '6' },
            { displayName: 'Cy', localGrade: '7' },
          ],
          agreeToNotice: true,
          noticeVersion: LEARNING_NOTICE_VERSION,
        })
    ).body;
    expect(roster.created.map((r: any) => r.gradeLabel)).toEqual([
      'Year 5',
      'Year 6',
      'Year 7',
    ]);
    expect(roster.codesEnabled).toBe(true);
    expect(
      (
        await api()
          .post(`/v1/learning/orgs/${orgId}/roster`)
          .set(as(bob))
          .send({
            students: [{ displayName: 'Zed', localGrade: '14' }],
            agreeToNotice: true,
            noticeVersion: LEARNING_NOTICE_VERSION,
          })
      ).status,
    ).toBe(400);
    const avaId = roster.created[0].learnerId;
    const student = (
      await api()
        .post('/v1/learning/student-sessions')
        .send({ code: roster.created[0].code })
    ).body.token;
    expect(
      (await api().get('/v1/learning/me').set(as(student))).body.learnerId,
    ).toBe(avaId);

    // Admin sees school students; outsiders and personal accounts don't.
    expect(
      (await api().get('/v1/learning/learners').set(as(alice))).body.map(
        (l: any) => l.id,
      ),
    ).toEqual(
      expect.arrayContaining(roster.created.map((r: any) => r.learnerId)),
    );
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${avaId}/dashboard`)
          .set(as(carol))
      ).status,
    ).toBe(404);
    expect(
      (await api().get(`/v1/learning/learners/${avaId}/dashboard`).set(as(bob)))
        .status,
    ).toBe(200);
    // School students can't be mixed into a personal class.
    const personal = (
      await api()
        .post('/v1/learning/classes')
        .set(as(bob))
        .send({ name: 'Home tutoring' })
    ).body;
    expect(
      (
        await api()
          .post(`/v1/learning/classes/${personal.id}/members/${avaId}`)
          .set(as(bob))
      ).status,
    ).toBe(400);

    // Teachers can't see the audit log; admins can.
    expect(
      (await api().get(`/v1/learning/orgs/${orgId}/audit`).set(as(bob))).status,
    ).toBe(403);
    const bobMember = (
      await api().get(`/v1/learning/orgs/${orgId}`).set(as(alice))
    ).body.members.find((m: any) => m.email === 'bob@example.com');
    const aliceMember = (
      await api().get(`/v1/learning/orgs/${orgId}`).set(as(alice))
    ).body.members.find((m: any) => m.isMe);
    expect(
      (
        await api()
          .delete(`/v1/learning/orgs/${orgId}/members/${aliceMember.id}`)
          .set(as(alice))
      ).status,
    ).toBe(400);
    await api()
      .delete(`/v1/learning/orgs/${orgId}/members/${bobMember.id}`)
      .set(as(alice))
      .expect(200);

    // Removed: no access, even to students and the class Bob created.
    expect(
      (await api().get(`/v1/learning/learners/${avaId}/dashboard`).set(as(bob)))
        .status,
    ).toBe(404);
    expect(
      (await api().get(`/v1/learning/classes/${cls.id}`).set(as(bob))).status,
    ).toBe(404);
    expect(
      (await api().get('/v1/learning/learners').set(as(bob))).body.map(
        (l: any) => l.id,
      ),
    ).not.toContain(avaId);
    expect(
      (await api().get(`/v1/learning/classes/${cls.id}`).set(as(alice))).status,
    ).toBe(200);
    const audit = (
      await api().get(`/v1/learning/orgs/${orgId}/audit`).set(as(alice))
    ).body.map((e: any) => e.action);
    expect(audit).toEqual(
      expect.arrayContaining([
        'school.created',
        'member.invited',
        'member.joined',
        'roster.imported',
        'student.code_created',
        'member.removed',
      ]),
    );
  });

  it('applies supports: English-learner guidance, dictation without spelling evidence, and redacted personal details', async () => {
    const learnerId = await createLearner(alice);
    await api()
      .patch(`/v1/learning/learners/${learnerId}/supports`)
      .set(as(alice))
      .send({ eal: true, dictation: true })
      .expect(200);
    const text = `${ESSAY} You can call me on 555-123-4567.`;
    const draft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(alice))
        .send({ learnerId, promptId: 'g68-spare-room' })
    ).body;
    const saved = await api()
      .patch(`/v1/learning/drafts/${draft.id}`)
      .set(as(alice))
      .send({
        content: text,
        expectedRevision: draft.revision,
        usedDictation: true,
      });
    const job = (
      await api().post('/v1/learning/submissions').set(as(alice)).send({
        draftId: draft.id,
        expectedRevision: saved.body.revision,
        idempotencyKey: 'support-key-1',
      })
    ).body;
    fake.script = [goodOutput(text)];
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const [system, user] = fake.calls[0];
    expect(system.content).toContain('English as an additional language');
    expect(system.content).toContain('speech-to-text');
    expect(user.content).toContain('[phone number]');
    expect(user.content).not.toContain('555-123-4567');
    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.inputMode).toBe('dictation');
    expect(view.safetyFlags).toEqual([
      expect.objectContaining({ category: 'personal_info' }),
    ]);
    const evidence = app.get<Repository<SkillEvidenceEntity>>(
      getRepositoryToken(SkillEvidenceEntity),
    );
    const rows = await evidence.find({
      where: { submissionId: job.submissionId },
    });
    expect(rows.map((r) => r.skillId)).not.toContain('conventions.mechanics');
    expect(rows.length).toBeGreaterThan(0);
  });

  it('runs the kindergarten loop: pictures, an adult typing the words, short read-aloud feedback', async () => {
    const learnerId = await createLearner(alice, 'K');
    const text = 'I like the swings best becuz you go up hi.';
    const draft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(alice))
        .send({ learnerId, promptId: 'k2-best-fruit' })
    ).body;
    const saved = await api()
      .patch(`/v1/learning/drafts/${draft.id}`)
      .set(as(alice))
      .send({ content: text, expectedRevision: draft.revision });
    const job = (
      await api().post('/v1/learning/submissions').set(as(alice)).send({
        draftId: draft.id,
        expectedRevision: saved.body.revision,
        idempotencyKey: 'scribed-key-1',
        scribed: true,
      })
    ).body;
    const rubric = getRubric('gk-2-opinion')!;
    fake.script = [
      JSON.stringify({
        summary: 'You told what you like. Next, tell more about why.',
        dimensions: rubric.dimensions.map((d) => ({
          skillId: d.skillId,
          evidenceState:
            d.skillId === 'conventions.mechanics'
              ? 'not_applicable'
              : 'observed',
          rating: d.skillId === 'conventions.mechanics' ? null : 3,
          quotes:
            d.skillId === 'conventions.mechanics'
              ? []
              : ['I like the swings best'],
          reason: 'Clear for this age.',
        })),
        strengths: [
          {
            skillId: 'purpose.claim',
            quote: 'I like the swings best',
            message: 'You told what you like!',
          },
        ],
        nextSteps: [
          {
            skillId: 'development.evidence',
            message: 'Tell one more reason.',
            hint: 'What else is fun about swings?',
          },
        ],
        wellbeing: { concern: 'none', category: 'none', reason: '' },
      }),
    ];
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const [system] = fake.calls[0];
    expect(system.content).toContain('read aloud to the child');
    expect(system.content).toContain('An adult typed this piece');
    expect(system.content).toContain('a red apple');
    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.inputMode).toBe('scribed');
    expect(view.job.state).toBe('complete');
    expect(view.prompt.band).toBe('K-2');
    expect(view.feedback.dimensions).toHaveLength(5);
    const evidence = app.get<Repository<SkillEvidenceEntity>>(
      getRepositoryToken(SkillEvidenceEntity),
    );
    const rows = await evidence.find({
      where: { submissionId: job.submissionId },
    });
    expect(rows.map((r) => r.skillId)).not.toContain('conventions.mechanics');
    expect(rows.map((r) => r.skillId)).toContain('purpose.claim');
  });

  it('gives high-school writers every supplied source', async () => {
    const learnerId = await createLearner(alice, '11');
    const essay =
      'The city should make buses free for students on routes with room. The council report projects more riders, and the union shows two routes are full. A pilot on the emptier routes tests the idea without stranding students at full stops.';
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g1112-ai-tutors',
      essay,
      'hs-sources-1',
    );
    fake.script = ['not json', 'still not json'];
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const [system, user] = fake.calls[0];
    expect(system.content).toContain('g11-12-argument');
    expect(system.content).toContain('development.counterclaim');
    expect(user.content).toContain('Pilot results from a neighboring district');
    expect(user.content).toContain('Letter from a teachers’ association');
  });

  it('marks pieces worth a second look without changing ratings', async () => {
    const learnerId = await createLearner(alice);
    const invented = goodOutput().replace(
      /The spare room should go to the art club/g,
      'Art is the most important subject',
    );
    fake.script = [invented, goodOutput()];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'second-look-1',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.checks).toEqual(
      expect.arrayContaining([expect.stringContaining('second try')]),
    );
    expect(view.checks.join(' ')).toContain('short piece');
    const queue = (await api().get('/v1/learning/review').set(as(alice))).body;
    expect(
      queue.find((q: any) => q.submissionId === job.submissionId)
        .needsAttention,
    ).toContain('Worth a second look');
  });

  it('meters AI use, holds work when the daily budget is spent, and shows operator metrics', async () => {
    const usage = app.get<Repository<AiUsageEntity>>(
      getRepositoryToken(AiUsageEntity),
    );
    await usage.clear();
    const learnerId = await createLearner(alice);
    fake.script = ['not json', goodOutput()];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'meter-key-1',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const rows = await usage.find({ order: { createdAt: 'ASC' } });
    expect(rows.map((r) => r.purpose).slice(0, 2)).toEqual([
      'evaluation',
      'repair',
    ]);
    expect(rows.every((r) => r.learnerId === learnerId)).toBe(true);
    expect(rows[0].promptTokens).toBeGreaterThan(100);
    expect(rows[0].measured).toBe(false);

    await api()
      .post(`/v1/learning/submissions/${job.submissionId}/helpfulness`)
      .set(as(alice))
      .send({ value: 'yes' })
      .expect(201);
    expect(
      (
        await api()
          .post(`/v1/learning/submissions/${job.submissionId}/helpfulness`)
          .set(as(bob))
          .send({ value: 'no' })
      ).status,
    ).toBe(404);

    // Spend the whole budget: new work waits, nothing is lost, and the coach rests.
    await usage.save(
      usage.create({
        purpose: 'evaluation',
        learnerId: null,
        ownerKey: null,
        model: 'fake-model',
        promptTokens: 10_000_000,
        completionTokens: 0,
        measured: true,
        outcome: 'ok',
      }),
    );
    fake.script = [goodOutput()];
    const second = await writeAndSubmit(
      alice,
      learnerId,
      'g68-uniforms',
      ESSAY,
      'meter-key-2',
    );
    const status = (
      await api()
        .post(`/v1/learning/evaluation-jobs/${second.job.jobId}/process`)
        .set(as(alice))
    ).body;
    expect(status.state).toBe('queued');
    expect(status.failureCode ?? status.reason ?? '').toMatch(
      /daily_budget|budget/,
    );
    const coach = await api()
      .post(`/v1/learning/drafts/${second.draft.id}/coach`)
      .set(as(alice));
    expect(coach.status).toBe(503);
    expect(coach.body.message).toMatch(/resting until tomorrow/);
    fake.script = [];

    const metrics = (
      await api().get('/v1/learning/admin/metrics').set(as(alice))
    ).body;
    expect(metrics.ai.remainingToday).toBe(0);
    expect(metrics.ai.byPurposeLast7Days.repair.calls).toBe(1);
    expect(metrics.learning.helpfulness30.yes).toBe(1);
    expect(metrics.learning.jobStates.waiting_for_budget).toBe(1);
    expect(
      (await api().get('/v1/learning/admin/metrics').set(as(bob))).status,
    ).toBe(403);
    await usage.clear();
  });

  it('asks for a second AI reading when every skill is rated 4, without changing levels', async () => {
    const learnerId = await createLearner(alice);
    const allFour = goodOutput(ESSAY, 4);
    const disagree = JSON.parse(goodOutput(ESSAY, 4));
    disagree.dimensions[0].rating = 2;
    fake.script = [allFour, JSON.stringify(disagree)];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'second-opinion-1',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    const view = (
      await api()
        .get(`/v1/learning/submissions/${job.submissionId}`)
        .set(as(alice))
    ).body;
    expect(view.checks.join(' ')).toContain('A second AI reading disagreed');
    expect(view.feedback.dimensions.every((d: any) => d.rating === 4)).toBe(
      true,
    );
  });

  it('keeps a portfolio of chosen pieces, with corrected levels', async () => {
    const learnerId = await createLearner(alice);
    fake.script = [goodOutput()];
    const { job } = await writeAndSubmit(
      alice,
      learnerId,
      'g68-spare-room',
      ESSAY,
      'portfolio-key-1',
    );
    await api()
      .post(`/v1/learning/evaluation-jobs/${job.jobId}/process`)
      .set(as(alice));
    fake.script = [];
    await api()
      .post(`/v1/learning/submissions/${job.submissionId}/portfolio`)
      .set(as(alice))
      .send({ include: true })
      .expect(201);
    const portfolio = (
      await api()
        .get(`/v1/learning/learners/${learnerId}/portfolio`)
        .set(as(alice))
    ).body;
    expect(portfolio.pieces).toHaveLength(1);
    expect(portfolio.pieces[0].prompt.id).toBe('g68-spare-room');
    expect(portfolio.pieces[0].levels.length).toBeGreaterThan(0);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/portfolio`)
          .set(as(bob))
      ).status,
    ).toBe(404);
  });

  it('lets invited educators review catalog content, and shows only roles publicly', async () => {
    const review = {
      itemType: 'lesson',
      itemId: 'g910-counterclaim',
      decision: 'approve',
      notes: 'Clear model; fair counterclaim example.',
      reviewerName: 'Ms. Rivera',
      reviewerRole: 'Grade 10 English teacher, Ontario',
    };
    expect(
      (
        await api()
          .post('/v1/learning/content/reviews')
          .set(as(bob))
          .send(review)
      ).status,
    ).toBe(403);
    await api()
      .post('/v1/learning/content/reviews')
      .set(as(alice))
      .send(review)
      .expect(201);
    expect(
      (
        await api()
          .post('/v1/learning/content/reviews')
          .set(as(alice))
          .send({ ...review, decision: 'changes', notes: ' ' })
      ).status,
    ).toBe(400);
    const queue = (
      await api().get('/v1/learning/content/reviews').set(as(alice))
    ).body;
    const item = queue.items.find((i: any) => i.id === 'g910-counterclaim');
    expect(item).toMatchObject({ approvals: 1, latestDecision: 'approve' });
    const status = (
      await api().get('/v1/learning/content/g910-counterclaim/review-status')
    ).body;
    expect(status).toMatchObject({
      approvals: 1,
      roles: ['Grade 10 English teacher, Ontario'],
    });
    expect(JSON.stringify(status)).not.toContain('Rivera');
  });

  it('limits submissions per student per day', async () => {
    const learnerId = await createLearner(alice);
    const draft = (
      await api()
        .post('/v1/learning/drafts')
        .set(as(alice))
        .send({ learnerId, promptId: 'g68-uniforms' })
    ).body;
    let revision = draft.revision;
    let last = 0;
    for (let i = 0; i < 21; i++) {
      revision = (
        await api()
          .patch(`/v1/learning/drafts/${draft.id}`)
          .set(as(alice))
          .send({ content: `${ESSAY} ${i}`, expectedRevision: revision })
      ).body.revision;
      last = (
        await api()
          .post('/v1/learning/submissions')
          .set(as(alice))
          .send({
            draftId: draft.id,
            expectedRevision: revision,
            idempotencyKey: `limit-key-${i}`,
          })
      ).status;
    }
    expect(last).toBe(429);
  });

  it('runs retention only with the cron secret, removing long-inactive profiles', async () => {
    expect((await api().get('/v1/learning/maintenance/retention')).status).toBe(
      401,
    );
    process.env.CRON_SECRET = 'cron-test-secret';
    expect(
      (
        await api()
          .get('/v1/learning/maintenance/retention')
          .set({ Authorization: 'Bearer wrong' })
      ).status,
    ).toBe(401);
    const report = (
      await api()
        .get('/v1/learning/maintenance/retention')
        .set({ Authorization: 'Bearer cron-test-secret' })
    ).body;
    expect(report).toMatchObject({ inactiveMonths: null, removedProfiles: 0 });

    process.env.RETENTION_INACTIVE_MONTHS = '12';
    const learnerId = await createLearner(alice);
    const later = await app
      .get(RetentionService)
      .run(new Date(Date.now() + 400 * 86_400_000));
    expect(later.removedProfiles).toBeGreaterThan(0);
    expect(
      (
        await api()
          .get(`/v1/learning/learners/${learnerId}/dashboard`)
          .set(as(alice))
      ).status,
    ).toBe(404);
  });
  it('gives guests feedback without an account and stores no writing', async () => {
    const usage = app.get<Repository<AiUsageEntity>>(
      getRepositoryToken(AiUsageEntity),
    );
    const submissions = app.get<Repository<SubmissionEntity>>(
      getRepositoryToken(SubmissionEntity),
    );
    await usage.clear();
    const before = await submissions.count();
    const guest = (body: Record<string, unknown>) =>
      api()
        .post('/v1/learning/guest/feedback')
        .send({ promptId: 'g68-spare-room', curriculum: 'us-ccss', ...body });

    fake.script = [goodOutput()];
    const ok = await guest({ text: ESSAY, grade: '7' });
    expect(ok.status).toBe(200);
    expect(ok.body).toMatchObject({
      kind: 'complete',
      grade: '7',
      band: '6-8',
      support: null,
    });
    expect(ok.body.feedback.dimensions[0].evidence[0].quote).toBe(
      ESSAY.split('.')[0],
    );
    expect(ok.body.skillNames['purpose.claim']).toBeTruthy();
    expect(await submissions.count()).toBe(before);
    const rows = await usage.find();
    expect(rows.map((r) => [r.purpose, r.learnerId, r.ownerKey])).toEqual([
      ['guest', null, null],
    ]);

    // Too short: no AI call, and it doesn't use one of the hourly requests.
    expect((await guest({ text: 'Too short.' })).body).toEqual({
      kind: 'not_scored',
      code: 'too_short',
    });
    expect(fake.calls).toHaveLength(1);
    // A grade outside the prompt's age group is refused.
    expect((await guest({ text: ESSAY, grade: '3' })).status).toBe(400);
    expect((await guest({ promptId: 'nope', text: ESSAY })).status).toBe(404);

    // Concerning writing still gets feedback, plus help for the student's country.
    const worrying = `${ESSAY} Sometimes I want to hurt myself.`;
    fake.script = [goodOutput(worrying)];
    const support = (await guest({ text: worrying, curriculum: 'uk-eng' }))
      .body;
    expect(support.kind).toBe('complete');
    expect(support.support).toMatchObject({
      wellbeing: true,
      emergency: '999',
    });
    expect(support.support.helplines[0].name).toBe('Childline');

    // Guests share only part of the daily budget, so profiles keep getting feedback.
    await usage.save(
      usage.create({
        purpose: 'guest',
        learnerId: null,
        ownerKey: null,
        model: 'fake-model',
        promptTokens: 1_000_000,
        completionTokens: 0,
        measured: true,
        outcome: 'ok',
      }),
    );
    const capped = await guest({ text: ESSAY });
    expect(capped.status).toBe(503);
    expect(capped.body.message).toMatch(/without an account/);
    await usage.clear();

    // Per-visitor hourly limit (two requests used above).
    for (let i = 2; i < GUEST_HOURLY_LIMIT; i++) {
      fake.script = [goodOutput()];
      expect((await guest({ text: ESSAY })).status).toBe(200);
    }
    const limited = await guest({ text: ESSAY });
    expect(limited.status).toBe(429);
    await usage.clear();
  });

  it('lets students 13 and older make their own profile, once, from Grade 7 up', async () => {
    const dave = await tokenFor('dave');
    const make = (body: Record<string, unknown>) =>
      api()
        .post('/v1/learning/learners')
        .set(as(dave))
        .send({
          displayName: 'Dave',
          curriculum: 'us-ccss',
          localGrade: '9',
          relationship: 'self',
          agreeToNotice: true,
          noticeVersion: LEARNING_NOTICE_VERSION,
          ...body,
        });
    expect((await make({})).status).toBe(400);
    expect(
      (await make({ confirmedAge13: true, localGrade: '5' })).body.message,
    ).toMatch(/Grade 7/);
    // England Year 7 is US grade 6: too young for a self profile.
    expect(
      (
        await make({
          confirmedAge13: true,
          curriculum: 'uk-eng',
          localGrade: '7',
        })
      ).status,
    ).toBe(400);
    expect((await make({ confirmedAge13: true })).status).toBe(201);
    expect((await make({ confirmedAge13: true })).body.message).toMatch(
      /already has your own profile/,
    );
  });
});
