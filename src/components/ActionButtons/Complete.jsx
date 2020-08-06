import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Complete = ({ handleClick, testID, disabled, style }) => (
  <Button
    variant="link"
    onClick={handleClick}
    className="p-0 mr-3"
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
};

Complete.defaultProps = {
  disabled: false,
  style: {},
};

export default Complete;
