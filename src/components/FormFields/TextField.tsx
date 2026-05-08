import React, { type ChangeEventHandler, type ReactNode } from 'react';
import Input from '../ui/Input';

export interface ITextFieldProps {
  name: string;
  label: string;
  value: string;
  handleChange: ChangeEventHandler;
  placeholder?: string;
  child?: ReactNode;
  disabled?: boolean;
  testID?: string;
}

const TextField: React.FC<ITextFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3">
    <Input
      type="text"
      label={props.label}
      value={props.value}
      onChange={props.handleChange}
      placeholder={props.placeholder ?? ''}
      name={props.name}
      disabled={props.disabled ?? false}
      testId={props.testID}
    />
    {props.child ?? ''}
  </div>
);

export default TextField;
