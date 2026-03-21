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
    'inline-flex items-center px-3 h-8 rounded-full text-sm font-medium ' +
    'cursor-pointer transition-colors duration-200 whitespace-nowrap select-none';

  const activeStyles = active
    ? 'bg-[var(--color-primary)] text-white'
    : 'bg-[var(--color-surface-overlay)] text-[var(--color-text-secondary)] hover:bg-[var(--color-border)]';

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
    <div
      className={
        `flex gap-2 overflow-x-auto [&::-webkit-scrollbar]:hidden ` +
        `[-ms-overflow-style:none] [scrollbar-width:none] ${className}`
      }
      role="group"
    >
      {children}
    </div>
  );
}
