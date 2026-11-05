import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { createHash, randomInt } from 'crypto';
import { SignJWT } from 'jose';
import { Repository } from 'typeorm';
import {
  LEARNER_TOKEN_AUDIENCE,
  LEARNER_TOKEN_ISSUER,
  type Actor,
} from '../auth/supabase-auth.guard';
import { AccessService } from './access.service';
import { LearnerEntity } from './entities';
import { LearningService } from './learning.service';
import { AuditService } from './audit.service';

/** No 0/O, 1/I/L: codes are read aloud and typed by children. 31 symbols × 12 = ~59 bits. */
const ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ';
const SESSION_HOURS = 12;

export const normalizeCode = (code: string) =>
  code.toUpperCase().replace(/[^0-9A-Z]/g, '');
const hashCode = (code: string) =>
  createHash('sha256').update(normalizeCode(code)).digest('hex');

/**
 * Student sign-in codes. An adult generates a code for one profile; the student enters it on
 * any device and gets a session limited to that profile (no adult, billing or other-student access).
 * The code is shown once; only its hash is stored. Generating a new code invalidates the old one.
 */
@Injectable()
export class StudentAccessService {
  private readonly attempts = new Map<
    string,
    { count: number; since: number }
  >();

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(LearnerEntity)
    private readonly learners: Repository<LearnerEntity>,
    private readonly access: AccessService,
    private readonly learning: LearningService,
    private readonly audit: AuditService,
  ) {}

  private secret() {
    const secret = this.config.get<string>('LEARNING_SESSION_SECRET');
    if (!secret || secret.length < 32) {
      throw new HttpException(
        'Student codes are not set up on this server yet.',
        HttpStatus.SERVICE_UNAVAILABLE,
      );
    }
    return new TextEncoder().encode(secret);
  }

  async createCode(actor: Actor, learnerId: string) {
    this.access.requireAdult(actor);
    this.secret();
    const learner = await this.access.learner(actor, learnerId);
    const raw = Array.from(
      { length: 12 },
      () => ALPHABET[randomInt(ALPHABET.length)],
    ).join('');
    const code = `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8)}`;
    await this.learners.update(
      { id: learner.id },
      { accessCodeHash: hashCode(code), accessCodeCreatedAt: new Date() },
    );
    await this.audit.record(
      actor,
      learner.organizationId,
      'student.code_created',
      { type: 'learner', id: learner.id },
    );
    return { code, learnerId: learner.id };
  }

  async revokeCode(actor: Actor, learnerId: string) {
    this.access.requireAdult(actor);
    const learner = await this.access.learner(actor, learnerId);
    await this.learners.update(
      { id: learner.id },
      { accessCodeHash: null, accessCodeCreatedAt: null },
    );
    await this.audit.record(
      actor,
      learner.organizationId,
      'student.code_revoked',
      { type: 'learner', id: learner.id },
    );
    return { revoked: true };
  }

  async startSession(code: string, clientKey: string) {
    const secret = this.secret();
    this.throttle(clientKey);
    const normalized = normalizeCode(code);
    const learner =
      normalized.length === 12
        ? await this.learners.findOneBy({
            accessCodeHash: hashCode(normalized),
          })
        : null;
    if (!learner || !(await this.access.hasAuthorization(learner.id))) {
      throw new UnauthorizedException(
        'That code didn’t work. Check it with your teacher or parent.',
      );
    }
    const expiresAt = new Date(Date.now() + SESSION_HOURS * 3600 * 1000);
    const token = await new SignJWT({ lid: learner.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuer(LEARNER_TOKEN_ISSUER)
      .setAudience(LEARNER_TOKEN_AUDIENCE)
      .setSubject(`learner:${learner.id}`)
      .setIssuedAt()
      .setExpirationTime(Math.floor(expiresAt.getTime() / 1000))
      .sign(secret);
    return { token, expiresAt, learner: this.learning.presentLearner(learner) };
  }

  /** Best-effort per-client limit (10 tries per 10 minutes). Codes are long enough that guessing is impractical anyway. */
  private throttle(key: string) {
    const now = Date.now();
    if (this.attempts.size > 5000) this.attempts.clear();
    const entry = this.attempts.get(key);
    if (!entry || now - entry.since > 10 * 60 * 1000) {
      this.attempts.set(key, { count: 1, since: now });
      return;
    }
    entry.count += 1;
    if (entry.count > 10)
      throw new HttpException(
        'Too many tries. Wait a few minutes and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
  }
}
