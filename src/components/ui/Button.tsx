import React from 'react';

export interface IButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  'data-test-id'?: string;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-hover)] ' + 'active:opacity-90',
  secondary:
    'border border-[var(--color-border-strong)] text-[var(--color-text-primary)] ' +
    'hover:bg-[var(--color-surface-overlay)]',
  ghost:
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] ' +
    'active:bg-[var(--color-surface-raised)]',
  danger: 'bg-[var(--color-danger)] text-white hover:bg-[var(--color-danger-hover)] ' + 'active:opacity-90',
  success: 'bg-[var(--color-success)] text-white hover:opacity-90 active:opacity-80',
};

const sizeStyles: Record<string, string> = {
  sm: 'h-8 px-3 text-sm rounded-md',
  md: 'h-10 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-lg',
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
    'font-medium transition-colors duration-200 ease-in-out ' + 'min-h-[44px] flex items-center justify-center gap-2';
  const widthStyles = fullWidth ? 'w-full' : '';
  const disabledStyles = disabled || loading ? 'opacity-50 cursor-not-allowed pointer-events-none' : 'cursor-pointer';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];
  const classNameParts = [baseStyles, variantStyle, sizeStyle, widthStyles, disabledStyles, className];
  const classNameString = classNameParts.join(' ').trim();

  const spinnerClassName =
    'inline-block h-4 w-4 animate-spin rounded-full ' + 'border-2 border-current border-t-transparent';

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
