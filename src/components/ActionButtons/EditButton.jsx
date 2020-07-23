import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const EditButton = ({ handleClick, ...rest }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3" {...rest}>
    <i className="fa fa-edit fa-2x text-warning" />
  </Button>
);

EditButton.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default EditButton;
