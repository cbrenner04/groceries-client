import React from 'react';
import PropTypes from 'prop-types';

import { CheckboxField, DateField, SelectField } from '../../../../components/FormFields';
import { listUsers } from '../../../../types';

const ToDo = ({
  assigneeId,
  clearAssignee,
  handleClearAssignee,
  dueBy,
  clearDueBy,
  handleClearDueBy,
  handleInput,
  listUsers,
}) => (
  <>
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
          classes="ml-1 mt-1"
        />
      }
    />
    <DateField
      name="dueBy"
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
          classes="ml-1 mt-1"
        />
      }
    />
  </>
);

ToDo.propTypes = {
  assigneeId: PropTypes.string.isRequired,
  clearAssignee: PropTypes.bool.isRequired,
  handleClearAssignee: PropTypes.func.isRequired,
  dueBy: PropTypes.string.isRequired,
  clearDueBy: PropTypes.bool.isRequired,
  handleClearDueBy: PropTypes.func.isRequired,
  handleInput: PropTypes.func.isRequired,
  listUsers: PropTypes.arrayOf(listUsers).isRequired,
};

export default ToDo;
