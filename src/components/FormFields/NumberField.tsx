import React, { type ChangeEventHandler } from 'react';
import NumberInput from '../ui/NumberInput';

export interface INumberFieldProps {
  name: string;
  label: string;
  value?: number;
  handleChange: ChangeEventHandler;
}

const NumberField: React.FC<INumberFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3">
    <NumberInput label={props.label} value={props.value ?? ''} onChange={props.handleChange} name={props.name} />
  </div>
);

export default NumberField;
