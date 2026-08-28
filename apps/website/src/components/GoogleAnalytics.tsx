'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export function trackEvent(name: string, params: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined' || !measurementId || !window.gtag) return;
  window.gtag('event', name, params);
}

export function GoogleAnalytics() {
  const pathname = usePathname();
  useEffect(() => {
    if (measurementId) window.gtag?.('config', measurementId, { page_path: pathname });
  }, [pathname]);
  if (!measurementId) return null;
  return <>
    <Script src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`} strategy="afterInteractive" />
    <Script id="ga4" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};window.gtag=gtag;gtag('js',new Date());gtag('config','${measurementId}');`}</Script>
  </>;
}
