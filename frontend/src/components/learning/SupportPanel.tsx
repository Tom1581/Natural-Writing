import type { Support } from '@/lib/learning/types';

/** Shown to the student when their writing may describe something worrying, or includes personal details. */
export default function SupportPanel({ support }: { support: Support }) {
  return (
    <>
      {support.wellbeing && (
        <aside className="lw-support" aria-labelledby="support-title">
          <h2 id="support-title">You’re not in trouble</h2>
          <p>
            If any of what you wrote is really happening to you, please talk to an adult you trust, like a parent, teacher or school counselor. If it’s a
            story, that’s okay too.
          </p>
          <p style={{ marginBottom: 6 }}>You can also contact, for free:</p>
          <ul className="lw-list">
            {support.helplines.map((h) => (
              <li key={h.name}>
                <a href={h.url} target="_blank" rel="noreferrer">
                  {h.name}
                </a>
                : {h.contact}
              </li>
            ))}
          </ul>
          <p className="lw-small" style={{ margin: 0 }}>
            If you are in danger right now, call {support.emergency}. This website is not watched by people all the time.
          </p>
        </aside>
      )}
      {support.personalInfo && (
        <p className="lw-notice" style={{ marginBottom: 16 }}>
          It looks like your writing might include a phone number, email or address. To keep yourself safe, take personal details out of your writing.
        </p>
      )}
    </>
  );
}
