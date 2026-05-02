'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
    gtag?: (...args: unknown[]) => void;
  }
}

interface GoogleTagEventsProps {
  gtmId: string;
  gaMeasurementId: string;
}

export default function GoogleTagEvents({ gtmId, gaMeasurementId }: GoogleTagEventsProps) {
  const pathname = usePathname();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || previousPath.current === pathname) return;
    previousPath.current = pathname;

    const pageLocation = `${window.location.origin}${pathname}`;
    const pageTitle = document.title;

    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'natural_quill_page_view',
      page_path: pathname,
      page_location: pageLocation,
      page_title: pageTitle,
      gtm_container_id: gtmId || undefined,
    });

    if (!gtmId && gaMeasurementId && typeof window.gtag === 'function') {
      window.gtag('config', gaMeasurementId, {
        page_path: pathname,
        page_location: pageLocation,
        page_title: pageTitle,
      });
    }
  }, [pathname, gtmId, gaMeasurementId]);

  return null;
}
