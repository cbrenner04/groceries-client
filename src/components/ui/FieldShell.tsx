import React from 'react';
import { fieldControlStyles, fieldShellWrapperVariants, fieldShellLabelStyles } from './FieldShell.variants';

// Re-exported so existing consumers (Input, Select, DateInput, NumberInput)
// can keep importing `fieldControlStyles` from './FieldShell' unchanged.
export { fieldControlStyles };

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
          <label htmlFor={htmlFor} className={fieldShellLabelStyles}>
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
