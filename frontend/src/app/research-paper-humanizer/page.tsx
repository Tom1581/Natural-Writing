import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const URL = `${SITE_URL}/research-paper-humanizer`;
const CTA_HREF = '/?tone=academic&strength=medium';

export const metadata: Metadata = {
  title: { absolute: 'AI Humanizer for Research Papers (Keeps Citations) | Natural Quill' },
  description:
    'Rewrite AI-assisted academic writing into natural scholarly prose without breaking citations, statistics, or your reference list. Academic tone, per-section strength, 400 words free.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'AI Humanizer for Research Papers | Natural Quill',
    description: 'Natural scholarly prose without broken citations, statistics, or reference lists.',
    url: URL,
    images: [OG_IMAGE],
  },
};

const SECTIONS = [
  { name: 'Abstract', strength: 'Light', why: 'Every sentence carries a result. Keep the wording tight and change only what sounds generated.' },
  { name: 'Introduction', strength: 'Medium', why: 'Generic AI framing ("In recent years…", "plays a crucial role") collects here.' },
  { name: 'Literature review', strength: 'Medium', why: 'Citation-dense. The prose between citations gets rewritten; the citations do not move.' },
  { name: 'Methods', strength: 'Light, or skip', why: 'Precision beats voice. Repetitive phrasing is normal and expected in methods.' },
  { name: 'Results', strength: 'Light', why: 'Numbers and statistical reporting must stay exact, and they do.' },
  { name: 'Discussion', strength: 'Medium or Strong', why: 'Where most AI habits show: signposting, "underscores the importance", paragraphs that sum themselves up.' },
  { name: 'Conclusion', strength: 'Medium', why: 'Cut the restating; keep the claims and the limitations.' },
];

const FAQS = [
  {
    q: 'Which citation styles are protected?',
    a: 'Author-date styles such as APA, Harvard, and Chicago author-date, for example (Smith, 2020) or (Smith et al., 2020; Lee, 2021), and numbered styles such as IEEE and Vancouver, for example [3], [4, 5], or [6-9]. Each rewritten paragraph is checked for them. For other formats, the numbers inside the citation are still protected, but review those citations after rewriting.',
  },
  {
    q: 'Will it change my statistics?',
    a: 'No. Numbers, percentages, sample sizes, and test statistics are copied exactly, including APA-style values without a leading zero such as p < .05 or r = .42. If a rewrite drops or changes one, that paragraph is redone or left as you wrote it.',
  },
  {
    q: 'What happens to my reference list and headings?',
    a: 'They are never sent for rewriting. A section that starts with a heading such as References, Bibliography, Works Cited, or Literature Cited is kept word for word, and so are the title and section headings.',
  },
  {
    q: 'Can I upload my paper as a Word or PDF file?',
    a: 'Yes. Word (.docx) files keep their paragraphs exactly. PDFs work too, but their line breaks have to be reconstructed, so check paragraph boundaries in the editor before you convert.',
  },
  {
    q: 'Is it allowed to use this on my thesis or a journal submission?',
    a: 'That depends on your university or journal. Many require you to disclose AI assistance in writing. Natural Quill edits wording only; it does not do your research or check your facts. Follow your institution’s policy and read every paragraph before you submit.',
  },
];

const BEFORE =
  "In today's digital age, social media has become an integral part of the lives of adolescents. Platforms such as Instagram, TikTok, and Snapchat play a crucial role in shaping how young people communicate, form identities, and perceive themselves. While these platforms offer numerous benefits, including opportunities for connection and self-expression, it is important to note that they also present significant risks to mental health. Research has shown that excessive social media use is associated with increased rates of anxiety, depression, and low self-esteem among teenagers (Twenge et al., 2018).";

const AFTER =
  'Social media dominates adolescent life. Platforms such as Instagram, TikTok, and Snapchat shape how young people communicate, develop identities, and view themselves. Although these services provide opportunities for connection and self-expression, they also introduce considerable mental-health risks. Research indicates that excessive social-media use correlates with higher incidences of anxiety, depression, and low self-esteem among teenagers (Twenge et al., 2018).';

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })),
};

