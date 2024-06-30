import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Refresh = ({ handleClick, testID, disabled, classes }) => (
  <Button
    variant="link"
    onClick={handleClick}
    className={`p-0 me-3 ${classes}`}
    data-test-id={testID}
    disabled={disabled}
  >
    <i className="fa fa-redo fa-2x text-primary" />
  </Button>
);

Refresh.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  classes: PropTypes.string.isRequired,
};

export default Refresh;
