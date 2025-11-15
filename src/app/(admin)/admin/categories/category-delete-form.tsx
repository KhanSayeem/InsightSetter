'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { deleteCategoryAction, type CategoryFormState } from '../actions';

const initialState: CategoryFormState = {
  ok: false,
  message: '',
  errors: {},
};

type FallbackOption = {
  id: string;
  label: string;
};

function DeleteButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="destructive" size="sm" className="self-start" disabled={pending}>
      {pending ? 'Deleting…' : 'Delete category'}
    </Button>
  );
}

export function CategoryDeleteForm({ categoryId, fallbackOptions }: { categoryId: string; fallbackOptions: FallbackOption[] }) {
  const [state, formAction] = useActionState(deleteCategoryAction.bind(null, categoryId), initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
    }
  }, [state.ok]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    if (!window.confirm('Deleting this category will move its articles to the selected fallback. Continue?')) {
      event.preventDefault();
    }
  };

  return (
    <form ref={formRef} action={formAction} onSubmit={handleSubmit} className="flex flex-col gap-2 text-sm">
      <label htmlFor={`fallback-${categoryId}`} className="text-xs font-semibold text-muted-foreground">
        Move existing articles to
      </label>
      <select
        id={`fallback-${categoryId}`}
        name="fallbackCategoryId"
        required
        className="rounded-xl border border-border bg-background px-3 py-2 text-sm shadow-sm focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <option value="" disabled>
          Choose category
        </option>
        {fallbackOptions.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
      {state.errors?.fallbackCategoryId ? <p className="text-sm text-destructive">{state.errors.fallbackCategoryId}</p> : null}
      <DeleteButton />
      {state.message ? (
        <p
          className={`text-xs ${
            state.ok
              ? 'rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-primary'
              : 'text-destructive'
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
