import React from 'react';
import PropTypes from 'prop-types';

import Filter from './Filter';
import Filtered from './Filtered';
import NoFilter from './NoFilter';

const CategoryFilter = (props) => {
  let component;
  if (props.categories.filter(Boolean).length) {
    if (props.filter) {
      component = <Filtered filter={props.filter} handleClearFilter={props.handleClearFilter} />;
    } else {
      component = <Filter categories={props.categories} handleCategoryFilter={props.handleCategoryFilter} />;
    }
  } else {
    component = <NoFilter />;
  }

  return <div className="float-right">{component}</div>;
};

CategoryFilter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  filter: PropTypes.string,
  handleClearFilter: PropTypes.func.isRequired,
  handleCategoryFilter: PropTypes.func.isRequired,
};

CategoryFilter.defaultProps = {
  filter: '',
  categories: [''],
};

export default CategoryFilter;
