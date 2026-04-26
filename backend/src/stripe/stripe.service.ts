import { Injectable, Logger, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Stripe from 'stripe';
import { BillingAccountEntity } from '../rewrite/entities/billing-account.entity';

type BillingModel = 'one_time' | 'subscription';

export const PLANS = {
  starter: {
    name: 'Starter',
    billingModel: 'one_time' as BillingModel,
    wordLimit: 10_000,
    wordsGranted: 10_000,
    amount: 1999,
  },
  pro: {
    name: 'Pro',
    billingModel: 'one_time' as BillingModel,
    wordLimit: 50_000,
    wordsGranted: 50_000,
    amount: 2999,
  },
  unlimited: {
    name: 'Unlimited',
    billingModel: 'subscription' as BillingModel,
    wordLimit: Infinity,
    wordsGranted: null,
    amount: 3999,
  },
} as const;

export type PlanKey = keyof typeof PLANS;

@Injectable()
export class StripeService {
  private readonly stripe: InstanceType<typeof Stripe>;
  private readonly logger = new Logger(StripeService.name);

  private readonly isConfigured: boolean;

  constructor(
    private config: ConfigService,
    @InjectRepository(BillingAccountEntity)
    private readonly billingAccountRepo: Repository<BillingAccountEntity>,
  ) {
    const key = config.get<string>('STRIPE_SECRET_KEY') || '';
    const isPlaceholder = !key || key.includes('REPLACE') || key === 'sk_test_placeholder';
    this.isConfigured = !isPlaceholder;
    if (isPlaceholder) {
      this.logger.warn('Stripe is not configured — set STRIPE_SECRET_KEY in backend/.env');
    }
    this.stripe = new Stripe(isPlaceholder ? 'sk_test_placeholder' : key, { apiVersion: '2026-04-22.dahlia' as any });
  }

  private assertConfigured() {
    if (!this.isConfigured) {
      throw new ServiceUnavailableException(
        'Stripe payments are not configured yet. Add your STRIPE_SECRET_KEY to backend/.env (get it from dashboard.stripe.com/apikeys).',
      );
    }
  }

  private normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
  }

  private getPriceId(plan: PlanKey): string {
    switch (plan) {
      case 'starter':
        return this.config.get<string>('STRIPE_PRICE_STARTER') || 'price_REPLACE_WITH_STARTER_PRICE_ID';
      case 'pro':
        return this.config.get<string>('STRIPE_PRICE_PRO') || 'price_REPLACE_WITH_PRO_PRICE_ID';
      case 'unlimited':
        return this.config.get<string>('STRIPE_PRICE_UNLIMITED') || 'price_REPLACE_WITH_UNLIMITED_PRICE_ID';
    }
  }

  private isUnlimitedStatusActive(status?: string | null): boolean {
    return status === 'active' || status === 'trialing';
  }

  private higherPackTier(current: string | null, next: PlanKey): string {
    const rank: Record<string, number> = { starter: 1, pro: 2 };
    if (!current) return next;
    return (rank[next] ?? 0) >= (rank[current] ?? 0) ? next : current;
  }

  private async findOrCreateBillingAccount(email: string): Promise<BillingAccountEntity> {
    const normalizedEmail = this.normalizeEmail(email);
    const existing = await this.billingAccountRepo.findOne({ where: { email: normalizedEmail } });
    if (existing) return existing;
    return this.billingAccountRepo.create({
      email: normalizedEmail,
      packTier: null,
      wordBalance: 0,
      lifetimeWordsPurchased: 0,
      unlimitedActive: false,
      subscriptionStatus: null,
      stripeCustomerId: null,
      stripeSubscriptionId: null,
      lastCheckoutSessionId: null,
      lastPaymentIntentId: null,
    });
  }

  private async applyCheckoutSession(session: any): Promise<void> {
    const plan = session.metadata?.plan as PlanKey | undefined;
    const email = session.customer_details?.email || session.customer_email || session.metadata?.email;

    if (!plan || !email || !PLANS[plan]) return;

    const account = await this.findOrCreateBillingAccount(email);
    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    account.stripeCustomerId = customerId || account.stripeCustomerId;

    if (PLANS[plan].billingModel === 'subscription') {
      account.unlimitedActive = true;
      account.subscriptionStatus =
        (typeof session.subscription === 'object' && session.subscription?.status) || 'active';
      account.stripeSubscriptionId =
        typeof session.subscription === 'string' ? session.subscription : session.subscription?.id || account.stripeSubscriptionId;
      account.lastCheckoutSessionId = session.id || account.lastCheckoutSessionId;
      await this.billingAccountRepo.save(account);
      return;
    }

    const sessionId = session.id || null;
    if (account.lastCheckoutSessionId && sessionId && account.lastCheckoutSessionId === sessionId) {
      return;
    }

    const wordsGranted = PLANS[plan].wordsGranted || 0;
    account.packTier = this.higherPackTier(account.packTier, plan);
    account.wordBalance += wordsGranted;
    account.lifetimeWordsPurchased += wordsGranted;
    account.lastCheckoutSessionId = sessionId || account.lastCheckoutSessionId;
    account.lastPaymentIntentId =
      typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id || account.lastPaymentIntentId;
    await this.billingAccountRepo.save(account);
  }

  private async refreshUnlimitedAccountState(account: BillingAccountEntity): Promise<BillingAccountEntity> {
    if (!this.isConfigured) return account;
    if (!account.stripeSubscriptionId && !account.stripeCustomerId) return account;

    let activeSubscription: any = null;

    if (account.stripeSubscriptionId) {
      try {
        activeSubscription = await this.stripe.subscriptions.retrieve(account.stripeSubscriptionId);
      } catch {
        activeSubscription = null;
      }
    }

    if (!activeSubscription && account.stripeCustomerId) {
      const subs = await this.stripe.subscriptions.list({
        customer: account.stripeCustomerId,
        status: 'all',
        limit: 10,
      });
      activeSubscription =
        subs.data.find(sub => this.isUnlimitedStatusActive(sub.status)) ||
        subs.data[0] ||
        null;
    }

    if (!activeSubscription) {
      account.unlimitedActive = false;
      account.subscriptionStatus = 'canceled';
      account.stripeSubscriptionId = null;
      return this.billingAccountRepo.save(account);
    }

    account.stripeSubscriptionId = activeSubscription.id || account.stripeSubscriptionId;
    account.subscriptionStatus = activeSubscription.status || account.subscriptionStatus;
    account.unlimitedActive = this.isUnlimitedStatusActive(activeSubscription.status);
    return this.billingAccountRepo.save(account);
  }

  private resolveTier(account: BillingAccountEntity | null): PlanKey | null {
    if (!account) return null;
    if (account.unlimitedActive) return 'unlimited';
    if (account.wordBalance > 0 && (account.packTier === 'starter' || account.packTier === 'pro')) {
      return account.packTier;
    }
    return null;
  }

  async createCheckoutSession(
    plan: PlanKey,
    userEmail: string,
    userId: string,
    origin: string,
  ): Promise<string> {
    this.assertConfigured();
    const { billingModel } = PLANS[plan];
    const priceId = this.getPriceId(plan);

    if (priceId.includes('REPLACE')) {
      throw new ServiceUnavailableException(
        `Stripe price ID for "${plan}" is not configured. Create a product in dashboard.stripe.com/products and set STRIPE_PRICE_${plan.toUpperCase()} in backend/.env.`,
      );
    }

    const metadata = {
      userId,
      plan,
      email: this.normalizeEmail(userEmail),
      billingModel,
    };

    const sessionConfig: Record<string, unknown> = {
      mode: billingModel === 'subscription' ? 'subscription' : 'payment',
      payment_method_types: ['card'],
      customer_email: userEmail,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/`,
      metadata,
    };

    if (billingModel === 'subscription') {
      sessionConfig.subscription_data = { metadata };
    } else {
      sessionConfig.customer_creation = 'always';
    }

    const session = await this.stripe.checkout.sessions.create(sessionConfig as any);

    return (session as any).url!;
  }

  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    const secret = this.config.get<string>('STRIPE_WEBHOOK_SECRET') || '';
    let event: any;

    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, secret);
    } catch (err: any) {
      this.logger.error(`Webhook signature failed: ${err.message}`);
      throw err;
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as any;
        await this.applyCheckoutSession(session);
        break;
      }
      case 'customer.subscription.updated': {
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        const account = await this.billingAccountRepo.findOne({ where: { stripeCustomerId: customerId } });
        if (!account) break;
        account.stripeSubscriptionId =
          typeof sub.id === 'string' ? sub.id : account.stripeSubscriptionId;
        account.subscriptionStatus = sub.status || null;
        account.unlimitedActive = this.isUnlimitedStatusActive(sub.status);
        await this.billingAccountRepo.save(account);
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object as any;
        const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
        if (!customerId) break;
        const account = await this.billingAccountRepo.findOne({ where: { stripeCustomerId: customerId } });
        if (!account) break;
        account.unlimitedActive = false;
        account.subscriptionStatus = sub.status || 'canceled';
        if (account.stripeSubscriptionId === sub.id) {
          account.stripeSubscriptionId = null;
        }
        await this.billingAccountRepo.save(account);
        this.logger.log(`Unlimited subscription cancelled — email=${account.email}`);
        break;
      }
    }
  }

  async createBillingPortalSession(email: string, origin: string): Promise<string> {
    this.assertConfigured();
    const customers = await this.stripe.customers.list({ email: this.normalizeEmail(email), limit: 1 }) as any;
    if (!customers.data?.length) {
      throw new Error('No billing account found for this email.');
    }
    const session = await (this.stripe.billingPortal.sessions as any).create({
      customer: customers.data[0].id,
      return_url: origin,
    });
    return session.url;
  }

  async getCustomerState(email: string): Promise<{
    tier: PlanKey | null;
    billingModel: BillingModel | null;
    wordsRemaining: number;
    totalWordsPurchased: number;
    unlimitedActive: boolean;
    subscriptionStatus: string | null;
    canManageBilling: boolean;
  }> {
    let account = await this.billingAccountRepo.findOne({ where: { email: this.normalizeEmail(email) } });
    if (account?.stripeSubscriptionId || account?.stripeCustomerId) {
      account = await this.refreshUnlimitedAccountState(account);
    }
    const tier = this.resolveTier(account);
    return {
      tier,
      billingModel: tier ? PLANS[tier].billingModel : null,
      wordsRemaining: account?.wordBalance ?? 0,
      totalWordsPurchased: account?.lifetimeWordsPurchased ?? 0,
      unlimitedActive: account?.unlimitedActive ?? false,
      subscriptionStatus: account?.subscriptionStatus ?? null,
      canManageBilling: !!account?.unlimitedActive,
    };
  }

  async getSubscriptionBySession(sessionId: string): Promise<{
    plan: string;
    status: string;
    billingModel: BillingModel;
    wordsGranted: number | null;
  } | null> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId, {
        expand: ['subscription'],
      }) as any;
      const plan: string = session.metadata?.plan || 'unknown';
      const resolvedPlan = (plan in PLANS ? plan : 'unlimited') as PlanKey;
      const billingModel = session.mode === 'subscription' ? 'subscription' : 'one_time';
      if (
        (billingModel === 'subscription' && this.isUnlimitedStatusActive(session.subscription?.status)) ||
        (billingModel === 'one_time' && session.payment_status === 'paid')
      ) {
        await this.applyCheckoutSession(session);
      }
      const status: string =
        billingModel === 'subscription'
          ? session.subscription?.status || 'unknown'
          : session.payment_status || session.status || 'unknown';
      return {
        plan,
        status,
        billingModel,
        wordsGranted: billingModel === 'one_time' ? PLANS[resolvedPlan].wordsGranted : null,
      };
    } catch {
      return null;
    }
  }
}