export default function ResearchPaperHumanizerPage() {
  return (
    <div className="content-shell">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <SiteNav />
      <main className="page-content">
        <header className="page-hero">
          <h1>AI humanizer for research papers that keeps your citations intact</h1>
          <p>
            Most humanizers treat a paper like a blog post. They swap synonyms, loosen the tone, and quietly break what matters in academic writing: a citation
            turns into &ldquo;Smith and colleagues&rdquo;, &ldquo;3 hours&rdquo; becomes &ldquo;three hours&rdquo;, and &ldquo;is associated with&rdquo; drifts
            into &ldquo;causes&rdquo;. Natural Quill&apos;s Academic mode works the other way round: it changes how your paper reads, never what it claims.
          </p>
          <Link href={CTA_HREF} className="page-cta">
            Humanize a paper in Academic mode →
          </Link>
          <p className="home-note">400 words free, no account needed.</p>
        </header>

        <section>
          <h2>What stays exactly the same</h2>
          <div className="home-columns">
            <div>
              <h3>Never sent for rewriting</h3>
              <ul>
                <li>Your title and section headings</li>
                <li>The reference list, bibliography, or works cited</li>
                <li>Figure and table captions, and short list items</li>
              </ul>
            </div>
            <div>
              <h3>Checked automatically in every paragraph</h3>
              <ul>
                <li>Citations such as (Twenge et al., 2018) or [4, 5]</li>
                <li>Numbers, percentages, and statistics, including p &lt; .05</li>
                <li>Paragraph length, so content is not dropped or padded</li>
              </ul>
            </div>
          </div>
          <p>
            Each paragraph is rewritten on its own, with the paragraph before it as context, and then checked automatically. If a citation or number goes missing,
            or the paragraph loses content, it is rewritten again with the problem pointed out. If it still fails, your original paragraph is kept and the editor
            tells you how many were left unchanged. The Academic tone also instructs the model to keep every claim exactly as strong as yours: a correlation
            stays a correlation, and &ldquo;suggests&rdquo; stays tentative.
          </p>
        </section>

        <section>
          <h2>Example: an AI-written introduction in Academic mode</h2>
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
          <p className="home-note">
            Unedited output. The citation is copied exactly, &ldquo;associated with&rdquo; stays a correlation, and the stock phrases (&ldquo;In today&apos;s
            digital age&rdquo;, &ldquo;plays a crucial role&rdquo;, &ldquo;it is important to note&rdquo;) are gone.
          </p>
        </section>

        <section>
          <h2>Recommended settings by section</h2>
          <p>Use the Academic tone throughout. Then match the edit strength to the section:</p>
          <div className="phrase-table-wrap">
            <table className="phrase-table">
              <thead>
                <tr>
                  <th scope="col">Section</th>
                  <th scope="col">Edit strength</th>
                  <th scope="col">Why</th>
                </tr>
              </thead>
              <tbody>
                {SECTIONS.map((s) => (
                  <tr key={s.name}>
                    <td>{s.name}</td>
                    <td>{s.strength}</td>
                    <td>{s.why}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p>
            Not sure which parts sound generated? Paste a section into the free <Link href="/ai-phrase-checker">AI Phrase Checker</Link> first. It highlights
            stock phrases and flags paragraphs where every sentence is the same length. The full list is in{' '}
            <Link href="/blog/ai-words-to-avoid">AI words to avoid</Link>.
          </p>
        </section>

        <section>
          <h2>Use it responsibly</h2>
          <p>
            Natural Quill edits wording. It does not do your research, verify your sources, or make weak evidence look strong. Many universities and journals ask
            authors to disclose AI assistance, so check the policy that applies to you, and read every paragraph before you submit. The goal is a paper that reads
            like you wrote it carefully, because you did.
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
          <p>
            <Link href={CTA_HREF} className="page-cta">
              Open the humanizer in Academic mode →
            </Link>
          </p>
        </section>
      </main>
    </div>
  );
}
