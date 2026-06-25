import React, { useState } from 'react';

import { Badge } from '../ui/Badge';
import {
  headerButtonVariants,
  labelVariants,
  dividerVariants,
  chevronVariants,
  childrenContainerVariants,
} from './CategoryGroup.variants';

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
        className={headerButtonVariants()}
        data-test-class="category-header"
        onClick={handleToggle}
        aria-expanded={expanded}
      >
        <span className={labelVariants({ uncategorized: isUncategorized })}>{displayName}</span>
        <Badge>{itemCount}</Badge>
        <div className={dividerVariants()} />
        <span className={chevronVariants({ expanded })} aria-hidden>
          ▼
        </span>
      </button>
      {expanded && <div className={childrenContainerVariants()}>{children}</div>}
    </div>
  );
}
