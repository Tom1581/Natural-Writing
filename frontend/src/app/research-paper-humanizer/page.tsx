import type { Metadata } from 'next';
import Link from 'next/link';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const URL = `${SITE_URL}/research-paper-humanizer`;
const CTA_HREF = '/?tone=academic&strength=medium';

export const metadata: Metadata = {
  title: { absolute: 'Editing AI-Assisted Research Writing: Check Citations | Natural Quill' },
  description:
    'A cautious workflow for revising AI-assisted research writing: choose edit strength by section, then verify citations, statistics, and claim strength.',
  alternates: { canonical: URL },
  openGraph: {
    title: 'AI Humanizer for Research Papers | Natural Quill',
    description: 'Revise academic prose and verify the details that an automated rewrite cannot guarantee.',
    url: URL,
    images: [OG_IMAGE],
  },
};

const SECTIONS = [
  { name: 'Abstract', strength: 'Light', why: 'Every sentence carries a result. Keep the wording tight and change only what sounds generated.' },
  { name: 'Introduction', strength: 'Medium', why: 'Generic AI framing ("In recent years…", "plays a crucial role") collects here.' },
  { name: 'Literature review', strength: 'Medium', why: 'Citation-dense. Compare every citation and attributed finding with the source.' },
  { name: 'Methods', strength: 'Light, or skip', why: 'Precision beats voice. Repetitive phrasing is normal and expected in methods.' },
  { name: 'Results', strength: 'Light', why: 'Numbers and statistical reporting must stay exact; verify each one manually.' },
  { name: 'Discussion', strength: 'Medium or Strong', why: 'Where most AI habits show: signposting, "underscores the importance", paragraphs that sum themselves up.' },
  { name: 'Conclusion', strength: 'Medium', why: 'Cut the restating; keep the claims and the limitations.' },
];

const FAQS = [
  {
    q: 'Which citation styles are protected?',
    a: 'The service checks common author-date and numbered patterns, but citation formats vary. Compare every citation in the output with your input and original source; the tool does not verify that a source exists or supports the claim.',
  },
  {
    q: 'Will it change my statistics?',
    a: 'The service checks many numeric spans and can retry or leave a paragraph unchanged when a check fails. It cannot validate your study or catch every change in meaning. Compare all numbers, units, inequality signs, and statistical conclusions yourself.',
  },
  {
    q: 'What happens to my reference list and headings?',
    a: 'The service tries to identify headings and reference sections so it can skip them, but document formats vary. Inspect the exported result before sharing or submitting it.',
  },
  {
    q: 'Can I upload my paper as a Word or PDF file?',
    a: 'Yes. You can upload .docx and .pdf files. Extraction can change formatting and paragraph boundaries, especially in PDFs, so check the text in the editor before rewriting.',
  },
  {
    q: 'Is it allowed to use this on my thesis or a journal submission?',
    a: 'That depends on your university or journal. Many require you to disclose AI assistance in writing. Natural Quill edits wording only; it does not do your research or check your facts. Follow your institution’s policy and read every paragraph before you submit.',
  },
];

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
          <h1>Edit AI-assisted research writing without trusting an unchecked rewrite</h1>
          <p>
            Academic writing depends on exact details. A smoother paragraph is not an improvement if a citation moves, a statistic changes, or a cautious
            association becomes a causal claim. Natural Quill&apos;s Academic mode asks the model for formal wording and checks some protected patterns; it
            does not replace your source review.
          </p>
          <Link href={CTA_HREF} className="page-cta">
            Humanize a paper in Academic mode →
          </Link>
          <p className="home-note">400 words free, no account needed.</p>
        </header>

        <section>
          <h2>What the service checks, and what you must verify</h2>
          <div className="home-columns">
            <div>
              <h3>Designed to skip</h3>
              <ul>
                <li>Your title and section headings</li>
                <li>The reference list, bibliography, or works cited</li>
                <li>Figure and table captions, and short list items</li>
              </ul>
            </div>
            <div>
              <h3>Checked for common patterns</h3>
              <ul>
                <li>Citations such as (Twenge et al., 2018) or [4, 5]</li>
                <li>Numbers, percentages, and statistics, including p &lt; .05</li>
                <li>Paragraph length, so content is not dropped or padded</li>
              </ul>
            </div>
          </div>
          <p>
            The rewrite service processes paragraphs and checks detected citations, numbers, and length. It can retry a paragraph or return the original
            when a check fails. Those checks are limited: they cannot confirm a citation is real, that a statistic was interpreted correctly, or that
            &ldquo;suggests&rdquo; did not become a stronger claim. Compare the output against the original paper and source documents.
          </p>
        </section>

        <section>
          <h2>See a real Academic-mode edit</h2>
          <p>
            In our <Link href="/blog/natural-quill-editing-test">published two-sample test</Link>, we ran a fictional paragraph containing
            &ldquo;18 of 40&rdquo;, a qualified conclusion, and a clearly fictional citation through the live service. The output retained those details in
            that run. We also show a different run where the output remained too vague. Both complete inputs, outputs, and settings are available so
            you can judge the result yourself.
          </p>
        </section>

        <section>
          <h2>Recommended settings by section</h2>
          <p>If you choose to revise a paper, work section by section and select a strength for each separate request. These are editing suggestions, not automatic settings:</p>
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
            To compare a source passage and its revision, use the browser-only <Link href="/revision-audit">Revision Audit</Link> to flag changed number tokens and common citations. For stock wording, try the <Link href="/ai-phrase-checker">Phrase Checker</Link>. The full list is in{' '}
            <Link href="/blog/ai-words-to-avoid">AI words to avoid</Link>.
          </p>
        </section>

        <section>
          <h2>Use it responsibly</h2>
          <p>
            Natural Quill edits wording. It does not do your research or verify your sources. Read the AI-use policy that applies to your class or
            publication, disclose assistance when required, and inspect every paragraph before submission. Do not upload confidential or unpublished
            work until you have read the <Link href="/privacy">privacy policy</Link>.
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
