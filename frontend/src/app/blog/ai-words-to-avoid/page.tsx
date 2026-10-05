import type { Metadata } from 'next';
import Link from 'next/link';
import PostMeta from '@/components/PostMeta';
import SiteNav from '@/components/SiteNav';
import { AI_PHRASES, CATEGORY_LABELS, type PhraseCategory } from '@/lib/aiPhrases';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const SLUG = 'ai-words-to-avoid';
const URL = `${SITE_URL}/blog/${SLUG}`;
const COUNT = AI_PHRASES.length;

export const metadata: Metadata = {
  title: `AI Words to Avoid: ${COUNT} ChatGPT Words and Phrases`,
  description:
    'The words and phrases that make writing sound like ChatGPT, from "delve" and "tapestry" to "it is important to note", with a plain alternative for each and the patterns that matter more than any single word.',
  alternates: { canonical: URL },
  keywords: ['ai words to avoid', 'chatgpt words', 'words that sound like ai', 'ai phrases list', 'chatgpt phrases to avoid', 'overused ai words'],
  openGraph: {
    title: `AI Words to Avoid: ${COUNT} ChatGPT Words and Phrases | Natural Quill`,
    description: 'Every word and phrase that makes writing sound like ChatGPT, with a plain alternative for each.',
    url: URL,
    type: 'article',
    images: [OG_IMAGE],
  },
};

const CATEGORY_ORDER: PhraseCategory[] = ['word', 'phrase', 'transition', 'chatbot'];

const PATTERNS = [
  {
    name: 'Every sentence is about the same length',
    detail:
      'Chatbot sentences tend to cluster around one medium length, one after another. People write a short sentence, then a long one, then a fragment. Split one long sentence or merge two short ones in each paragraph.',
  },
  {
    name: 'A signpost at the start of each sentence',
    detail:
      'Furthermore, Moreover, Additionally, Notably. If the ideas follow from each other, the reader does not need a sign saying so. Cut most of them; use but, so, or also when a link really helps.',
  },
  {
    name: 'Everything comes in threes',
    detail:
      '"Clear, concise, and compelling." "Students, teachers, and parents." A list of three sounds complete, so models use it constantly. Keep the items that carry information and drop the filler.',
  },
  {
    name: 'Trailing "-ing" clauses',
    detail:
      'Sentences that end with ", highlighting the importance of…", ", ensuring that…", or ", underscoring the need for…" tack on a vague comment. Make it its own sentence with a real subject, or delete it.',
  },
  {
    name: 'Paragraphs that sum themselves up',
    detail:
      'A last sentence that starts with "Overall" or "Ultimately" and repeats the paragraph adds length, not meaning. End on the most specific point instead.',
  },
  {
    name: 'Em dashes everywhere',
    detail: 'One dash in a page is fine. Three in a paragraph reads as machine output. Use commas, parentheses, a colon, or a new sentence.',
  },
  {
    name: '"Not only… but also" and "It\'s not just X, it\'s Y"',
    detail: 'Both build fake contrast. Say the stronger point directly.',
  },
  {
    name: 'Stacked hedges',
    detail: '"May potentially help to improve" says "may" three times. Pick one hedge that matches the evidence: "may improve".',
  },
];

const BEFORE =
  "In today's fast-paced world, effective time management plays a crucial role in academic success. It is important to note that students face a wide range of competing demands. Furthermore, poor planning can lead to stress and burnout. By leveraging simple tools such as planners and calendars, students can unlock their full potential and achieve a healthy work-life balance.";

const AFTER =
  'Good time management helps students succeed. They juggle a lot of demands at once, and poor planning leads to stress and burnout. Simple tools help: a planner or a calendar can make a heavy schedule manageable and still leave room for life outside school.';

const PROMPT = `Write in plain, specific language. Do not use these words or phrases: delve, tapestry, testament, realm, landscape (as a metaphor), pivotal, crucial, multifaceted, foster, leverage, harness, navigate (as a metaphor), embark, unlock, seamless, holistic, vibrant, "plays a crucial role", "it is important to note", "in today's digital age", "a wide range of". Do not start sentences with Furthermore, Moreover, Additionally, or In conclusion. Vary sentence length. Do not use em dashes.`;

