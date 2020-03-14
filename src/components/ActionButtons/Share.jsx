import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Share = ({ to, ...rest }) => (
  <Button href={to} variant="link" className="p-0 mr-3" {...rest}>
    <i className="fa fa-users fa-2x text-primary" />
  </Button>
);

Share.propTypes = {
  to: PropTypes.string.isRequired,
};

export default Share;
