import { Controller, Post, Get, Body, Param, Query } from '@nestjs/common';
import { RewriteService, RewriteOptions } from './rewrite.service';
import { StyleMemoryService } from './style-memory.service';
import { SemanticService } from './semantic.service';
import { RhythmService } from './rhythm.service';
import { EvolutionService } from './evolution.service';
import { OracleService } from './oracle.service';
import { GenesisService } from './genesis.service';
import { BenchmarkService } from './benchmark.service';
import { ComplianceService } from './compliance.service';
import { FinalityService } from './finality.service';

@Controller('rewrite')
export class RewriteController {
  constructor(
    private readonly rewriteService: RewriteService,
    private readonly styleMemoryService: StyleMemoryService,
    private readonly semanticService: SemanticService,
    private readonly rhythmService: RhythmService,
    private readonly evolutionService: EvolutionService,
    private readonly oracleService: OracleService,
    private readonly genesisService: GenesisService,
    private readonly benchmarkService: BenchmarkService,
    private readonly complianceService: ComplianceService,
    private readonly finalityService: FinalityService,
  ) {}

  // ─── Static routes first (prevent /:id shadowing) ─────────────────────────

  @Get('finality-audit')
  performFinalityAudit() {
    return this.finalityService.performFinalityAudit();
  }

  @Get('compliance-check')
  performComplianceCheck(@Query('text') text: string) {
    return this.complianceService.performComplianceCheck(text);
  }

  @Get('industry-benchmarks')
  getIndustryBenchmarks() {
    return this.benchmarkService.getIndustryBenchmarks();
  }

  @Get('history')
  getHistory() {
    return this.rewriteService.getHistory();
  }

  @Get('stats')
  getPlatformStats() {
    return this.rewriteService.getPlatformStats();
  }

  @Get('projects')
  getProjects() {
    return this.rewriteService.getProjects();
  }

  @Get('oracle-projection')
  getOracleProjection(@Query('orgId') orgId: string) {
    return this.oracleService.projectROI(orgId);
  }

  @Get('style-drift')
  getStyleDrift(@Query('orgId') orgId: string) {
    return this.evolutionService.getStyleDrift(orgId);
  }

  @Get('rhythm-analysis')
  getRhythmAnalysis(@Query('text') text: string) {
    return this.rhythmService.analyzeCadence(text);
  }

  @Get('semantic-search')
  semanticSearch(@Query('q') query: string, @Query('orgId') orgId: string) {
    return this.semanticService.search(query, orgId);
  }

  @Get('semantic-map')
  getSemanticMap(@Query('orgId') orgId: string) {
    return this.semanticService.getSemanticMap(orgId);
  }

  // ─── Static POST routes ───────────────────────────────────────────────────

  @Post('process')
  processText(@Body() body: { text: string; options: RewriteOptions }) {
    return this.rewriteService.processText(body.text, body.options);
  }

  @Post('genesis-scaffold')
  scaffold(@Body() body: { orgId: string; orgName: string }) {
    return this.genesisService.scaffoldOrganization(body.orgId, body.orgName);
  }

  @Post('log-feedback')
  logFeedback(@Body() body: { manuscriptId: string; aiText: string; humanText: string }) {
    return this.styleMemoryService.logFeedback(body.manuscriptId, body.aiText, body.humanText);
  }

  @Post('projects')
  createProject(@Body() body: { name: string; description?: string }) {
    return this.rewriteService.createProject(body.name, body.description);
  }

  @Post('chat')
  async chat(@Body() body: { query: string; content: string }) {
    const reply = await this.rewriteService.chatWithManuscript(body.query, body.content);
    // Return plain text (SidecarChat calls .text() on the response)
    return reply;
  }

  @Post('profile-style')
  profileStyle(@Body() body: { text: string; name?: string }) {
    return this.styleMemoryService.profileStyle(body.text, body.name);
  }

  @Post('refine-sentence')
  refineSentence(@Body() body: { sentence: string; context: string; mode: string }) {
    return this.rewriteService.refineSentence(body.sentence, body.context, body.mode);
  }

  // ─── Parameterised routes last ────────────────────────────────────────────

  @Get('versions/:manuscriptId')
  getVersions(@Param('manuscriptId') manuscriptId: string) {
    return this.rewriteService.getVersions(manuscriptId);
  }

  @Post(':id/spawn-readers')
  spawnReaders(@Param('id') id: string, @Body() body: { content: string }) {
    return this.rewriteService.spawnReaders(body.content);
  }

  @Post(':id/predict-engagement')
  predictEngagement(@Param('id') id: string, @Body() body: { content: string }) {
    return this.rewriteService.analyzeEngagement(body.content);
  }

  @Post(':id/synthesize')
  synthesize(@Param('id') id: string, @Body() body: { content: string; options?: any }) {
    return this.rewriteService.synthesizeMasterpiece(body.content, body.options);
  }
}
