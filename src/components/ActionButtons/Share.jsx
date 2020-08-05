import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Share = ({ handleClick, ...rest }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3" {...rest}>
    <i className="fa fa-users fa-2x text-primary" />
  </Button>
);

Share.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default Share;
