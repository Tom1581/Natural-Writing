import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  createParamDecorator,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  createRemoteJWKSet,
  jwtVerify,
  decodeJwt,
  decodeProtectedHeader,
  type JWTPayload,
} from 'jose';
import type { Request } from 'express';

export interface Actor {
  /**
   * "adult": a parent, guardian or teacher signed in with Supabase.
   * "learner": a student signed in with a code; limited to their own profile.
   */
  kind: 'adult' | 'learner';
  /** Supabase user id for adults; "learner:<id>" for students. Ownership is never keyed on an email. */
  subject: string;
  email: string | null;
  /** Set only for learner sessions. */
  learnerId?: string;
}

/** Issuer of student session tokens (signed with LEARNING_SESSION_SECRET). */
export const LEARNER_TOKEN_ISSUER = 'natural-quill-learning';
export const LEARNER_TOKEN_AUDIENCE = 'learner';

type ActorRequest = Request & { actor?: Actor };

/**
 * Verifies a Supabase access token sent as `Authorization: Bearer <jwt>`.
 * Asymmetric projects are checked against the project's public JWKS; legacy
 * HS256 projects (and tests) use SUPABASE_JWT_SECRET.
 */
@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private jwks: ReturnType<typeof createRemoteJWKSet> | null = null;

  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<ActorRequest>();
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
    if (!token) throw new UnauthorizedException('Sign in to continue.');

    if (this.isLearnerToken(token)) {
      const secret = this.configService.get<string>('LEARNING_SESSION_SECRET');
      const verified = secret
        ? await jwtVerify(token, new TextEncoder().encode(secret), {
            issuer: LEARNER_TOKEN_ISSUER,
            audience: LEARNER_TOKEN_AUDIENCE,
            algorithms: ['HS256'],
          }).catch(() => null)
        : null;
      const learnerId = verified?.payload.lid;
      if (!verified || typeof learnerId !== 'string') {
        throw new UnauthorizedException(
          'Your student session has ended. Ask your teacher or parent for your code.',
        );
      }
      req.actor = {
        kind: 'learner',
        subject: `learner:${learnerId}`,
        email: null,
        learnerId,
      };
      return true;
    }

    const payload = await this.verify(token).catch(() => {
      throw new UnauthorizedException(
        'Your session has expired. Please sign in again.',
      );
    });
    if (!payload.sub || payload.role !== 'authenticated') {
      throw new UnauthorizedException('Sign in to continue.');
    }
    req.actor = {
      kind: 'adult',
      subject: payload.sub,
      email: typeof payload.email === 'string' ? payload.email : null,
    };
    return true;
  }

  private isLearnerToken(token: string) {
    try {
      return decodeJwt(token).iss === LEARNER_TOKEN_ISSUER;
    } catch {
      return false;
    }
  }

  private async verify(token: string): Promise<JWTPayload> {
    const supabaseUrl = (
      this.configService.get<string>('SUPABASE_URL') || ''
    ).replace(/\/+$/, '');
    const issuer = supabaseUrl ? `${supabaseUrl}/auth/v1` : undefined;
    const options = { issuer, audience: 'authenticated' };

    const { alg } = decodeProtectedHeader(token);
    if (alg === 'HS256') {
      const secret = this.configService.get<string>('SUPABASE_JWT_SECRET');
      if (!secret) throw new Error('SUPABASE_JWT_SECRET not set');
      return (
        await jwtVerify(token, new TextEncoder().encode(secret), {
          ...options,
          algorithms: ['HS256'],
        })
      ).payload;
    }

    if (!supabaseUrl) throw new Error('SUPABASE_URL not set');
    this.jwks ??= createRemoteJWKSet(
      new URL(`${supabaseUrl}/auth/v1/.well-known/jwks.json`),
    );
    return (
      await jwtVerify(token, this.jwks, {
        ...options,
        algorithms: ['ES256', 'RS256'],
      })
    ).payload;
  }
}

export const CurrentActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Actor => {
    const actor = context.switchToHttp().getRequest<ActorRequest>().actor;
    if (!actor) throw new UnauthorizedException('Sign in to continue.');
    return actor;
  },
);

/**
 * For routes that also serve signed-out visitors (the converter's free trial). With no
 * Authorization header the request continues with no actor; a header that is present but
 * invalid is rejected, so a stale session is never silently treated as anonymous.
 */
@Injectable()
export class OptionalSupabaseAuthGuard extends SupabaseAuthGuard {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<ActorRequest>();
    if (!req.headers.authorization) return true;
    return super.canActivate(context);
  }
}

/** The verified actor, or null for a signed-out visitor. Use with OptionalSupabaseAuthGuard. */
export const OptionalActor = createParamDecorator(
  (_data: unknown, context: ExecutionContext): Actor | null =>
    context.switchToHttp().getRequest<ActorRequest>().actor ?? null,
);

/**
 * The verified email of a signed-in adult (lowercased), or null. Billing and converter usage
 * are keyed on this. Student sessions never have one.
 */
export function verifiedAdultEmail(actor: Actor | null): string | null {
  return actor?.kind === 'adult' && actor.email
    ? actor.email.trim().toLowerCase()
    : null;
}
