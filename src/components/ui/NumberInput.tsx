import React from 'react';

interface INumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  testId?: string;
}

const NumberInput: React.FC<INumberInputProps> = (props): React.JSX.Element => {
  const { label, error, testId, className, id, ...inputProps } = props;
  const inputId = id || testId || inputProps.name || 'number-input';
  const wrapperStyles =
    'tw:border tw:border-[var(--color-border)] tw:rounded-lg tw:bg-[var(--color-surface)] ' + 'tw:transition-colors';
  const wrapperErrorStyles = error ? 'tw:border-[var(--color-danger)]' : '';
  const finalWrapperStyles = `${wrapperStyles} ${wrapperErrorStyles}`.trim();

  const inputBaseStyles =
    'tw:w-full tw:h-11 tw:px-4 tw:pb-2 tw:bg-transparent tw:border-0 tw:outline-none tw:text-base ' +
    'tw:transition-colors tw:focus:outline-none tw:focus:ring-2 ' +
    'tw:focus:ring-[var(--color-primary)]/30';
  const inputLabelPadding = label ? '' : 'tw:pt-2';
  const finalInputStyles = `${inputBaseStyles} ${inputLabelPadding} ${className || ''}`.trim();

  return (
    <div className="tw:w-full">
      <div className={finalWrapperStyles}>
        {label && (
          <label
            htmlFor={inputId}
            className="tw:block tw:px-4 tw:pt-2 tw:text-sm tw:font-medium tw:text-[var(--color-text-secondary)]"
          >
            {label}
          </label>
        )}
        <input id={inputId} type="number" className={finalInputStyles} data-test-id={testId} {...inputProps} />
      </div>
      {error && <p className="tw:mt-1 tw:text-sm tw:text-[var(--color-danger)]">{error}</p>}
    </div>
  );
};

export default NumberInput;
