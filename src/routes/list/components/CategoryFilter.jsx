import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';

const CategoryFilter = props => (
  <div className="float-right">
    {!props.categories.filter((cat) => !!cat).length &&
      <Button
        variant="light"
        disabled
        style={{ cursor: 'not-allowed' }}
      >
        Filter by category
      </Button>}
    {!!props.categories.filter((cat) => !!cat).length && !props.filter &&
      <Dropdown>
        <Dropdown.Toggle variant="light" id="filter-by-category-button">
          Filter by category
        </Dropdown.Toggle>
        <Dropdown.Menu>
          {props.categories.sort().map((category) => {
            if (!category) return '';
            return (
              <Dropdown.Item
                as="button"
                key={category}
                name={category}
                onClick={props.handleCategoryFilter}
              >
                {category}
              </Dropdown.Item>
            );
          })}
        </Dropdown.Menu>
      </Dropdown>}
    {props.filter &&
      <>
        <span style={{ lineHeight: '2.5rem', marginRight: '1rem' }}>Filtering by:</span>
        <Button
          id="clear-filter-button"
          variant="outline-primary"
          style={{ marginRight: '1rem' }}
          onClick={props.handleClearFilter}
        >
          {props.filter} <i className="fa fa-trash" />
        </Button>
      </>}
  </div>
);

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
