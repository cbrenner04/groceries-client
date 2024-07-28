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

const TextField: React.FC<ITextFieldProps> = ({
  name,
  label,
  value,
  handleChange,
  placeholder = '',
  child = '',
  disabled = false,
}): React.JSX.Element => (
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
    {child}
  </Form.Group>
);

export default TextField;
