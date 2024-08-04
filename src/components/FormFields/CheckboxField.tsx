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

const CheckboxField: React.FC<ICheckboxFieldProps> = (props): React.JSX.Element => (
  <Form.Group controlId={props.name} className={`${props.classes ?? ''} mb-3`}>
    <Form.Check
      type={props.type ?? 'checkbox'}
      checked={props.value ?? false}
      onChange={props.handleChange}
      label={props.label}
      name={props.name}
    />
  </Form.Group>
);

export default CheckboxField;
