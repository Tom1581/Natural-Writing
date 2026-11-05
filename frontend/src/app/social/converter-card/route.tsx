import { converterOgCard } from '@/lib/converterOgCard';

/**
 * Stable URL for the converter's share card. Metadata images inside route groups are served at
 * hashed paths, so pages and JSON-LD that name the image directly point here instead.
 */
export function GET() {
  return converterOgCard();
}
