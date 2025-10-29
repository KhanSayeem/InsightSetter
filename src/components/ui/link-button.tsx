import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { ReactNode } from 'react';
import { clsx } from 'clsx';

type LinkButtonProps = LinkProps & {
  children: ReactNode;
  className?: string;
  icon?: ReactNode;
};

export function LinkButton({ children, className, icon, ...props }: LinkButtonProps) {
  return (
    <Link
      {...props}
      className={clsx(
        'group inline-flex items-center gap-2 text-sm font-semibold text-primary transition hover:text-primary/80',
        className,
      )}
    >
      {children}
      {icon ? <span aria-hidden className="transition-transform group-hover:translate-x-1">{icon}</span> : null}
    </Link>
  );
}

