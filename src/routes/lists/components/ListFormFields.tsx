import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, SelectField, TextField } from 'components/FormFields';
import type { IListItemConfiguration } from 'typings';

export interface IListFormFieldsProps {
  name: string;
  configurationId: string;
  configurations: IListItemConfiguration[];
  completed: boolean;
  handleNameChange: ChangeEventHandler;
  handleConfigurationChange: ChangeEventHandler;
  handleCompletedChange?: ChangeEventHandler;
  editForm: boolean;
}

const ListFormFields: React.FC<IListFormFieldsProps> = (props): React.JSX.Element => {
  const configurationOptions = props.configurations.map((config) => ({
    value: config.id,
    label: config.name,
  }));

  return (
    <React.Fragment>
      <TextField
        name="name"
        label="Name"
        value={props.name}
        handleChange={props.handleNameChange}
        placeholder="My super cool list"
      />
      <SelectField
        name="list_item_configuration_id"
        label="Template"
        value={props.configurationId}
        handleChange={props.handleConfigurationChange}
        options={configurationOptions}
        blankOption={false}
      />
      {props.editForm && (
        <CheckboxField
          name="completed"
          label="Completed"
          value={props.completed}
          handleChange={props.handleCompletedChange!}
          classes="mb-3"
        />
      )}
    </React.Fragment>
  );
};

export default ListFormFields;
