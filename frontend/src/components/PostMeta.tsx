import { formatDate, getPost, SITE_URL } from '@/lib/posts';

/** Date line plus Article and breadcrumb structured data for a blog post. */
export default function PostMeta({ slug }: { slug: string }) {
  const post = getPost(slug);
  const url = `${SITE_URL}/blog/${post.slug}`;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.description,
      datePublished: post.published,
      dateModified: post.updated,
      mainEntityOfPage: url,
      image: `${SITE_URL}/opengraph-image`,
      author: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL },
      publisher: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL, logo: { '@type': 'ImageObject', url: `${SITE_URL}/apple-icon` } },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Natural Quill', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Guides', item: `${SITE_URL}/blog` },
        { '@type': 'ListItem', position: 3, name: post.title, item: url },
      ],
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <div style={{ fontSize: '0.8rem', color: '#888899', marginBottom: '1rem' }}>
        Updated <time dateTime={post.updated}>{formatDate(post.updated)}</time> · {post.readTime}
      </div>
    </>
  );
}
