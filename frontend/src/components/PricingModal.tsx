'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Zap, Star, Infinity as InfinityIcon, Loader2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import TermsOfUse from './TermsOfUse';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Plan {
  key: 'starter' | 'pro' | 'unlimited';
  name: string;
  price: number;
  wordLimit: string;
  billingLabel: string;
  badge?: string;
  icon: React.ReactNode;
  accentColor: string;
  borderColor: string;
  bgColor: string;
  features: string[];
}

const PLANS: Plan[] = [
  {
    key: 'starter',
    name: 'Starter',
    price: 19.99,
    wordLimit: '10,000 words',
    billingLabel: 'one-time',
    icon: <Zap size={20} />,
    accentColor: '#60a5fa',
    borderColor: 'rgba(96,165,250,0.3)',
    bgColor: 'rgba(96,165,250,0.05)',
    features: [
      '10,000 prepaid words',
      'All 5 humanization styles',
      'AI-style pattern reduction',
      'Strength & tone controls',
      'Use anytime until balance runs out',
      'Manuscript history (7 days)',
      'Email support',
    ],
  },
  {
    key: 'pro',
    name: 'Pro',
    price: 29.99,
    wordLimit: '50,000 words',
    billingLabel: 'one-time',
    badge: 'Most Popular',
    icon: <Star size={20} />,
    accentColor: '#a78bfa',
    borderColor: 'rgba(167,139,250,0.5)',
    bgColor: 'rgba(167,139,250,0.07)',
    features: [
      '50,000 prepaid words',
      'Everything in Starter',
      'Priority Groq LLM processing',
      'Style cloning & profiles',
      'AI Draft Generator (Gemini)',
      'Use anytime until balance runs out',
      'Manuscript history (30 days)',
      'Sidecar AI chat',
      'Priority support',
    ],
  },
  {
    key: 'unlimited',
    name: 'Unlimited',
    price: 39.99,
    wordLimit: 'Unlimited words',
    billingLabel: 'monthly',
    icon: <InfinityIcon size={20} />,
    accentColor: '#34d399',
    borderColor: 'rgba(52,211,153,0.3)',
    bgColor: 'rgba(52,211,153,0.05)',
    features: [
      'Unlimited words',
      'Everything in Pro',
      'Fastest processing priority',
      'Manuscript history (90 days)',
      'Renews every month',
      'Early access to new features',
      'Dedicated support channel',
    ],
  },
];

interface PricingModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { name: string; email: string } | null;
  onLoginRequired: () => void;
}

