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

const ToDoFormFields: React.FC<IToDoFormFieldsProps> = (props) => (
  <React.Fragment>
    <TextField
      name="task"
      label="Task"
      value={props.task}
      handleChange={props.inputChangeHandler}
      placeholder="Clean the toilets"
    />
    <SelectField
      name="assigneeId"
      label="Assignee"
      value={props.assigneeId}
      handleChange={props.inputChangeHandler}
      options={props.listUsers.map((user) => ({ value: String(user.id), label: user.email }))}
      blankOption
    />
    <DateField
      name="dueBy"
      label="Due By"
      value={props.dueBy}
      handleChange={props.inputChangeHandler}
      placeholder="mm/dd/yyyy"
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
  </React.Fragment>
);

export default ToDoFormFields;
