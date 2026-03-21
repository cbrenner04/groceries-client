import React from 'react';

export interface IBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  'data-test-id'?: string;
}

const variantStyles: Record<string, string> = {
  default: 'bg-[var(--color-surface-overlay)] text-[var(--color-text-primary)]',
  primary: 'bg-[var(--color-primary-light)] text-[var(--color-primary)]',
  success: 'bg-[rgb(16_185_129_/_0.15)] text-[var(--color-success)]',
  warning: 'bg-[rgb(245_158_11_/_0.15)] text-[var(--color-warning)]',
  danger: 'bg-[rgb(239_68_68_/_0.15)] text-[var(--color-danger)]',
};

export function Badge(props: IBadgeProps): React.JSX.Element {
  const { variant = 'default', className = '', children, ...rest } = props;

  const baseStyles = 'inline-flex items-center text-xs font-medium px-2 py-0.5 rounded-full';
  const variantStyle = variantStyles[variant];

  return (
    <span className={`${baseStyles} ${variantStyle} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
