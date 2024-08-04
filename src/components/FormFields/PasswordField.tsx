import React, { type ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';

export interface IPasswordFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
}

const PasswordField: React.FC<IPasswordFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name} className="mb-3">
    <Form.Label>{props.label}</Form.Label>
    <Form.Control
      type="password"
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? ''}
      autoComplete="off"
      name={props.name}
    />
  </Form.Group>
);

export default PasswordField;
