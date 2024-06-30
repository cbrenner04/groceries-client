import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const TextField = ({ name, label, value, handleChange, placeholder, child, disabled }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder || ''}
      name={name}
      disabled={disabled || false}
    />
    {child || ''}
  </Form.Group>
);

TextField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  child: PropTypes.node,
  disabled: PropTypes.bool,
};

export default TextField;
