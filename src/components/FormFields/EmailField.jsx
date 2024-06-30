import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const EmailField = ({ name, label, value, handleChange }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type="email" value={value} onChange={handleChange} placeholder="jane.smith@example.com" name={name} />
  </Form.Group>
);

EmailField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default EmailField;
