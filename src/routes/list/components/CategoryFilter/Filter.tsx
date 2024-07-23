import React, { MouseEventHandler } from 'react';
import { Dropdown } from 'react-bootstrap';

interface IFilterProps {
  categories: string[];
  handleCategoryFilter: MouseEventHandler;
}

const Filter: React.FC<IFilterProps> = ({ categories, handleCategoryFilter }) => (
  <Dropdown data-test-id="filter-dropdown">
    <Dropdown.Toggle variant="light" id="filter-by-category-button">
      Filter by category
    </Dropdown.Toggle>
    <Dropdown.Menu>
      {categories.sort().map((category) => {
        if (!category) {
          return '';
        }
        return (
          <Dropdown.Item
            as="button"
            key={category}
            name={category}
            onClick={handleCategoryFilter}
            data-test-id={`filter-by-${category}`}
          >
            {category}
          </Dropdown.Item>
        );
      })}
    </Dropdown.Menu>
  </Dropdown>
);

export default Filter;
