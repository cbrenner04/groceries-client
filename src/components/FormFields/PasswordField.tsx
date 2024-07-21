import React, { ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';

interface IPasswordFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
}

const PasswordField: React.FC<IPasswordFieldProps> = ({ name, label, value, handleChange, placeholder = '' }) => (
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
