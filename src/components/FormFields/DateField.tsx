import React, { type ChangeEventHandler, type ReactNode } from 'react';
import { Form } from 'react-bootstrap';

export interface IDateFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
  child?: ReactNode;
  disabled?: boolean;
}

const DateField: React.FC<IDateFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name} className="mb-3">
    <Form.Label>{props.label}</Form.Label>
    <Form.Control
      type="date"
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? ''}
      name={props.name}
      disabled={props.disabled ?? false}
    />
    {props.child ?? ''}
  </Form.Group>
);

export default DateField;
