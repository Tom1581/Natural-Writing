/**
 * Removes personal details before writing is sent to the AI provider. Automated redaction is
 * imperfect, so students are also asked not to include personal details, and the safety
 * screen flags them for an adult.
 */
const RULES: { placeholder: string; re: RegExp }[] = [
  { placeholder: '[email address]', re: /[\w.+-]+@[\w-]+\.[\w.]{2,}/g },
  {
    placeholder: '[phone number]',
    re: /\+?\d{1,3}[-.\s]?\(?\d{2,4}\)?[-.\s]\d{3,4}[-.\s]\d{3,4}\b|\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b0\d{3,4}\s?\d{3}\s?\d{3,4}\b/g,
  },
  {
    placeholder: '[street address]',
    re: /\b\d{1,5}\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Court|Ct|Crescent|Cres|Close|Way|Boulevard|Blvd)\b/g,
  },
];

export const PLACEHOLDER_PATTERN =
  /\[(?:email address|phone number|street address)\]/;

export function redactPersonalDetails(text: string): string {
  return RULES.reduce((t, r) => t.replace(r.re, r.placeholder), text);
}
