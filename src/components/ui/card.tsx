import type { ComponentPropsWithoutRef, ElementType } from 'react';
import { clsx } from 'clsx';

type CardProps<T extends ElementType = 'div'> = {
  as?: T;
  className?: string;
} & Omit<ComponentPropsWithoutRef<T>, 'className'>;

export function Card<T extends ElementType = 'div'>({
  as,
  className,
  ...props
}: CardProps<T>) {
  const Component = as ?? 'div';

  return (
    <Component
      className={clsx('rounded-3xl border border-border bg-card', className)}
      {...props}
    />
  );
}
