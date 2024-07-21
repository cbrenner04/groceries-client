import React, { ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';

export interface INumberFieldProps {
  name: string;
  label: string;
  value?: number;
  handleChange: ChangeEventHandler;
}

const NumberField: React.FC<INumberFieldProps> = ({ name, label, value = '', handleChange }) => (
  <Form.Group controlId={name} className="mb-3">
    <Form.Label>{label}</Form.Label>
    <Form.Control type="number" value={value} onChange={handleChange} name={name} />
  </Form.Group>
);

export default NumberField;
