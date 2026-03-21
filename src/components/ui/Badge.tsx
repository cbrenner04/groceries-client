import React from 'react';

export interface IBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  children: React.ReactNode;
  'data-test-id'?: string;
}

const variantStyles: Record<string, string> = {
  default: 'tw:bg-[var(--color-surface-overlay)] tw:text-[var(--color-text-primary)]',
  primary: 'tw:bg-[var(--color-primary-light)] tw:text-[var(--color-primary)]',
  success: 'tw:bg-[rgb(16_185_129_/_0.15)] tw:text-[var(--color-success)]',
  warning: 'tw:bg-[rgb(245_158_11_/_0.15)] tw:text-[var(--color-warning)]',
  danger: 'tw:bg-[rgb(239_68_68_/_0.15)] tw:text-[var(--color-danger)]',
};

export function Badge(props: IBadgeProps): React.JSX.Element {
  const { variant = 'default', className = '', children, ...rest } = props;

  const baseStyles = 'tw:inline-flex tw:items-center tw:text-xs tw:font-medium tw:px-2 tw:py-0.5 tw:rounded-full';
  const variantStyle = variantStyles[variant];

  return (
    <span className={`${baseStyles} ${variantStyle} ${className}`.trim()} {...rest}>
      {children}
    </span>
  );
}
