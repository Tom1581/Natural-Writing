import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsageService } from './usage.service';
import type { Actor } from '../auth/supabase-auth.guard';
import { AccessService } from './access.service';
import { getPrompt, type FrameworkId } from './content';
import { DraftEntity, LearnerEntity } from './entities';
import { buildCoachMessages, validateCoach } from './evaluator/coach';
import { buildRepairMessage } from './evaluator/evaluation-prompt';
import {
  countWords,
  MIN_WORDS_FOR_FEEDBACK,
  MIN_WORDS_FOR_FEEDBACK_EARLY,
} from './evaluator/evaluator.service';
import {
  EVAL_LLM_CLIENT,
  BudgetExceededError,
  RateLimitedError,
  type EvalLlmClient,
} from './evaluator/llm-client';

/** Checks per draft per 24 hours: keeps the free AI tier available for everyone's final feedback. */
export const COACH_DAILY_LIMIT = 6;
const DAY_MS = 24 * 60 * 60 * 1000;

@Injectable()
export class CoachService {
  constructor(
    @InjectRepository(DraftEntity)
    private readonly drafts: Repository<DraftEntity>,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    @Inject(EVAL_LLM_CLIENT) private readonly client: EvalLlmClient,
    private readonly access: AccessService,
    private readonly usage: UsageService,
  ) {}

  async check(actor: Actor, draftId: string) {
    const draft = await this.access.draft(actor, draftId);
    const prompt = getPrompt(draft.promptId);
    if (!prompt)
      throw new BadRequestException('That prompt is no longer available.');
    if (prompt.checkIn || prompt.checkpoint) {
      throw new ForbiddenException(
        'Check-ins and checkpoints are written on your own, so the coach is turned off. You can use it on every other prompt.',
      );
    }
    const minWords =
      prompt.band === 'K-2'
        ? MIN_WORDS_FOR_FEEDBACK_EARLY
        : MIN_WORDS_FOR_FEEDBACK;
    if (countWords(draft.content) < minWords) {
      throw new BadRequestException(
        'Write a few more sentences first, then check again.',
      );
    }
    await this.access.requireAuthorization(draft.learnerId);

    const now = Date.now();
    const windowActive =
      draft.coachWindowStart &&
      now - new Date(draft.coachWindowStart).getTime() < DAY_MS;
    const used = windowActive ? draft.coachUses : 0;
    if (used >= COACH_DAILY_LIMIT) {
      throw new HttpException(
        `You've used all ${COACH_DAILY_LIMIT} checks for this draft today. Use the success checklist, or submit for feedback.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const learner = await this.learners.findOneByOrFail({
      id: draft.learnerId,
    });
    const messages = buildCoachMessages({
      prompt,
      gradeLevel: learner.gradeLevel,
      curriculum: learner.curriculum as FrameworkId,
      text: draft.content,
    });
    try {
      const result = await this.usage.withContext(
        {
          purpose: 'coach',
          learnerId: learner.id,
          ownerKey: learner.organizationId ?? learner.ownerSubject,
        },
        async () => {
          const first = await this.client.completeJson(messages);
          const checked = validateCoach(first, prompt);
          if (checked.ok) return checked;
          return validateCoach(
            await this.client.completeJson([
              ...messages,
              { role: 'assistant', content: first },
              buildRepairMessage(checked.problems),
            ]),
            prompt,
          );
        },
      );
      if (!result.ok)
        throw new HttpException(
          'The coach could not check this draft right now. Try again in a moment.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );

      await this.drafts.update(
        { id: draft.id },
        {
          coachUses: used + 1,
          coachWindowStart: windowActive
            ? draft.coachWindowStart
            : new Date(now),
          coachUsedSinceSubmit: true,
        },
      );
      return {
        ...result.result,
        remaining: COACH_DAILY_LIMIT - used - 1,
        revision: draft.revision,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if (err instanceof BudgetExceededError) {
        throw new HttpException(
          'Draft checks are resting until tomorrow. Use the success checklist, or submit for feedback: your writing is saved.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      if (err instanceof RateLimitedError) {
        throw new HttpException(
          `Lots of students are writing right now. Try the coach again in about ${err.retryAfterSeconds} seconds.`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      }
      throw new HttpException(
        'The coach is not available right now. Your draft is saved.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }
}
