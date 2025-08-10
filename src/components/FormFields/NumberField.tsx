import React, { type ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';

export interface INumberFieldProps {
  name: string;
  label: string;
  value?: number;
  handleChange: ChangeEventHandler;
}

const NumberField: React.FC<INumberFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name} className="mb-3">
    <Form.Label>{props.label}</Form.Label>
    <Form.Control
      type="number"
      value={props.value !== undefined ? props.value : ''}
      onChange={props.handleChange}
      name={props.name}
    />
  </Form.Group>
);

export default NumberField;
