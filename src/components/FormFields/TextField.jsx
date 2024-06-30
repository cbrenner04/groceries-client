import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import { CheckboxField } from './';

const TextField = ({ name, label, value, handleChange, placeholder, disabled, showClear, clear, handleClear }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="text"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      name={name}
      disabled={disabled}
    />
    {showClear && (
      <CheckboxField
        name={`clear${name[0].toUpperCase() + name.slice(1)}`}
        label={`Clear ${name}`}
        handleChange={handleClear}
        value={clear}
        classes="ms-1 mt-1"
      />
    )}
  </Form.Group>
);

TextField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  placeholder: PropTypes.string.isRequired,
  disabled: PropTypes.bool.isRequired,
  showClear: PropTypes.bool.isRequired,
  handleClear: PropTypes.func.isRequired,
  clear: PropTypes.bool.isRequired,
};

export default TextField;
