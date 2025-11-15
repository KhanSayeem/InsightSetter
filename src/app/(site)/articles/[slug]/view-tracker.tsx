'use client';

import { useEffect } from 'react';

function isSupported() {
  return typeof window !== 'undefined' && 'IntersectionObserver' in window;
}

export function ViewTracker({ articleId }: { articleId: string }) {
  useEffect(() => {
    // Development diagnostics
    const log = (...args: unknown[]) => {
      if (process.env.NODE_ENV !== 'production') console.info('[view-tracker]', ...args);
    };

    if (!isSupported()) {
      // Fallback: fire immediately
      log('no IO support, sendBeacon', { articleId });
      navigator.sendBeacon?.(
        '/api/analytics/page-view',
        new Blob([JSON.stringify({ articleId })], { type: 'application/json' }),
      );
      return;
    }

    const el = document.getElementById('article-root');
    if (!el) {
      log('article-root not found');
      return;
    }

    let sent = false;
    const send = () => {
      if (sent) return;
      sent = true;
      log('posting', { articleId });
      fetch('/api/analytics/page-view', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        keepalive: true,
        body: JSON.stringify({ articleId }),
      }).catch((err) => log('post failed', err));
    };

    // Observe visibility
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          send();
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    // Safety fallback: if IO never fires (layout quirks), send after 3s
    const timer = window.setTimeout(() => {
      if (!sent) {
        log('timeout fallback');
        send();
      }
    }, 3000);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
    };
  }, [articleId]);

  return null;
}
