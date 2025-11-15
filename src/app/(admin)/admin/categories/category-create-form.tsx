'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { createCategoryAction, type CategoryFormState } from '../actions';

const initialState: CategoryFormState = {
  ok: false,
  message: '',
  errors: {},
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="md">
      {pending ? 'Saving…' : 'Create category'}
    </Button>
  );
}

export function CategoryCreateForm() {
  const [state, formAction] = useActionState(createCategoryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  return (
    <form ref={formRef} action={formAction} className="space-y-6 rounded-2xl border border-border/60 bg-background/70 p-6 shadow-sm">
      <div className="space-y-2">
        <label htmlFor="label" className="text-sm font-semibold text-foreground">
          Display name
        </label>
        <input
          id="label"
          name="label"
          type="text"
          required
          placeholder="ex. Infra & Energy"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        {state.errors?.label ? <p className="text-sm text-destructive">{state.errors.label}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="slug" className="text-sm font-semibold text-foreground">
          Slug <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="slug"
          name="slug"
          type="text"
          placeholder="infra-energy"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
        <p className="text-xs text-muted-foreground">
          Leave blank to auto-generate from the name. Readers visit categories at <code>/categories/[slug]</code>.
        </p>
        {state.errors?.slug ? <p className="text-sm text-destructive">{state.errors.slug}</p> : null}
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-semibold text-foreground">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          placeholder="One sentence on the type of analysis that belongs here."
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="railTitle" className="text-sm font-semibold text-foreground">
          Homepage rail title <span className="text-muted-foreground">(optional)</span>
        </label>
        <input
          id="railTitle"
          name="railTitle"
          type="text"
          placeholder="Appears above the track on the homepage"
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {state.message ? (
        <p
          className={`text-sm ${
            state.ok
              ? 'rounded-xl border border-primary/30 bg-primary/10 px-4 py-2 text-primary'
              : 'text-destructive'
          }`}
        >
          {state.message}
        </p>
      ) : null}

      <div className="flex items-center justify-end">
        <SubmitButton />
      </div>
    </form>
  );
}
