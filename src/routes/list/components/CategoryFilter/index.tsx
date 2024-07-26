import React, { type MouseEventHandler } from 'react';

import Filter from './Filter';
import Filtered from './Filtered';
import NoFilter from './NoFilter';

export interface ICategoryFilterProps {
  categories?: string[];
  filter?: string;
  handleClearFilter: MouseEventHandler;
  handleCategoryFilter: MouseEventHandler;
}

const CategoryFilter: React.FC<ICategoryFilterProps> = ({
  categories = [],
  filter = '',
  handleClearFilter,
  handleCategoryFilter,
}): React.JSX.Element => {
  return categories.filter(Boolean).length ? (
    filter ? (
      <Filtered filter={filter} handleClearFilter={handleClearFilter} />
    ) : (
      <Filter categories={categories} handleCategoryFilter={handleCategoryFilter} />
    )
  ) : (
    <NoFilter />
  );
};

export default CategoryFilter;
