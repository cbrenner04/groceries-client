import React, { type ChangeEventHandler, type ReactNode } from 'react';
import { Form } from 'react-bootstrap';

export interface ISelectFieldProps {
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

const SelectField: React.FC<ISelectFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name} className="mb-3">
    <Form.Label>{props.label}</Form.Label>
    <Form.Control
      as="select"
      value={props.value ?? ''}
      onChange={props.handleChange}
      name={props.name}
      disabled={props.disabled ?? false}
    >
      {props.blankOption && (
        <option value="" disabled={!props.value}>
          {props.value ? `Clear ${props.label}` : `Select ${props.label}`}
        </option>
      )}
      {props.options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Form.Control>
    {props.child ?? ''}
  </Form.Group>
);

export default SelectField;
