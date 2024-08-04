import React, { type ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

export interface IEmailFieldProps {
  value: string;
  handleChange: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  placeholder?: string;
}

const EmailField: React.FC<IEmailFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name ?? 'email'} className="mb-3">
    <Form.Label>{props.label ?? 'Email'}</Form.Label>
    <Form.Control
      type="email"
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? 'jane.smith@example.com'}
      name={props.name ?? 'email'}
    />
  </Form.Group>
);

export default EmailField;
