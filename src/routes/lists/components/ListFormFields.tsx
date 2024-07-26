import type { ChangeEventHandler, ChangeEvent } from 'react';
import React from 'react';

import { CheckboxField, SelectField, TextField } from '../../../components/FormFields';
import { EListType } from '../../../typings';

interface IListFormFieldsProps {
  name: string;
  type: string;
  completed?: boolean;
  handleNameChange: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => void;
  handleTypeChange: ({ target: { value } }: ChangeEvent<HTMLInputElement>) => void;
  handleCompletedChange?: ChangeEventHandler;
  editForm?: boolean;
}

const ListFormFields: React.FC<IListFormFieldsProps> = (props) => {
  return (
    <>
      <TextField
        name="name"
        label="Name"
        value={props.name}
        // TODO: figure typings out
        handleChange={props.handleNameChange as unknown as ChangeEventHandler}
        placeholder="My super cool list"
      />
      <SelectField
        name="type"
        label="Type"
        value={props.type}
        // TODO: figure typings out
        handleChange={props.handleTypeChange as unknown as ChangeEventHandler}
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
        <CheckboxField
          name="completed"
          label="Completed"
          value={props.completed ?? false}
          handleChange={props.handleCompletedChange ?? (() => undefined)}
          classes="mb-3"
        />
      )}
    </>
  );
};

export default ListFormFields;
