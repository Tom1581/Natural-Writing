import Link from 'next/link';

export default function SignInPrompt({ what = 'practice writing' }: { what?: string }) {
  return (
    <div className="lw-card" style={{ maxWidth: 560 }}>
      <h1 style={{ fontSize: '1.6rem' }}>Sign in to {what}</h1>
      <p className="lw-muted">
        A parent, guardian or teacher signs in and creates a profile for each student; students 13 or older can make their own. Writing, feedback and
        progress are saved to that profile.
      </p>
      <div className="lw-btn-row">
        <Link className="lw-btn lw-btn-primary" href="/learn/sign-in">Sign in</Link>
        <Link className="lw-btn lw-btn-secondary" href="/learn/grades">Practice without an account</Link>
      </div>
      <p className="lw-small lw-muted" style={{ margin: '12px 0 0' }}>Without an account you can write to any prompt and get feedback, but nothing is saved.</p>
    </div>
  );
}
