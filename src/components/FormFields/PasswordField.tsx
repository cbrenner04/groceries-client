import React, { type ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';

export interface IPasswordFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
}

const PasswordField: React.FC<IPasswordFieldProps> = ({
  name,
  label,
  value,
  handleChange,
  placeholder = '',
}): React.JSX.Element => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control
      type="password"
      value={value}
      onChange={handleChange}
      placeholder={placeholder}
      autoComplete="off"
      name={name}
    />
  </Form.Group>
);

export default PasswordField;
