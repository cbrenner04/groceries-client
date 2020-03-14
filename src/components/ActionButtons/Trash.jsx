import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Trash = ({ handleClick, ...rest }) => (
  <Button variant="link" onClick={handleClick} className="p-0" {...rest}>
    <i className="fa fa-trash fa-2x text-danger" />
  </Button>
);

Trash.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default Trash;
