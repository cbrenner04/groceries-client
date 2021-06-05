import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Share = ({ to, testID, disabled, style }) => (
  <Link className="p-0 me-3" to={to} data-test-id={testID} disabled={disabled} style={style}>
    <i className="fa fa-users fa-2x text-primary" />
  </Link>
);

Share.propTypes = {
  to: PropTypes.string.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  style: PropTypes.shape({
    pointerEvents: PropTypes.string,
    opacity: PropTypes.number,
  }).isRequired,
};

export default Share;
