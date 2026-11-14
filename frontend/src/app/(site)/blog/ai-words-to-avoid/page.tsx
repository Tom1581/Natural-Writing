import type { Metadata } from 'next';
import Link from 'next/link';
import PostMeta from '@/components/PostMeta';
import SiteNav from '@/components/SiteNav';
import SkillBridge from '@/components/SkillBridge';
import { AI_PHRASES, CATEGORY_LABELS, type PhraseCategory } from '@/lib/aiPhrases';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const SLUG = 'ai-words-to-avoid';
const URL = `${SITE_URL}/blog/${SLUG}`;
const COUNT = AI_PHRASES.length;

export const metadata: Metadata = {
  title: `AI Words to Avoid: ${COUNT} ChatGPT Words and Phrases`,
  description: `The ${COUNT} words and phrases that make writing sound like ChatGPT, from "delve" and "tapestry" to "it is important to note", with a plain alternative for each.`,
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

/** The entries that rarely appear in natural writing, for the short list at the top of the page. */
const strong = (category: PhraseCategory) =>
  AI_PHRASES.filter((p) => p.category === category && p.level === 'strong').map((p) => p.label.replace(/,$/, ''));
const TOP_WORDS = strong('word');
const TOP_PHRASES = [...strong('phrase'), ...strong('transition')];

const SECTIONS = [
  { id: 'short-list', label: 'The short list' },
  { id: 'why', label: 'Why chatbots overuse these words' },
  { id: 'how-to-use', label: 'How to use this list' },
  { id: 'list-word', label: 'The full list, with alternatives' },
  { id: 'patterns', label: 'Patterns that matter more than single words' },
  { id: 'before-after', label: 'Before and after' },
  { id: 'prompt', label: 'A prompt for ChatGPT' },
  { id: 'practice', label: 'Practice the skill' },
  { id: 'faq', label: 'Common questions' },
];

/** Answers are plain text so the same words serve the page and its FAQ structured data. */
const FAQS = [
  {
    q: 'What words does ChatGPT overuse the most?',
    a: `Delve, tapestry, testament, realm, landscape, underscore, multifaceted, harness, navigate and embark are among the easiest to spot, along with phrases such as "plays a crucial role" and "it is important to note". The full list on this page has ${COUNT} entries, each with a plainer alternative.`,
  },
  {
    q: 'Is there a banned-words list I can give ChatGPT?',
    a: 'Yes. The prompt on this page names the words and patterns to avoid, and you can paste it into any chatbot. It cuts most of them but not all, especially in long answers, so read the result before you use it.',
  },
  {
    q: 'Will removing these words stop an AI detector from flagging my writing?',
    a: 'No. Most detectors measure how predictable the whole text is, not which words it contains, so swapping words for synonyms leaves the pattern in place. No word list can promise a detector result. If the writing is your own, keep your notes and drafts, which show how the work developed.',
  },
  {
    q: 'Are these words wrong to use?',
    a: 'No. People use them too, and some are exactly right for a subject: "robust" is the correct word for robust standard errors. What readers notice is several of them in one paragraph, or a sentence that would say nothing without them.',
  },
  {
    q: 'How do I check my own draft for these words?',
    a: 'Paste it into the free AI Phrase Checker on this site. It highlights every word and phrase from this list and shows whether your sentence lengths vary. It runs in your browser and needs no account.',
  },
];

const faqLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

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
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd).replace(/</g, '\\u003c') }} />
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

          <nav className="article-toc" aria-label="On this page">
            <p>On this page</p>
            <ol>
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a href={`#${sec.id}`}>{sec.label}</a>
                </li>
              ))}
            </ol>
          </nav>

          <h2 id="short-list">The short list: {TOP_WORDS.length + TOP_PHRASES.length} AI words and phrases to cut first</h2>
          <p>
            If you only have a minute, search your draft for these. They are the entries marked <span className="tag tag-strong">strong</span> in the full
            list: words and phrases that rarely turn up in writing by people.
          </p>
          <p className="short-list">
            <strong>Words:</strong> {TOP_WORDS.join(', ')}.
          </p>
          <p className="short-list">
            <strong>Phrases:</strong> {TOP_PHRASES.join('; ')}.
          </p>

          <h2 id="why">Why chatbots overuse these words</h2>
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

          <h2 id="how-to-use">How to use this list</h2>
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
              <section key={cat} id={`list-${cat}`}>
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

          <h2 id="patterns">Patterns that matter more than single words</h2>
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

          <h2 id="before-after">Before and after</h2>
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

          <h2 id="prompt">A prompt that keeps ChatGPT away from these words</h2>
          <p>If you draft with a chatbot, add this to your prompt. It will not catch everything, especially in long answers, so check the result.</p>
          <pre className="prompt-box">{PROMPT}</pre>

          <h2 id="practice">Practice the skill, not only the list</h2>
          <p>
            A banned-word list treats the symptom. The habits underneath are ordinary revision skills: choosing the exact word, varying sentence
            length, and using a transition only when it names a real relationship. These free lessons and five-minute practice sets from{' '}
            <Link href="/">Natural Quill Writing Studio</Link> teach each one. They are written for grades 6 to 12 and need no account.
          </p>
          <SkillBridge only={['word-choice', 'rhythm', 'transitions', 'concision']} showEdit={false} />

          <h2>Check your own writing</h2>
          <p>
            Paste a draft into the <Link href="/ai-phrase-checker">free AI Phrase Checker</Link> to see which of these words and patterns it contains. To revise
            a whole essay or paper in one pass, the <Link href="/converter">Natural Quill humanizer</Link> rewrites each paragraph and keeps your citations and numbers
            exactly as written. Writing for a journal or a class? See the{' '}
            <Link href="/research-paper-humanizer">research paper humanizer</Link>.
          </p>

          <h2 id="faq">Common questions</h2>
          <div className="home-faq">
            {FAQS.map(({ q, a }) => (
              <details key={q}>
                <summary>{q}</summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
          <p>
            For how detector reports work and what they can&apos;t show, read{' '}
            <Link href="/blog/understanding-ai-writing-detectors">Can AI detectors be wrong?</Link>
          </p>
        </article>
      </main>
    </div>
  );
}
