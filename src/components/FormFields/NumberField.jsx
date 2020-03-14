import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const NumberField = ({
  name,
  label,
  value,
  handleChange,
}) => (
  <Form.Group controlId={name}>
    <Form.Label>{label}</Form.Label>
    <Form.Control type="number" value={value || ''} onChange={handleChange} />
  </Form.Group>
);

NumberField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.number,
  handleChange: PropTypes.func.isRequired,
};

NumberField.defaultProps = {
  value: 0,
};

export default NumberField;
