import React from 'react';
import FieldShell, { fieldControlStyles } from './FieldShell';

interface IInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  testId?: string;
}

const Input: React.FC<IInputProps> = (props): React.JSX.Element => {
  const { label, error, testId, className, id, ...inputProps } = props;
  const inputId = id || testId || inputProps.name || 'input';

  return (
    <FieldShell label={label} error={error} htmlFor={inputId}>
      <input
        id={inputId}
        className={`${fieldControlStyles} ${className || ''}`.trim()}
        data-test-id={testId}
        {...inputProps}
      />
    </FieldShell>
  );
};

export default Input;
