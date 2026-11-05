import { Inject, Injectable, Logger } from '@nestjs/common';
import type { FrameworkId, Rubric, WritingPrompt } from '../content';
import {
  buildEvaluationMessages,
  buildRepairMessage,
  TEMPLATE_VERSION,
} from './evaluation-prompt';
import { EVAL_LLM_CLIENT, type EvalLlmClient } from './llm-client';
import { validateFeedback } from './validate-feedback';
import type { ValidatedFeedback } from './feedback.types';
import type { Wellbeing } from './validate-feedback';

/** Below this, there is not enough writing to rate skills; the student is asked to write more. */
export const MIN_WORDS_FOR_FEEDBACK = 15;
/** Kindergarten to Grade 2 pieces are often a sentence or two, which is enough to give feedback on. */
export const MIN_WORDS_FOR_FEEDBACK_EARLY = 5;

export type EvaluationOutcome =
  | {
      kind: 'complete';
      feedback: ValidatedFeedback;
      wellbeing: Wellbeing;
      /** True when the first answer failed validation and a repair was needed. */
      repaired: boolean;
      model: string;
      templateVersion: string;
    }
  | { kind: 'not_scored'; code: 'too_short' }
  | { kind: 'invalid'; code: 'validation_failed' };

export const countWords = (text: string) =>
  (text.trim().match(/\S+/g) || []).length;

@Injectable()
export class EvaluatorService {
  private readonly logger = new Logger(EvaluatorService.name);

  constructor(
    @Inject(EVAL_LLM_CLIENT) private readonly client: EvalLlmClient,
  ) {}

  /**
   * Evaluates one submission. Rate limits and provider errors propagate so the caller
   * can re-queue the job; invalid output gets one bounded repair attempt.
   */
  async evaluate(input: {
    prompt: WritingPrompt;
    rubric: Rubric;
    gradeLevel: string;
    curriculum: FrameworkId;
    text: string;
    eal?: boolean;
    dictated?: boolean;
    scribed?: boolean;
    /** Only for the independent second reading; normal grading uses the provider default (0). */
    temperature?: number;
  }): Promise<EvaluationOutcome> {
    const options =
      input.temperature === undefined
        ? undefined
        : { temperature: input.temperature };
    const minWords =
      input.rubric.band === 'K-2'
        ? MIN_WORDS_FOR_FEEDBACK_EARLY
        : MIN_WORDS_FOR_FEEDBACK;
    if (countWords(input.text) < minWords)
      return { kind: 'not_scored', code: 'too_short' };

    const messages = buildEvaluationMessages(input);
    const first = await this.client.completeJson(messages, options);
    let result = validateFeedback(first, input.rubric, input.text);
    const repaired = !result.ok;

    if (!result.ok) {
      // Problems describe the model's JSON (skill ids, quotes it produced), never the student.
      this.logger.warn(
        `[evaluate] repairing output: ${result.problems.length} problem(s)`,
      );
      const repaired = await this.client.completeJson(
        [
          ...messages,
          { role: 'assistant', content: first },
          buildRepairMessage(result.problems),
        ],
        options,
      );
      result = validateFeedback(repaired, input.rubric, input.text);
    }
    if (!result.ok) return { kind: 'invalid', code: 'validation_failed' };
    return {
      kind: 'complete',
      feedback: result.feedback,
      wellbeing: result.wellbeing,
      repaired,
      model: this.client.model,
      templateVersion: TEMPLATE_VERSION,
    };
  }
}