export default function PricingModal({ isOpen, onClose, user, onLoginRequired }: PricingModalProps) {
  const [loadingPlan,  setLoadingPlan]  = useState<string | null>(null);
  const [pendingPlan,  setPendingPlan]  = useState<Plan | null>(null);
  const [termsOpen,    setTermsOpen]    = useState(false);

  // Step 1: plan button clicked → open Terms modal
  const handlePlanClick = (plan: Plan) => {
    if (!user) {
      toast.error('Please sign in first to continue.');
      onLoginRequired();
      return;
    }
    setPendingPlan(plan);
    setTermsOpen(true);
  };

  // Step 2: user agreed to terms → proceed to Stripe
  const handleTermsAgreed = async () => {
    if (!pendingPlan || !user) return;
    const plan = pendingPlan;
    setLoadingPlan(plan.key);

    try {
      const res = await fetch(`${API}/stripe/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: plan.key,
          email: user.email,
          userId: user.email,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        const msg: string = (err as any)?.message || 'Failed to start checkout.';
        if (res.status === 503 || msg.includes('not configured') || msg.includes('REPLACE')) {
          throw new Error('Stripe payments are not set up yet. Add your STRIPE_SECRET_KEY and price IDs to backend/.env.');
        }
        throw new Error(msg);
      }

      const { url } = await res.json();
      window.location.href = url;
    } catch (err: any) {
      toast.error(err.message || 'Checkout failed. Please try again.', { duration: 6000 });
      setLoadingPlan(null);
      setTermsOpen(false);
    }
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.88)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            zIndex: 300,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            overflowY: 'auto',
          }}
          onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ duration: 0.25 }}
            style={{
              background: '#0a0a0f',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '1.5rem',
              width: '100%',
              maxWidth: '880px',
              padding: '2.5rem',
              position: 'relative',
              boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
            }}
          >
            {/* Close */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute', top: '1.25rem', right: '1.25rem',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '50%', width: '32px', height: '32px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-muted)', cursor: 'pointer',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'var(--text-muted)'; }}
            >
              <X size={14} />
            </button>

            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
              <h2 style={{
                fontSize: '1.75rem', fontWeight: 900,
                fontFamily: 'var(--font-display)',
                letterSpacing: '-0.03em',
                background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%)',
                WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                marginBottom: '0.5rem',
              }}>
                Unlock Full Access
              </h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto' }}>
                Free trial includes up to <strong style={{ color: '#fff' }}>400 words</strong>. Buy token packs for Starter or Pro, or subscribe monthly for Unlimited.
              </p>
            </div>

            {/* Pricing cards */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
              gap: '1rem',
            }}>
              {PLANS.map(plan => (
                <div
                  key={plan.key}
                  style={{
                    position: 'relative',
                    background: plan.badge ? 'rgba(124,58,237,0.08)' : plan.bgColor,
                    border: `1px solid ${plan.borderColor}`,
                    borderRadius: '1rem',
                    padding: '1.75rem',
                    display: 'flex', flexDirection: 'column', gap: '1rem',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLElement).style.boxShadow = `0 12px 40px ${plan.accentColor}22`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Badge */}
                  {plan.badge && (
                    <div style={{
                      position: 'absolute', top: '-12px', left: '50%', transform: 'translateX(-50%)',
                      background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
                      borderRadius: '999px', padding: '0.25rem 0.85rem',
                      fontSize: '0.6rem', fontWeight: 800, textTransform: 'uppercase',
                      letterSpacing: '0.12em', color: '#fff', whiteSpace: 'nowrap',
                    }}>
                      {plan.badge}
                    </div>
                  )}

                  {/* Plan header */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: plan.accentColor, marginBottom: '0.5rem' }}>
                      {plan.icon}
                      <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                        {plan.name}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.25rem' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', fontFamily: 'var(--font-display)' }}>
                        ${plan.price}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>/ {plan.billingLabel}</span>
                    </div>
                    <p style={{ fontSize: '0.7rem', color: plan.accentColor, fontWeight: 700, marginTop: '0.2rem' }}>
                      {plan.wordLimit}
                    </p>
                  </div>

                  {/* Features */}
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {plan.features.map(feature => (
                      <li key={feature} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                        <Check size={13} style={{ color: plan.accentColor, flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.75rem', color: 'rgba(232,232,237,0.75)', lineHeight: 1.4 }}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <button
                    onClick={() => handlePlanClick(plan)}
                    disabled={!!loadingPlan}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                      padding: '0.75rem',
                      background: plan.badge
                        ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                        : `linear-gradient(135deg, ${plan.accentColor}33, ${plan.accentColor}22)`,
                      border: `1px solid ${plan.badge ? 'transparent' : plan.borderColor}`,
                      borderRadius: '0.65rem',
                      color: plan.badge ? '#fff' : plan.accentColor,
                      fontSize: '0.72rem', fontWeight: 800,
                      textTransform: 'uppercase', letterSpacing: '0.1em',
                      cursor: loadingPlan ? 'not-allowed' : 'pointer',
                      opacity: loadingPlan && loadingPlan !== plan.key ? 0.5 : 1,
                      transition: 'all 0.15s ease',
                    }}
                  >
                    {loadingPlan === plan.key
                      ? <><Loader2 size={14} className="animate-spin" /> Redirecting…</>
                      : !user
                        ? <><Lock size={13} /> Sign in to Continue</>
                        : plan.key === 'unlimited'
                          ? `Subscribe to ${plan.name}`
                          : `Buy ${plan.name}`
                    }
                  </button>
                </div>
              ))}
            </div>

            {/* Footer note */}
            <p style={{ textAlign: 'center', fontSize: '0.6rem', color: 'var(--text-dark)', marginTop: '1.5rem' }}>
              Starter and Pro are one-time token packs. Unlimited renews monthly. Secure payment via Stripe.
              By purchasing you agree to our Terms of Use and No-Refund Policy.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>

    {/* Terms of Use gate — lives outside AnimatePresence, has its own animation */}
    {pendingPlan && (
      <TermsOfUse
        isOpen={termsOpen}
        planName={pendingPlan.name}
        planPrice={String(pendingPlan.price)}
        billingLabel={pendingPlan.billingLabel}
        onAgree={handleTermsAgreed}
        onClose={() => { setTermsOpen(false); setLoadingPlan(null); }}
        isLoading={loadingPlan === pendingPlan.key}
      />
    )}
    </>
  );
}
