import type { ChangeEventHandler } from 'react';
import React from 'react';

import { TextField, CategoryField, CheckboxField } from '../../../../components/FormFields';

interface ISimpleFormFieldsProps {
  content: string;
  completed?: boolean;
  editForm?: boolean;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}

const SimpleFormFields: React.FC<ISimpleFormFieldsProps> = (props) => (
  <>
    <TextField
      name="content"
      label="Content"
      value={props.content}
      handleChange={props.inputChangeHandler}
      placeholder="Something cool"
    />
    <CategoryField
      category={props.category ?? ''}
      categories={props.categories ?? []}
      handleInput={props.inputChangeHandler}
    />
    {props.editForm && (
      <CheckboxField
        name="completed"
        label="Completed"
        value={props.completed ?? false}
        handleChange={props.inputChangeHandler}
        classes="mb-3"
      />
    )}
  </>
);

export default SimpleFormFields;
