'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { submitArticleAction } from '@/app/actions';
import type { FormActionState } from '@/app/actions';
import { Button } from '@/components/ui/button';

type CategoryOption = {
  id: string;
  label: string;
  description?: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? 'Submitting.' : 'Send for review'}
    </Button>
  );
}

const initialState: FormActionState = {
  ok: false,
  message: '',
  errors: {},
};

export default function SubmitForm({ categories }: { categories: CategoryOption[] }) {
  const [state, formAction] = useActionState(submitArticleAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-8">
      <div className="space-y-2">
        <label htmlFor="category" className="text-sm font-semibold text-muted-foreground">
          Category
        </label>
        <select
          id="category"
          name="category"
          required
          defaultValue=""
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="" disabled>
            Choose the best fit
          </option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.label}
            </option>
          ))}
        </select>
        {categories.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            {categories.map((category) => category.label).join(' · ')}
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">No categories available yet.</p>
        )}
        {state.errors?.category && <p className="text-sm text-destructive">{state.errors.category}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-semibold text-muted-foreground">
          Headline
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          maxLength={150}
          placeholder="What's the core insight?"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {state.errors?.title && <p className="text-sm text-destructive">{state.errors.title}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-semibold text-muted-foreground">
          Tags <span className="font-normal text-muted-foreground/70">(optional)</span>
        </label>
        <input
          id="tags"
          name="tags"
          type="text"
          placeholder="macro, liquidity, rates"
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="text-xs text-muted-foreground">
          Up to five tags, separated by commas. We use these for discovery.
        </p>
        {state.errors?.tags && <p className="text-sm text-destructive">{state.errors.tags}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="summary" className="text-sm font-semibold text-muted-foreground">
          Summary <span className="font-normal text-muted-foreground/70">(optional)</span>
        </label>
        <textarea
          id="summary"
          name="summary"
          rows={3}
          placeholder="One paragraph overview to draw readers in."
          className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="content" className="text-sm font-semibold text-muted-foreground">
          Article body
        </label>
        <textarea
          id="content"
          name="content"
          required
          rows={12}
          placeholder="Share the data, narrative, or framework you want the InsightSetter audience to understand."
          className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {state.errors?.content && <p className="text-sm text-destructive">{state.errors.content}</p>}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="authorName" className="text-sm font-semibold text-muted-foreground">
            Your name
          </label>
          <input
            id="authorName"
            name="authorName"
            type="text"
            required
            placeholder="How should we credit you?"
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {state.errors?.authorName && (
            <p className="text-sm text-destructive">{state.errors.authorName}</p>
          )}
        </div>
        <div className="space-y-2">
          <label htmlFor="authorEmail" className="text-sm font-semibold text-muted-foreground">
            Contact email <span className="font-normal text-muted-foreground/70">(optional)</span>
          </label>
          <input
            id="authorEmail"
            name="authorEmail"
            type="email"
            placeholder="We'll use this if we need clarification."
            className="w-full rounded-lg border border-border bg-background px-4 py-2.5 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          {state.errors?.authorEmail && (
            <p className="text-sm text-destructive">{state.errors.authorEmail}</p>
          )}
        </div>
      </div>

      {state.message && (
        <div
          className={`rounded-lg border px-4 py-3 text-sm ${
            state.ok
              ? 'border-primary/30 bg-primary/10 text-primary'
              : 'border-destructive/40 bg-destructive/10 text-destructive'
          }`}
        >
          {state.message}
        </div>
      )}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
