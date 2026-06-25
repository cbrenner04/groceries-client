import React from 'react';
import FieldShell from './FieldShell';
import { dateInputControlStyles } from './DateInput.variants';

interface IDateInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  testId?: string;
}

const DateInput: React.FC<IDateInputProps> = (props): React.JSX.Element => {
  const { label, error, testId, className, id, ...inputProps } = props;
  const inputId = id || testId || inputProps.name || 'date-input';

  return (
    <FieldShell label={label} error={error} htmlFor={inputId}>
      <input
        id={inputId}
        type="date"
        className={`${dateInputControlStyles} ${className || ''}`.trim()}
        data-test-id={testId}
        {...inputProps}
      />
    </FieldShell>
  );
};

export default DateInput;
