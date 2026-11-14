import type { Metadata } from 'next';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import PostMeta from '@/components/PostMeta';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const SLUG = 'understanding-ai-writing-detectors';
const URL = `${SITE_URL}/blog/${SLUG}`;

// The title answers the question people bring to this page. In Search Console (Oct 14–Nov 10, 2026)
// it was shown 191 times, partly for searches quoting Turnitin's accuracy statements, and got no
// clicks under its old title, "What AI Writing Detector Reports Can and Cannot Tell You".
const TITLE = 'Can AI Detectors Be Wrong? How to Read a Turnitin AI Report';
const DESCRIPTION =
  'Turnitin says its AI report may not always be accurate and should not be the sole basis for action against a student. What a score means and what to do if flagged.';

export const metadata: Metadata = {
  title: { absolute: TITLE },
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: { title: TITLE, description: DESCRIPTION, url: URL, type: 'article', images: [OG_IMAGE] },
};

const TURNITIN_GUIDE = 'https://guides.turnitin.com/hc/en-us/articles/22774058814093-Using-the-AI-Writing-Report';
const TURNITIN_FILES = 'https://guides.turnitin.com/hc/en-us/articles/28234943089933-File-requirements-for-an-AI-writing-report';
const TURNITIN_ELL =
  'https://www.turnitin.ca/blog/new-research-turnitin-s-ai-detector-shows-no-statistically-significant-bias-against-english-language-learners';
const MRU_ADVISORY = 'https://www.mtroyal.ca/AI/ai-detection-advisory.htm';
const LIANG_STUDY = 'https://pmc.ncbi.nlm.nih.gov/articles/PMC10382961/';

