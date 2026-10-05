import Link from 'next/link';
import { POSTS } from '@/lib/posts';

export const FAQS: { q: string; a: string }[] = [
  {
    q: 'What does Natural Quill do?',
    a: 'Natural Quill rewrites AI-generated drafts from ChatGPT, Claude, Gemini, and similar tools so they read like a careful person wrote them. It varies sentence rhythm, removes stock AI phrasing and signposting, and replaces vague wording with plain, specific language, while keeping your meaning intact.',
  },
  {
    q: 'Will it change my citations, numbers, or references?',
    a: 'No. In-text citations such as (Smith et al., 2020) or [3], numbers, percentages, and dates are copied exactly, and every rewritten paragraph is checked for them automatically. Your title, section headings, and reference list are never sent for rewriting.',
  },
  {
    q: 'Which tone should I use for an essay or research paper?',
    a: 'Choose Academic. It keeps a formal register with no contractions, no slang, and the same level of certainty as your draft, so "is associated with" never turns into "causes". Use Formal for reports and emails, and Natural, Conversational, or Blog for less formal writing.',
  },
  {
    q: 'What is the difference between Light, Medium, and Strong?',
    a: 'Light keeps your sentence structure and only fixes phrasing that sounds machine-written. Medium rewrites every sentence in new words. Strong rebuilds each paragraph from its ideas, reordering and combining sentences where the logic allows.',
  },
  {
    q: 'Is Natural Quill free?',
    a: 'You can rewrite 400 words free with no account. After that, word packs start at $19.99 for 10,000 words, and the Unlimited plan is $39.99 per month.',
  },
  {
    q: 'Can Natural Quill guarantee my text passes an AI detector?',
    a: 'No tool can honestly guarantee that, because detectors change and disagree with each other. Natural Quill targets the patterns they rely on, such as uniform sentence length and stock AI phrases, and shows a before-and-after AI-style score so you can see what changed.',
  },
  {
    q: 'Can I upload Word or PDF files?',
    a: 'Yes. You can paste text or upload .docx, .pdf, and .txt files. Paragraph breaks are kept, so the rewrite follows the structure of your document.',
  },
  {
    q: 'How is this different from a paraphrasing tool?',
    a: 'Paraphrasers swap synonyms, which often makes text worse and can break technical terms. Natural Quill edits the way a human editor does: it restructures sentences, cuts filler, and keeps terminology, citations, and claims exactly as they were.',
  },
];

const BEFORE =
  'Furthermore, the constant exposure to curated and idealized images can lead to unrealistic comparisons. Adolescents often compare their own lives to the seemingly perfect lives of their peers and influencers, which can foster feelings of inadequacy. A 2019 study found that teens who spent more than 3 hours per day on social media faced double the risk of poor mental health outcomes, including symptoms of depression and anxiety (Riehm et al., 2019). Moreover, the phenomenon of cyberbullying further exacerbates these issues, as it allows harassment to extend beyond the school environment and into the home.';

const AFTER =
  'The constant exposure to curated, idealized images can generate unrealistic comparisons, prompting adolescents to measure their own lives against the seemingly perfect lives of peers and influencers and to feel inadequate. A 2019 study reported that teens who used social media for more than 3 hours each day faced twice the risk of poor mental-health outcomes, such as depressive and anxious symptoms (Riehm et al., 2019). In addition, cyberbullying intensifies these problems by allowing harassment to continue beyond school and enter the home.';

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
            <p>Each paragraph is rewritten on its own and checked. If a citation, number, or piece of content goes missing, that paragraph is redone or left as you wrote it.</p>
          </li>
        </ol>
      </section>

      <section>
        <h2>What changes, and what stays exactly the same</h2>
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
            <h3>Preserved</h3>
            <ul>
              <li>In-text citations such as (Smith et al., 2020) or [3]</li>
              <li>Numbers, percentages, dates, and units</li>
              <li>Your title, section headings, and reference list</li>
              <li>Technical terms and names</li>
              <li>The strength of every claim: &ldquo;associated with&rdquo; never becomes &ldquo;causes&rdquo;</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2>Example: a ChatGPT paragraph rewritten in Academic tone</h2>
        <div className="home-columns">
          <figure className="home-sample">
            <figcaption>ChatGPT draft</figcaption>
            <p>{BEFORE}</p>
          </figure>
          <figure className="home-sample home-sample-after">
            <figcaption>After Natural Quill (Academic, Medium)</figcaption>
            <p>{AFTER}</p>
          </figure>
        </div>
        <p className="home-note">The citation and the &ldquo;3 hours&rdquo; figure are carried over exactly. Results vary a little between runs; use Generate New Version for another take.</p>
      </section>

      <section>
        <h2>Built for essays, research papers, and everyday writing</h2>
        <p>
          Students use Natural Quill to turn AI-assisted outlines and drafts into essays that sound like their own work. Researchers use the Academic tone to smooth AI-polished sections without losing citations or hedging; see how the{' '}
          <Link href="/research-paper-humanizer">research paper humanizer</Link> handles citations and statistics. Marketers, bloggers, and non-native English writers use the Natural and Blog tones to make drafts read less generic.
        </p>
        <p>
          Natural Quill edits wording, not ideas. Check the result before you use it, and follow your school&apos;s or publisher&apos;s policy on AI assistance.
        </p>
      </section>

      <section>
        <h2>Free tools</h2>
        <p>
          Not sure which parts of a draft sound generated? The free <Link href="/ai-phrase-checker">AI Phrase Checker</Link> highlights the words and phrases chatbots overuse and checks whether your sentence lengths vary. It runs in your browser, with no limit and no account. For the complete list with plain alternatives, read{' '}
          <Link href="/blog/ai-words-to-avoid">AI words to avoid</Link>.
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
