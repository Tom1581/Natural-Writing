import type { MetadataRoute } from 'next';

const SITE_URL = 'https://naturalquill.one';
const LAST_MODIFIED = new Date('2026-05-12');

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/pricing`, lastModified: LAST_MODIFIED, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/blog`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/how-to-make-ai-writing-undetectable`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/how-to-bypass-gptzero`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/how-to-bypass-turnitin-ai-detection`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/how-to-make-chatgpt-essay-undetectable`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/best-ai-humanizer-for-students`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/blog/best-ai-humanizer-2025`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
    { url: `${SITE_URL}/blog/how-to-humanize-chatgpt-text`, lastModified: LAST_MODIFIED, changeFrequency: 'weekly', priority: 0.85 },
  ];
}
