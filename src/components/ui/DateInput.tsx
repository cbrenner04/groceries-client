import React from 'react';

interface IDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  testId?: string;
}

const DateInput: React.FC<IDateInputProps> = (props): React.JSX.Element => {
  const { label, error, testId, className, id, ...inputProps } = props;
  const inputId = id || testId || inputProps.name || 'date-input';
  const baseStyles =
    'tw:w-full tw:h-11 tw:px-4 tw:py-2 tw:bg-[var(--color-surface)] ' +
    'tw:border tw:border-[var(--color-border)] tw:rounded-lg tw:text-base ' +
    'tw:transition-colors tw:focus:outline-none tw:focus:ring-2 ' +
    'tw:focus:ring-[var(--color-primary)]/30 tw:focus:border-[var(--color-border-strong)]';
  const errorStyles = error ? 'tw:border-[var(--color-danger)]' : '';
  const inputStyles = `${baseStyles} ${errorStyles} ${className || ''}`.trim();

  return (
    <div className="tw:w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="tw:block tw:text-sm tw:font-medium tw:text-[var(--color-text-secondary)] tw:mb-2"
        >
          {label}
        </label>
      )}
      <input id={inputId} type="date" className={inputStyles} data-test-id={testId} {...inputProps} />
      {error && <p className="tw:mt-1 tw:text-sm tw:text-[var(--color-danger)]">{error}</p>}
    </div>
  );
};

export default DateInput;
