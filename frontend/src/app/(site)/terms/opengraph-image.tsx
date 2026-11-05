import { CONVERTER_OG_ALT, converterOgCard } from '@/lib/converterOgCard';

export const alt = CONVERTER_OG_ALT;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return converterOgCard();
}
