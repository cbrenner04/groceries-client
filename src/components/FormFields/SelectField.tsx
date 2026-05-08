import React, { type ChangeEventHandler, type ReactNode } from 'react';
import Select from '../ui/Select';

export interface ISelectFieldProps {
  name: string;
  label: string;
  value?: string;
  handleChange: ChangeEventHandler;
  options: {
    value: string;
    label: string;
  }[];
  blankOption: boolean;
  child?: ReactNode;
  disabled?: boolean;
}

const SelectField: React.FC<ISelectFieldProps> = (props): React.JSX.Element => (
  <div className="tw:mb-3">
    <Select
      label={props.label}
      value={props.value ?? ''}
      onChange={props.handleChange}
      name={props.name}
      disabled={props.disabled ?? false}
      options={props.options}
    >
      {props.blankOption && (
        <option value="" disabled={!props.value}>
          {props.value ? `Clear ${props.label}` : `Select ${props.label}`}
        </option>
      )}
    </Select>
    {props.child ?? ''}
  </div>
);

export default SelectField;
