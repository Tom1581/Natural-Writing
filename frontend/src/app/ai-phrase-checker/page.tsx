import type { Metadata } from 'next';
import Link from 'next/link';
import PhraseChecker from '@/components/PhraseChecker';
import SiteNav from '@/components/SiteNav';
import { AI_PHRASES } from '@/lib/aiPhrases';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const URL = `${SITE_URL}/ai-phrase-checker`;

export const metadata: Metadata = {
  title: 'Free AI Phrase Checker: Find ChatGPT Words in Your Writing',
  description:
    'Paste any text to highlight the words and phrases ChatGPT overuses, such as "delve", "crucial", and "it is important to note", with plain alternatives. Free, unlimited, and it runs in your browser.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'Free AI Phrase Checker | Natural Quill',
    description: 'Highlight ChatGPT-style words and phrases in your text and get plain alternatives. Free and private.',
    url: URL,
    images: [OG_IMAGE],
  },
};

const FAQS = [
  {
    q: 'Is the AI Phrase Checker free?',
    a: 'Yes. It is free, unlimited, and needs no account.',
  },
  {
    q: 'Is my text uploaded or stored?',
    a: 'No. The check runs entirely in your browser. Your text is not sent to a server unless you choose to send it to the Natural Quill humanizer.',
  },
  {
    q: 'Is this an AI detector?',
    a: 'No. This tool applies a published list of wording patterns and counts sentence lengths in your browser. It does not estimate who wrote the text or predict a detector result. A flagged phrase is a prompt to edit, not evidence of AI use.',
  },
  {
    q: 'Does a flagged word mean my text was written by AI?',
    a: 'No. People use these words too, and some are exactly right for a subject. The tool only points out wording that you might want to review. Judge each suggestion against your audience and intended meaning.',
  },
  {
    q: 'What should I do with the results?',
    a: 'Read each flagged passage in context. Cut filler where it adds nothing, but keep necessary technical language. Sentence-length variety is descriptive, not a quality target. To compare an optional rewrite, you can send the draft to Natural Quill; that separate action uploads and stores text.',
  },
];

const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: 'AI Phrase Checker',
    url: URL,
    applicationCategory: 'WritingApp',
    operatingSystem: 'Web Browser',
    description: 'Highlights words and phrases that AI chatbots overuse and suggests plain alternatives.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
    publisher: { '@type': 'Organization', name: 'Natural Quill', url: SITE_URL },
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
  },
];

const FIXES = [
  {
    before: 'It is important to note that the survey had a low response rate.',
    after: 'The survey had a low response rate.',
    why: 'The opener adds nothing. State the point.',
  },
  {
    before: 'Social media plays a crucial role in shaping teen identity.',
    after: 'Social media shapes how teens see themselves.',
    why: 'Swap the stock phrase for the verb it hides.',
  },
  {
    before: 'This study delves into the intricate tapestry of urban life.',
    after: 'This study looks at how people in three neighborhoods share public space.',
    why: 'Replacing "delves" with "digs" is not enough. Say what is actually studied.',
  },
  {
    before: 'Furthermore, the policy fosters collaboration among stakeholders.',
    after: 'The policy also gets teachers and parents talking to each other.',
    why: 'Drop the signpost and name the people involved.',
  },
];

export default function AiPhraseCheckerPage() {
  return (
    <div className="content-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <SiteNav />
      <main className="page-content">
        <header className="page-hero">
          <h1>Free AI Phrase Checker: find the ChatGPT words in your writing</h1>
          <p>
            Paste any text to highlight the {`${AI_PHRASES.length} words and phrases that chatbots lean on`}, from &ldquo;delve&rdquo; and &ldquo;tapestry&rdquo; to
            &ldquo;it is important to note&rdquo;, with a possible plainer alternative for each. It also counts sentence lengths and repeated openers.
            This is a writing aid, not an authorship test. The check itself runs in your browser; nothing is uploaded unless you choose to use the separate rewrite service.
          </p>
        </header>

        <PhraseChecker />

        <section>
          <h2>What the checker looks for</h2>
          <div className="home-columns">
            <div>
              <h3>Wording</h3>
              <ul>
                <li>Overused words such as delve, tapestry, testament, realm, pivotal, and multifaceted</li>
                <li>Stock phrases such as &ldquo;plays a crucial role&rdquo; and &ldquo;in today&apos;s digital age&rdquo;</li>
                <li>Signposts at the start of sentences: Furthermore, Moreover, In conclusion</li>
                <li>Chatbot leftovers such as &ldquo;Certainly!&rdquo; and &ldquo;I hope this helps&rdquo;</li>
              </ul>
            </div>
            <div>
              <h3>Rhythm</h3>
              <ul>
                <li>Sentence variety: how much your sentence lengths differ from each other</li>
                <li>Repeated openers, such as several sentences that start with &ldquo;This&rdquo;</li>
                <li>Em dashes, which chatbots tend to scatter through their answers</li>
              </ul>
            </div>
          </div>
          <p className="home-note">
            <strong>Strong</strong> flags (red) are editorial priorities, not evidence of AI authorship. <strong>Mild</strong>{' '}flags (amber) may be entirely appropriate.
            Judge every suggestion in context. The checker has a few exclusions, including &ldquo;robust standard errors&rdquo; and &ldquo;foster care&rdquo;,
            but its pattern matching cannot understand all technical uses.
          </p>
        </section>

        <section>
          <h2>Why these words may deserve a second look</h2>
          <p>
            Some stock words can make a paragraph less specific. A pattern of increased use of certain words appears in
            published science: a study of more than 15 million PubMed abstracts found that words such as &ldquo;delves&rdquo;, &ldquo;underscores&rdquo;, and
            &ldquo;showcasing&rdquo; became sharply more common after ChatGPT&apos;s release, and estimated that at least 13.5% of 2024 abstracts were processed with
            a language model (
            <a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC12219543/" rel="noopener" target="_blank">
              Kobak et al., Science Advances, 2025
            </a>
            ).
          </p>
          <p>
            That research describes aggregate patterns, not a way to identify the author of an individual paragraph. None of these words is wrong on its own.
            The useful question is whether the sentence makes a concrete point for your reader.
          </p>
        </section>

        <section>
          <h2>How to fix what it finds</h2>
          <div className="fix-list">
            {FIXES.map((f) => (
              <div key={f.before} className="fix-item">
                <p className="fix-before">{f.before}</p>
                <p className="fix-after">{f.after}</p>
                <p className="home-note">{f.why}</p>
              </div>
            ))}
          </div>
          <p>
            Want the full list with alternatives? Read <Link href="/blog/ai-words-to-avoid">AI words to avoid</Link>. To rewrite a whole essay or paper at once,
            use the <Link href="/">Natural Quill humanizer</Link>. For academic work, the <Link href="/research-paper-humanizer">research paper humanizer</Link>{' '}
            asks the editor to preserve citations and numbers; check the output before using it.
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
      </main>
    </div>
  );
}
