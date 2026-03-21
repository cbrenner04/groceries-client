import React, { type ChangeEventHandler } from 'react';
import Checkbox from '../ui/Checkbox';

export interface ICheckboxFieldProps {
  name: string;
  label: string;
  value?: boolean;
  handleChange: ChangeEventHandler;
  classes?: string;
}

const CheckboxField: React.FC<ICheckboxFieldProps> = (props): React.JSX.Element => (
  <div className={`${props.classes ?? ''} tw:mb-3`}>
    <Checkbox checked={props.value ?? false} onChange={props.handleChange} label={props.label} name={props.name} />
  </div>
);

export default CheckboxField;
