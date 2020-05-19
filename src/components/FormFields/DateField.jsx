import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const DateField = ({ name, label, value, handleChange, placeholder }) => (
  <Form.Group controlId={name}>
    <Form.Label>{label}</Form.Label>
    <Form.Control type="date" value={value} onChange={handleChange} placeholder={placeholder} name={name} />
  </Form.Group>
);

DateField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

DateField.defaultProps = {
  placeholder: '',
};

export default DateField;
