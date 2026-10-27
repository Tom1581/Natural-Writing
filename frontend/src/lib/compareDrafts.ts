/** Small, transparent text checks. These are not semantic or factual validation. */
export function extractNumberTokens(text: string): string[] {
  return text.match(/\b\d+(?:,\d{3})*(?:\.\d+)?%?|(?<!\d)\.\d+\b/g) ?? [];
}

export function extractCitationTokens(text: string): string[] {
  const authorDate = text.match(/\([^()]*\b(?:19|20)\d{2}[a-z]?[^()]*\)/gi) ?? [];
  const numbered = text.match(/\[\s*\d+(?:\s*[-–,]\s*\d+)*\s*\]/g) ?? [];
  return [...authorDate, ...numbered].map((item) => item.replace(/\s+/g, ' ').trim());
}

export function compareTokens(before: string[], after: string[]): { missing: string[]; added: string[] } {
  const remainingAfter = new Map<string, number>();
  for (const token of after) remainingAfter.set(token, (remainingAfter.get(token) ?? 0) + 1);

  const missing: string[] = [];
  for (const token of before) {
    const count = remainingAfter.get(token) ?? 0;
    if (count > 0) remainingAfter.set(token, count - 1);
    else missing.push(token);
  }

  const added: string[] = [];
  for (const [token, count] of remainingAfter) {
    for (let i = 0; i < count; i++) added.push(token);
  }
  return { missing, added };
}
