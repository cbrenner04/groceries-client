import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, SelectField, TextField } from 'components/FormFields';
import { EListType } from 'typings';

export interface IListFormFieldsProps {
  name: string;
  type: string;
  completed: boolean;
  handleNameChange: ChangeEventHandler;
  handleTypeChange: ChangeEventHandler;
  handleCompletedChange: ChangeEventHandler;
  editForm: boolean;
}

const ListFormFields: React.FC<IListFormFieldsProps> = ({
  name,
  type,
  handleNameChange,
  handleTypeChange,
  handleCompletedChange,
  completed,
  editForm,
}): React.JSX.Element => {
  return (
    <React.Fragment>
      <TextField
        name="name"
        label="Name"
        value={name}
        handleChange={handleNameChange}
        placeholder="My super cool list"
      />
      <SelectField
        name="type"
        label="Type"
        value={type}
        handleChange={handleTypeChange}
        options={[
          { value: EListType.BOOK_LIST, label: 'books' },
          { value: EListType.GROCERY_LIST, label: 'groceries' },
          { value: EListType.MUSIC_LIST, label: 'music' },
          { value: EListType.SIMPLE_LIST, label: 'simple' },
          { value: EListType.TO_DO_LIST, label: 'to-do' },
        ]}
        blankOption={false}
      />
      {editForm && (
        <CheckboxField
          name="completed"
          label="Completed"
          value={completed}
          handleChange={handleCompletedChange}
          classes="mb-3"
        />
      )}
    </React.Fragment>
  );
};

export default ListFormFields;
