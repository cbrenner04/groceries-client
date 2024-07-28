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

const ToDo: React.FC<IToDoProps> = ({
  assigneeId,
  clearAssignee,
  handleClearAssignee,
  dueBy,
  clearDueBy,
  handleClearDueBy,
  handleInput,
  listUsers,
}): React.JSX.Element => (
  <React.Fragment>
    <SelectField
      name="assigneeId"
      label="Assignee"
      value={assigneeId}
      handleChange={handleInput}
      options={listUsers.map((user) => ({ value: String(user.id), label: user.email }))}
      blankOption
      disabled={clearAssignee}
      child={
        <CheckboxField
          name="clearAssignee"
          label="Clear assignee"
          handleChange={handleClearAssignee}
          value={clearAssignee}
          classes="ms-1 mt-1"
        />
      }
    />
    <DateField
      name="due_by"
      label="Due By"
      value={dueBy}
      handleChange={handleInput}
      placeholder="mm/dd/yyyy"
      disabled={clearDueBy}
      child={
        <CheckboxField
          name="clearDueBy"
          label="Clear due by"
          handleChange={handleClearDueBy}
          value={clearDueBy}
          classes="ms-1 mt-1"
        />
      }
    />
  </React.Fragment>
);

export default ToDo;
