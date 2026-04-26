'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import BrandMark from '@/components/BrandMark';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // Supabase v2 automatically exchanges the ?code= param for a session.
    // We just need to wait for onAuthStateChange to confirm it, then navigate home.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        subscription.unsubscribe();
        router.replace('/');
      } else if (event === 'SIGNED_OUT') {
        subscription.unsubscribe();
        router.replace('/login');
      }
    });

    // Also check immediately in case the session is already established
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        subscription.unsubscribe();
        router.replace('/');
      }
    });

    return () => { subscription.unsubscribe(); };
  }, [router]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-primary)',
      gap: '1.5rem',
    }}>
      <div className="icon-container-core" style={{ width: '56px', height: '56px' }}>
        <BrandMark size={28} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        <svg
          style={{ animation: 'spin 1s linear infinite', flexShrink: 0 }}
          width="18" height="18" viewBox="0 0 24 24" fill="none"
          stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-6.219-8.56" />
        </svg>
        Completing sign-in…
      </div>
    </div>
  );
}
