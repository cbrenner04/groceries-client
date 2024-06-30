import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Share = ({ to, testID, disabled, classes }) => (
  <Link className={`p-0 me-3 ${classes}`} to={to} data-test-id={testID} disabled={disabled}>
    <i className="fa fa-users fa-2x text-primary" />
  </Link>
);

Share.propTypes = {
  to: PropTypes.string.isRequired,
  testID: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  classes: PropTypes.string.isRequired,
};

export default Share;
