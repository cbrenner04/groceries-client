import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, TextField } from 'components/FormFields';

export interface IListFormFieldsProps {
  name: string;
  completed: boolean;
  refreshed: boolean;
  handleNameChange: ChangeEventHandler;
  handleCompletedChange?: ChangeEventHandler;
  handleRefreshedChange?: ChangeEventHandler;
  editForm: boolean;
}

const ListFormFields: React.FC<IListFormFieldsProps> = (props): React.JSX.Element => {
  return (
    <React.Fragment>
      <TextField
        name="name"
        label="Name"
        value={props.name}
        handleChange={props.handleNameChange}
        placeholder="My super cool list"
      />
      {props.editForm && (
        <React.Fragment>
          {props.handleCompletedChange && (
            <CheckboxField
              name="completed"
              label="Completed"
              value={props.completed}
              handleChange={props.handleCompletedChange}
              classes="mb-3"
            />
          )}
          {props.handleRefreshedChange && (
            <CheckboxField
              name="refreshed"
              label="Refreshed"
              value={props.refreshed}
              handleChange={props.handleRefreshedChange}
              classes="mb-3"
            />
          )}
        </React.Fragment>
      )}
    </React.Fragment>
  );
};

export default ListFormFields;
