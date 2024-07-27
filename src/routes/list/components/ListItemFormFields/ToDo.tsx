import React, { type ChangeEventHandler } from 'react';

import { TextField, CategoryField, DateField, CheckboxField, SelectField } from 'components/FormFields';
import type { IListUser } from 'typings';

export interface IToDoFormFieldsProps {
  task: string;
  assigneeId: string;
  dueBy: string;
  completed?: boolean;
  listUsers: IListUser[];
  editForm?: boolean;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}

const ToDoFormFields: React.FC<IToDoFormFieldsProps> = ({
  task,
  assigneeId,
  dueBy,
  inputChangeHandler,
  listUsers,
  completed = false,
  editForm = false,
  category = '',
  categories = [],
}) => (
  <React.Fragment>
    <TextField
      name="task"
      label="Task"
      value={task}
      handleChange={inputChangeHandler}
      placeholder="Clean the toilets"
    />
    <SelectField
      name="assigneeId"
      label="Assignee"
      value={assigneeId}
      handleChange={inputChangeHandler}
      options={listUsers.map((user) => ({ value: String(user.id), label: user.email }))}
      blankOption
    />
    <DateField name="dueBy" label="Due By" value={dueBy} handleChange={inputChangeHandler} placeholder="mm/dd/yyyy" />
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

export default ToDoFormFields;
