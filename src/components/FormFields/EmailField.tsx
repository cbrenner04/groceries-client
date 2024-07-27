import React, { type ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

export interface IEmailFieldProps {
  name?: string;
  label?: string;
  value: string;
  handleChange: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => void;
}

const EmailField: React.FC<IEmailFieldProps> = ({
  name = 'email',
  label = 'Email',
  value,
  handleChange,
}): React.JSX.Element => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type="email" value={value} onChange={handleChange} placeholder="jane.smith@example.com" name={name} />
  </Form.Group>
);

export default EmailField;
