import React from 'react';

import { Button } from '../ui/Button';

export interface IEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState(props: IEmptyStateProps): React.JSX.Element {
  const { icon, title, description, action } = props;

  return (
    <div className="tw:flex tw:flex-col tw:items-center tw:justify-center tw:py-16 tw:px-4 tw:text-center">
      {icon && (
        <div className="tw:text-[var(--color-text-tertiary)] tw:mb-4 tw:[&>svg]:tw:w-16 tw:[&>svg]:tw:h-16">{icon}</div>
      )}
      <h2 className="tw:text-lg tw:font-medium tw:text-[var(--color-text-primary)] tw:mb-1">{title}</h2>
      {description && (
        <p className="tw:text-sm tw:text-[var(--color-text-secondary)] tw:mb-4 tw:max-w-xs">{description}</p>
      )}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
