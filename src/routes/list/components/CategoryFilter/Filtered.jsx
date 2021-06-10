import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Filtered = ({ filter, handleClearFilter }) => (
  <>
    <span id="filter-title">Filtering by:</span>
    <Button data-test-id="clear-filter" variant="outline-primary" id="filter-button" onClick={handleClearFilter}>
      {filter} <i className="fa fa-trash" />
    </Button>
  </>
);

Filtered.propTypes = {
  filter: PropTypes.string.isRequired,
  handleClearFilter: PropTypes.func.isRequired,
};

export default Filtered;
