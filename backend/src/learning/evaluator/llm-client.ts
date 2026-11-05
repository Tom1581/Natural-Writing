import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

/** The provider asked us to slow down. The job is re-queued, not failed. */
export class RateLimitedError extends Error {
  constructor(readonly retryAfterSeconds: number) {
    super(
      `Evaluation provider rate limited; retry after ${retryAfterSeconds}s`,
    );
  }
}

/** Today's AI budget is used up. Work is saved and waits for tomorrow's budget. */
export class BudgetExceededError extends RateLimitedError {}

/** Timeouts, 5xx and similar transient problems. The job is retried with backoff. */
export class ProviderError extends Error {}

/** What the evaluator and coach call: the provider, metered against the daily budget. */
export const EVAL_LLM_CLIENT = Symbol('EVAL_LLM_CLIENT');
/** The raw provider client underneath the meter. */
export const EVAL_LLM_PROVIDER = Symbol('EVAL_LLM_PROVIDER');

export interface TokenUsage {
  promptTokens: number;
  completionTokens: number;
}

export interface CallOptions {
  /** Overrides the default (0). Used only for the independent second reading. */
  temperature?: number;
}

export interface EvalLlmClient {
  readonly model: string;
  completeJson(messages: ChatMessage[], options?: CallOptions): Promise<string>;
  /** Same as completeJson, plus the provider's token counts when it reports them. */
  completeJsonWithUsage?(
    messages: ChatMessage[],
    options?: CallOptions,
  ): Promise<{ content: string; usage: TokenUsage | null }>;
}

/**
 * OpenAI-compatible chat client for the evaluator. Defaults to Groq's free tier.
 * Grading uses exactly one pinned model with no fallback chain, so the same essay
 * is never scored by different models depending on load. Switching providers
 * (for example to a paid tier) only changes EVAL_LLM_BASE_URL / EVAL_LLM_MODEL / EVAL_LLM_API_KEY.
 */
@Injectable()
export class OpenAiCompatibleEvalClient implements EvalLlmClient {
  readonly model: string;
  private readonly baseUrl: string;
  private readonly apiKey: string | undefined;
  private readonly reasoningEffort: string;
  private readonly temperature: number;

  constructor(configService: ConfigService) {
    this.baseUrl = (
      configService.get<string>('EVAL_LLM_BASE_URL') ||
      'https://api.groq.com/openai/v1'
    ).replace(/\/+$/, '');
    this.model =
      configService.get<string>('EVAL_LLM_MODEL') || 'openai/gpt-oss-120b';
    this.apiKey =
      configService.get<string>('EVAL_LLM_API_KEY') ||
      configService.get<string>('GROQ_API_KEY');
    this.reasoningEffort =
      configService.get<string>('EVAL_LLM_REASONING_EFFORT') || 'low';
    // 0 keeps grading as repeatable as the provider allows; the same essay should get the same levels.
    this.temperature =
      Number(configService.get<string>('EVAL_LLM_TEMPERATURE') ?? 0) || 0;
  }

  async completeJson(
    messages: ChatMessage[],
    options?: CallOptions,
  ): Promise<string> {
    return (await this.completeJsonWithUsage(messages, options)).content;
  }

  async completeJsonWithUsage(
    messages: ChatMessage[],
    options?: CallOptions,
  ): Promise<{ content: string; usage: TokenUsage | null }> {
    if (!this.apiKey)
      throw new ProviderError('EVAL_LLM_API_KEY (or GROQ_API_KEY) not set');
    // gpt-oss reasoning tokens count against max_completion_tokens; keep reasoning short and hidden.
    const reasoning = /gpt-oss/i.test(this.model)
      ? { reasoning_effort: this.reasoningEffort, include_reasoning: false }
      : {};

    let res: Response;
    try {
      res = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages,
          temperature: options?.temperature ?? this.temperature,
          max_completion_tokens: 3000,
          response_format: { type: 'json_object' },
          ...reasoning,
        }),
        signal: AbortSignal.timeout(45000),
      });
    } catch (err) {
      throw new ProviderError(
        `Evaluation provider unreachable: ${err instanceof Error ? err.message : err}`,
      );
    }

    if (res.status === 429) {
      throw new RateLimitedError(
        Math.min(Number(res.headers.get('retry-after')) || 20, 120),
      );
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new ProviderError(
        `Evaluation provider error ${res.status} (${this.model}): ${err?.error?.message || 'unknown'}`,
      );
    }
    const data = await res.json();
    const choice = data?.choices?.[0];
    if (choice?.finish_reason === 'length')
      throw new ProviderError(`Evaluation output truncated (${this.model})`);
    const content = choice?.message?.content;
    if (!content)
      throw new ProviderError(`No content returned (${this.model})`);
    const usage =
      typeof data?.usage?.prompt_tokens === 'number'
        ? {
            promptTokens: data.usage.prompt_tokens,
            completionTokens: data.usage.completion_tokens ?? 0,
          }
        : null;
    return { content: String(content), usage };
  }
}
