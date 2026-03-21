import React from 'react';

export interface ICardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'interactive';
  selected?: boolean;
  completed?: boolean;
  children: React.ReactNode;
  'data-test-id'?: string;
}

export function Card(props: ICardProps): React.JSX.Element {
  const { variant = 'default', selected = false, completed = false, className = '', children, ...rest } = props;

  const baseStyles =
    'tw:bg-[var(--color-surface-raised)] tw:border tw:border-[var(--color-border)] ' +
    'tw:rounded-[var(--radius-lg)] tw:p-4 tw:shadow-[var(--shadow-sm)] tw:transition-all tw:duration-200';

  const interactiveStyles =
    variant === 'interactive'
      ? 'tw:cursor-pointer tw:hover:shadow-[var(--shadow-md)] tw:hover:scale-[1.01] ' +
        'tw:active:shadow-[var(--shadow-sm)] tw:active:scale-[0.99]'
      : '';

  const selectedStyles = selected ? 'tw:border-[var(--color-primary)] tw:bg-[var(--color-primary-light)]' : '';

  const completedStyles = completed ? 'tw:opacity-60 tw:[&_*]:line-through' : '';

  const classNameString = [baseStyles, interactiveStyles, selectedStyles, completedStyles, className]
    .filter(Boolean)
    .join(' ')
    .trim();

  return (
    <div className={classNameString} {...rest}>
      {children}
    </div>
  );
}
