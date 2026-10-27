import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What does Natural Quill do?',
    a: 'Natural Quill suggests alternative wording for a draft in the tone and edit strength you choose. It can reduce repetition and stock phrasing, but it cannot add missing research or judge whether a claim is true. Compare the result with your source before using it.',
  },
  {
    q: 'Will it change my citations, numbers, or references?',
    a: 'The service checks for some citation and number patterns and can leave a paragraph unchanged if a check fails. No automated check covers every format or meaning change. Verify citations, numbers, headings, and references yourself before using the output.',
  },
  {
    q: 'Which tone should I use for an essay or research paper?',
    a: 'Academic asks the editor for a formal register; Formal is useful for reports and emails. Natural, Conversational, and Blog are less formal. In every mode, check that a cautious claim has not become a stronger one.',
  },
  {
    q: 'What is the difference between Light, Medium, and Strong?',
    a: 'Light asks for smaller edits, while Medium and Strong allow more rewriting. The result still depends on the input and the AI service, so compare the output with your draft regardless of the setting.',
  },
  {
    q: 'Is Natural Quill free?',
    a: 'You can rewrite 400 words free with no account. After that, word packs start at $19.99 for 10,000 words, and the Unlimited plan is $39.99 per month.',
  },
  {
    q: 'Can Natural Quill guarantee my text passes an AI detector?',
    a: 'No. Natural Quill is a writing editor, not an AI detector. Its style indicators are simple heuristics, not a probability that a detector will flag your work. Focus on accuracy, clarity, and any disclosure rules that apply to your writing.',
  },
  {
    q: 'Can I upload Word or PDF files?',
    a: 'Yes. You can paste text or upload .docx, .pdf, and .txt files. Paragraph breaks are kept, so the rewrite follows the structure of your document.',
  },
  {
    q: 'How is this different from a paraphrasing tool?',
    a: 'You can choose a tone and edit strength, then compare a suggested revision with your original. The tool may cut filler or restructure sentences, but it can also leave vague ideas vague or alter nuance. Review technical terms and claims yourself.',
  },
];

const BEFORE =
  'In a fictional class survey, 18 of 40 students said they revised after midnight. This result suggests late editing was common in this small group, but it cannot establish a pattern across the university (Sample, 2024, p. 12).';

const AFTER =
  'In a fictional class survey, 18 of 40 students reported revising after midnight. Although this finding indicates that late editing was frequent within the group, it does not allow one to infer a university-wide pattern (Sample, 2024, p. 12).';

export default function HomeContent() {
  return (
    <div className="page-content">
      <section>
        <h2>How Natural Quill turns AI text into natural writing</h2>
        <ol className="home-steps">
          <li>
            <h3>Paste or upload your draft</h3>
            <p>Paste text from ChatGPT, Claude, Gemini, or Copilot, or upload a .docx or .pdf file.</p>
          </li>
          <li>
            <h3>Pick a tone and edit strength</h3>
            <p>Academic and Formal keep a scholarly register. Natural, Conversational, and Blog loosen up. Light edits keep your structure; Strong rebuilds each paragraph.</p>
          </li>
          <li>
            <h3>Get a faithful rewrite</h3>
            <p>The service checks some details after rewriting and may retry or keep a paragraph unchanged. Review the result for meaning and evidence yourself.</p>
          </li>
        </ol>
      </section>

      <section>
        <h2>What the editor tries to change—and what you must check</h2>
        <div className="home-columns">
          <div>
            <h3>Rewritten</h3>
            <ul>
              <li>Even, same-length sentences become varied, natural rhythm</li>
              <li>Signposting such as &ldquo;Furthermore&rdquo;, &ldquo;Moreover&rdquo;, and &ldquo;In conclusion&rdquo; is cut</li>
              <li>Stock AI vocabulary (delve, crucial, landscape, foster, tapestry) gives way to plain, specific words</li>
              <li>Wordy nominalizations become direct verbs</li>
              <li>Em dashes and other typographic giveaways are cleaned up</li>
            </ul>
          </div>
          <div>
            <h3>Check before you use the result</h3>
            <ul>
              <li>In-text citations such as (Smith et al., 2020) or [3]</li>
              <li>Numbers, percentages, dates, and units</li>
              <li>Your title, section headings, and reference list</li>
              <li>Technical terms and names</li>
              <li>The strength of every claim: &ldquo;associated with&rdquo; must not become &ldquo;causes&rdquo;</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2>A live edit, including its limits</h2>
        <div className="home-columns">
          <figure className="home-sample">
            <figcaption>Fictional input written for our test</figcaption>
            <p>{BEFORE}</p>
          </figure>
          <figure className="home-sample home-sample-after">
            <figcaption>Natural Quill output (Academic, Light; October 27, 2026)</figcaption>
            <p>{AFTER}</p>
          </figure>
        </div>
        <p className="home-note">The number, fictional citation, and caution about a small sample remained in this one run. That does not guarantee every future edit. Read the <Link href="/blog/natural-quill-editing-test">complete two-sample test</Link>, including a rewrite that still sounded vague.</p>
      </section>

      <section>
        <h2>Built for essays, research papers, and everyday writing</h2>
        <p>
          Writers can compare alternative phrasing for essays, reports, and articles. For academic writing, use the Academic tone cautiously and check citations, statistics, and hedging; see how the{' '}
          <Link href="/research-paper-humanizer">research paper humanizer</Link> handles citations and statistics. Marketers, bloggers, and non-native English writers use the Natural and Blog tones to make drafts read less generic.
        </p>
        <p>
          Natural Quill edits wording, not ideas. Check the result before you use it, and follow your school&apos;s or publisher&apos;s policy on AI assistance.
        </p>
      </section>

      <section>
        <h2>Free tools</h2>
        <p>
          Want to spot repetitive wording? The free <Link href="/ai-phrase-checker">Phrase Checker</Link> highlights stock phrases and checks whether your sentence lengths vary. It runs in your browser, with no limit and no account. For the complete list with plain alternatives, read{' '}
          <Link href="/blog/ai-words-to-avoid">AI words to avoid</Link>.
        </p>
        <p>
          Comparing an original draft with a rewrite? The <Link href="/revision-audit">Revision Audit</Link> flags missing or new number tokens and common citation patterns. It works with any editor, runs in your browser, and helps you find details that deserve a closer read.
        </p>
      </section>

      <section>
        <h2>Frequently asked questions</h2>
        <div className="home-faq">
          {FAQS.map(({ q, a }) => (
            <details key={q}>
              <summary>{q}</summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>

      <section>
        <h2>Writing guides</h2>
        <ul className="home-guides">
          {POSTS.map(post => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              <span>{post.description}</span>
            </li>
          ))}
        </ul>
        <p className="home-note">
          See <Link href="/pricing">pricing</Link> or browse <Link href="/blog">all guides</Link>.
        </p>
      </section>
    </div>
  );
}
