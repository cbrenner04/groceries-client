import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const DateField = ({ name, label, value, handleChange, placeholder, child, disabled }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="date"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
    />
    {child}
  </Form.Group>
);

DateField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  child: PropTypes.node,
  disabled: PropTypes.bool,
};

DateField.defaultProps = {
  placeholder: '',
  child: '',
  disabled: false,
};

export default DateField;
