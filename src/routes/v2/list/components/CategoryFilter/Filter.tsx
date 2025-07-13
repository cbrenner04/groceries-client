import React from 'react';
import { Dropdown } from 'react-bootstrap';

export interface IFilterProps {
  categories: string[];
  handleCategoryFilter: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const Filter: React.FC<IFilterProps> = (props): React.JSX.Element => {
  // Filter out empty strings and create unique keys
  const validCategories = props.categories.filter(Boolean);

  return (
    <Dropdown>
      <Dropdown.Toggle variant="light" id="dropdown-basic">
        Filter by category
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {validCategories.map((category) => (
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

export default Filter;
