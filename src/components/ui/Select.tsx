import React from 'react';
import FieldShell, { fieldControlStyles } from './FieldShell';
import { selectControlStyles } from './Select.variants';

interface ISelectOption {
  value: string;
  label: string;
}

export interface ISelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: ISelectOption[];
  testId?: string;
}

const Select: React.FC<ISelectProps> = (props): React.JSX.Element => {
  const { label, error, options, testId, className, children, id, ...selectProps } = props;
  const selectId = id || testId || selectProps.name || 'select';

  return (
    <FieldShell label={label} error={error} htmlFor={selectId}>
      <select
        id={selectId}
        className={`${fieldControlStyles} ${selectControlStyles} ${className || ''}`.trim()}
        data-test-id={testId}
        {...selectProps}
      >
        {children}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
};

export default Select;
