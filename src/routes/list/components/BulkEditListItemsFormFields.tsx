import React from 'react';

import { TextField, CheckboxField, DateField, NumberField } from 'components/FormFields';
import { capitalize } from 'utils/format';

export interface IFieldUpdate {
  label: string;
  data: string;
  clear: boolean;
}

export interface IBulkEditListItemsFormFieldsProps {
  fieldConfigurations: {
    id: string;
    label: string;
    data_type: 'boolean' | 'date_time' | 'free_text' | 'number';
    position?: number;
  }[];
  fieldUpdates: IFieldUpdate[];
  handleFieldChange: React.ChangeEventHandler<HTMLInputElement>;
  handleClearField: (label: string) => void;
  listType: string;
}

const BulkEditListItemsFormFields: React.FC<IBulkEditListItemsFormFieldsProps> = (props): React.JSX.Element => {
  const renderField = (config: IBulkEditListItemsFormFieldsProps['fieldConfigurations'][number]): React.JSX.Element => {
    const fieldUpdate = props.fieldUpdates.find((f) => f.label === config.label);
    const value = fieldUpdate?.data ?? '';
    const isCleared = fieldUpdate?.clear ?? false;

    const commonProps = {
      name: config.label,
      label: capitalize(config.label),
      handleChange: props.handleFieldChange,
    };

    const clearCheckbox = (
      <CheckboxField
        name={`clear_${config.label}`}
        label={`Clear ${capitalize(config.label)}`}
        value={isCleared}
        handleChange={(): void => props.handleClearField(config.label)}
        classes="ms-1 mt-1"
      />
    );

    switch (config.data_type) {
      case 'boolean':
        return (
          <div key={config.id} className="mb-3">
            <CheckboxField
              name={config.label}
              label={capitalize(config.label)}
              value={value === 'true'}
              handleChange={props.handleFieldChange}
            />
            {clearCheckbox}
          </div>
        );
      case 'date_time':
        return (
          <div key={config.id} className="mb-3">
            <DateField {...commonProps} value={value} />
            {clearCheckbox}
          </div>
        );
      case 'number':
        return (
          <div key={config.id} className="mb-3">
            <NumberField {...commonProps} value={value !== '' ? Number(value) : undefined} />
            {clearCheckbox}
          </div>
        );
      case 'free_text':
      default:
        return (
          <div key={config.id} className="mb-3">
            <TextField {...commonProps} value={value} />
            {clearCheckbox}
          </div>
        );
    }
  };

  return (
    <React.Fragment>
      <div>Update attributes for all items.</div>
      <br />
      {props.fieldConfigurations
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
        .map((config) => renderField(config))}
    </React.Fragment>
  );
};

export default BulkEditListItemsFormFields;
