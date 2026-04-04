import React, { useState } from 'react';

import { Badge } from '../ui/Badge';

export interface ICategoryGroupProps {
  category: string;
  children: React.ReactNode;
  itemCount: number;
  defaultExpanded?: boolean;
}

export function CategoryGroup(props: ICategoryGroupProps): React.JSX.Element {
  const { category, children, itemCount, defaultExpanded = true } = props;
  const [expanded, setExpanded] = useState(defaultExpanded);

  const isUncategorized = !category;
  const displayName = isUncategorized ? 'Other' : category;

  const handleToggle = (): void => {
    setExpanded((prev) => !prev);
  };

  return (
    <div className="tw:mb-4">
      <button
        type="button"
        className="tw:flex tw:items-center tw:gap-2 tw:w-full tw:mb-2 tw:group tw:cursor-pointer"
        data-test-class="category-header"
        onClick={handleToggle}
        aria-expanded={expanded}
      >
        <span
          className={
            'tw:text-sm tw:font-semibold tw:uppercase tw:tracking-wide tw:text-[var(--color-text-secondary)] ' +
            'tw:whitespace-nowrap' +
            (isUncategorized ? ' tw:italic' : '')
          }
        >
          {displayName}
        </span>
        <Badge>{itemCount}</Badge>
        <div className="tw:flex-1 tw:h-px tw:bg-[var(--color-border)]" />
        <span
          className={
            'tw:text-[var(--color-text-tertiary)] tw:text-xs tw:transition-transform tw:duration-200' +
            (expanded ? '' : ' tw:-rotate-90')
          }
          aria-hidden
        >
          ▼
        </span>
      </button>
      {expanded && <div className="tw:flex tw:flex-col tw:gap-2">{children}</div>}
    </div>
  );
}
