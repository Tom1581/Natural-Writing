'use client';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

type AnalyticsPayload = Record<string, string | number | boolean | null | undefined>;

export function trackEvent(event: string, payload: AnalyticsPayload = {}) {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({
    event,
    ...payload,
  });

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, payload);
  }
}
