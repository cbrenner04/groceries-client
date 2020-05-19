import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

const SelectField = ({ name, label, value, handleChange, options, blankOption }) => (
  <Form.Group controlId={name}>
    <Form.Label>{label}</Form.Label>
    <Form.Control as="select" value={value} onChange={handleChange} name={name}>
      {blankOption && (
        <option value="" disabled={!value}>
          {value ? `Clear ${label}` : `Select ${label}`}
        </option>
      )}
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Control>
  </Form.Group>
);

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  handleChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  blankOption: PropTypes.bool.isRequired,
};

SelectField.defaultProps = {
  value: '',
};

export default SelectField;
