import type { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

const DEFAULT_ORIGINS = [
  'https://naturalquill.one',
  'https://www.naturalquill.one',
  'http://localhost:3000',
];

/**
 * Explicit origin allowlist shared by the local server and the Vercel handler.
 * Add preview or staging origins with CORS_ORIGINS (comma-separated).
 * CORS is not authorization; the learning API checks a verified session on every request.
 */
export function corsOptions(): CorsOptions {
  const extra = (process.env.CORS_ORIGINS || '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  const allowed = new Set([...DEFAULT_ORIGINS, ...extra]);
  return {
    origin: (origin, callback) =>
      callback(null, !origin || allowed.has(origin)),
    credentials: true,
  };
}
