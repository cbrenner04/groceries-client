import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const EditLink = ({ to, disabled, style, testID }) => (
  <Link className="p-0 me-3" to={to} disabled={disabled} style={style} data-test-id={testID}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Link>
);

EditLink.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  style: PropTypes.shape({
    pointerEvents: PropTypes.string,
    opacity: PropTypes.number,
  }).isRequired,
  testID: PropTypes.string.isRequired,
};

export default EditLink;
