"use client";

import { useState } from 'react';
export function ShareButton({ title, url }: { title: string; url?: string }) {
  const [copied, setCopied] = useState(false);

  async function onShare() {
    try {
      const href = url || (typeof window !== 'undefined' ? window.location.href : '');
      if (navigator.share && href) {
        await navigator.share({ title, url: href });
        return;
      }
      if (href && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(href);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }
    } catch {
      // noop
    }
  }

  return (
    <button
      type="button"
      onClick={onShare}
      className="group inline-flex items-center text-sm font-semibold text-primary transition hover:text-primary/80"
      aria-label="Share article"
    >
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </button>
  );
}
