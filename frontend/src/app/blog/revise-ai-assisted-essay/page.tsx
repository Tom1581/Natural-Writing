import type { Metadata } from 'next';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import PostMeta from '@/components/PostMeta';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const SLUG = 'revise-ai-assisted-essay';
const URL = `${SITE_URL}/blog/${SLUG}`;

export const metadata: Metadata = {
  title: 'How to Revise an AI-Assisted Essay Without Losing Your Argument',
  description: 'A practical essay revision workflow for checking the thesis, evidence, citations, and your course AI-use rules.',
  alternates: { canonical: URL },
  openGraph: { title: 'How to Revise an AI-Assisted Essay | Natural Quill', description: 'Keep your own argument at the center of an AI-assisted draft.', url: URL, type: 'article', images: [OG_IMAGE] },
};

export default function Post() {
  return (
    <div className="content-shell">
      <SiteNav />
      <main className="page-content">
        <article className="article">
          <Link href="/blog" className="article-back">← All guides</Link>
          <PostMeta slug={SLUG} />
          <h1>How to revise an AI-assisted essay without losing your argument</h1>
          <p className="article-lede">A fluent first draft can hide a weak argument. Before polishing sentences, make sure the essay answers the assignment, uses evidence you have checked, and reflects work you are allowed to submit.</p>
          <p>This is a revision method, not a way to disguise authorship. Your instructor&apos;s or institution&apos;s rules determine whether and how AI assistance may be used. Read those rules before editing an AI-assisted draft, and disclose use when required.</p>

          <h2>1. Rebuild the thesis in your own words</h2>
          <p>Close the draft and answer three questions on a blank page: What is the exact question? What position do I take? What would change my mind? Then compare those answers with the thesis in the draft. If the draft makes a broader claim than your evidence supports, narrow it before changing the style.</p>
          <p>For example, “Social media harms teenagers” is too broad for two sources about sleep. A defensible thesis might be: “Late-night social media use can reduce sleep time for some teenagers; school guidance should focus on bedtime habits rather than treating all use alike.” That revision identifies a population, mechanism, and limit. It does not merely swap words to sound different.</p>

          <h2>2. Give each paragraph a job</h2>
          <ol>
            <li>Write a five-word label beside each paragraph, such as “sleep survey result” or “alternative explanation.”</li>
            <li>Check that each label advances the thesis. Move or cut a paragraph that repeats a point without adding evidence.</li>
            <li>Put the evidence near the claim it supports. Follow it with your own explanation of why the evidence matters.</li>
            <li>Include a meaningful objection or limitation where the topic warrants one. A token “some disagree” sentence does not test your argument.</li>
          </ol>
          <p>Here is an illustrative structure: claim that a later bedtime matters; report a study you actually read; explain how the study measured sleep; note that correlation alone cannot establish cause; then explain what conclusion still follows. The limitation strengthens a careful argument.</p>

          <AdSenseAd />

          <h2>3. Audit every citation and factual claim</h2>
          <p>Open each cited source yourself. Confirm the author, date, page or URL, and what the source actually says. AI tools can invent references or attach real references to unsupported claims. If a quotation is not in the source, remove it. If the source is weaker than the sentence suggests, revise the sentence. Keep a note of what you checked so you can retrace the decision later.</p>
          <p>Check numbers separately: sample size, year, denominator, and whether a percentage describes a change or a share. “A 20% increase” and “20 percentage points” are not interchangeable. A style edit must never silently change either one.</p>

          <h2>4. Edit for clarity, then compare meaning</h2>
          <p>Replace filler with the actual relationship between ideas. “It is important to note that this issue is multifaceted” might become “The two studies measured different age groups, so their results are not directly comparable.” The latter does analytical work. Our <Link href="/blog/ai-words-to-avoid">phrase guide</Link> has more examples of vague openings and direct alternatives.</p>
          <p>After editing, compare the new draft against your original outline and sources. Did a cautious “may” become “proves”? Did you drop a qualifier, change a date, or broaden the conclusion? Restore the accurate wording even when it sounds less dramatic.</p>

          <h2>5. Keep a record of the process</h2>
          <p>Save your outline, notes, sources, and draft history according to your course rules. If a teacher asks how you developed the work, you can explain your reasoning and revisions. A detector score is not a substitute for that process; see our <Link href="/blog/understanding-ai-writing-detectors">guide to interpreting AI-writing reports</Link>.</p>
          <p>Natural Quill can suggest a clearer version of a paragraph, but it cannot verify a citation, decide whether the argument is yours, or grant permission to use AI in a course. If you try it, submit only text you are comfortable sending to an AI service and review each suggestion yourself. See the <Link href="/privacy">privacy policy</Link> before pasting sensitive material.</p>
          <Link href="/" className="page-cta">Try the writing editor</Link>
        </article>
      </main>
    </div>
  );
}
