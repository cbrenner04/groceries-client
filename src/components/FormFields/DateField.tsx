import React, { type ChangeEventHandler, type ReactNode } from 'react';
import DateInput from '../ui/DateInput';

export interface IDateFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  child?: ReactNode;
  disabled?: boolean;
}

const DateField: React.FC<IDateFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3">
    <DateInput
      label={props.label}
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? ''}
      name={props.name}
      disabled={props.disabled ?? false}
    />
    {props.child ?? ''}
  </div>
);

export default DateField;
