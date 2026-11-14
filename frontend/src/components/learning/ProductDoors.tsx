'use client';

import Link from 'next/link';
import { ProductIcon } from '@/components/ProductSwitcher';
import { useSession } from '@/lib/learning/session';

/**
 * The two doors under the home page's hero. Writing Studio owns the page, but most people who
 * search for Natural Quill by name are looking for the humanizer, so both products are named
 * side by side here with who each one is for. The pairing is the point: one builds the skill,
 * the other revises a draft that already exists.
 *
 * Students signed in with a code never see the humanizer, so for them the block is not shown.
 * The humanizer links are plain anchors: it lives under a different root layout, which is a
 * full page load anyway.
 */
export default function ProductDoors() {
  const { kind } = useSession();
  if (kind === 'student') return null;
  return (
    <section className="lw-doors" aria-labelledby="doors-title">
      <h2 id="doors-title">Two ways to get natural writing</h2>
      <div className="lw-doors-grid">
        <div className="lw-door" data-product="studio">
          <ProductIcon product="studio" size={22} />
          <div>
            <p className="lw-door-who">For students, parents and teachers</p>
            <h3>
              Build the skill <span>Writing Studio</span>
            </h3>
            <p>
              Short lessons, grade-level prompts and feedback that points to the student’s own sentences. Kindergarten to grade 12, free, with no
              ads.
            </p>
            <p className="lw-door-links">
              <Link href="/learn/grades">Start writing practice</Link>
              <Link href="/learn/how-it-works">How it works</Link>
            </p>
          </div>
        </div>
        <div className="lw-door" data-product="converter">
          <ProductIcon product="converter" size={22} />
          <div>
            <p className="lw-door-who">For adults with an AI-assisted draft</p>
            <h3>
              Revise a draft <span>AI Humanizer</span>
            </h3>
            <p>
              Paste a draft from ChatGPT or another AI tool and compare a more natural rewrite. It checks citations and numbers; you check the
              meaning. 400 words free.
            </p>
            <p className="lw-door-links">
              <a href="/converter">Open the AI Humanizer</a>
              <a href="/ai-phrase-checker">Free Phrase Checker</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
