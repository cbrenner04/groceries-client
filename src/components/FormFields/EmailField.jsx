import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const EmailField = ({ name, label, value, handleChange }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label || 'Email'}</Form.Label>
    <Form.Control
      type="email"
      value={value}
      onChange={handleChange}
      placeholder="jane.smith@example.com"
      name={name || 'email'}
    />
  </Form.Group>
);

EmailField.propTypes = {
  name: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default EmailField;
