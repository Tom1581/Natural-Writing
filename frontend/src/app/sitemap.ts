import type { MetadataRoute } from 'next';
import { POSTS, SITE_URL } from '@/lib/posts';

const HOME_UPDATED = new Date('2026-10-05');
const TOOLS_UPDATED = new Date('2026-10-05');

export default function sitemap(): MetadataRoute.Sitemap {
  const latestPost = POSTS.reduce((latest, p) => (p.updated > latest ? p.updated : latest), POSTS[0].published);
  return [
    { url: SITE_URL, lastModified: HOME_UPDATED, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/research-paper-humanizer`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/ai-phrase-checker`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: HOME_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(latestPost), changeFrequency: 'weekly', priority: 0.8 },
    ...POSTS.map(post => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
