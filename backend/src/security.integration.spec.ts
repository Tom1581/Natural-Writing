import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { SignJWT } from 'jose';
import request from 'supertest';
import { RewriteController } from './rewrite/rewrite.controller';
import { RewriteService } from './rewrite/rewrite.service';
import { StyleMemoryService } from './rewrite/style-memory.service';
import { RhythmService } from './rewrite/rhythm.service';
import { OracleService } from './rewrite/oracle.service';
import { GenesisService } from './rewrite/genesis.service';
import { BenchmarkService } from './rewrite/benchmark.service';
import { ComplianceService } from './rewrite/compliance.service';
import { FinalityService } from './rewrite/finality.service';
import { StripeController } from './stripe/stripe.controller';
import { StripeService } from './stripe/stripe.service';

const SECRET = 'converter-test-secret-0123456789abcdef';
const SUPABASE_URL = 'https://example.supabase.co';
const ADMIN = 'a15817348@gmail.com';

const tokenFor = (email: string, sub = `user-${email}`) =>
  new SignJWT({ role: 'authenticated', email })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(sub)
    .setIssuer(`${SUPABASE_URL}/auth/v1`)
    .setAudience('authenticated')
    .setExpirationTime('1h')
    .sign(new TextEncoder().encode(SECRET));

/**
 * The converter and billing routes must identify users only from a verified session.
 * These tests send the kinds of forged requests that used to work.
 */
