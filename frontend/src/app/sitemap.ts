import type { MetadataRoute } from 'next';

const SITE_URL = 'https://naturalquill.one';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: SITE_URL, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${SITE_URL}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE_URL}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/blog/how-to-make-ai-writing-undetectable`, lastModified: new Date('2025-04-20'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/blog/how-to-bypass-gptzero`, lastModified: new Date('2025-04-18'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/blog/best-ai-humanizer-2025`, lastModified: new Date('2025-04-15'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog/how-to-humanize-chatgpt-text`, lastModified: new Date('2025-04-12'), changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE_URL}/blog/how-to-bypass-turnitin-ai-detection`, lastModified: new Date('2025-04-24'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/blog/best-ai-humanizer-for-students`, lastModified: new Date('2025-04-22'), changeFrequency: 'monthly', priority: 0.85 },
    { url: `${SITE_URL}/blog/how-to-make-chatgpt-essay-undetectable`, lastModified: new Date('2025-04-21'), changeFrequency: 'monthly', priority: 0.85 },
  ];
}
