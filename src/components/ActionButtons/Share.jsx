import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

const Share = ({ to, ...rest }) => (
  <Link className="p-0 mr-3" to={to} {...rest}>
    <i className="fa fa-users fa-2x text-primary" />
  </Link>
);

Share.propTypes = {
  to: PropTypes.string.isRequired,
};

export default Share;
