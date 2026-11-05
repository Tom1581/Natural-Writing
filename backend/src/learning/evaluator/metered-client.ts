import { Inject, Injectable } from '@nestjs/common';
import { UsageService } from '../usage.service';
import {
  BudgetExceededError,
  EVAL_LLM_PROVIDER,
  RateLimitedError,
  type CallOptions,
  type ChatMessage,
  type EvalLlmClient,
} from './llm-client';

const estimate = (text: string) => Math.ceil(text.length / 4);

/**
 * Wraps the provider: refuses calls once today's token budget is spent, and records the
 * tokens of every call (with who it was for) in the usage ledger.
 */
@Injectable()
export class MeteredEvalClient implements EvalLlmClient {
  constructor(
    @Inject(EVAL_LLM_PROVIDER) private readonly provider: EvalLlmClient,
    private readonly usage: UsageService,
  ) {}

  get model() {
    return this.provider.model;
  }

  async completeJson(
    messages: ChatMessage[],
    options?: CallOptions,
  ): Promise<string> {
    if ((await this.usage.remainingToday()) <= 0)
      throw new BudgetExceededError(this.usage.secondsUntilReset());
    const ctx = this.usage.context();
    const purpose =
      ctx?.purpose === 'evaluation' && ctx.calls > 0
        ? 'repair'
        : (ctx?.purpose ?? 'evaluation');
    if (ctx) ctx.calls += 1;
    const base = {
      purpose,
      learnerId: ctx?.learnerId ?? null,
      ownerKey: ctx?.ownerKey ?? null,
      model: this.provider.model,
    };
    const promptEstimate = estimate(messages.map((m) => m.content).join(''));
    try {
      const { content, usage } = this.provider.completeJsonWithUsage
        ? await this.provider.completeJsonWithUsage(messages, options)
        : {
            content: await this.provider.completeJson(messages, options),
            usage: null,
          };
      await this.usage.record({
        ...base,
        promptTokens: usage?.promptTokens ?? promptEstimate,
        completionTokens: usage?.completionTokens ?? estimate(content),
        measured: !!usage,
        outcome: 'ok',
      });
      return content;
    } catch (err) {
      // Failed calls may still have used tokens; count the prompt so the budget stays conservative.
      await this.usage.record({
        ...base,
        promptTokens: err instanceof RateLimitedError ? 0 : promptEstimate,
        completionTokens: 0,
        measured: false,
        outcome: err instanceof RateLimitedError ? 'rate_limited' : 'error',
      });
      throw err;
    }
  }
}
