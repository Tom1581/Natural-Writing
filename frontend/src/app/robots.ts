import type { MetadataRoute } from 'next';

const SITE_URL = 'https://naturalquill.one';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/ads.txt'],
        disallow: ['/auth/', '/payment-success'],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/', '/ads.txt'],
        disallow: ['/auth/', '/payment-success'],
      },
      {
        userAgent: 'Mediapartners-Google',
        allow: ['/', '/ads.txt'],
        disallow: ['/auth/', '/payment-success'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
