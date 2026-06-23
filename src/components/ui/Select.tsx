import React from 'react';
import FieldShell, { fieldControlStyles } from './FieldShell';

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
  const chevronSvg =
    'data:image/svg+xml;utf8,' +
    '<svg%20xmlns=%22http://www.w3.org/2000/svg%22%20viewBox=%220%200%2024%2024%22%20fill=%22none%22%20' +
    'stroke=%22%236b7280%22%20stroke-width=%222%22%20stroke-linecap=%22round%22%20stroke-linejoin=%22round%22>' +
    '<polyline%20points=%226%209%2012%2015%2018%209%22></polyline></svg>';
  const selectStyles =
    `${fieldControlStyles} tw:appearance-none ` +
    `tw:bg-[image:url('${chevronSvg}')] ` +
    'tw:bg-no-repeat tw:bg-right tw:pr-10';

  return (
    <FieldShell label={label} error={error} htmlFor={selectId}>
      <select
        id={selectId}
        className={`${selectStyles} ${className || ''}`.trim()}
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
