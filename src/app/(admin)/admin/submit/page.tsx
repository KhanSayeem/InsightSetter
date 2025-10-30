import type { Metadata } from 'next';

import { isAdminAuthenticated } from '@/lib/admin-auth';
import LoginForm from '@/app/(admin)/admin/login-form';
import SubmitForm from './submit-form';

export const metadata: Metadata = {
  title: 'Submit Article',
};

export default async function AdminSubmitPage() {
  const authed = await isAdminAuthenticated();

  if (!authed) {
    return (
      <div className="mx-auto max-w-xl space-y-6">
        <header className="space-y-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            InsightSetter admin
          </p>
          <h1 className="text-3xl font-semibold text-foreground">Moderator access</h1>
          <p className="text-sm text-muted-foreground">
            Use the shared password to review submissions, publish stories, and manage the queue.
          </p>
        </header>
        <LoginForm nextPath="/admin/submit" passwordConfigured />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Submit an Article</h1>
        <p className="text-muted-foreground">
          As an admin, you can directly publish articles to the site.
        </p>
      </header>
      <SubmitForm />
    </div>
  );
}
