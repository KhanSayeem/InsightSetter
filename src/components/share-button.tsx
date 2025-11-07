"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

function ShareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path d="M16 8a3 3 0 1 0-2.83-4H13a3 3 0 0 0 3 3Zm-8 8a3 3 0 1 0 0 6 3 3 0 0 0 0-6Zm8 0a3 3 0 1 0 2.83 4H19a3 3 0 0 0-3-3ZM8.62 14.21l6.76-3.38-.9-1.8-6.76 3.38.9 1.8Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

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
    <Button type="button" variant="secondary" size="sm" onClick={onShare} aria-label="Share article" className="inline-flex items-center gap-2">
      <ShareIcon className="h-4 w-4" />
      <span>{copied ? 'Copied!' : 'Share'}</span>
    </Button>
  );
}
