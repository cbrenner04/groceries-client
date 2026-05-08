import React from 'react';

export interface IToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  testId?: string;
  disabled?: boolean;
}

export function Toggle(props: IToggleProps): React.JSX.Element {
  const { checked, onChange, label, testId, disabled = false } = props;

  const handleToggle = (): void => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleToggle();
    }
  };

  const trackColor = checked ? 'tw:bg-[var(--color-primary)]' : 'tw:bg-[var(--color-surface-overlay)]';
  const disabledClass = disabled ? 'tw:opacity-50 tw:cursor-not-allowed' : 'tw:cursor-pointer';
  const thumbTranslate = checked ? 'tw:translate-x-5' : 'tw:translate-x-0.5';
  const labelColor = checked ? 'tw:text-[var(--color-text-primary)]' : 'tw:text-[var(--color-text-secondary)]';
  const labelDisabled = disabled ? 'tw:cursor-not-allowed tw:opacity-50' : 'tw:cursor-pointer';
  const buttonClassName =
    'tw:relative tw:inline-flex tw:h-6 tw:w-11 tw:items-center tw:rounded-full ' +
    'tw:transition-colors tw:duration-200 tw:ease-in-out ' +
    'tw:focus-visible:outline tw:focus-visible:outline-2 tw:focus-visible:outline-offset-2 ' +
    `tw:focus-visible:outline-[var(--color-primary)] ${trackColor} ${disabledClass}`;
  const spanClassName =
    'tw:inline-block tw:h-5 tw:w-5 tw:transform tw:rounded-full tw:bg-[#ffffff] tw:shadow-md ' +
    `tw:transition-transform tw:duration-200 tw:ease-in-out ${thumbTranslate}`;

  return (
    <div className="tw:flex tw:items-center tw:gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label || 'Toggle'}
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        data-test-id={testId}
        disabled={disabled}
        className={buttonClassName}
      >
        <span className={spanClassName} />
      </button>
      {label && (
        <label
          className={`tw:text-sm tw:font-medium ${labelDisabled} ${labelColor}`}
          onClick={!disabled ? handleToggle : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
}
