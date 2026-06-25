import React from 'react';

import { Button } from '../ui/Button';
import { twContainer, twIconWrapper, twTitle, twDescription } from './EmptyState.variants';

export interface IEmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  testId?: string;
}

export function EmptyState(props: IEmptyStateProps): React.JSX.Element {
  const { icon, title, description, action, testId } = props;

  return (
    <div className={twContainer} data-test-id={testId}>
      {icon && <div className={twIconWrapper}>{icon}</div>}
      <h2 className={twTitle}>{title}</h2>
      {description && <p className={twDescription}>{description}</p>}
      {action && (
        <Button variant="primary" size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
