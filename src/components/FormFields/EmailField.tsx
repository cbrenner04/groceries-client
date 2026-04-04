import React, { type ChangeEvent } from 'react';
import Input from '../ui/Input';

export interface IEmailFieldProps {
  value: string;
  handleChange: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  placeholder?: string;
}

const EmailField: React.FC<IEmailFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3">
    <Input
      type="email"
      label={props.label ?? 'Email'}
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? 'jane.smith@example.com'}
      name={props.name ?? 'email'}
    />
  </div>
);

export default EmailField;
