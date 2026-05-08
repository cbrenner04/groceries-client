import React from 'react';

interface ICheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  testId?: string;
}

const Checkbox: React.FC<ICheckboxProps> = (props): React.JSX.Element => {
  const { label, testId, checked, id, ...inputProps } = props;
  const inputId = id || inputProps.name || 'checkbox';
  const isChecked = checked ?? false;

  return (
    <div className="tw:flex tw:items-center tw:min-h-[44px] tw:cursor-pointer tw:gap-3">
      <div className="tw:relative tw:w-5 tw:h-5">
        <input
          type="checkbox"
          id={inputId}
          checked={isChecked}
          className={
            'tw:appearance-none tw:absolute tw:w-5 tw:h-5 tw:rounded ' +
            'tw:border-2 tw:border-[var(--color-border)] tw:bg-[var(--color-surface)] ' +
            'tw:cursor-pointer tw:transition-colors tw:focus:outline-none ' +
            'tw:focus:ring-2 tw:focus:ring-[var(--color-primary)]/30'
          }
          data-test-id={testId}
          {...inputProps}
        />
        {isChecked && (
          <svg
            className="tw:absolute tw:inset-0 tw:w-5 tw:h-5 tw:text-white tw:pointer-events-none"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <rect width="20" height="20" rx="2" fill="var(--color-primary)" />
            <path
              d="M6.5 10.5L8.5 12.5L13.5 7.5"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
        )}
        {!isChecked && (
          <div
            className={
              'tw:absolute tw:inset-0 tw:w-5 tw:h-5 tw:rounded ' +
              'tw:border-2 tw:border-[var(--color-border)] tw:bg-[var(--color-surface)] ' +
              'tw:pointer-events-none'
            }
          />
        )}
      </div>
      <label
        htmlFor={inputId}
        className="tw:text-sm tw:select-none tw:text-[var(--color-text-primary)] tw:cursor-pointer tw:mb-0"
      >
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
