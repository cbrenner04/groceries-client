import React, { ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';

interface IEmailFieldProps {
  name?: string;
  label?: string;
  value: string;
  handleChange: ChangeEventHandler;
}

const EmailField: React.FC<IEmailFieldProps> = ({ name = 'email', label = 'Email', value, handleChange }) => (
  <Form.Group controlId={name || 'email'} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type="email" value={value} onChange={handleChange} placeholder="jane.smith@example.com" name={name} />
  </Form.Group>
);

export default EmailField;
