import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  getPrompt,
  getRubric,
  GRADES_IN_BAND,
  LESSONS,
  SKILLS,
} from './content';
import {
  countWords,
  EvaluatorService,
  MIN_WORDS_FOR_FEEDBACK,
  MIN_WORDS_FOR_FEEDBACK_EARLY,
} from './evaluator/evaluator.service';
import { BudgetExceededError, RateLimitedError } from './evaluator/llm-client';
import type { GuestFeedbackDto } from './learning.dto';
import { screenText, SUPPORT } from './safety';
import { UsageService } from './usage.service';

/** Feedback requests per visitor per hour. Best effort: kept in memory on each server instance. */
export const GUEST_HOURLY_LIMIT = 5;
/** Share of the daily AI budget guests may use, so students with profiles always get feedback. */
export const DEFAULT_GUEST_BUDGET_SHARE = 0.4;
const HOUR_MS = 60 * 60 * 1000;

/**
 * Writing feedback without an account, for any age. Nothing is stored: not the text, the
 * feedback or the visitor's address (the hourly limit lives only in memory). The usage ledger
 * records token counts under "guest", with no learner or owner.
 */
@Injectable()
export class GuestService {
  private readonly requests = new Map<string, number[]>();
  private readonly budgetShare: number;

  constructor(
    private readonly evaluator: EvaluatorService,
    private readonly usage: UsageService,
    config: ConfigService,
  ) {
    const raw = config.get<string>('AI_GUEST_BUDGET_SHARE');
    const share = raw ? Number(raw) : NaN;
    this.budgetShare =
      share >= 0 && share <= 1 ? share : DEFAULT_GUEST_BUDGET_SHARE;
  }

  async feedback(dto: GuestFeedbackDto, client: string) {
    const prompt = getPrompt(dto.promptId);
    const rubric = prompt && getRubric(prompt.rubricId);
    if (!prompt || !rubric) throw new NotFoundException('Prompt not found.');
    const grades = GRADES_IN_BAND[prompt.band];
    const grade =
      dto.grade?.toUpperCase() ?? grades[Math.floor(grades.length / 2)];
    if (!grades.includes(grade))
      throw new BadRequestException(
        'This prompt is for a different age group. Choose a prompt for your grade.',
      );

    // Too-short writing never reaches the AI, so it doesn't use one of the hourly requests.
    const minWords =
      prompt.band === 'K-2'
        ? MIN_WORDS_FOR_FEEDBACK_EARLY
        : MIN_WORDS_FOR_FEEDBACK;
    if (countWords(dto.text) < minWords)
      return { kind: 'not_scored' as const, code: 'too_short' };

    if (
      (await this.usage.tokensTodayFor('guest')) >=
      this.usage.dailyBudget * this.budgetShare
    )
      throw new HttpException(
        'Free feedback without an account has reached today’s limit. Try again tomorrow, or ask a parent or teacher to make you a profile.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    this.throttle(client);

    const curriculum = dto.curriculum;
    const screen = screenText(dto.text);
    try {
      const outcome = await this.usage.withContext(
        { purpose: 'guest', learnerId: null, ownerKey: null },
        () =>
          this.evaluator.evaluate({
            prompt,
            rubric,
            gradeLevel: grade,
            curriculum,
            text: dto.text,
            scribed: !!dto.scribed && prompt.band === 'K-2',
          }),
      );
      if (outcome.kind === 'not_scored')
        return { kind: 'not_scored' as const, code: outcome.code };
      if (outcome.kind === 'invalid')
        throw new HttpException(
          'We couldn’t produce feedback we trust this time, so we didn’t show any. Please try again.',
          HttpStatus.SERVICE_UNAVAILABLE,
        );

      const concerns = [
        ...screen.map((h) => h.category as string),
        ...(outcome.wellbeing.concern === 'none'
          ? []
          : [outcome.wellbeing.category]),
      ];
      const nextSkill = outcome.feedback.nextSteps[0]?.skillId;
      const lesson = nextSkill
        ? LESSONS.find((l) => l.band === prompt.band && l.skillId === nextSkill)
        : undefined;
      return {
        kind: 'complete' as const,
        grade,
        band: prompt.band,
        feedback: outcome.feedback,
        skillNames: Object.fromEntries(
          rubric.dimensions.map((d) => [
            d.skillId,
            SKILLS.find((s) => s.id === d.skillId)?.name ?? d.skillId,
          ]),
        ),
        suggestedLesson: lesson ? { id: lesson.id, title: lesson.title } : null,
        support: concerns.length
          ? {
              wellbeing: concerns.some((c) => c !== 'personal_info'),
              personalInfo: concerns.includes('personal_info'),
              ...SUPPORT[curriculum],
            }
          : null,
      };
    } catch (err) {
      if (err instanceof HttpException) throw err;
      if (err instanceof BudgetExceededError)
        throw new HttpException(
          'Feedback has reached today’s limit for the free service. Try again after midnight (UTC).',
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      if (err instanceof RateLimitedError)
        throw new HttpException(
          `Lots of students are writing right now. Try again in about ${err.retryAfterSeconds} seconds; your writing is still on this page.`,
          HttpStatus.SERVICE_UNAVAILABLE,
        );
      throw new HttpException(
        'Feedback is not available right now. Your writing is still on this page.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
  }

  private throttle(client: string) {
    const now = Date.now();
    if (this.requests.size > 5000) this.requests.clear();
    const recent = (this.requests.get(client) ?? []).filter(
      (t) => now - t < HOUR_MS,
    );
    if (recent.length >= GUEST_HOURLY_LIMIT)
      throw new HttpException(
        `You can get feedback ${GUEST_HOURLY_LIMIT} times an hour without an account. Use the time to revise, then try again.`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    recent.push(now);
    this.requests.set(client, recent);
  }
}
