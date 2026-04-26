'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FileText, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface TermsOfUseProps {
  isOpen: boolean;
  planName: string;
  planPrice: string;
  billingLabel: string;
  onAgree: () => void;
  onClose: () => void;
  isLoading?: boolean;
}

export default function TermsOfUse({
  isOpen, planName, planPrice, billingLabel, onAgree, onClose, isLoading = false,
}: TermsOfUseProps) {
  const [agreed, setAgreed]     = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const bodyRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) { setAgreed(false); setScrolled(false); }
  }, [isOpen]);

  const handleScroll = () => {
    const el = bodyRef.current;
    if (!el) return;
    if (el.scrollTop + el.clientHeight >= el.scrollHeight - 40) setScrolled(true);
  };

  const TODAY = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const isRecurring = billingLabel.toLowerCase().includes('month');

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 500 }}
          />

          {/* Centering container — flex so Framer Motion transform doesn't break centering */}
          <div style={{
            position: 'fixed', inset: 0, zIndex: 510,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '1.5rem',
            pointerEvents: 'none',
          }}>
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.94, opacity: 0, y: 16 }}
            transition={{ type: 'spring', damping: 28, stiffness: 340 }}
            style={{
              width: '100%',
              maxWidth: 680,
              maxHeight: 'calc(100vh - 3rem)',
              background: '#080810',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: '1.25rem',
              boxShadow: '0 40px 120px rgba(0,0,0,0.9)',
              display: 'flex', flexDirection: 'column',
              overflow: 'hidden',
              pointerEvents: 'all',
            }}
          >
            {/* Header */}
            <div style={{
              padding: '1.4rem 1.75rem',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <FileText size={16} style={{ color: '#fbbf24' }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 900, color: '#fff' }}>
                    Terms of Use & Billing Agreement
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.58rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.3em', color: '#2a2a2a' }}>
                    Read before proceeding to payment
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{ background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '0.25rem', display: 'flex' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Plan summary banner */}
            <div style={{
              margin: '1rem 1.75rem 0',
              padding: '0.75rem 1rem',
              background: 'rgba(37,99,235,0.07)',
              border: '1px solid rgba(37,99,235,0.15)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              flexShrink: 0,
            }}>
              <div>
                <p style={{ margin: 0, fontSize: '0.78rem', fontWeight: 800, color: '#fff' }}>
                  {planName} Plan — <span style={{ color: '#60a5fa' }}>${planPrice} / {billingLabel}</span>
                </p>
                <p style={{ margin: '0.15rem 0 0', fontSize: '0.63rem', color: '#555' }}>
                  {isRecurring
                    ? 'This is a recurring monthly subscription. You will be charged automatically each month.'
                    : 'This is a one-time purchase. No recurring charges.'}
                </p>
              </div>
              {isRecurring && (
                <div style={{
                  padding: '0.25rem 0.6rem',
                  background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)',
                  borderRadius: 6,
                  fontSize: '0.58rem', fontWeight: 800, color: '#fbbf24',
                  textTransform: 'uppercase', letterSpacing: '0.15em', whiteSpace: 'nowrap',
                }}>
                  Auto-renews
                </div>
              )}
            </div>

            {/* Scrollable legal body */}
            <div
              ref={bodyRef}
              onScroll={handleScroll}
              className="custom-scroll"
              style={{
                flex: 1, overflowY: 'auto',
                padding: '1.25rem 1.75rem',
                fontSize: '0.72rem', color: '#888', lineHeight: 1.8,
              }}
            >
              <p style={{ fontSize: '0.6rem', color: '#333', marginBottom: '1.25rem' }}>
                Effective Date: {TODAY} &nbsp;·&nbsp; Natural Quill ("the Service")
              </p>

              <Section title="1. Acceptance of Terms">
                By clicking "Agree & Proceed to Payment," you confirm that you have read, understood, and agree to be legally bound by these Terms of Use and the Billing Agreement below. If you do not agree to these terms, click Cancel and do not proceed with payment.
              </Section>

              <Section title="2. Description of Service">
                Natural Quill is a web-based AI writing humanisation tool that processes user-submitted text using automated language models and rule-based algorithms. The Service is provided on an "as-is" and "as-available" basis. Natural Quill reserves the right to modify, suspend, or discontinue the Service or any feature thereof at any time without prior notice.
              </Section>

              <Section title="3. Eligibility">
                You must be at least 18 years of age (or the age of legal majority in your jurisdiction) and have the legal capacity to enter into a binding contract to purchase any plan. By completing a purchase you represent and warrant that these conditions are met.
              </Section>

              <Section title="4. Plans and Billing">
                <strong style={{ color: '#aaa' }}>Starter and Pro (One-Time Purchases)</strong><br />
                The Starter ($19.99) and Pro ($29.99) plans are one-time non-recurring purchases. You are granted a fixed prepaid word balance (10,000 or 50,000 words respectively) that is deducted as you use the Service. These word balances do not expire. You will not be billed again unless you choose to make an additional purchase.
                <br /><br />
                <strong style={{ color: '#aaa' }}>Unlimited (Monthly Subscription)</strong><br />
                The Unlimited plan ($39.99/month) is a recurring monthly subscription. Your payment method will be charged automatically on the same calendar date each month until you cancel. You may cancel at any time through your billing portal; cancellation takes effect at the end of the current billing period, after which you retain access until the period expires and no further charges will be made.
              </Section>

              <Section title="5. No Refund Policy" highlight>
                <span style={{ color: '#f87171', fontWeight: 700 }}>ALL SALES ARE FINAL. NATURAL QUILL DOES NOT OFFER REFUNDS, CREDITS, OR EXCHANGES UNDER ANY CIRCUMSTANCES.</span>
                <br /><br />
                This includes, but is not limited to:
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '0.5rem' }}>
                  <li>Unused word balance remaining after purchase</li>
                  <li>Partial use of a monthly billing period</li>
                  <li>Dissatisfaction with AI output quality</li>
                  <li>Technical issues outside of our direct control</li>
                  <li>Accidental purchases</li>
                  <li>Duplicate purchases</li>
                  <li>Change of mind after payment is processed</li>
                </ul>
                <br />
                If you are experiencing a technical issue with the Service, please contact support at <span style={{ color: '#60a5fa' }}>stockitupcs@gmail.com</span> before making a purchase. Support inquiries do not constitute grounds for a refund unless Natural Quill determines at its sole discretion that a billing error occurred on our end.
                <br /><br />
                To the extent required by applicable consumer protection law in your jurisdiction, statutory rights that cannot be waived by contract remain unaffected. However, Natural Quill explicitly does not offer discretionary refunds beyond any such minimum statutory requirements.
              </Section>

              <Section title="6. Acceptable Use">
                You agree to use the Service solely for lawful purposes. You must not use Natural Quill to:
                <ul style={{ margin: '0.5rem 0 0 1rem', paddingLeft: '0.5rem' }}>
                  <li>Submit content that infringes the intellectual property rights of others</li>
                  <li>Generate or humanise content intended for fraud, deception, or academic misconduct</li>
                  <li>Attempt to reverse-engineer, scrape, or systematically extract data from the Service</li>
                  <li>Circumvent any technical or access controls</li>
                  <li>Resell or sublicense access to the Service without written authorisation</li>
                </ul>
                Natural Quill reserves the right to terminate accounts that violate this policy without refund.
              </Section>

              <Section title="7. Intellectual Property">
                The text you submit remains your own. Natural Quill does not claim ownership of your input or output. Natural Quill retains all rights to the underlying software, algorithms, models, brand, and interface. You are granted a limited, non-exclusive, non-transferable licence to use the Service for personal or business purposes during your active subscription or word balance period.
              </Section>

              <Section title="8. Privacy and Data">
                By using the Service you consent to our collection and processing of usage data including submitted text, email address, and transaction information for the purpose of providing and improving the Service. We do not sell your personal data to third parties. Payment processing is handled by Stripe, Inc., and Natural Quill does not store full card details. Please review Stripe's privacy policy at stripe.com/privacy.
              </Section>

              <Section title="9. Disclaimer of Warranties">
                THE SERVICE IS PROVIDED "AS IS" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT. NATURAL QUILL DOES NOT GUARANTEE THAT OUTPUT WILL PASS ANY PARTICULAR AI DETECTION TOOL OR MEET ANY SPECIFIC STANDARD. RESULTS MAY VARY.
              </Section>

              <Section title="10. Limitation of Liability">
                TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, NATURAL QUILL AND ITS OPERATORS SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING OUT OF OR RELATING TO YOUR USE OF THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES. NATURAL QUILL'S TOTAL CUMULATIVE LIABILITY SHALL NOT EXCEED THE AMOUNT YOU PAID FOR THE SERVICE IN THE TWELVE (12) MONTHS PRECEDING THE CLAIM.
              </Section>

              <Section title="11. Modifications to Terms">
                Natural Quill reserves the right to update these Terms at any time. Material changes will be notified via email to your registered address or by a notice posted on the Service. Continued use of the Service after such notice constitutes acceptance of the revised Terms.
              </Section>

              <Section title="12. Governing Law and Disputes">
                These Terms shall be governed by and construed in accordance with the laws of the applicable jurisdiction. Any dispute arising under these Terms shall first be attempted to be resolved through good-faith negotiation. If unresolved, disputes shall be submitted to binding arbitration in accordance with applicable arbitration rules. You waive any right to a jury trial or class-action proceeding to the extent permitted by law.
              </Section>

              <Section title="13. Contact">
                For billing inquiries, technical issues, or support requests, contact us at: <span style={{ color: '#60a5fa' }}>stockitupcs@gmail.com</span>. We aim to respond within 1–2 business days.
              </Section>

              {!scrolled && (
                <p style={{ textAlign: 'center', fontSize: '0.58rem', color: '#333', marginTop: '0.5rem' }}>
                  Scroll to the bottom to enable the agreement checkbox
                </p>
              )}
            </div>

            {/* Footer: checkbox + CTA */}
            <div style={{
              padding: '1.1rem 1.75rem',
              borderTop: '1px solid rgba(255,255,255,0.05)',
              flexShrink: 0,
              background: '#080810',
            }}>
              {/* No-refund alert */}
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                padding: '0.6rem 0.75rem',
                background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.14)',
                borderRadius: 8, marginBottom: '0.85rem',
              }}>
                <AlertTriangle size={13} style={{ color: '#f87171', flexShrink: 0, marginTop: 1 }} />
                <p style={{ margin: 0, fontSize: '0.62rem', color: '#888', lineHeight: 1.6 }}>
                  <span style={{ color: '#f87171', fontWeight: 700 }}>No refunds.</span> All purchases are final. Unused word balances and subscription periods are non-refundable.
                </p>
              </div>

              {/* Checkbox */}
              <label style={{
                display: 'flex', alignItems: 'flex-start', gap: '0.65rem',
                cursor: scrolled ? 'pointer' : 'not-allowed', opacity: scrolled ? 1 : 0.4,
                marginBottom: '0.85rem', userSelect: 'none',
              }}>
                <div
                  onClick={() => scrolled && setAgreed(v => !v)}
                  style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, marginTop: 1,
                    border: `1.5px solid ${agreed ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,
                    background: agreed ? 'rgba(34,197,94,0.12)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.15s',
                  }}
                >
                  {agreed && <CheckCircle2 size={12} style={{ color: '#22c55e' }} />}
                </div>
                <span style={{ fontSize: '0.68rem', color: '#aaa', lineHeight: 1.6 }}>
                  I have read and agree to the <strong style={{ color: '#ddd' }}>Terms of Use</strong>, the{' '}
                  <strong style={{ color: '#ddd' }}>Billing Agreement</strong>, and the{' '}
                  <strong style={{ color: '#f87171' }}>No-Refund Policy</strong>. I understand that{' '}
                  {isRecurring
                    ? 'my payment method will be charged $' + planPrice + ' monthly until I cancel.'
                    : 'this is a one-time charge of $' + planPrice + ' with no refunds.'}
                </span>
              </label>

              {/* CTA */}
              <button
                onClick={() => { if (agreed && !isLoading) onAgree(); }}
                disabled={!agreed || isLoading}
                style={{
                  width: '100%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  padding: '0.85rem',
                  background: agreed && !isLoading
                    ? 'linear-gradient(135deg, #1d4ed8, #2563eb)'
                    : 'rgba(37,99,235,0.08)',
                  border: 'none', borderRadius: 10,
                  color: agreed && !isLoading ? '#fff' : 'rgba(255,255,255,0.18)',
                  fontSize: '0.7rem', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.15em',
                  cursor: agreed && !isLoading ? 'pointer' : 'not-allowed',
                  transition: 'all 0.18s',
                  boxShadow: agreed && !isLoading ? '0 4px 20px rgba(37,99,235,0.35)' : 'none',
                  fontFamily: 'inherit',
                }}
              >
                {isLoading
                  ? <><Loader2 size={14} className="animate-spin" /> Redirecting to Stripe…</>
                  : <>Agree & Proceed to Payment — ${planPrice} / {billingLabel}</>
                }
              </button>
            </div>
          </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

function Section({ title, children, highlight }: { title: string; children: React.ReactNode; highlight?: boolean }) {
  return (
    <div style={{ marginBottom: '1.25rem' }}>
      <h3 style={{
        margin: '0 0 0.4rem',
        fontSize: '0.68rem', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.15em',
        color: highlight ? '#f87171' : '#555',
      }}>
        {title}
      </h3>
      <div style={{ color: '#666', fontSize: '0.7rem', lineHeight: 1.8 }}>
        {children}
      </div>
    </div>
  );
}
