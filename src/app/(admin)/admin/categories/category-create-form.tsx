'use client';

import { useActionState, useEffect, useRef, useState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { createCategoryAction, type CategoryFormState } from '../actions';
import { PRIMARY_NAV_CATEGORY_HELP, PRIMARY_NAV_CATEGORY_LIMIT } from '@/lib/nav-config';

const initialState: CategoryFormState = {
  ok: false,
  message: '',
  errors: {},
};

type NavCategorySummary = {
  id: string;
  label: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} size="md">
      {pending ? 'Saving…' : 'Create category'}
    </Button>
  );
}

export function CategoryCreateForm({ pinnedCategories }: { pinnedCategories: NavCategorySummary[] }) {
  const [state, formAction] = useActionState(createCategoryAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const navSlotsUsed = pinnedCategories.length;
  const navIsFull = navSlotsUsed >= PRIMARY_NAV_CATEGORY_LIMIT;
  const [navPlacement, setNavPlacement] = useState<'more' | 'nav' | 'replace'>('more');

  useEffect(() => {
    if (state.ok) {
      formRef.current?.reset();
      setNavPlacement('more');
    }
  }, [state.ok]);

  useEffect(() => {
    if (!navIsFull && navPlacement === 'replace') {
      setNavPlacement('nav');
    }
    if (navIsFull && navPlacement === 'nav') {
      setNavPlacement('more');
    }
  }, [navIsFull, navPlacement]);

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

      <div className="space-y-2">
        <label htmlFor="navPlacement" className="text-sm font-semibold text-foreground">
          Navigation placement
        </label>
        <select
          id="navPlacement"
          name="navPlacement"
          value={navPlacement}
          onChange={(event) => setNavPlacement(event.target.value as typeof navPlacement)}
          className="w-full rounded-xl border border-border bg-background px-4 py-2.5 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="more">List inside “More”</option>
          {!navIsFull ? <option value="nav">Show directly in the nav</option> : null}
          {navIsFull ? <option value="replace">Replace an existing nav link</option> : null}
        </select>
        <p className="text-xs text-muted-foreground">
          {PRIMARY_NAV_CATEGORY_HELP} {navSlotsUsed}/{PRIMARY_NAV_CATEGORY_LIMIT} slots currently in use.
        </p>
        {state.errors?.navPlacement ? <p className="text-sm text-destructive">{state.errors.navPlacement}</p> : null}
        {navPlacement === 'replace' ? (
          <div className="space-y-2">
            <label htmlFor="navReplacement" className="text-xs font-semibold text-muted-foreground">
              Select a category to move into “More”
            </label>
            <select
              id="navReplacement"
              name="navReplacement"
              className="w-full rounded-xl border border-border bg-background px-4 py-2 text-sm text-foreground transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
              required={navPlacement === 'replace'}
            >
              <option value="">Choose category</option>
              {pinnedCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.label}
                </option>
              ))}
            </select>
            {state.errors?.navReplacement ? <p className="text-sm text-destructive">{state.errors.navReplacement}</p> : null}
          </div>
        ) : null}
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
