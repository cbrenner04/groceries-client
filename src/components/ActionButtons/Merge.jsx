import React from 'react';
import PropTypes from 'prop-types';
import { Button } from 'react-bootstrap';

const Merge = ({ handleClick }) => (
  <Button variant="link" onClick={handleClick} className="p-0 mr-3">
    <i className="fa fa-compress-alt fa-2x text-warning" />
  </Button>
);

Merge.propTypes = {
  handleClick: PropTypes.func.isRequired,
};

export default Merge;
