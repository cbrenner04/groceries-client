import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import { CheckboxField } from './';

const SelectField = ({
  name,
  label,
  value,
  handleChange,
  options,
  blankOption,
  showClear,
  handleClear,
  clear,
  disabled,
}) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control as="select" value={value} onChange={handleChange} name={name} disabled={disabled}>
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
    {showClear && (
      <CheckboxField
        name={`clear${(name[0].toUpperCase() + name.slice(1)).replace('Id', '')}`}
        label={`Clear ${name.replace('Id', '')}`}
        handleChange={handleClear}
        value={clear}
        classes="ms-1 mt-1"
      />
    )}
  </Form.Group>
);

SelectField.propTypes = {
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  handleChange: PropTypes.func.isRequired,
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string,
      label: PropTypes.string,
    }),
  ).isRequired,
  blankOption: PropTypes.bool.isRequired,
  disabled: PropTypes.bool.isRequired,
  showClear: PropTypes.bool.isRequired,
  clear: PropTypes.bool.isRequired,
  handleClear: PropTypes.func.isRequired,
};

export default SelectField;
