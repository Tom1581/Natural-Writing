import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog — AI Writing & Humanization Guides',
  description: 'Learn how to humanize AI text, improve ChatGPT drafts, and reduce common AI-style writing patterns. Free writing guides from Natural Quill.',
  alternates: { canonical: 'https://naturalquill.one/blog' },
  openGraph: {
    title: 'Blog — AI Writing & Humanization Guides | Natural Quill',
    description: 'Free guides on humanizing AI text, improving AI-generated drafts, and making ChatGPT writing sound natural.',
    url: 'https://naturalquill.one/blog',
  },
};

const posts = [
  {
    slug: 'how-to-make-ai-writing-undetectable',
    title: 'How to Make AI Writing Sound Natural in 2025',
    description: 'A step-by-step guide to making AI writing sound natural while reducing common AI-detection patterns in GPTZero, Scribbr, and Turnitin.',
    date: 'April 20, 2025',
    readTime: '5 min read',
  },
  {
    slug: 'how-to-bypass-gptzero',
    title: 'How GPTZero Reads AI Writing Patterns',
    description: 'What GPTZero AI detection measures and how to revise AI text so it sounds clearer, less repetitive, and more natural.',
    date: 'April 18, 2025',
    readTime: '4 min read',
  },
  {
    slug: 'best-ai-humanizer-2025',
    title: 'Best AI Humanizer Tools in 2025 (Honest Comparison)',
    description: 'We compared the top AI humanizer tools on writing quality, editing control, naturalness, and price. Here is what we found.',
    date: 'April 15, 2025',
    readTime: '6 min read',
  },
  {
    slug: 'how-to-humanize-chatgpt-text',
    title: 'How to Humanize ChatGPT Text for Free',
    description: 'ChatGPT text gets flagged because of specific writing patterns. Here is how to fix them and make your output sound genuinely human.',
    date: 'April 12, 2025',
    readTime: '5 min read',
  },
];

export default function BlogIndex() {
  return (
    <main style={{ minHeight: '100vh', background: '#07070a', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map((post) => (
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
                  <span>{post.date}</span>
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
