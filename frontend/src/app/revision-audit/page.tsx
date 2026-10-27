import type { Metadata } from 'next';
import Link from 'next/link';
import RevisionAudit from '@/components/RevisionAudit';
import SiteNav from '@/components/SiteNav';
import { OG_IMAGE, SITE_URL } from '@/lib/posts';

const URL = `${SITE_URL}/revision-audit`;

export const metadata: Metadata = {
  title: 'Free Revision Audit: Compare Numbers and Citations',
  description: 'Paste an original and revised draft to find changed number tokens and common citation patterns. This comparison runs in your browser.',
  alternates: { canonical: URL },
  openGraph: { title: 'Compare a Revision for Missing Numbers and Citations', description: 'A free browser-only check for visible differences between two passages.', url: URL, images: [OG_IMAGE] },
};

export default function RevisionAuditPage() {
  return (
    <div className="content-shell">
      <SiteNav />
      <main className="page-content">
        <article className="article">
          <header className="page-hero">
            <h1>Revision audit: compare numbers and citations</h1>
            <p className="article-lede">A rewrite can read smoothly while changing a result. Paste the original and revised passages below to surface missing or new number tokens and common citation patterns. The comparison runs in your browser; these passages are not sent to our rewrite service.</p>
          </header>

          <RevisionAudit />

          <section>
            <h2>What this check can find</h2>
            <p>The tool compares occurrences, not just unique values. If your original uses “40” twice and the revision uses it once, the missing occurrence is reported. It also compares common author-date citations such as “(Lee, 2024)” and numbered references such as “[3]” as exact text.</p>
            <p>The result is a review queue, not an automatic approval. A deliberate change may be correct, and an unchanged number may still be attached to the wrong claim. Differences in punctuation or citation spacing may be flagged even when the source is the same.</p>
          </section>

          <section>
            <h2>What it cannot find</h2>
            <ul>
              <li>It cannot tell whether a cited source exists, supports a claim, or is formatted correctly.</li>
              <li>It does not compare mathematical operators or units. “p &lt; .05” and “p = .05” have different meanings even if the same number appears.</li>
              <li>It cannot detect a changed conclusion, a stronger causal claim, a missing qualification, or a paraphrase that distorts the source.</li>
              <li>It does not cover every citation convention, formula, table, or non-English number format.</li>
            </ul>
            <p>After the token check, read the paragraphs side by side and open the underlying sources. Our <Link href="/blog/revise-ai-assisted-essay">essay revision guide</Link> offers a fuller claim-and-evidence checklist. If you want to examine stock wording without uploading text, try the <Link href="/ai-phrase-checker">phrase checker</Link>.</p>
          </section>

          <section>
            <h2>Privacy and next steps</h2>
            <p>Typing in this comparison tool does not submit your text to the Natural Quill rewrite API. Standard page analytics may record a page visit, but the comparison inputs are not included in those events. If you choose to use the separate <Link href="/">AI writing editor</Link>, its request is processed and stored as described in our <Link href="/privacy">privacy policy</Link>.</p>
            <p>You can use this tool with any draft and any editing service. It is designed to help you catch visible changes, including in our own output. For a firsthand look at the editor&apos;s strengths and limits, read our <Link href="/blog/natural-quill-editing-test">two-sample test</Link>.</p>
          </section>
        </article>
      </main>
    </div>
  );
}
