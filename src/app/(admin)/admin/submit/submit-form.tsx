'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { submitAdminArticleAction } from '@/app/(admin)/admin/actions';
import type { FormActionState } from '@/app/actions';
import { ARTICLE_CATEGORY_OPTIONS, ARTICLE_CATEGORY_META } from '@/lib/article-categories';
import { Button } from '@/components/ui/button';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending} size="lg">
      {pending ? 'Publishing...' : 'Publish Article'}
    </Button>
  );
}

const initialState: FormActionState = {
  ok: false,
  message: '',
  errors: {},
};

export default function SubmitForm() {
  const [state, formAction] = useActionState(submitAdminArticleAction, initialState);
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
          {ARTICLE_CATEGORY_OPTIONS.map(({ value, label }) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
        <p className="text-xs text-muted-foreground">
          {Object.values(ARTICLE_CATEGORY_META)
            .map((meta) => meta.label)
            .join(' • ')}
        </p>
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
