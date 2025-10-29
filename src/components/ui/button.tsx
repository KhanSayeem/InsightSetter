import Link from 'next/link';
import type { LinkProps } from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { clsx } from 'clsx';

export const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-full font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-70',
  {
    variants: {
      variant: {
        primary:
          'bg-primary text-primary-foreground shadow-md hover:bg-primary/90 hover:shadow-lg',
        secondary:
          'border border-border/70 bg-background text-muted-foreground hover:border-primary/40 hover:text-primary',
        destructive:
          'border border-destructive/40 bg-background text-destructive hover:border-destructive hover:bg-destructive/10',
        ghost:
          'text-muted-foreground hover:text-foreground',
      },
      size: {
        sm: 'h-9 px-4 text-xs',
        md: 'h-10 px-5 text-sm',
        lg: 'h-11 px-6 text-sm',
        xl: 'h-12 px-6 text-base',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  },
);

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
  };

export function Button({
  className,
  variant,
  size,
  icon,
  iconPosition = 'right',
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={clsx(
        buttonVariants({ variant, size }),
        icon && 'gap-2',
        className,
      )}
      {...props}
    >
      {iconPosition === 'left' && icon ? <span aria-hidden>{icon}</span> : null}
      <span>{children}</span>
      {iconPosition === 'right' && icon ? <span aria-hidden>{icon}</span> : null}
    </button>
  );
}

type ButtonLinkProps = LinkProps &
  VariantProps<typeof buttonVariants> & {
    children: ReactNode;
    className?: string;
  };

export function ButtonLink({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      {...props}
      className={clsx(buttonVariants({ variant, size }), className)}
    >
      {children}
    </Link>
  );
}
