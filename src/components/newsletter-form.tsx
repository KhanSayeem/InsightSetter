'use client';

import { useActionState } from 'react';

import { Button } from '@/components/ui/button';
import { subscribeNewsletterAction, type NewsletterSubscribeState } from '@/app/newsletter-actions';

const initialState: NewsletterSubscribeState = {
  ok: false,
  message: '',
};

export function NewsletterForm() {
  const [state, formAction] = useActionState(subscribeNewsletterAction, initialState);

  return (
    <form action={formAction} className="flex w-full flex-col gap-3 sm:flex-row sm:items-center">
      <div className="w-full">
        <label htmlFor="newsletter-email" className="sr-only">
          Email address
        </label>
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="w-full rounded-full border border-border bg-background px-5 py-3 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 sm:max-w-sm"
        />
      </div>
      <Button type="submit" size="lg" className="w-full sm:w-auto">
        Notify me
      </Button>
      {state.message ? (
        <p
          className={`text-sm ${
            state.ok ? 'text-primary' : 'text-destructive'
          } sm:ml-4 sm:mt-0`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
