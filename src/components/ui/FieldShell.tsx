import React from 'react';

interface IFieldShellProps {
  label?: string | undefined;
  error?: string | undefined;
  htmlFor: string;
  children: React.ReactNode;
}

/**
 * Shared classes for the borderless control (input/select) that sits inside a
 * FieldShell. The shell owns the border, rounding, surface fill, and the
 * notched label; the control is transparent and fills the box.
 */
export const fieldControlStyles =
  'tw:w-full tw:h-11 tw:px-4 tw:bg-transparent tw:border-0 tw:outline-none tw:text-base ' +
  'tw:transition-colors tw:focus:outline-none tw:focus:ring-2 ' +
  'tw:focus:ring-[var(--color-primary)]/30';

const wrapperStyles =
  'tw:relative tw:border tw:border-[var(--color-border)] tw:rounded-lg ' +
  'tw:bg-[var(--color-surface)] tw:transition-colors';

const labelStyles =
  'tw:absolute tw:-top-2 tw:left-3 tw:px-1 tw:bg-[var(--color-surface)] ' +
  'tw:text-xs tw:font-medium tw:text-[var(--color-text-secondary)]';

/**
 * The bordered field "box" with a label notched onto its top border and an
 * optional error message below. Shared by Input, Select, DateInput, NumberInput.
 */
const FieldShell: React.FC<IFieldShellProps> = (props): React.JSX.Element => {
  const { label, error, htmlFor, children } = props;
  const wrapperErrorStyles = error ? 'tw:border-[var(--color-danger)]' : '';

  return (
    <div className="tw:w-full tw:my-2">
      <div className={`${wrapperStyles} ${wrapperErrorStyles}`.trim()}>
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
