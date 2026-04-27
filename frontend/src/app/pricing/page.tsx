import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Pricing — Natural Quill AI Humanizer',
  description: 'Natural Quill pricing: free 400 words with no signup. Starter 10,000 words for $19.99 one-time. Pro 50,000 words for $29.99. Unlimited monthly for $39.99. No subscriptions traps.',
  alternates: { canonical: 'https://naturalquill.one/pricing' },
  keywords: ['ai humanizer pricing', 'natural quill pricing', 'ai humanizer cost', 'humanize ai text price', 'cheap ai humanizer', 'affordable ai humanizer'],
  openGraph: {
    title: 'Pricing — Natural Quill AI Humanizer',
    description: 'Free to try. One-time word packs from $19.99. No subscription traps.',
    url: 'https://naturalquill.one/pricing',
  },
};

const plans = [
  {
    name: 'Free',
    price: '$0',
    billing: 'no signup required',
    words: '400 words',
    features: ['400 free words', 'All tone settings', 'All strength levels', 'No account needed'],
    cta: 'Start Free',
    href: '/',
    highlight: false,
  },
  {
    name: 'Starter',
    price: '$19.99',
    billing: 'one-time payment',
    words: '10,000 words',
    features: ['10,000 word balance', 'All tone settings', 'PDF & DOCX upload', 'Manuscript history', 'No expiry'],
    cta: 'Get Starter',
    href: '/#pricing',
    highlight: false,
  },
  {
    name: 'Pro',
    price: '$29.99',
    billing: 'one-time payment',
    words: '50,000 words',
    features: ['50,000 word balance', 'All tone settings', 'PDF & DOCX upload', 'Manuscript history', 'No expiry', 'Priority processing'],
    cta: 'Get Pro',
    href: '/#pricing',
    highlight: true,
  },
  {
    name: 'Unlimited',
    price: '$39.99',
    billing: 'per month',
    words: 'Unlimited words',
    features: ['Unlimited words', 'All tone settings', 'PDF & DOCX upload', 'Manuscript history', 'Priority processing', 'Cancel anytime'],
    cta: 'Get Unlimited',
    href: '/#pricing',
    highlight: false,
  },
];

const faqs = [
  { q: 'Do word packs expire?', a: 'No. Starter and Pro word packs never expire. Use them at your own pace.' },
  { q: 'Can I try before buying?', a: 'Yes. You get 400 words free with no account required. No credit card needed.' },
  { q: 'What counts as a word?', a: 'Words are counted on the input text you submit for rewriting, not the output.' },
  { q: 'Can I cancel the Unlimited plan?', a: 'Yes, cancel anytime from your account settings. You keep access until the end of your billing period.' },
  { q: 'Do you offer refunds?', a: 'All purchases are final due to the nature of digital word credits. Please use the free tier to verify the tool works for your needs before purchasing.' },
  { q: 'Which plan is best for students?', a: 'Most students find the Starter pack ($19.99 for 10,000 words) covers a full semester of essay humanization. That is roughly 10 full essays at 1,000 words each.' },
];

export default function PricingPage() {
  return (
    <main style={{ minHeight: '100vh', background: '#07070a', color: '#ffffff', fontFamily: 'Inter, sans-serif' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '4rem 1.5rem' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '3.5rem' }}>
          <Link href="/" style={{ color: '#2563eb', fontSize: '0.875rem', textDecoration: 'none', display: 'inline-block', marginBottom: '2rem' }}>← Back to Natural Quill</Link>
          <h1 style={{ fontSize: '2.5rem', fontWeight: 900, letterSpacing: '-0.03em', marginBottom: '1rem' }}>Simple, honest pricing</h1>
          <p style={{ fontSize: '1.1rem', color: '#888899', maxWidth: '500px', margin: '0 auto', lineHeight: 1.6 }}>
            Pay once, use when you need it. No subscriptions traps. 400 words free — no signup.
          </p>
        </div>

        {/* Plans */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '4rem' }}>
          {plans.map(plan => (
            <div key={plan.name} style={{
              padding: '1.75rem 1.5rem',
              background: plan.highlight ? 'rgba(37,99,235,0.1)' : 'rgba(255,255,255,0.03)',
              border: plan.highlight ? '1px solid rgba(37,99,235,0.4)' : '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1rem',
              display: 'flex', flexDirection: 'column',
            }}>
              {plan.highlight && <div style={{ fontSize: '0.7rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#60a5fa', marginBottom: '0.75rem' }}>Most Popular</div>}
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.5rem', color: '#fff' }}>{plan.name}</h2>
              <div style={{ marginBottom: '0.25rem' }}>
                <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff' }}>{plan.price}</span>
              </div>
              <div style={{ fontSize: '0.75rem', color: '#888899', marginBottom: '0.5rem' }}>{plan.billing}</div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#60a5fa', marginBottom: '1.25rem' }}>{plan.words}</div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                {plan.features.map(f => (
                  <li key={f} style={{ fontSize: '0.85rem', color: '#c8d0e0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: '#10b981', fontWeight: 700 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href} style={{
                display: 'block', textAlign: 'center',
                background: plan.highlight ? '#2563eb' : 'rgba(255,255,255,0.07)',
                color: '#fff', padding: '0.75rem',
                borderRadius: '0.5rem', fontWeight: 700,
                textDecoration: 'none', fontSize: '0.9rem',
              }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        {/* FAQ */}
        <div style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', textAlign: 'center' }}>Frequently asked questions</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {faqs.map(({ q, a }) => (
              <div key={q} style={{ padding: '1.25rem', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem' }}>
                <p style={{ fontWeight: 700, color: '#fff', margin: '0 0 0.5rem', fontSize: '0.95rem' }}>{q}</p>
                <p style={{ color: '#888899', margin: 0, lineHeight: 1.65, fontSize: '0.9rem' }}>{a}</p>
              </div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <Link href="/" style={{ display: 'inline-block', background: '#2563eb', color: '#fff', padding: '0.9rem 2.5rem', borderRadius: '0.5rem', fontWeight: 700, textDecoration: 'none', fontSize: '1rem' }}>
            Try Free — 400 Words, No Signup →
          </Link>
        </div>
      </div>
    </main>
  );
}
