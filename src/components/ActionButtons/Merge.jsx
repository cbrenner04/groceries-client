import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Merge = ({ handleClick, testID }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3" data-test-id={testID}>
    <i className="fa fa-compress-alt fa-2x text-warning" />
  </Button>
);

Merge.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
};

export default Merge;