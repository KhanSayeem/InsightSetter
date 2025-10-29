'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import {
  sendDigestAction,
  type NewsletterDigestState,
} from '@/app/newsletter-actions';

const initialState: NewsletterDigestState = {
  ok: false,
  message: '',
};

export function DigestSenderForm() {
  const [state, formAction] = useActionState(sendDigestAction, initialState);
  const defaultSubject = `InsightSetter briefing — ${new Date().toLocaleDateString()}`;

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label htmlFor="digest-subject" className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Subject
        </label>
        <input
          id="digest-subject"
          name="subject"
          type="text"
          defaultValue={defaultSubject}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="digest-article-count" className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Articles to include
        </label>
        <select
          id="digest-article-count"
          name="articleCount"
          defaultValue="5"
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          {[3, 4, 5, 6, 7, 8].map((count) => (
            <option key={count} value={count}>
              {count} articles
            </option>
          ))}
        </select>
      </div>
      <Button type="submit" size="sm">
        Send digest
      </Button>
      {state.message ? (
        <p className={`text-sm ${state.ok ? 'text-primary' : 'text-destructive'}`}>
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
