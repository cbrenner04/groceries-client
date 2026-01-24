import React, { type ChangeEventHandler } from 'react';

import type { EListItemFieldType, IListItemField } from 'typings';
import { TextField, CheckboxField, DateField, NumberField } from 'components/FormFields';

export interface IListItemFormFieldsProps {
  fieldConfigurations: {
    id: string;
    label: string;
    data_type: EListItemFieldType;
    position: number;
  }[];
  fields: IListItemField[];
  setFormData: ChangeEventHandler<HTMLInputElement>;
  editForm: boolean;
}

const ListItemFormFields: React.FC<IListItemFormFieldsProps> = (props): React.JSX.Element => {
  // Sort field configurations by position
  const sortedFieldConfigurations = [...props.fieldConfigurations].sort((a, b) => a.position - b.position);

  // Helper to find the value for a given config
  const getFieldValue = (configLabel: string): IListItemField | undefined => {
    return props.fields.find((field) => field.label === configLabel);
  };

  const renderField = (config: IListItemFormFieldsProps['fieldConfigurations'][number]): React.JSX.Element => {
    const field = getFieldValue(config.label);
    const commonProps = {
      name: config.label,
      label: config.label.charAt(0).toUpperCase() + config.label.slice(1),
      handleChange: props.setFormData,
    };
    switch (config.data_type) {
      case 'boolean':
        return (
          <CheckboxField key={config.id} {...commonProps} value={field?.data === 'true' || false} classes="mb-3" />
        );
      case 'date_time':
        return <DateField key={config.id} {...commonProps} value={field?.data ?? ''} />;
      case 'number':
        return <NumberField key={config.id} {...commonProps} value={field?.data ? Number(field.data) : undefined} />;
      case 'free_text':
      default:
        return <TextField key={config.id} {...commonProps} value={field?.data ?? ''} />;
    }
  };

  return <React.Fragment>{sortedFieldConfigurations.map((config) => renderField(config))}</React.Fragment>;
};

export default ListItemFormFields;
