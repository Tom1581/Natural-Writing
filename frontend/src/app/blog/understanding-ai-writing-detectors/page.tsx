import type { Metadata } from 'next';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import PostMeta from '@/components/PostMeta';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const SLUG = 'understanding-ai-writing-detectors';
const URL = `${SITE_URL}/blog/${SLUG}`;

export const metadata: Metadata = {
  title: 'What AI Writing Detector Reports Can and Cannot Tell You',
  description: 'How to read an AI-writing report cautiously, understand false positives, and document your writing process.',
  alternates: { canonical: URL },
  openGraph: { title: 'Understanding AI Writing Detector Reports | Natural Quill', description: 'Treat a detection report as a prompt for review, not a verdict.', url: URL, type: 'article', images: [OG_IMAGE] },
};

export default function Post() {
  return (
    <div className="content-shell">
      <SiteNav />
      <main className="page-content">
        <article className="article">
          <Link href="/blog" className="article-back">← All guides</Link>
          <PostMeta slug={SLUG} />
          <h1>What AI writing detector reports can and cannot tell you</h1>
          <p className="article-lede">A detector report estimates whether portions of text resemble patterns in its training data. It does not observe who typed the words, why they chose them, or how a draft evolved.</p>
          <p>Turnitin explicitly says its AI-writing model can misidentify both human and AI-generated text and should not be the sole basis for adverse action. Its own guidance calls for human judgment alongside institutional policy. Read the <a href="https://guides.turnitin.com/hc/en-us/articles/22774058814093-Using-the-AI-Writing-Report">current Turnitin report guide</a> for the precise meaning of its interface; products and thresholds can change.</p>

          <h2>A percentage is not a probability of guilt</h2>
          <p>Suppose a report highlights three paragraphs in a ten-paragraph essay. That does not mean there is a 30% chance the author used AI. The percentage describes a tool&apos;s classification of qualifying text under its own rules. It cannot establish intent, authorship, or whether a permitted editing tool was used.</p>
          <p>Results also depend on what was submitted. Quotations, reference lists, short passages, and unsupported formats may be treated differently by a product. Before interpreting a number, read that product&apos;s documentation for what it actually analyzed.</p>

          <h2>What to check when a report surprises you</h2>
          <ol>
            <li><strong>Check the assignment rules.</strong> The permitted use of AI varies by course and task. The same drafting process may be acceptable in one context and prohibited in another.</li>
            <li><strong>Read the highlighted passage.</strong> Look for a genuine issue: an unverified source, a generic paragraph that avoids the question, or a sentence inconsistent with the rest of the argument. Fix the writing problem, not the score.</li>
            <li><strong>Look at the full paper.</strong> A fragment without an outline, source notes, and surrounding paragraphs gives an incomplete picture of the work.</li>
            <li><strong>Preserve your process.</strong> Keep dated notes, outlines, drafts, source annotations, and revision history when available. They are more informative than repeated attempts to make a detector number move.</li>
          </ol>

          <AdSenseAd />

          <h2>If you are a student</h2>
          <p>If a teacher asks about a flagged passage, explain how you developed the idea and show your drafts and sources. Be accurate about any tools you used. Ask which course rule applies and how you can clarify the record. Do not rewrite a truthful passage into worse prose just to chase a lower score.</p>
          <p>If you did use AI where it was allowed, follow the required disclosure format. If you used it where it was not allowed, address that directly. A paraphraser does not change the underlying provenance of an idea.</p>

          <h2>If you are an instructor or editor</h2>
          <p>Use the report to decide what deserves a conversation or closer source review. Ask the writer to walk through a thesis decision, source choice, and revision. Compare the passage to the assignment and the writer&apos;s drafts. Apply the same process consistently, including when a report shows no highlight: a low score is not proof of independent authorship either.</p>

          <h2>Where a writing editor fits</h2>
          <p>Our editor helps users revise clarity and tone, but it cannot guarantee a detector result and should not be used to conceal a violation of a school or publisher policy. For a substantive revision process, start with the <Link href="/blog/revise-ai-assisted-essay">essay guide</Link> or <Link href="/blog/how-to-humanize-chatgpt-text">worked paragraph edit</Link>. The aim is accurate, accountable writing—not a particular score.</p>
          <Link href="/blog" className="page-cta">Read more writing guides</Link>
        </article>
      </main>
    </div>
  );
}
