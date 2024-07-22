import React, { ChangeEventHandler, ReactNode } from 'react';
import { Form } from 'react-bootstrap';

interface ISelectFieldProps {
  name: string;
  label: string;
  value?: string;
  handleChange: ChangeEventHandler;
  options: {
    value: string;
    label: string;
  }[];
  blankOption: boolean;
  child?: ReactNode;
  disabled?: boolean;
}

const SelectField: React.FC<ISelectFieldProps> = ({
  name,
  label,
  value = '',
  handleChange,
  options,
  blankOption,
  child = '',
  disabled = false,
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
    {child}
  </Form.Group>
);

export default SelectField;
