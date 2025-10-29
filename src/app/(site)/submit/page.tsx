import type { Metadata } from 'next';

import { Card } from '@/components/ui/card';
import { Tag } from '@/components/ui/tag';
import SubmitForm from './submit-form';

export const metadata: Metadata = {
  title: 'Submit an article',
  description:
    'Share your perspective on finance, technology, or the economy with the InsightSetter audience.',
};

export default function SubmitPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-4">
        <Tag variant="primary" className="w-fit border-primary/20 bg-primary/10 tracking-[0.3em] text-primary/80">
          Contribute
        </Tag>
        <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
          Pitch a story to InsightSetter
        </h1>
        <p className="max-w-2xl text-base text-muted-foreground">
          We&apos;re looking for rigorous, actionable takes on markets, company building, product, and macro
          forces. Submissions go straight to our editors for review.
        </p>
      </header>

      <Card className="p-8 shadow-lg">
        <SubmitForm />
      </Card>
    </div>
  );
}
