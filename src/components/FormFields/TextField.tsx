import React, { type ChangeEventHandler, type ReactNode } from 'react';
import { Form } from 'react-bootstrap';

export interface ITextFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
  child?: ReactNode;
  disabled?: boolean;
}

const TextField: React.FC<ITextFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name} className="mb-3">
    <Form.Label>{props.label}</Form.Label>
    <Form.Control
      type="text"
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? ''}
      name={props.name}
      disabled={props.disabled ?? false}
    />
    {props.child ?? ''}
  </Form.Group>
);

export default TextField;
