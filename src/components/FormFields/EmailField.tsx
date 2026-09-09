import React, { type ChangeEvent } from 'react';
import Input from '../ui/Input';

export interface IEmailFieldProps {
  value: string;
  handleChange: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  label?: string;
  placeholder?: string;
  autoComplete?: React.InputHTMLAttributes<HTMLInputElement>['autoComplete'];
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
      autoComplete={props.autoComplete}
    />
  </div>
);

export default EmailField;
