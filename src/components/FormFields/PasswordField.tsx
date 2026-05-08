import React, { type ChangeEventHandler } from 'react';
import Input from '../ui/Input';

export interface IPasswordFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
}

const PasswordField: React.FC<IPasswordFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3">
    <Input
      type="password"
      label={props.label}
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? ''}
      autoComplete="off"
      name={props.name}
    />
  </div>
);

export default PasswordField;
