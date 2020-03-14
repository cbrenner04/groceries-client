import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Edit = ({ to, ...rest }) => (
  <Button variant="link" href={to} className="p-0 mr-3" {...rest}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Button>
);

Edit.propTypes = {
  to: PropTypes.string.isRequired,
};

export default Edit;
