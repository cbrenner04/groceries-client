import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Edit = ({ to, ...rest }) => (
  <Link className="p-0 mr-3" to={to} {...rest}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Link>
);

Edit.propTypes = {
  to: PropTypes.string.isRequired,
};

export default Edit;