/** Answers are plain text so the same words serve the page and its FAQ structured data. */
const FAQS = [
  {
    q: 'Can Turnitin’s AI detector be wrong?',
    a: 'Yes. Turnitin’s own guide says its AI writing detection model may not always be accurate and that a result should not be used as the sole basis for adverse actions against a student. It can misidentify human-written, AI-generated and AI-paraphrased text.',
  },
  {
    q: 'What does the asterisk on a Turnitin AI report mean?',
    a: 'Turnitin shows an asterisk instead of a number when the result is under 20%. It stopped showing low percentages because false positives are more common in that range.',
  },
  {
    q: 'Can an AI detector check an entire book manuscript?',
    a: 'Often not in one piece. Detectors limit how long a document can be, so a book-length manuscript may have to be checked in parts, each with its own result. There is a minimum length too: in 2023 Turnitin said its detector needs at least 300 words of prose.',
  },
  {
    q: 'Are AI detectors biased against non-native English writers?',
    a: 'A 2023 study of seven detectors found that they labeled 61.3% of TOEFL essays by non-native English speakers as AI-generated, on average. Turnitin was not in that study and reports no significant difference for documents of 300 words or more. Short texts carry the highest risk.',
  },
  {
    q: 'Does a low AI score prove that a person wrote the text?',
    a: 'No. Detectors also miss AI-generated text, so a low score is not proof of independent authorship. Drafts, notes and sources are better evidence of how a piece was written.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

export default function Post() {
  return (
    <div className="content-shell">
      <SiteNav />
      <main className="page-content">
        <article className="article">
          <Link href="/blog" className="article-back">← All guides</Link>
          <PostMeta slug={SLUG} />
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }} />
          <h1>Can AI detectors be wrong? How to read a Turnitin AI writing report</h1>
          <p className="article-lede">Yes. Every AI detector makes mistakes in both directions, and Turnitin says so about its own. A detector report estimates whether portions of text resemble patterns in its training data. It does not observe who typed the words, why they chose them, or how a draft evolved.</p>

          <h2 id="turnitin">What Turnitin says about its own accuracy</h2>
          <p>Turnitin&apos;s <a href={TURNITIN_GUIDE}>guide to the AI writing report</a> says its detection model &ldquo;may not always be accurate&rdquo; and that a result &ldquo;should not be used as the sole basis for adverse actions against a student&rdquo;. It names three kinds of text the model can misidentify: human-written, AI-generated and AI-paraphrased. Its guidance calls for human judgment alongside an institution&apos;s own policy.</p>
          <p>Turnitin has also stopped showing a number for low results. A score under 20% appears as an asterisk, because false positives are more common in that range. Both points are reported in <a href={MRU_ADVISORY}>Mount Royal University&apos;s advisory on AI detection</a>. Read Turnitin&apos;s current guide for the precise meaning of its interface; products and thresholds change.</p>

          <h2 id="accuracy">How often do detectors get it wrong?</h2>
          <p>Independent tests have found large errors in some conditions. In a 2023 study in the journal <em>Patterns</em>, researchers ran 91 TOEFL essays by non-native English speakers and 88 essays by US eighth-graders through seven widely used detectors. The detectors classified the US essays almost perfectly, but they labeled more than half of the TOEFL essays as AI-generated: an average false-positive rate of 61.3%. At least one detector flagged 97.8% of them. The authors &ldquo;strongly caution against the use of GPT detectors in evaluative or educational settings, particularly when assessing the work of non-native English speakers&rdquo; (<a href={LIANG_STUDY}>Liang et al., 2023</a>).</p>
          <p>Turnitin&apos;s detector was not one of the seven. In <a href={TURNITIN_ELL}>its response</a>, Turnitin pointed out that the TOEFL essays were all under 150 words, and reported its own test: for documents that meet its 300-word minimum, the difference in false positives between English-language learners and native English writers was &ldquo;small, and not statistically significant&rdquo;. For shorter documents, of 150 to 300 words, the gap was larger. This is Turnitin&apos;s own evaluation, not an independent one.</p>
          <p>Two practical points follow. Short texts, and writing with a narrow range of vocabulary, are where false positives are most likely. And a result from one detector says little about another, because they are different products with different error rates.</p>

          <h2 id="percentage">A percentage is not a probability of guilt</h2>
          <p>Suppose a report highlights three paragraphs in a ten-paragraph essay. That does not mean there is a 30% chance the author used AI. The percentage describes a tool&apos;s classification of qualifying text under its own rules. It cannot establish intent, authorship, or whether a permitted editing tool was used.</p>

          <h2 id="limits">What a detector does not analyze</h2>
          <p>Detectors do not read everything you submit. In 2023 Turnitin said its detector needs at least 300 words of prose before it gives a result, and its current <a href={TURNITIN_FILES}>file requirements</a> set limits on document length, file size, file type and language. A book-length manuscript can be over the length limit, so it may have to be checked in parts, each with its own result.</p>
          <p>Results also depend on what was submitted. Quotations, reference lists, short passages, and unsupported formats may be treated differently by a product. Before interpreting a number, read that product&apos;s documentation for what it actually analyzed.</p>

          <h2 id="check">What to check when a report surprises you</h2>
          <ol>
            <li><strong>Check the assignment rules.</strong> The permitted use of AI varies by course and task. The same drafting process may be acceptable in one context and prohibited in another.</li>
            <li><strong>Read the highlighted passage.</strong> Look for a genuine issue: an unverified source, a generic paragraph that avoids the question, or a sentence inconsistent with the rest of the argument. Fix the writing problem, not the score.</li>
            <li><strong>Look at the full paper.</strong> A fragment without an outline, source notes, and surrounding paragraphs gives an incomplete picture of the work.</li>
            <li><strong>Preserve your process.</strong> Keep dated notes, outlines, drafts, source annotations, and revision history when available. They are more informative than repeated attempts to make a detector number move.</li>
          </ol>

          <AdSenseAd />

          <h2 id="student">If you are a student</h2>
          <p>If a teacher asks about a flagged passage, explain how you developed the idea and show your drafts and sources. Be accurate about any tools you used. Ask which course rule applies and how you can clarify the record. Do not rewrite a truthful passage into worse prose just to chase a lower score.</p>
          <p>If you did use AI where it was allowed, follow the required disclosure format. If you used it where it was not allowed, address that directly. A paraphraser does not change the underlying provenance of an idea.</p>

          <h2 id="instructor">If you are an instructor or editor</h2>
          <p>Use the report to decide what deserves a conversation or closer source review. Ask the writer to walk through a thesis decision, source choice, and revision. Compare the passage to the assignment and the writer&apos;s drafts. Apply the same process consistently, including when a report shows no highlight: a low score is not proof of independent authorship either.</p>
          <p>If you teach writing in school, drafts and revisions are the best record you can have. <Link href="/learn/for-teachers">Natural Quill Writing Studio</Link> gives students from kindergarten to grade 12 practice with feedback that quotes their own sentences and asks them to revise, so that record builds as they work. Our guide to <Link href="/learn/guides/ai-writing-feedback-in-the-classroom">using AI writing feedback in the classroom</Link> covers what such feedback can and can&apos;t do.</p>

          <h2 id="rewriting">Can a rewriting tool make text pass a detector?</h2>
          <p>No tool can promise that, including ours. Detectors are updated, and Turnitin&apos;s own guide names AI-paraphrased text among the kinds of text its model classifies. Our <Link href="/converter">AI Humanizer</Link> helps users revise clarity and tone, but it cannot guarantee a detector result and should not be used to conceal a violation of a school or publisher policy. For a substantive revision process, start with the <Link href="/blog/revise-ai-assisted-essay">essay guide</Link> or <Link href="/blog/how-to-humanize-chatgpt-text">worked paragraph edit</Link>. The aim is accurate, accountable writing, not a particular score.</p>

          <h2 id="faq">Common questions</h2>
          <div className="home-faq">
            {FAQS.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <Link href="/blog" className="page-cta">Read more writing guides</Link>
        </article>
      </main>
    </div>
  );
}
