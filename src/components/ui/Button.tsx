import React from 'react';
import { type VariantProps } from 'class-variance-authority';
import { buttonVariants, buttonSpinnerStyles } from './Button.variants';

export interface IButtonProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'disabled'>,
    Pick<VariantProps<typeof buttonVariants>, 'variant' | 'size' | 'fullWidth'> {
  loading?: boolean;
  fullWidth?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  'data-test-id'?: string;
}

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

  const isDisabled = disabled || loading;
  const classNameString = buttonVariants({
    variant,
    size,
    fullWidth,
    disabled: isDisabled,
    className,
  });

  return (
    <button type="button" disabled={isDisabled} className={classNameString} {...rest}>
      {loading ? (
        <>
          <span className={buttonSpinnerStyles} />
          Loading
        </>
      ) : (
        children
      )}
    </button>
  );
}
