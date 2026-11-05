import {
  Controller, Post, Body, Headers, Req,
  HttpCode, Get, Query, BadRequestException, UseGuards,
} from '@nestjs/common';
import { CurrentActor, SupabaseAuthGuard, verifiedAdultEmail, type Actor } from '../auth/supabase-auth.guard';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService, PlanKey, PLANS } from './stripe.service';

interface CheckoutDto {
  plan: PlanKey;
}

/** Billing always acts on the signed-in user's own verified email, never one sent in the request. */
function requireEmail(actor: Actor): string {
  const email = verifiedAdultEmail(actor);
  if (!email) throw new BadRequestException('Sign in with an email address to manage billing.');
  return email;
}

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Get('plans')
  getPlans() {
    return Object.entries(PLANS).map(([key, p]) => ({
      key,
      name: p.name,
      amount: p.amount,
      wordLimit: p.wordLimit === Infinity ? null : p.wordLimit,
      billingModel: p.billingModel,
      wordsGranted: p.wordsGranted,
    }));
  }

  @Get('customer-state')
  @UseGuards(SupabaseAuthGuard)
  async getCustomerState(@CurrentActor() actor: Actor) {
    return this.stripeService.getCustomerState(requireEmail(actor));
  }

  @Post('checkout')
  @HttpCode(200)
  @UseGuards(SupabaseAuthGuard)
  async checkout(@Body() body: CheckoutDto, @Req() req: RawBodyRequest<Request>, @CurrentActor() actor: Actor) {
    const { plan } = body;
    const email = requireEmail(actor);
    const userId = actor.subject;
    if (!PLANS[plan]) throw new BadRequestException('Unknown plan');
    const origin =
      (req.headers['origin'] as string) ||
      (req.headers['referer'] as string)?.replace(/\/$/, '') ||
      'http://localhost:3000';
    const url = await this.stripeService.createCheckoutSession(plan, email, userId, origin);
    return { url };
  }

  @Post('webhook')
  @HttpCode(200)
  async webhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    if (!req.rawBody) throw new BadRequestException('Missing raw body');
    await this.stripeService.handleWebhook(req.rawBody, signature);
    return { received: true };
  }

  @Post('billing-portal')
  @HttpCode(200)
  @UseGuards(SupabaseAuthGuard)
  async billingPortal(@Req() req: RawBodyRequest<Request>, @CurrentActor() actor: Actor) {
    const email = requireEmail(actor);
    const origin =
      (req.headers['origin'] as string) ||
      (req.headers['referer'] as string)?.replace(/\/$/, '') ||
      'http://localhost:3000';
    const url = await this.stripeService.createBillingPortalSession(email, origin);
    return { url };
  }

  @Get('verify-session')
  async verifySession(@Query('session_id') sessionId: string) {
    if (!sessionId) throw new BadRequestException('Missing session_id');
    const result = await this.stripeService.getSubscriptionBySession(sessionId);
    if (!result) throw new BadRequestException('Session not found');
    return result;
  }
}
