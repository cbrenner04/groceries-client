import React from 'react';

export interface IFilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  testId?: string;
}

export function FilterChip(props: IFilterChipProps): React.JSX.Element {
  const { label, active, onClick, testId } = props;

  const baseStyles =
    'tw:inline-flex tw:items-center tw:justify-center tw:px-3 tw:min-h-[44px] ' +
    'tw:rounded-full tw:text-sm tw:font-medium tw:cursor-pointer ' +
    'tw:transition-colors tw:duration-200 tw:whitespace-nowrap tw:select-none ' +
    'tw:min-w-[44px] ' +
    'tw:focus-visible:outline-none tw:focus-visible:ring-2 tw:focus-visible:ring-[var(--color-primary)]';

  const activeStyles = active
    ? 'tw:bg-[var(--color-primary)] tw:text-white'
    : 'tw:bg-[var(--color-surface-overlay)] tw:text-[var(--color-text-secondary)] ' +
      'tw:hover:bg-[var(--color-border)]';

  return (
    <button
      type="button"
      className={`${baseStyles} ${activeStyles}`}
      onClick={onClick}
      data-test-id={testId}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}

export interface IFilterChipGroupProps {
  children: React.ReactNode;
  className?: string;
}

export function FilterChipGroup(props: IFilterChipGroupProps): React.JSX.Element {
  const { children, className = '' } = props;

  return (
    <div className={`tw:flex tw:flex-wrap tw:gap-2 ${className}`} role="group">
      {children}
    </div>
  );
}
