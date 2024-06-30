import React from 'react';
import PropTypes from 'prop-types';

import Filter from './Filter';
import Filtered from './Filtered';
import NoFilter from './NoFilter';

const CategoryFilter = (props) => {
  const cats = props.categories || [''];
  if (cats.filter(Boolean).length) {
    if (props.filter || '') {
      return <Filtered filter={props.filter || ''} handleClearFilter={props.handleClearFilter} />;
    } else {
      return <Filter categories={cats} handleCategoryFilter={props.handleCategoryFilter} />;
    }
  } else {
    return <NoFilter />;
  }
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  filter: PropTypes.string,
  handleClearFilter: PropTypes.func.isRequired,
  handleCategoryFilter: PropTypes.func.isRequired,
};

export default CategoryFilter;
