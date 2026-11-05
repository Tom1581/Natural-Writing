import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: 'Accessibility features in Writing Studio and how to report a barrier.',
  alternates: { canonical: '/learn/accessibility' },
};

export default function Accessibility() {
  return (
    <article className="lw-lesson">
      <p className="lw-eyebrow">Accessibility</p>
      <h1>Accessibility</h1>
      <p>We aim for Writing Studio to meet WCAG 2.2 level AA. It has not been independently audited yet; this page describes what is in place today.</p>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Features</h2>
        <ul className="lw-list">
          <li>Read-aloud for tasks and lessons, using your device’s voice in your country’s English.</li>
          <li>Text size and line-spacing controls (the “Aa” button), remembered on your device.</li>
          <li>Dictation (speech to text) in the writing area, where the browser supports it.</li>
          <li>Keyboard access throughout, visible focus outlines, and a “Skip to content” link.</li>
          <li>Light and dark themes that follow your device, and reduced motion when your device asks for it.</li>
          <li>Printable reports and sign-in cards.</li>
        </ul>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Known gaps</h2>
        <ul className="lw-list">
          <li>Highlights in feedback use colour plus an underline; we are still testing them with screen readers.</li>
          <li>Dictation depends on the browser (Chrome and Edge support it; others may not).</li>
        </ul>
      </section>
      <section className="lw-card">
        <h2 style={{ fontSize: '1.2rem' }}>Report a barrier</h2>
        <p style={{ margin: 0 }}>
          Email <a href="mailto:stockitupcs@gmail.com">stockitupcs@gmail.com</a> with the page and what happened.
        </p>
      </section>
    </article>
  );
}
