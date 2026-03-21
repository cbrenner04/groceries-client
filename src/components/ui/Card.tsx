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
    'bg-[var(--color-surface-raised)] border border-[var(--color-border)] ' +
    'rounded-[var(--radius-lg)] p-4 shadow-[var(--shadow-sm)] transition-all duration-200';

  const interactiveStyles =
    variant === 'interactive'
      ? 'cursor-pointer hover:shadow-[var(--shadow-md)] hover:scale-[1.01] ' +
        'active:shadow-[var(--shadow-sm)] active:scale-[0.99]'
      : '';

  const selectedStyles = selected ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : '';

  const completedStyles = completed ? 'opacity-60 [&_*]:line-through' : '';

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
