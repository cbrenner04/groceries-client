import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const PasswordField = ({ name, label, value, handleChange, placeholder }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="password"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || ''}
      autoComplete="off"
      name={name}
    />
  </Form.Group>
);

PasswordField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
};

export default PasswordField;
