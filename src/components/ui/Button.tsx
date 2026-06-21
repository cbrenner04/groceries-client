import React from 'react';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'ghost-danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  'data-test-id'?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'tw:bg-[var(--color-primary)] tw:text-white tw:hover:bg-[var(--color-primary-hover)] tw:active:opacity-90',
  secondary:
    'tw:border tw:border-[var(--color-border-strong)] tw:text-[var(--color-text-primary)] ' +
    'tw:hover:bg-[var(--color-surface-overlay)]',
  ghost:
    'tw:text-[var(--color-text-secondary)] tw:hover:bg-[var(--color-surface-overlay)] ' +
    'tw:active:bg-[var(--color-surface-raised)]',
  'ghost-danger':
    'tw:text-[var(--color-danger)] tw:hover:bg-[var(--color-surface-overlay)] ' +
    'tw:active:bg-[var(--color-surface-raised)]',
  danger: 'tw:bg-[var(--color-danger)] tw:text-white tw:hover:bg-[var(--color-danger-hover)] tw:active:opacity-90',
  success: 'tw:bg-[var(--color-success)] tw:text-white tw:hover:opacity-90 tw:active:opacity-80',
};

const sizeStyles: Record<string, string> = {
  sm: 'tw:h-8 tw:px-3 tw:text-sm tw:rounded-md',
  md: 'tw:h-10 tw:px-4 tw:text-sm tw:rounded-lg',
  lg: 'tw:h-12 tw:px-6 tw:text-base tw:rounded-lg',
};

export function Button(props: IButtonProps): React.JSX.Element {
  const {
    variant = 'primary',
    size = 'md',
    loading = false,
    fullWidth = false,
    disabled = false,
    className = '',
    children,
    ...rest
  } = props;

  const baseStyles =
    'tw:font-medium tw:transition-colors tw:duration-200 tw:ease-in-out ' +
    'tw:min-h-[44px] tw:flex tw:items-center tw:justify-center tw:gap-2 ' +
    'tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--color-primary)]';
  const widthStyles = fullWidth ? 'tw:w-full' : '';
  const disabledStyles =
    disabled || loading ? 'tw:opacity-50 tw:cursor-not-allowed tw:pointer-events-none' : 'tw:cursor-pointer';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const classNameParts = [baseStyles, variantStyle, sizeStyle, widthStyles, disabledStyles, className];
  const classNameString = classNameParts.join(' ').trim();

  const spinnerClassName =
    'tw:inline-block tw:h-4 tw:w-4 tw:animate-spin tw:rounded-full ' +
    'tw:border-2 tw:border-current tw:border-t-transparent';

  return (
    <button type="button" disabled={disabled || loading} className={classNameString} {...rest}>
      {loading ? (
        <>
          <span className={spinnerClassName} />
          Loading
        </>
      ) : (
        children
      )}
    </button>
  );
}