describe('Converter and billing identity', () => {
  let app: INestApplication;
  const rewrite = {
    processText: jest.fn().mockResolvedValue({ id: 'r1' }),
    getAccessStatus: jest.fn().mockResolvedValue({ tier: 'pro' }),
    getFreeUsage: jest.fn().mockResolvedValue({ wordsUsed: 10, limit: 400 }),
    chatWithManuscript: jest.fn().mockResolvedValue('reply'),
  };
  const stripe = {
    getCustomerState: jest.fn().mockResolvedValue({ tier: null }),
    createCheckoutSession: jest
      .fn()
      .mockResolvedValue('https://checkout.example/session'),
    createBillingPortalSession: jest
      .fn()
      .mockResolvedValue('https://billing.example/portal'),
  };
  const genesis = {
    scaffoldOrganization: jest.fn().mockResolvedValue({ ok: true }),
  };

  beforeAll(async () => {
    process.env.SUPABASE_JWT_SECRET = SECRET;
    process.env.SUPABASE_URL = SUPABASE_URL;
    const moduleRef = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true, ignoreEnvFile: true })],
      controllers: [RewriteController, StripeController],
      providers: [
        { provide: RewriteService, useValue: rewrite },
        { provide: StripeService, useValue: stripe },
        { provide: GenesisService, useValue: genesis },
        ...[
          StyleMemoryService,
          RhythmService,
          OracleService,
          BenchmarkService,
          ComplianceService,
          FinalityService,
        ].map((cls) => ({ provide: cls, useValue: {} })),
      ],
    }).compile();
    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(() => app.close());
  beforeEach(() => jest.clearAllMocks());

  const api = () => request(app.getHttpServer());
  const bearer = async (email: string) => ({
    Authorization: `Bearer ${await tokenFor(email)}`,
  });

  it('ignores an email in the request body when rewriting (no free admin access)', async () => {
    await api()
      .post('/rewrite/process')
      .send({
        text: 'hello',
        options: {},
        userEmail: ADMIN,
        subscriptionTier: 'admin',
      })
      .expect(201);
    expect(rewrite.processText).toHaveBeenCalledWith(
      'hello',
      {},
      null,
      null,
      expect.any(String),
    );
  });

  it('uses the signed-in email, not a victim email in the body, so nobody spends another person’s words', async () => {
    await api()
      .post('/rewrite/process')
      .set(await bearer('Attacker@Example.com'))
      .send({ text: 'hi', options: {}, userEmail: 'victim@example.com' })
      .expect(201);
    expect(rewrite.processText).toHaveBeenCalledWith(
      'hi',
      {},
      'attacker@example.com',
      null,
      expect.any(String),
    );
    expect(stripe.getCustomerState).toHaveBeenCalledWith(
      'attacker@example.com',
    );
  });

  it('grants admin only to a verified admin session', async () => {
    await api()
      .post('/rewrite/process')
      .set(await bearer(ADMIN))
      .send({ text: 'x', options: {} })
      .expect(201);
    expect(rewrite.processText).toHaveBeenCalledWith(
      'x',
      {},
      ADMIN,
      'admin',
      expect.any(String),
    );
  });

  it('rejects a forged or expired token instead of treating it as anonymous', async () => {
    const forged = await new SignJWT({ role: 'authenticated', email: ADMIN })
      .setProtectedHeader({ alg: 'HS256' })
      .setSubject('x')
      .setIssuer(`${SUPABASE_URL}/auth/v1`)
      .setAudience('authenticated')
      .setExpirationTime('1h')
      .sign(new TextEncoder().encode('not-the-real-secret-0123456789abcdef'));
    await api()
      .post('/rewrite/process')
      .set({ Authorization: `Bearer ${forged}` })
      .send({ text: 'x', options: {} })
      .expect(401);
    expect(rewrite.processText).not.toHaveBeenCalled();
  });

  it('does not reveal anyone’s plan or usage from an ?email= query', async () => {
    const access = await api()
      .get('/rewrite/access-status?email=victim@example.com')
      .expect(200);
    expect(access.body.tier).toBeNull();
    expect(rewrite.getAccessStatus).not.toHaveBeenCalled();
    const usage = await api()
      .get('/rewrite/free-usage?email=victim@example.com')
      .expect(200);
    expect(usage.body).toEqual({ wordsUsed: 0, limit: 400 });
    expect(rewrite.getFreeUsage).not.toHaveBeenCalled();

    await api()
      .get('/rewrite/access-status?email=victim@example.com')
      .set(await bearer('me@example.com'))
      .expect(200);
    expect(rewrite.getAccessStatus).toHaveBeenCalledWith('me@example.com');
  });

  it('opens a billing portal only for the signed-in user’s own account', async () => {
    await api()
      .post('/stripe/billing-portal')
      .send({ email: 'victim@example.com' })
      .expect(401);
    await api()
      .post('/stripe/billing-portal')
      .set(await bearer('me@example.com'))
      .send({ email: 'victim@example.com' })
      .expect(200);
    expect(stripe.createBillingPortalSession).toHaveBeenCalledTimes(1);
    expect(stripe.createBillingPortalSession).toHaveBeenCalledWith(
      'me@example.com',
      expect.any(String),
    );
  });

  it('creates checkout only for the signed-in user, with their verified id', async () => {
    await api()
      .post('/stripe/checkout')
      .send({ plan: 'pro', email: 'victim@example.com', userId: 'victim' })
      .expect(401);
    await api()
      .post('/stripe/checkout')
      .set(await bearer('me@example.com'))
      .send({ plan: 'pro', email: 'victim@example.com', userId: 'victim' })
      .expect(200);
    expect(stripe.createCheckoutSession).toHaveBeenCalledWith(
      'pro',
      'me@example.com',
      'user-me@example.com',
      expect.any(String),
    );
  });

  it('requires sign-in for customer state and for writing organization records', async () => {
    await api()
      .get('/stripe/customer-state?email=victim@example.com')
      .expect(401);
    await api()
      .get('/stripe/customer-state')
      .set(await bearer('me@example.com'))
      .expect(200);
    expect(stripe.getCustomerState).toHaveBeenCalledWith('me@example.com');
    await api()
      .post('/rewrite/genesis-scaffold')
      .send({ orgId: 'o', orgName: 'n' })
      .expect(401);
    expect(genesis.scaffoldOrganization).not.toHaveBeenCalled();
  });

  it('rate-limits the converter’s AI tools per visitor', async () => {
    const ip = { 'X-Forwarded-For': '203.0.113.9' };
    for (let i = 0; i < 30; i++) await api().post('/rewrite/chat').set(ip).send({ query: 'q', content: 'c' }).expect(201);
    await api().post('/rewrite/chat').set(ip).send({ query: 'q', content: 'c' }).expect(429);
    await api().post('/rewrite/chat').set({ 'X-Forwarded-For': '203.0.113.10' }).send({ query: 'q', content: 'c' }).expect(201);
  });
});
