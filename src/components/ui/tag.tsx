import type { HTMLAttributes } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

const tagVariants = cva(
  'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em]',
  {
    variants: {
      variant: {
        primary: 'border-primary/20 bg-primary/10 text-primary/80',
        outline: 'border-border/60 bg-background/80 text-muted-foreground',
        muted: 'border-border bg-background text-muted-foreground/80',
      },
      size: {
        sm: 'px-3 py-1',
        md: 'px-3.5 py-1',
        lg: 'px-4 py-1',
      },
    },
    defaultVariants: {
      variant: 'outline',
      size: 'sm',
    },
  },
);

type TagProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof tagVariants>;

export function Tag({ className, variant, size, ...props }: TagProps) {
  return (
    <span
      className={clsx(tagVariants({ variant, size }), className)}
      {...props}
    />
  );
}

