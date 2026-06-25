import React from 'react';

import { IconButton } from '../ui/IconButton';
import { twBar, twCloseButton, twCount, twActionsContainer } from './MultiSelectBar.variants';

export interface IMultiSelectAction {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  variant?: 'default' | 'success' | 'danger' | 'primary' | 'warning';
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
    <div className={twBar} data-test-id="multi-select-bar" role="toolbar" aria-label="Multi-select actions">
      <button
        type="button"
        className={twCloseButton}
        data-test-id="multi-select-close"
        onClick={onClose}
        aria-label="Exit multi-select"
      >
        &times;
      </button>
      <span className={twCount} data-test-id="multi-select-count">
        {selectedCount} selected
      </span>
      <div className={twActionsContainer}>
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
