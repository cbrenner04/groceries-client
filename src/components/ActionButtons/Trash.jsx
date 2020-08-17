import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Trash = ({ handleClick, testID, disabled }) => (
  <Button variant="link" onClick={handleClick} className="p-0" data-test-id={testID} disabled={disabled}>
    <i className="fa fa-trash fa-2x text-danger" />
  </Button>
);

Trash.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
};

export default Trash;
