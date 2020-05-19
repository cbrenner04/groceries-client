import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown } from 'react-bootstrap';

const Filter = ({ categories, handleCategoryFilter }) => (
  <Dropdown>
    <Dropdown.Toggle variant="light" id="filter-by-category-button">
      Filter by category
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {categories.sort().map((category) => {
        if (!category) return '';
        return (
          <Dropdown.Item as="button" key={category} name={category} onClick={handleCategoryFilter}>
            {category}
          </Dropdown.Item>
        );
      })}
    </Dropdown.Menu>
  </Dropdown>
);

Filter.propTypes = {
  categories: PropTypes.arrayOf(PropTypes.string),
  handleCategoryFilter: PropTypes.func.isRequired,
};

Filter.defaultProps = {
  categories: [''],
};

export default Filter;
