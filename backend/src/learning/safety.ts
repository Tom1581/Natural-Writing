import type { FrameworkId } from './content';
import type { SafetyCategory } from './entities/safety-flag.entity';

export interface ScreenHit {
  category: SafetyCategory;
  level: 'possible' | 'urgent';
  reason: string;
}

/**
 * A first-person phrase screen that runs on every submission, even when the AI is unavailable.
 * It is deliberately narrow: stories may contain danger, so most hits are "possible" and only
 * first-person statements about the writer are "urgent". A human always makes the call.
 * Reasons never include the student's words.
 */
const PATTERNS: {
  category: SafetyCategory;
  level: 'possible' | 'urgent';
  reason: string;
  re: RegExp;
}[] = [
  {
    category: 'self_harm',
    level: 'urgent',
    reason: 'First-person words about wanting to die or self-harm.',
    re: /\bI\s+(?:want|wanna|wish|plan|am going|'m going|feel like I want)\s+(?:to\s+)?(?:die|kill myself|end (?:it|my life)|hurt myself|be dead)\b|\bI\s+(?:keep\s+)?(?:cut|hurt|harm)\s+myself\b|\bI\s+(?:wish|wished)\s+I\s+(?:was|were)\s+(?:dead|never born)\b/i,
  },
  {
    category: 'self_harm',
    level: 'possible',
    reason: 'Words about suicide or self-harm (may be fiction).',
    re: /\b(?:suicid(?:e|al)|kill (?:my|him|her|them)sel(?:f|ves)|self[- ]harm)\b/i,
  },
  {
    category: 'abuse',
    level: 'urgent',
    reason:
      'First-person words that may describe being hurt or abused by someone.',
    re: /\b(?:my\s+(?:dad|father|mum|mom|mother|step-?(?:dad|mum|mom|father|mother)|uncle|aunt|brother|sister|cousin|coach|teacher|babysitter|grandpa|grandma))\s+(?:hits|hit|beats|beat|kicks|kicked|chokes|choked|touches|touched|hurts|hurt|abuses|abused)\s+me\b|\b(?:I'?m|I am)\s+(?:not safe|scared to go)\s+(?:at\s+)?home\b/i,
  },
  {
    category: 'threat',
    level: 'urgent',
    reason: 'First-person words about harming other people.',
    // Specific targets only, so "I'll shoot the ball" or a game story doesn't match.
    re: /\bI(?:'m going to| am going to|'m gonna| will|'ll| want to| plan to)\s+(?:bring\s+a\s+(?:gun|knife)\s+to\s+school|shoot\s+(?:up|someone|people|him|her|them|everyone)|stab\s+(?:someone|him|her|them)|kill\s+(?:him|her|them|everyone|someone|people|my))\b/i,
  },
  {
    category: 'personal_info',
    level: 'possible',
    reason: 'Looks like a phone number, email address or street address.',
    re: /\b\d{3}[-.\s]\d{3}[-.\s]\d{4}\b|\b0\d{3,4}\s?\d{3}\s?\d{3,4}\b|[\w.+-]+@[\w-]+\.[\w.]{2,}|\b\d{1,5}\s+[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\s(?:Street|St|Road|Rd|Avenue|Ave|Lane|Ln|Drive|Dr|Court|Ct|Crescent|Cres|Close|Way|Boulevard|Blvd)\b/,
  },
];

export function screenText(text: string): ScreenHit[] {
  const hits: ScreenHit[] = [];
  for (const p of PATTERNS) {
    if (
      p.re.test(text) &&
      !hits.some(
        (h) =>
          h.category === p.category &&
          (h.level === 'urgent' || h.level === p.level),
      )
    ) {
      hits.push({ category: p.category, level: p.level, reason: p.reason });
    }
  }
  // Keep only the strongest hit per category.
  return hits.filter(
    (h) =>
      !(
        h.level === 'possible' &&
        hits.some((o) => o.category === h.category && o.level === 'urgent')
      ),
  );
}

export interface SupportInfo {
  /** Who to contact, for the student's country. Checked against the services' own sites. */
  helplines: { name: string; contact: string; url: string }[];
  emergency: string;
}

export const SUPPORT: Record<FrameworkId, SupportInfo> = {
  'us-ccss': {
    helplines: [
      {
        name: '988 Suicide & Crisis Lifeline',
        contact: 'Call or text 988',
        url: 'https://988lifeline.org',
      },
      {
        name: 'Childhelp National Child Abuse Hotline',
        contact: 'Call or text 1-800-422-4453',
        url: 'https://www.childhelphotline.org',
      },
    ],
    emergency: '911',
  },
  'ca-on': {
    helplines: [
      {
        name: 'Kids Help Phone',
        contact: 'Call 1-800-668-6868 or text CONNECT to 686868',
        url: 'https://kidshelpphone.ca',
      },
    ],
    emergency: '911',
  },
  'uk-eng': {
    helplines: [
      {
        name: 'Childline',
        contact: 'Call 0800 1111',
        url: 'https://www.childline.org.uk',
      },
    ],
    emergency: '999',
  },
  'au-ac9': {
    helplines: [
      {
        name: 'Kids Helpline',
        contact: 'Call 1800 55 1800',
        url: 'https://kidshelpline.com.au',
      },
    ],
    emergency: '000',
  },
};
