import React from 'react';
import { Dropdown } from 'react-bootstrap';

import Filtered from './Filtered';

export interface ICategoryFilterProps {
  categories?: string[];
  filter?: string;
  handleClearFilter: () => void;
  handleCategoryFilter: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const CategoryFilter: React.FC<ICategoryFilterProps> = (props): React.JSX.Element => {
  if (props.filter) {
    return <Filtered filter={props.filter} handleClearFilter={props.handleClearFilter} />;
  }

  // Always show the filter dropdown, even if no categories exist
  // This allows filtering by uncategorized items
  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" id="dropdown-basic">
        Filter by category
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {/* Add Uncategorized option */}
        <Dropdown.Item
          key="uncategorized"
          onClick={(): void => {
            const syntheticEvent = {
              target: { name: 'uncategorized' },
            } as React.ChangeEvent<HTMLInputElement>;
            props.handleCategoryFilter(syntheticEvent);
          }}
        >
          Uncategorized
        </Dropdown.Item>
        {/* Show valid categories */}
        {props.categories?.filter(Boolean).map((category) => (
          <Dropdown.Item
            key={category}
            onClick={(): void => {
              const syntheticEvent = {
                target: { name: category },
              } as React.ChangeEvent<HTMLInputElement>;
              props.handleCategoryFilter(syntheticEvent);
            }}
          >
            {category}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default CategoryFilter;
