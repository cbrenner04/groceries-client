import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

import Filter from './Filter';
import Filtered from './Filtered';

export interface ICategoryFilterProps {
  categories?: string[];
  filter?: string;
  handleClearFilter: MouseEventHandler;
  handleCategoryFilter: MouseEventHandler;
}

const CategoryFilter: React.FC<ICategoryFilterProps> = (props): React.JSX.Element => {
  if (props.filter) {
    return <Filtered filter={props.filter} handleClearFilter={props.handleClearFilter} />;
  }
  if (props.categories?.filter(Boolean).length) {
    return <Filter categories={props.categories} handleCategoryFilter={props.handleCategoryFilter} />;
  }
  return (
    <Button variant="light" id="no-filter" disabled>
      Filter by category
    </Button>
  );
};

export default CategoryFilter;
