import type { MetadataRoute } from 'next';
import { POSTS, SITE_URL } from '@/lib/posts';
import { FRAMEWORK_SLUGS, GRADES, getCatalog, gradeSlug } from '@/lib/learning/public';
import { GUIDES } from '@/lib/learning/guides';

const HOME_UPDATED = new Date('2026-10-27');
const TOOLS_UPDATED = new Date('2026-10-27');
const LEARN_UPDATED = new Date('2026-11-05');

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalog = await getCatalog();
  const latestPost = POSTS.reduce((latest, p) => (p.updated > latest ? p.updated : latest), POSTS[0].published);
  return [
    { url: SITE_URL, lastModified: LEARN_UPDATED, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/converter`, lastModified: LEARN_UPDATED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/research-paper-humanizer`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/ai-phrase-checker`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/revision-audit`, lastModified: TOOLS_UPDATED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/pricing`, lastModified: HOME_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/about`, lastModified: HOME_UPDATED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/support`, lastModified: HOME_UPDATED, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/privacy`, lastModified: HOME_UPDATED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/terms`, lastModified: HOME_UPDATED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/learn/lessons`, lastModified: LEARN_UPDATED, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/learn/privacy`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.4 },
    { url: `${SITE_URL}/learn/practice`, lastModified: LEARN_UPDATED, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/learn/prompts`, lastModified: LEARN_UPDATED, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/learn/how-it-works`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/learn/for-parents`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/learn/for-teachers`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/learn/accessibility`, lastModified: LEARN_UPDATED, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE_URL}/learn/curriculum`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    ...FRAMEWORK_SLUGS.map((id) => ({
      url: `${SITE_URL}/learn/curriculum/${id}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...(catalog?.drills ?? []).map((d) => ({
      url: `${SITE_URL}/learn/practice/${d.id}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
    { url: `${SITE_URL}/learn/grades`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.8 },
    ...GRADES.map((g) => ({
      url: `${SITE_URL}/learn/grades/${gradeSlug(g)}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    { url: `${SITE_URL}/learn/rubrics`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    ...(catalog?.rubrics ?? []).map((r) => ({
      url: `${SITE_URL}/learn/rubrics/${r.id}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    // Check-in and checkpoint prompts have no public page.
    ...(catalog?.prompts ?? [])
      .filter((p) => !p.checkIn && !p.checkpoint)
      .map((p) => ({
        url: `${SITE_URL}/learn/prompts/${p.id}`,
        lastModified: LEARN_UPDATED,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      })),
    { url: `${SITE_URL}/learn/examples`, lastModified: LEARN_UPDATED, changeFrequency: 'monthly', priority: 0.7 },
    ...(catalog?.examples ?? []).map((e) => ({
      url: `${SITE_URL}/learn/examples/${e.id}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/learn/guides`, lastModified: LEARN_UPDATED, changeFrequency: 'weekly', priority: 0.7 },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/learn/guides/${g.slug}`,
      lastModified: new Date(g.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...(catalog?.lessons ?? []).map((l) => ({
      url: `${SITE_URL}/learn/lessons/${l.id}`,
      lastModified: LEARN_UPDATED,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    { url: `${SITE_URL}/blog`, lastModified: new Date(latestPost), changeFrequency: 'weekly', priority: 0.8 },
    // POSTS contains only current canonical guides; older article URLs redirect to these.
    ...POSTS.map(post => ({
      url: `${SITE_URL}/blog/${post.slug}`,
      lastModified: new Date(post.updated),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
