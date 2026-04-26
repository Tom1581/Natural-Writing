'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2 } from 'lucide-react';
import BrandMark from '@/components/BrandMark';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const PLAN_NAMES: Record<string, string> = {
  starter: 'Starter',
  pro: 'Pro',
  unlimited: 'Unlimited',
};

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [plan, setPlan] = useState<string | null>(null);
  const [billingModel, setBillingModel] = useState<'one_time' | 'subscription' | null>(null);
  const [wordsGranted, setWordsGranted] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!sessionId) {
      router.replace('/');
      return;
    }

    fetch(`${API}/stripe/verify-session?session_id=${sessionId}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.plan) setPlan(data.plan);
        if (data?.billingModel) setBillingModel(data.billingModel);
        if (typeof data?.wordsGranted === 'number') setWordsGranted(data.wordsGranted);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sessionId, router]);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => router.replace('/'), 5000);
      return () => clearTimeout(t);
    }
  }, [loading, router]);

  return (
    <>
      {loading ? (
        <>
          <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Confirming your subscription…</p>
        </>
      ) : (
        <>
          <CheckCircle2 size={52} style={{ color: '#34d399' }} />
          <div>
            <h1 style={{
              fontSize: '1.75rem', fontWeight: 900, letterSpacing: '-0.03em',
              fontFamily: 'var(--font-display)', color: '#fff', marginBottom: '0.5rem',
            }}>
              You're all set!
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              {plan
                ? billingModel === 'one_time'
                  ? `Your ${PLAN_NAMES[plan] || plan} purchase is complete${wordsGranted ? ` and ${wordsGranted.toLocaleString()} words were added.` : '.'}`
                  : `Your ${PLAN_NAMES[plan] || plan} subscription is now active.`
                : 'Your payment is complete.'}
            </p>
          </div>
          <p style={{ fontSize: '0.7rem', color: 'var(--text-dark)' }}>
            Redirecting you to the editor in a moment…
          </p>
        </>
      )}
    </>
  );
}

export default function PaymentSuccessPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '1.5rem', padding: '2rem',
      textAlign: 'center',
    }}>
      <div className="icon-container-core" style={{ width: '60px', height: '60px' }}>
        <BrandMark size={30} />
      </div>
      <Suspense fallback={
        <Loader2 size={28} style={{ animation: 'spin 1s linear infinite', color: 'var(--text-muted)' }} />
      }>
        <PaymentSuccessContent />
      </Suspense>
    </div>
  );
}
