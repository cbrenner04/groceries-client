import React, { MouseEventHandler } from 'react';

import Filter from './Filter';
import Filtered from './Filtered';
import NoFilter from './NoFilter';

interface ICategoryFilterProps {
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
}) => {
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
