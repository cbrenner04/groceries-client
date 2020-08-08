import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const EditButton = ({ handleClick, testID, disabled }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3" disabled={disabled} data-test-id={testID}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Button>
);

EditButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
};

EditButton.defaultProps = {
  disabled: false,
};

export default EditButton;
