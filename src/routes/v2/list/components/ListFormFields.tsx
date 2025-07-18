import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, SelectField, TextField } from 'components/FormFields';
import { EListType } from 'typings';

export interface IListFormFieldsProps {
  name: string;
  type: string;
  completed: boolean;
  refreshed: boolean;
  handleNameChange: ChangeEventHandler;
  handleTypeChange: ChangeEventHandler;
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
      <SelectField
        name="type"
        label="Type"
        value={props.type}
        handleChange={props.handleTypeChange}
        options={[
          { value: EListType.BOOK_LIST, label: 'books' },
          { value: EListType.GROCERY_LIST, label: 'groceries' },
          { value: EListType.MUSIC_LIST, label: 'music' },
          { value: EListType.SIMPLE_LIST, label: 'simple' },
          { value: EListType.TO_DO_LIST, label: 'to-do' },
        ]}
        blankOption={false}
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
