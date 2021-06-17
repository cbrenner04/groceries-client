import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Merge = ({ handleClick, testID, disabled }) => (
  <Button variant="link" onClick={handleClick} className="p-0 me-3" data-test-id={testID} disabled={disabled}>
    <i className="fa fa-compress-alt fa-2x text-warning" />
  </Button>
);

Merge.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default Merge;
