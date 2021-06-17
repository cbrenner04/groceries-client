import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Complete = ({ handleClick, testID, disabled, style, classes }) => (
  <Button
    variant="link"
    onClick={handleClick}
    className={`p-0 me-3 ${classes}`}
    data-test-id={testID}
    disabled={disabled}
    style={style}
  >
    <i className="fa fa-check fa-2x text-success" />
  </Button>
);

Complete.propTypes = {
  handleClick: PropTypes.func.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  style: PropTypes.shape({
    pointerEvents: PropTypes.string,
    opacity: PropTypes.number,
  }),
  classes: PropTypes.string,
};

Complete.defaultProps = {
  disabled: false,
  style: {},
  classes: '',
};

export default Complete;
