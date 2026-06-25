import React from 'react';
import { cva } from 'class-variance-authority';

// Convention: cva definition lives in the same file as the component.
// All Tailwind classes keep the `tw:` prefix required by this project's config.

/**
 * Shared classes for the borderless control (input/select) that sits inside a
 * FieldShell. The shell owns the border, rounding, surface fill, and the
 * notched label; the control is transparent and fills the box.
 *
 * Exported as a plain string so existing consumers (Select, DateInput,
 * NumberInput) remain unchanged — they concatenate this into their className.
 */
export const fieldControlStyles = cva(
  'tw:w-full tw:h-11 tw:px-4 tw:bg-transparent tw:border-0 tw:outline-none tw:text-base ' +
    'tw:transition-colors tw:focus:outline-none tw:focus:ring-2 ' +
    'tw:focus:ring-[var(--color-primary)]/30',
)();

const fieldShellWrapperVariants = cva(
  'tw:relative tw:border tw:rounded-[var(--radius-lg)] tw:bg-[var(--color-surface)] tw:transition-colors',
  {
    variants: {
      error: {
        true: 'tw:border-[var(--color-danger)]',
        false: 'tw:border-[var(--color-border)]',
      },
    },
    defaultVariants: {
      error: false,
    },
  },
);

const labelStyles =
  'tw:absolute tw:-top-2 tw:left-3 tw:px-1 tw:bg-[var(--color-surface)] ' +
  'tw:text-xs tw:font-medium tw:text-[var(--color-text-secondary)]';

interface IFieldShellProps {
  label?: string | undefined;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}

/**
 * The bordered field "box" with a label notched onto its top border and an
 * optional error message below. Shared by Input, Select, DateInput, NumberInput.
 */
const FieldShell: React.FC<IFieldShellProps> = (props): React.JSX.Element => {
  const { label, error, htmlFor, children } = props;

  return (
    <div className="tw:w-full tw:my-2">
      <div className={fieldShellWrapperVariants({ error: !!error })}>
        {label && (
          <label htmlFor={htmlFor} className={labelStyles}>
            {label}
          </label>
        )}
        {children}
      </div>
      {error && <p className="tw:mt-1 tw:text-sm tw:text-[var(--color-danger)]">{error}</p>}
    </div>
  );
};

export default FieldShell;
