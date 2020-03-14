import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Complete = ({ handleClick, ...rest }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3" {...rest}>
    <i className="fa fa-check fa-2x text-success" />
  </Button>
);

Complete.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default Complete;
