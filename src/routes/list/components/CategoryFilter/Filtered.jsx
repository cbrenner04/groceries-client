import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Filtered = ({ filter, handleClearFilter }) => (
  <>
    <span style={{ lineHeight: '2.5rem', marginRight: '1rem' }}>Filtering by:</span>
    <Button
      data-test-id="clear-filter"
      variant="outline-primary"
      style={{ marginRight: '1rem' }}
      onClick={handleClearFilter}
    >
      {filter} <i className="fa fa-trash" />
    </Button>
  </>
);

Filtered.propTypes = {
  filter: PropTypes.string.isRequired,
  handleClearFilter: PropTypes.func.isRequired,
};

export default Filtered;
