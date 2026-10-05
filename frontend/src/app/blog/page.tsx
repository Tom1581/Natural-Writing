import type { Metadata } from 'next';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import { OG_IMAGE, POSTS, formatDate } from '@/lib/posts';

export const metadata: Metadata = {
  title: 'Blog — AI Writing & Humanization Guides',
  description: 'Learn how to humanize AI text, improve ChatGPT drafts, and reduce common AI-style writing patterns. Free writing guides from Natural Quill.',
  alternates: { canonical: 'https://naturalquill.one/blog' },
  openGraph: {
    title: 'Blog — AI Writing & Humanization Guides | Natural Quill',
    description: 'Free guides on humanizing AI text, improving AI-generated drafts, and making ChatGPT writing sound natural.',
    url: 'https://naturalquill.one/blog',
    images: [OG_IMAGE],
  },
};

export default function BlogIndex() {
  return (
    <main style={{ minHeight: '100vh', background: '#07070a', color: '#ffffff', fontFamily: 'var(--font-body)' }}>
      <div style={{ maxWidth: '760px', margin: '0 auto', padding: '4rem 1.5rem' }}>
        <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', marginBottom: '2.5rem' }}>
          ← Back to Natural Quill
        </Link>

        <h1 style={{ fontSize: '2.25rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '0.75rem' }}>
          AI Writing Guides
        </h1>
        <p style={{ color: '#888899', fontSize: '1rem', marginBottom: '3rem', lineHeight: 1.6 }}>
          Practical guides on humanizing AI text, improving AI-generated drafts, and making your writing sound natural.
        </p>

        <AdSenseAd minHeight={96} />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              style={{ textDecoration: 'none' }}
            >
              <article style={{
                padding: '1.5rem',
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.07)',
                borderRadius: '0.875rem',
                transition: 'border-color 0.2s',
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.6rem', fontSize: '0.75rem', color: '#888899' }}>
                  <time dateTime={post.updated}>Updated {formatDate(post.updated)}</time>
                  <span>·</span>
                  <span>{post.readTime}</span>
                </div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#ffffff', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                  {post.title}
                </h2>
                <p style={{ fontSize: '0.9rem', color: '#888899', lineHeight: 1.6, margin: 0 }}>
                  {post.description}
                </p>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