export default function AiWordsToAvoid() {
  return (
    <div className="content-shell">
      <SiteNav />
      <main className="page-content">
        <article className="article">
          <Link href="/blog" className="article-back">
            ← All guides
          </Link>
          <PostMeta slug={SLUG} />
          <h1>AI words to avoid: {COUNT} ChatGPT words and phrases, and what to write instead</h1>

          <p className="article-lede">
            If you have read much AI-generated text, you can spot it within a sentence or two. It &ldquo;delves into&rdquo; things. Everything &ldquo;plays a
            crucial role&rdquo;. Paragraphs open with &ldquo;Furthermore&rdquo; and close with &ldquo;Overall&rdquo;. None of these words is wrong, but chatbots
            reach for the same small set so often that readers, teachers, and AI detectors have learned to notice them.
          </p>
          <p>
            This list collects the words and phrases that turn up most in ChatGPT, Claude, and Gemini output, grouped by type, with a plainer option for each. After
            the list come the patterns that matter more than any single word. You can also paste your own text into the free{' '}
            <Link href="/ai-phrase-checker">AI Phrase Checker</Link>, which highlights every item on this page.
          </p>

          <h2>Why chatbots overuse these words</h2>
          <p>
            A language model writes by choosing a likely next word, over and over. Formal, positive, slightly grand words such as &ldquo;crucial&rdquo;,
            &ldquo;foster&rdquo;, and &ldquo;landscape&rdquo; fit almost any topic, so they win often. The habit is measurable. Researchers who tracked
            vocabulary in more than 15 million PubMed abstracts found that &ldquo;delves&rdquo;, &ldquo;underscores&rdquo;, and &ldquo;showcasing&rdquo; jumped in
            frequency after ChatGPT&apos;s release, and estimated that at least 13.5% of 2024 abstracts were processed with a language model (
            <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12219543/" rel="noopener" target="_blank">
              Kobak et al., Science Advances, 2025
            </a>
            ).
          </p>

          <h2>How to use this list</h2>
          <ul>
            <li>
              <strong>Question these words; don&apos;t ban them.</strong>{' '}&ldquo;Robust&rdquo; is the right word for robust standard errors, and
              &ldquo;landscape&rdquo; is fine for a painting. What stands out is several of them in one paragraph.
            </li>
            <li>
              <strong>Fix the sentence, not just the word.</strong>{' '}Swapping &ldquo;delve into&rdquo; for &ldquo;dig into&rdquo; leaves the same empty sentence.
              Ask what the sentence actually says, then say that.
            </li>
            <li>
              <strong>Start with the strong ones.</strong> Entries marked <span className="tag tag-strong">strong</span> rarely appear in natural writing. Those
              marked <span className="tag tag-mild">mild</span> are ordinary words that only stand out in bulk.
            </li>
          </ul>

          {CATEGORY_ORDER.map((cat) => {
            const rows = AI_PHRASES.filter((p) => p.category === cat).sort(
              (a, b) => Number(b.level === 'strong') - Number(a.level === 'strong') || a.label.localeCompare(b.label),
            );
            return (
              <section key={cat}>
                <h2>
                  {CATEGORY_LABELS[cat]} ({rows.length})
                </h2>
                <div className="phrase-table-wrap">
                  <table className="phrase-table">
                    <thead>
                      <tr>
                        <th scope="col">Word or phrase</th>
                        <th scope="col">Try instead</th>
                        <th scope="col" className="col-flag">Flag</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((p) => (
                        <tr key={p.label}>
                          <td>{p.label}</td>
                          <td>{p.instead}</td>
                          <td className="col-flag">
                            <span className={`tag tag-${p.level}`}>{p.level}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            );
          })}

          <h2>Patterns that matter more than single words</h2>
          <p>
            You can remove every word above and still sound like a chatbot. These habits are what readers and detectors pick up on most, and most of them are
            about structure rather than vocabulary.
          </p>
          <ol className="pattern-list">
            {PATTERNS.map((p) => (
              <li key={p.name}>
                <strong>{p.name}.</strong> {p.detail}
              </li>
            ))}
          </ol>

          <h2>Before and after</h2>
          <p>Here is a typical ChatGPT paragraph and an edited version that keeps every point:</p>
          <div className="home-columns">
            <figure className="home-sample">
              <figcaption>ChatGPT draft</figcaption>
              <p>{BEFORE}</p>
            </figure>
            <figure className="home-sample home-sample-after">
              <figcaption>Edited</figcaption>
              <p>{AFTER}</p>
            </figure>
          </div>
          <p>
            The edit drops the opener, the stock phrases, the signpost, and the promise to &ldquo;unlock&rdquo; anything. It also breaks the even rhythm: the first
            sentence is six words, the last is twenty-two.
          </p>

          <h2>A prompt that keeps ChatGPT away from these words</h2>
          <p>If you draft with a chatbot, add this to your prompt. It will not catch everything, especially in long answers, so check the result.</p>
          <pre className="prompt-box">{PROMPT}</pre>

          <h2>Check your own writing</h2>
          <p>
            Paste a draft into the <Link href="/ai-phrase-checker">free AI Phrase Checker</Link> to see which of these words and patterns it contains. To revise
            a whole essay or paper in one pass, the <Link href="/">Natural Quill humanizer</Link> rewrites each paragraph and keeps your citations and numbers
            exactly as written. Writing for a journal or a class? See the{' '}
            <Link href="/research-paper-humanizer">research paper humanizer</Link>.
          </p>
        </article>
      </main>
    </div>
  );
}
