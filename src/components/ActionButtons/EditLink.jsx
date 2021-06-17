import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const EditLink = ({ to, disabled, style, testID, classes }) => (
  <Link className={`p-0 mr-3 ${classes}`} to={to} disabled={disabled} style={style} data-test-id={testID}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Link>
);

EditLink.propTypes = {
  to: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  style: PropTypes.shape({
    pointerEvents: PropTypes.string,
    opacity: PropTypes.number,
  }),
  testID: PropTypes.string.isRequired,
  classes: PropTypes.string,
};

EditLink.defaultProps = {
  classes: '',
  style: {},
};

export default EditLink;
