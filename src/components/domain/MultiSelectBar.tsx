import React from 'react';

import { IconButton } from '../ui/IconButton';

export interface IMultiSelectAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger' | 'primary';
  testId: string;
}

export interface IMultiSelectBarProps {
  selectedCount: number;
  onClose: () => void;
  actions: IMultiSelectAction[];
}

export function MultiSelectBar(props: IMultiSelectBarProps): React.JSX.Element {
  const { selectedCount, onClose, actions } = props;

  return (
    <div
      className={
        'tw:flex tw:items-center tw:gap-3 tw:px-4 tw:py-2 ' +
        'tw:bg-[var(--color-surface-raised)] tw:border tw:border-[var(--color-border)] ' +
        'tw:rounded-[var(--radius-lg)] tw:shadow-[var(--shadow-md)]'
      }
      data-test-id="multi-select-bar"
      role="toolbar"
      aria-label="Multi-select actions"
    >
      <button
        type="button"
        className={
          'tw:flex tw:items-center tw:justify-center tw:w-8 tw:h-8 tw:rounded-full ' +
          'tw:text-[var(--color-text-secondary)] tw:hover:bg-[var(--color-surface-overlay)] ' +
          'tw:cursor-pointer tw:transition-colors'
        }
        data-test-id="multi-select-close"
        onClick={onClose}
        aria-label="Exit multi-select"
      >
        &times;
      </button>
      <span
        className="tw:text-sm tw:font-medium tw:text-[var(--color-text-primary)] tw:whitespace-nowrap"
        data-test-id="multi-select-count"
      >
        {selectedCount} selected
      </span>
      <div className="tw:flex tw:items-center tw:gap-1 tw:ml-auto">
        {actions.map((action) => (
          <IconButton
            key={action.testId}
            icon={action.icon}
            variant={action.variant ?? 'default'}
            size="sm"
            label={action.label}
            data-test-id={action.testId}
            onClick={action.onClick}
          />
        ))}
      </div>
    </div>
  );
}
