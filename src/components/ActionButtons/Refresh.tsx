import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Refresh = ({ handleClick, testID, style, disabled, classes }) => (
  <Button
    variant="link"
    onClick={handleClick}
    className={`p-0 me-3 ${classes || ''}`}
    data-test-id={testID}
    style={style || {}}
    disabled={disabled || false}
  >
    <i className="fa fa-redo fa-2x text-primary" />
  </Button>
);

Refresh.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
  style: PropTypes.shape({
    pointerEvents: PropTypes.string,
    opacity: PropTypes.number,
  }),
  disabled: PropTypes.bool,
  classes: PropTypes.string,
};

export default Refresh;
