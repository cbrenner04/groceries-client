import React from 'react';

export interface IIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  'data-test-id'?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-10 w-10 text-base',
  lg: 'h-12 w-12 text-lg',
};

const variantStyles: Record<string, string> = {
  default:
    'text-[var(--color-text-secondary)] hover:bg-[var(--color-surface-overlay)] ' + 'active:bg-[var(--color-border)]',
  success: 'text-[var(--color-success)] hover:bg-[rgb(16_185_129_/_0.1)] ' + 'active:bg-[rgb(16_185_129_/_0.2)]',
  danger: 'text-[var(--color-danger)] hover:bg-[rgb(239_68_68_/_0.1)] ' + 'active:bg-[rgb(239_68_68_/_0.2)]',
  primary: 'text-[var(--color-primary)] hover:bg-[var(--color-primary-light)] ' + 'active:bg-[rgb(79_70_229_/_0.2)]',
};

export function IconButton(props: IIconButtonProps): React.JSX.Element {
  const { icon, variant = 'default', size = 'md', label, disabled = false, className = '', ...rest } = props;

  const baseStyles =
    'rounded-full transition-colors duration-200 ease-in-out flex items-center ' +
    'justify-center flex-shrink-0 min-h-[44px] min-w-[44px] cursor-pointer';
  const disabledStyles = disabled ? 'opacity-50 cursor-not-allowed pointer-events-none' : '';
  const variantStyle = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      className={`${baseStyles} ${variantStyle} ${sizeStyle} ${disabledStyles} ${className}`.trim()}
      {...rest}
    >
      {icon}
    </button>
  );
}
