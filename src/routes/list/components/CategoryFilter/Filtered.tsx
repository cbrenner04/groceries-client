import React, { type MouseEventHandler } from 'react';
import { Button } from 'react-bootstrap';

export interface IFilteredProps {
  filter: string;
  handleClearFilter: MouseEventHandler;
}

const Filtered: React.FC<IFilteredProps> = ({ filter, handleClearFilter }): React.JSX.Element => (
  <React.Fragment>
    <span id="filter-title">Filtering by:</span>
    <Button data-test-id="clear-filter" variant="outline-primary" id="filter-button" onClick={handleClearFilter}>
      {filter} <i className="fa fa-trash" />
    </Button>
  </React.Fragment>
);

export default Filtered;
