'use client';

import { useActionState, useMemo, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  sendDigestAction,
  type NewsletterDigestState,
} from '@/app/newsletter-actions';

const initialState: NewsletterDigestState = {
  ok: false,
  message: '',
};

type DigestRecipient = {
  id: string;
  email: string;
  createdAt: string;
};

type DigestSenderFormProps = {
  subscribers: DigestRecipient[];
};

const joinDateFormatter = new Intl.DateTimeFormat('en', {
  dateStyle: 'medium',
});

export function DigestSenderForm({ subscribers }: DigestSenderFormProps) {
  const [state, formAction] = useActionState(sendDigestAction, initialState);
  const [recipientMode, setRecipientMode] = useState<'all' | 'custom' | ''>('');
  const [manualRecipients, setManualRecipients] = useState<string[]>([]);
  const defaultSubject = `InsightSetter briefing - ${new Date().toLocaleDateString()}`;

  const hasSubscribers = subscribers.length > 0;

  const manualRecipientsFiltered = useMemo(
    () =>
      manualRecipients.filter((email) =>
        subscribers.some((subscriber) => subscriber.email === email),
      ),
    [manualRecipients, subscribers],
  );

  const canSubmit =
    hasSubscribers &&
    (recipientMode === 'all' ||
      (recipientMode === 'custom' && manualRecipientsFiltered.length > 0));

  const handleRecipientToggle = (email: string) => {
    setManualRecipients((prev) =>
      prev.includes(email)
        ? prev.filter((item) => item !== email)
        : [...prev, email],
    );
  };


  const selectionSummary = useMemo(() => {
    if (!hasSubscribers) {
      return '';
    }

    if (recipientMode === 'all') {
      return `All selected (${subscribers.length})`;
    }

    return `${manualRecipientsFiltered.length}/${subscribers.length} selected`;
  }, [hasSubscribers, manualRecipientsFiltered.length, recipientMode, subscribers.length]);

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-1">
        <label
          htmlFor="digest-subject"
          className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
        >
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
        <label
          htmlFor="digest-article-count"
          className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground"
        >
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

      <fieldset className="space-y-3 rounded-xl border border-border/70 p-4">
        <legend className="text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          Recipients
        </legend>
        {hasSubscribers ? (
          <>
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="recipientMode"
                  value="all"
                  checked={recipientMode === 'all'}
                  onChange={() => {
                    setRecipientMode('all');
                    setManualRecipients([]);
                  }}
                  className="h-4 w-4 accent-primary"
                />
                <span>Select all subscribers ({subscribers.length})</span>
              </label>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input
                  type="radio"
                  name="recipientMode"
                  value="custom"
                  checked={recipientMode === 'custom'}
                  onChange={() => setRecipientMode('custom')}
                  className="h-4 w-4 accent-primary"
                />
                <span>Select subscribers manually</span>
              </label>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Subscribers</span>
                <span>{selectionSummary}</span>
              </div>
              <div className="max-h-64 overflow-y-auto rounded-xl border border-border/60 bg-background/60">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background/80 backdrop-blur">
                    <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted-foreground">
                      <th className="px-3 py-2 font-medium">Send</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscribers.map((subscriber) => (
                      <tr
                        key={subscriber.id}
                        className="border-t border-border/50 odd:bg-background/40"
                      >
                        <td className="px-3 py-2">
                          <input
                            type="checkbox"
                            name="recipients"
                            value={subscriber.email}
                            checked={
                              recipientMode === 'all' ||
                              manualRecipientsFiltered.includes(subscriber.email)
                            }
                            onChange={() => handleRecipientToggle(subscriber.email)}
                            disabled={recipientMode !== 'custom'}
                            className="h-4 w-4 accent-primary disabled:opacity-40"
                          />
                        </td>
                        <td className="px-3 py-2 font-medium text-foreground">
                          {subscriber.email}
                        </td>
                        <td className="px-3 py-2 text-muted-foreground">
                          {joinDateFormatter.format(new Date(subscriber.createdAt))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {!canSubmit ? (
              <p className="text-xs text-muted-foreground">
                Choose &quot;Select all&quot; or pick at least one subscriber to enable sending.
              </p>
            ) : null}
          </>
        ) : (
          <p className="rounded-lg border border-border/60 bg-background/70 px-3 py-2 text-sm text-muted-foreground">
            No active subscribers yet. Once people join the list, you can choose who receives the digest.
          </p>
        )}
      </fieldset>

      <Button type="submit" size="sm" disabled={!canSubmit}>
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
