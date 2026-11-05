import { SITE_URL } from './public';

/** JSON for a <script type="application/ld+json">, with "<" escaped so text can't close the tag. */
export const ldJson = (data: unknown) => JSON.stringify(data).replace(/</g, '\\u003c');

export const PUBLISHER = {
  '@type': 'Organization',
  name: 'Natural Quill',
  url: SITE_URL,
  logo: `${SITE_URL}/icon`,
} as const;

export function breadcrumbLd(items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.href}` })),
  };
}

export function itemListLd(name: string, items: { name: string; href: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: `${SITE_URL}${it.href}` })),
  };
}

/** schema.org educationalLevel text for a band, e.g. "Grades 9–10". */
export const GENRE_NAMES: Record<string, string> = {
  opinion: 'Opinion and argument',
  informative: 'Informative and explanatory',
  narrative: 'Narrative',
};
