const HTML_TAG =
  /<\/?(?:p|br|div|span|strong|em|b|i|u|a|ul|ol|li|h[1-6]|blockquote|code|pre|sup|sub|mark|s|del|ins|table|thead|tbody|tr|td|th|hr|img|font|section|article)(?:\s+[\w:-]+=(?:"[^"]*"|'[^']*'|[^\s"'<>]+))*\s*\/?>/gi;

/**
 * Removes real HTML tags only. A generic /<[^>]+>/ deletes everything between
 * "p < .05" and a later "n > 300", which wipes out whole sections of papers.
 * Mirrors stripHtml in backend/src/rewrite/humanizer.ts.
 */
export function stripHtml(text: string): string {
  return text.replace(HTML_TAG, '');
}
