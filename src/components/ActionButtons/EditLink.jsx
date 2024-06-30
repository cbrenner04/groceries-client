import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const EditLink = ({ to, disabled, testID, classes }) => (
  <Link className={`p-0 me-3 ${classes}`} to={to} disabled={disabled} data-test-id={testID}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Link>
);

EditLink.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  testID: PropTypes.string.isRequired,
  classes: PropTypes.string.isRequired,
};

export default EditLink;
