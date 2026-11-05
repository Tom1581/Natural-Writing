import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';

const WINDOW_MS = 10 * 60 * 1000;
const LIMIT = 30;
const hits = new Map<string, { count: number; since: number }>();

/** The client address as reported by the hosting platform (Vercel sets x-forwarded-for). */
export function clientIp(req: Request) {
  const forwarded = (req.headers['x-vercel-forwarded-for'] ||
    req.headers['x-forwarded-for']) as string | undefined;
  return (
    forwarded?.split(',')[0].trim() || req.socket?.remoteAddress || 'unknown'
  );
}

/**
 * Best-effort limit for AI-backed converter tools that signed-out visitors can call:
 * 30 requests per 10 minutes per address, per server instance. It protects the shared
 * free AI quota from scripted abuse; it is not a security boundary.
 */
@Injectable()
export class IpRateLimitGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const key = clientIp(context.switchToHttp().getRequest<Request>());
    const now = Date.now();
    if (hits.size > 10_000) hits.clear();
    const entry = hits.get(key);
    if (!entry || now - entry.since > WINDOW_MS) {
      hits.set(key, { count: 1, since: now });
      return true;
    }
    entry.count += 1;
    if (entry.count > LIMIT) {
      throw new HttpException(
        'Too many requests. Please wait a few minutes and try again.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
    return true;
  }
}
