import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, DateField, SelectField } from 'components/FormFields';
import type { IListUser } from 'typings';

export interface IToDoProps {
  assigneeId: string;
  clearAssignee: boolean;
  handleClearAssignee: ChangeEventHandler;
  dueBy: string;
  clearDueBy: boolean;
  handleClearDueBy: ChangeEventHandler;
  handleInput: ChangeEventHandler;
  listUsers: IListUser[];
}

const ToDo: React.FC<IToDoProps> = (props): React.JSX.Element => (
  <React.Fragment>
    <SelectField
      name="assigneeId"
      label="Assignee"
      value={props.assigneeId}
      handleChange={props.handleInput}
      options={props.listUsers.map((user) => ({ value: String(user.id), label: user.email }))}
      blankOption
      disabled={props.clearAssignee}
      child={
        <CheckboxField
          name="clearAssignee"
          label="Clear assignee"
          handleChange={props.handleClearAssignee}
          value={props.clearAssignee}
          classes="ms-1 mt-1"
        />
      }
    />
    <DateField
      name="due_by"
      label="Due By"
      value={props.dueBy}
      handleChange={props.handleInput}
      placeholder="mm/dd/yyyy"
      disabled={props.clearDueBy}
      child={
        <CheckboxField
          name="clearDueBy"
          label="Clear due by"
          handleChange={props.handleClearDueBy}
          value={props.clearDueBy}
          classes="ms-1 mt-1"
        />
      }
    />
  </React.Fragment>
);

export default ToDo;
