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

  const trackColor = checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-surface-overlay)]';
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  const thumbTranslate = checked ? 'translate-x-5' : 'translate-x-0.5';
  const labelColor = checked ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]';
  const labelDisabled = disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer';
  const buttonClassName =
    'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out ' +
    'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ' +
    `focus-visible:outline-[var(--color-primary)] ${trackColor} ${disabledClass}`;
  const spanClassName =
    'inline-block h-5 w-5 transform rounded-full bg-white shadow-md ' +
    `transition-transform duration-200 ease-in-out ${thumbTranslate}`;

  return (
    <div className="flex items-center gap-3">
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
          className={`text-sm font-medium ${labelDisabled} ${labelColor}`}
          onClick={!disabled ? handleToggle : undefined}
        >
          {label}
        </label>
      )}
    </div>
  );
}
