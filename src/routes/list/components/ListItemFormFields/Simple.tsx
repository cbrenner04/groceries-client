import React, { type ChangeEventHandler } from 'react';

import { TextField, CategoryField, CheckboxField } from 'components/FormFields';

export interface ISimpleFormFieldsProps {
  content: string;
  completed?: boolean;
  editForm?: boolean;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}

const SimpleFormFields: React.FC<ISimpleFormFieldsProps> = ({
  content,
  inputChangeHandler,
  completed = false,
  editForm = '',
  category = '',
  categories = [],
}) => (
  <React.Fragment>
    <TextField
      name="content"
      label="Content"
      value={content}
      handleChange={inputChangeHandler}
      placeholder="Something cool"
    />
    <CategoryField category={category} categories={categories} handleInput={inputChangeHandler} />
    {editForm && (
      <CheckboxField
        name="completed"
        label="Completed"
        value={completed}
        handleChange={inputChangeHandler}
        classes="mb-3"
      />
    )}
  </React.Fragment>
);

export default SimpleFormFields;
