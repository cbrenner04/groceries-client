import React from 'react';
import FieldShell from './FieldShell';
import { numberInputControlStyles } from './NumberInput.variants';

interface INumberInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  testId?: string;
}

const NumberInput: React.FC<INumberInputProps> = (props): React.JSX.Element => {
  const { label, error, testId, className, id, ...inputProps } = props;
  const inputId = id || testId || inputProps.name || 'number-input';

  return (
    <FieldShell label={label} error={error} htmlFor={inputId}>
      <input
        id={inputId}
        type="number"
        className={`${numberInputControlStyles} ${className || ''}`.trim()}
        data-test-id={testId}
        {...inputProps}
      />
    </FieldShell>
  );
};

export default NumberInput;
