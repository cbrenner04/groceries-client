import React from 'react';
import PropTypes from 'prop-types';
import { Button, Dropdown } from 'react-bootstrap';

const CategoryFilter = (props) => {
  let component;
  if (props.categories.filter((cat) => !!cat).length) {
    if (props.filter) {
      component = (
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
        </>
      );
    } else {
      component = (
        <Dropdown>
          <Dropdown.Toggle variant="light" id="filter-by-category-button">
            Filter by category
          </Dropdown.Toggle>
          <Dropdown.Menu>
            {props.categories.sort().map((category) => {
              if (!category) return '';
              return (
                <Dropdown.Item as="button" key={category} name={category} onClick={props.handleCategoryFilter}>
                  {category}
                </Dropdown.Item>
              );
            })}
          </Dropdown.Menu>
        </Dropdown>
      );
    }
  } else {
    component = (
      <Button variant="light" disabled style={{ cursor: 'not-allowed' }}>
        Filter by category
      </Button>
    );
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
