import React from 'react';
import { Button } from 'react-bootstrap';
import { TrashIcon } from '../../../../components/icons';

export interface IFilteredProps {
  filter: string;
  handleClearFilter: () => void;
}

const Filtered: React.FC<IFilteredProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <span id="filter-title">Filtering by:</span>
    <Button data-test-id="clear-filter" variant="outline-primary" id="filter-button" onClick={props.handleClearFilter}>
      {props.filter === 'uncategorized' ? 'Uncategorized' : props.filter} <TrashIcon size="sm" />
    </Button>
  </React.Fragment>
);

export default Filtered;
