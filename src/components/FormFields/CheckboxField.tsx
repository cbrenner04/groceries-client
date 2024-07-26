import React, { type ChangeEventHandler } from 'react';
import { Form } from 'react-bootstrap';
import type { FormCheckType } from 'react-bootstrap/esm/FormCheck';

export interface ICheckboxFieldProps {
  name: string;
  label: string;
  value?: boolean;
  handleChange: ChangeEventHandler;
  classes?: string;
  type?: FormCheckType;
}

const CheckboxField: React.FC<ICheckboxFieldProps> = ({
  name,
  label,
  value = false,
  handleChange,
  classes = '',
  type = 'checkbox',
}): React.JSX.Element => (
  <Form.Group controlId={name} className={`${classes} mb-3`}>
    <Form.Check type={type} checked={value} onChange={handleChange} label={label} name={name} />
  </Form.Group>
);

export default CheckboxField;
