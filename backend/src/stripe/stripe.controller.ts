import {
  Controller, Post, Body, Headers, Req,
  HttpCode, Get, Query, BadRequestException,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common';
import type { Request } from 'express';
import { StripeService, PlanKey, PLANS } from './stripe.service';

interface CheckoutDto {
  plan: PlanKey;
  email: string;
  userId: string;
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
  async getCustomerState(@Query('email') email: string) {
    if (!email) throw new BadRequestException('Missing email');
    return this.stripeService.getCustomerState(email);
  }

  @Post('checkout')
  @HttpCode(200)
  async checkout(@Body() body: CheckoutDto, @Req() req: RawBodyRequest<Request>) {
    const { plan, email, userId } = body;
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
  async billingPortal(@Body() body: { email: string }, @Req() req: RawBodyRequest<Request>) {
    if (!body.email) throw new BadRequestException('Missing email');
    const origin =
      (req.headers['origin'] as string) ||
      (req.headers['referer'] as string)?.replace(/\/$/, '') ||
      'http://localhost:3000';
    const url = await this.stripeService.createBillingPortalSession(body.email, origin);
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
