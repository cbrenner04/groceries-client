import React from 'react';

export interface IIconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'default' | 'success' | 'danger' | 'primary';
  size?: 'sm' | 'md' | 'lg';
  label: string;
  'data-test-id'?: string;
}

const sizeStyles: Record<string, string> = {
  sm: 'tw:h-8 tw:w-8 tw:text-sm',
  md: 'tw:h-10 tw:w-10 tw:text-base',
  lg: 'tw:h-12 tw:w-12 tw:text-lg',
};

const variantStyles: Record<string, string> = {
  default:
    'tw:text-[var(--color-text-secondary)] tw:hover:bg-[var(--color-surface-overlay)] ' +
    'tw:active:bg-[var(--color-border)]',
  success:
    'tw:text-[var(--color-success)] tw:hover:bg-[rgb(16_185_129_/_0.1)] ' + 'tw:active:bg-[rgb(16_185_129_/_0.2)]',
  danger: 'tw:text-[var(--color-danger)] tw:hover:bg-[rgb(239_68_68_/_0.1)] ' + 'tw:active:bg-[rgb(239_68_68_/_0.2)]',
  primary:
    'tw:text-[var(--color-primary)] tw:hover:bg-[var(--color-primary-light)] ' + 'tw:active:bg-[rgb(22_163_74_/_0.2)]',
};

export function IconButton(props: IIconButtonProps): React.JSX.Element {
  const { icon, variant = 'default', size = 'md', label, disabled = false, className = '', ...rest } = props;

  const baseStyles =
    'tw:rounded-full tw:transition-colors tw:duration-200 tw:ease-in-out tw:flex tw:items-center ' +
    'tw:justify-center tw:flex-shrink-0 tw:min-h-[44px] tw:min-w-[44px] tw:cursor-pointer';
  const disabledStyles = disabled ? 'tw:opacity-50 tw:cursor-not-allowed tw:pointer-events-none' : '';
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
