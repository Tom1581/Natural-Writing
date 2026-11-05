import { AsyncLocalStorage } from 'node:async_hooks';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { AiUsageEntity } from './entities';

export interface UsageContext {
  purpose: 'evaluation' | 'second_opinion' | 'coach' | 'guest';
  learnerId: string | null;
  ownerKey: string | null;
  /** Calls made so far in this context; the second evaluation call is a repair. */
  calls: number;
}

/**
 * Free-tier default: Groq allows about 200,000 tokens a day for openai/gpt-oss-120b. We stop a
 * little short so a burst never ends in provider errors. Raise AI_DAILY_TOKEN_BUDGET with a paid plan.
 */
export const DEFAULT_DAILY_TOKEN_BUDGET = 180_000;

const startOfUtcDay = (d = new Date()) =>
  new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));

/** Records every AI call (tokens, purpose, who it was for) and enforces the daily budget. */
@Injectable()
export class UsageService {
  private readonly store = new AsyncLocalStorage<UsageContext>();
  readonly dailyBudget: number;

  constructor(
    @InjectRepository(AiUsageEntity)
    private readonly usage: Repository<AiUsageEntity>,
    config: ConfigService,
  ) {
    this.dailyBudget =
      Number(config.get<string>('AI_DAILY_TOKEN_BUDGET')) ||
      DEFAULT_DAILY_TOKEN_BUDGET;
  }

  /** Runs fn with a usage context, so every AI call inside it is attributed. */
  withContext<T>(
    ctx: Omit<UsageContext, 'calls'>,
    fn: () => Promise<T>,
  ): Promise<T> {
    return this.store.run({ ...ctx, calls: 0 }, fn);
  }

  context(): UsageContext | undefined {
    return this.store.getStore();
  }

  async tokensToday(): Promise<number> {
    // A day holds at most a few thousand rows on the free tier, so summing here stays cheap and portable.
    const rows = await this.usage.find({
      where: { createdAt: MoreThanOrEqual(startOfUtcDay()) },
      select: { promptTokens: true, completionTokens: true },
    });
    return rows.reduce((n, r) => n + r.promptTokens + r.completionTokens, 0);
  }

  /** Tokens used today for one purpose, e.g. "guest" for feedback without an account. */
  async tokensTodayFor(purpose: string): Promise<number> {
    const rows = await this.usage.find({
      where: { purpose, createdAt: MoreThanOrEqual(startOfUtcDay()) },
      select: { promptTokens: true, completionTokens: true },
    });
    return rows.reduce((n, r) => n + r.promptTokens + r.completionTokens, 0);
  }

  /** Seconds until the budget resets at midnight UTC. */
  secondsUntilReset(now = new Date()) {
    const next = startOfUtcDay(now).getTime() + 86_400_000;
    return Math.max(60, Math.ceil((next - now.getTime()) / 1000));
  }

  async remainingToday() {
    return this.dailyBudget - (await this.tokensToday());
  }

  async record(row: Omit<AiUsageEntity, 'id' | 'createdAt'>) {
    await this.usage.save(this.usage.create(row));
  }

  /** Daily totals for the last `days` days (UTC), oldest first. */
  async daily(days = 14) {
    const since = new Date(startOfUtcDay().getTime() - (days - 1) * 86_400_000);
    const rows = await this.usage.find({
      where: { createdAt: MoreThanOrEqual(since) },
      select: {
        createdAt: true,
        purpose: true,
        promptTokens: true,
        completionTokens: true,
        outcome: true,
      },
    });
    const out = Array.from({ length: days }, (_, i) => ({
      date: new Date(since.getTime() + i * 86_400_000)
        .toISOString()
        .slice(0, 10),
      tokens: 0,
      calls: 0,
      rateLimited: 0,
      byPurpose: {},
    }));
    for (const r of rows) {
      const day = out.find(
        (d) => d.date === new Date(r.createdAt).toISOString().slice(0, 10),
      );
      if (!day) continue;
      day.tokens += r.promptTokens + r.completionTokens;
      day.calls += 1;
      if (r.outcome === 'rate_limited') day.rateLimited += 1;
      day.byPurpose[r.purpose] = (day.byPurpose[r.purpose] ?? 0) + 1;
    }
    return out;
  }
}
