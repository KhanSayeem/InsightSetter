"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function CopyLinkButton({ href, className }: { href: string; className?: string }) {
  const [copied, setCopied] = useState(false);

  async function onCopy() {
    try {
      const absolute = href.startsWith('http')
        ? href
        : `${window.location.origin}${href.startsWith('/') ? href : `/${href}`}`;
      await navigator.clipboard.writeText(absolute);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      // noop
    }
  }

  return (
    <button
      type="button"
      onClick={onCopy}
      className={['group inline-flex items-center text-sm font-semibold text-primary transition hover:text-primary/80', className].filter(Boolean).join(' ')}
    >
      {copied ? 'Copied!' : 'Share'}
    </button>
  );
}
