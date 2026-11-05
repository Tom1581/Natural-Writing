import { Controller, Post, Get, Body, Param, Query, Req, UseGuards } from '@nestjs/common';
import { isAdminEmail } from '../auth/admin';
import { IpRateLimitGuard } from '../auth/ip-rate-limit.guard';
import { OptionalActor, OptionalSupabaseAuthGuard, SupabaseAuthGuard, verifiedAdultEmail, type Actor } from '../auth/supabase-auth.guard';
import type { Request } from 'express';
import { RewriteService, RewriteOptions } from './rewrite.service';
import { StyleMemoryService } from './style-memory.service';
import { RhythmService } from './rhythm.service';
import { OracleService } from './oracle.service';
import { GenesisService } from './genesis.service';
import { BenchmarkService } from './benchmark.service';
import { ComplianceService } from './compliance.service';
import { FinalityService } from './finality.service';
import { StripeService } from '../stripe/stripe.service';

@Controller('rewrite')
export class RewriteController {
  constructor(
    private readonly rewriteService: RewriteService,
    private readonly styleMemoryService: StyleMemoryService,
    private readonly rhythmService: RhythmService,
    private readonly oracleService: OracleService,
    private readonly genesisService: GenesisService,
    private readonly benchmarkService: BenchmarkService,
    private readonly complianceService: ComplianceService,
    private readonly finalityService: FinalityService,
    private readonly stripeService: StripeService,
  ) {}

  // ─── Static routes first (prevent /:id shadowing) ─────────────────────────

  @Get('finality-audit')
  performFinalityAudit() {
    return this.finalityService.performFinalityAudit();
  }

  @Get('compliance-check')
  @UseGuards(IpRateLimitGuard)
  performComplianceCheck(@Query('text') text: string) {
    return this.complianceService.performComplianceCheck(text);
  }

  @Get('industry-benchmarks')
  getIndustryBenchmarks() {
    return this.benchmarkService.getIndustryBenchmarks();
  }

  @Get('stats')
  getPlatformStats() {
    return this.rewriteService.getPlatformStats();
  }

  // Usage and billing state belong to the signed-in user only. The email comes from the
  // verified session token; an ?email= query parameter is ignored.

  @Get('free-usage')
  @UseGuards(OptionalSupabaseAuthGuard)
  getFreeUsage(@OptionalActor() actor: Actor | null) {
    const email = verifiedAdultEmail(actor);
    if (!email) return { wordsUsed: 0, limit: 400 };
    return this.rewriteService.getFreeUsage(email);
  }

  @Get('access-status')
  @UseGuards(OptionalSupabaseAuthGuard)
  async getAccessStatus(@OptionalActor() actor: Actor | null) {
    const email = verifiedAdultEmail(actor);
    if (!email) {
      return {
        tier: null,
        wordsRemaining: 0,
        totalWordsPurchased: 0,
        freeWordsUsed: 0,
        freeWordsLimit: 400,
        unlimitedActive: false,
        subscriptionStatus: null,
        canManageBilling: false,
      };
    }
    await this.stripeService.getCustomerState(email);
    return this.rewriteService.getAccessStatus(email);
  }

  @Get('oracle-projection')
  getOracleProjection(@Query('orgId') orgId: string) {
    return this.oracleService.projectROI(orgId);
  }

  @Get('rhythm-analysis')
  @UseGuards(IpRateLimitGuard)
  getRhythmAnalysis(@Query('text') text: string) {
    return this.rhythmService.analyzeCadence(text);
  }

  // ─── Static POST routes ───────────────────────────────────────────────────

  @Post('process')
  @UseGuards(OptionalSupabaseAuthGuard)
  async processText(
    // userEmail / subscriptionTier may still arrive from older clients; they are ignored.
    @Body() body: { text: string; options: RewriteOptions },
    @Req() req: Request,
    @OptionalActor() actor: Actor | null,
  ) {
    const ip =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      'unknown';

    // Identity, admin status and paid access all come from the verified session, never the body.
    const email = verifiedAdultEmail(actor);
    const isAdmin = isAdminEmail(email);
    const tier = isAdmin ? 'admin' : null;
    if (email && !isAdmin) {
      await this.stripeService.getCustomerState(email);
    }

    return this.rewriteService.processText(
      body.text,
      body.options,
      email,
      tier,
      ip,
    );
  }

  @Post('genesis-scaffold')
  // Writes records, so it is not open to signed-out visitors.
  @UseGuards(SupabaseAuthGuard)
  scaffold(@Body() body: { orgId: string; orgName: string }) {
    return this.genesisService.scaffoldOrganization(body.orgId, body.orgName);
  }

  @Post('chat')
  @UseGuards(IpRateLimitGuard)
  async chat(@Body() body: { query: string; content: string }) {
    const reply = await this.rewriteService.chatWithManuscript(body.query, body.content);
    // Return plain text (SidecarChat calls .text() on the response)
    return reply;
  }

  @Post('generate-draft')
  @UseGuards(IpRateLimitGuard)
  generateDraft(@Body() body: { paperType: string; wordCount: string; prompt: string }) {
    return this.rewriteService.generateDraft(body.paperType, body.wordCount, body.prompt);
  }

  @Post('profile-style')
  @UseGuards(IpRateLimitGuard)
  profileStyle(@Body() body: { text: string; name?: string }) {
    return this.styleMemoryService.profileStyle(body.text, body.name);
  }

  @Post('refine-sentence')
  @UseGuards(IpRateLimitGuard)
  refineSentence(@Body() body: { sentence: string; context: string; mode: string }) {
    return this.rewriteService.refineSentence(body.sentence, body.context, body.mode);
  }

  // ─── Parameterised routes last ────────────────────────────────────────────

  @Post(':id/spawn-readers')
  @UseGuards(IpRateLimitGuard)
  spawnReaders(@Param('id') id: string, @Body() body: { content: string }) {
    return this.rewriteService.spawnReaders(body.content);
  }

  @Post(':id/predict-engagement')
  @UseGuards(IpRateLimitGuard)
  predictEngagement(@Param('id') id: string, @Body() body: { content: string }) {
    return this.rewriteService.analyzeEngagement(body.content);
  }

  @Post(':id/synthesize')
  @UseGuards(IpRateLimitGuard)
  synthesize(@Param('id') id: string, @Body() body: { content: string; options?: any }) {
    return this.rewriteService.synthesizeMasterpiece(body.content, body.options);
  }
}
