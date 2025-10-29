'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { AdminAuthState } from './actions';
import { authenticateAdmin } from './actions';

type LoginFormProps = {
  nextPath?: string;
  passwordConfigured: boolean;
};

const initialState: AdminAuthState = {};

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending;

  return (
    <Button type="submit" disabled={isDisabled} size="lg">
      {pending ? 'Checking.' : 'Enter dashboard'}
    </Button>
  );
}

export default function LoginForm({ nextPath, passwordConfigured }: LoginFormProps) {
  const [state, formAction] = useActionState(authenticateAdmin, initialState);

  const helperText = passwordConfigured
    ? (
        <>
          This password is configured via <code>.env</code> as <code>ADMIN_PASSWORD</code>. Keep it private.
        </>
      )
    : (
        <>
          Configure <code>ADMIN_PASSWORD</code> in your environment to enable moderator access.
        </>
      );

  return (
    <Card as="form" action={formAction} className="space-y-6 p-8 shadow-lg">
      <input type="hidden" name="next" value={nextPath ?? ''} />

      <div className="space-y-2">
        <label htmlFor="password" className="text-sm font-semibold text-muted-foreground">
          Admin password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoFocus
          disabled={!passwordConfigured}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground shadow-sm transition focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-60"
        />
        {state?.error && <p className="text-sm text-destructive">{state.error}</p>}
      </div>

      <p className="text-xs text-muted-foreground">{helperText}</p>

      <div className="flex justify-end">
        <SubmitButton disabled={!passwordConfigured} />
      </div>
    </Card>
  );
}
