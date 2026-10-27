import type { Metadata } from 'next';
import Link from 'next/link';
import AdSenseAd from '@/components/AdSenseAd';
import PostMeta from '@/components/PostMeta';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const SLUG = 'natural-quill-editing-test';
const URL = `${SITE_URL}/blog/${SLUG}`;

export const metadata: Metadata = {
  title: 'We Tested Two Natural Quill Edits: What Improved and What Did Not',
  description: 'Two reproducible, fictional writing samples run through Natural Quill on October 27, 2026, with the complete inputs, outputs, settings, and an honest editorial assessment.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'A Transparent Natural Quill Editing Test',
    description: 'See the complete inputs and outputs, including a rewrite that remained too vague.',
    url: URL,
    type: 'article',
    images: [OG_IMAGE],
  },
};

const GENERAL_INPUT = 'In today’s fast-paced world, small teams face many challenges. Clear communication plays a crucial role in helping them collaborate effectively. It is important to note that regular updates can foster alignment and drive success.';
const GENERAL_OUTPUT = 'Small teams operate in a fast-paced environment and encounter many challenges. Clear communication helps them collaborate more effectively. Regular updates can promote alignment and support success.';
const ACADEMIC_INPUT = 'In a fictional class survey, 18 of 40 students said they revised after midnight. This result suggests late editing was common in this small group, but it cannot establish a pattern across the university (Sample, 2024, p. 12).';
const ACADEMIC_OUTPUT = 'In a fictional class survey, 18 of 40 students reported revising after midnight. Although this finding indicates that late editing was frequent within the group, it does not allow one to infer a university-wide pattern (Sample, 2024, p. 12).';

export default function Post() {
  return (
    <div className="content-shell">
      <SiteNav />
      <main className="page-content">
        <article className="article">
          <Link href="/blog" className="article-back">← All guides</Link>
          <PostMeta slug={SLUG} />
          <h1>We tested two Natural Quill edits: what improved and what did not</h1>
          <p className="article-lede">
            We sell this editor, so a glowing example alone would be a poor way to judge it. Below are two complete, unedited responses from the live Natural Quill rewrite service on October 27, 2026. Both inputs were written for this test and contain no user writing.
          </p>
          <p>
            This is a small product demonstration, not an independent benchmark. We sent each sample once, with no follow-up prompt or manual correction to the output. A later run may differ. We did not test AI detectors, compare competing products, or measure how often the service preserves facts across a large sample.
          </p>

          <h2>How to read these examples</h2>
          <p>
            Read the source and rewrite side by side. Then ask whether the edit is clearer, whether it adds or weakens a claim, and whether every important detail survived. A lower number on a stylistic dashboard would not answer those questions. Your own review remains necessary before you use any generated text.
          </p>

          <h2>Test 1: generic team-writing copy</h2>
          <p>Settings: Natural tone, Medium strength, General section, 60% editing-intensity control. One request; the service reported zero unchanged paragraphs.</p>
          <div className="home-columns">
            <figure className="home-sample"><figcaption>Complete input</figcaption><p>{GENERAL_INPUT}</p></figure>
            <figure className="home-sample home-sample-after"><figcaption>Complete tool output</figcaption><p>{GENERAL_OUTPUT}</p></figure>
          </div>
          <p>
            The output removes “plays a crucial role” and “it is important to note,” making two sentences shorter. That is a real improvement in concision. But “fast-paced environment,” “many challenges,” and “support success” are still vague. The tool cannot know which challenges this particular team faces, so it cannot supply the missing example or evidence. A human editor should add a concrete situation—perhaps a delayed handoff between shifts—or delete the unsupported opening altogether.
          </p>
          <p>
            This is a useful failure case: fluent paraphrasing is not the same as adding information. If your draft has no specific point, a rewrite alone will not make it valuable to a reader.
          </p>

          <AdSenseAd />

          <h2>Test 2: a qualified academic claim</h2>
          <p>Settings: Academic tone, Light strength, General section, 40% editing-intensity control. One request; the service reported zero unchanged paragraphs. “Sample, 2024” is a deliberately fictional citation, not a source to cite.</p>
          <div className="home-columns">
            <figure className="home-sample"><figcaption>Complete input</figcaption><p>{ACADEMIC_INPUT}</p></figure>
            <figure className="home-sample home-sample-after"><figcaption>Complete tool output</figcaption><p>{ACADEMIC_OUTPUT}</p></figure>
          </div>
          <p>
            Here the output keeps “18 of 40,” the fictional citation, and the warning against generalizing to the university. “Said they revised” becomes “reported revising,” which fits the requested register. “Common” becomes “frequent,” a close but not perfectly interchangeable choice; if the frequency matters analytically, the writer should decide which word is justified. Neither version proves anything about a real university because the survey and citation were invented for this test.
          </p>

          <h2>What these two runs establish—and what they do not</h2>
          <ul>
            <li>They show the exact output we received for two short inputs with stated settings on one date.</li>
            <li>They show why a user should compare meaning and specificity, not just surface polish.</li>
            <li>They do not establish a success rate, a plagiarism outcome, an AI-detector result, or a guarantee that citations and numbers will always survive.</li>
          </ul>
          <p>
            We use automated checks for some protected details, but they do not verify whether a claim is true or whether a source exists. A writing editor is not a fact-checker. Before uploading your own text, read our <Link href="/privacy">privacy policy</Link>; the rewrite service stores submitted and generated text. The <Link href="/revision-audit">Revision Audit</Link> lets you compare two passages for visible number and citation changes in your browser, without sending them to the rewrite service.
          </p>
          <p>
            If you want to repeat the comparison, copy either input above, select the stated tone and strength on the <Link href="/">editor</Link>, and compare your result sentence by sentence. Because AI output varies, do not expect identical wording. Our <Link href="/blog/choosing-ai-writing-editor-for-students">tool-comparison checklist</Link> offers a broader method for choosing an editor.
          </p>
          <Link href="/" className="page-cta">Try an edit with your own review</Link>
        </article>
      </main>
    </div>
  );
}
