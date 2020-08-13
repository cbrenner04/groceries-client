import React from 'react';
import PropTypes from 'prop-types';

import { TextField, CategoryField, DateField, CheckboxField, SelectField } from '../../../../components/FormFields';

const ToDoFormFields = (props) => (
  <>
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
    <CategoryField category={props.category} categories={props.categories} handleInput={props.inputChangeHandler} />
    {props.editForm && (
      <CheckboxField
        name="completed"
        label="Completed"
        value={props.completed}
        handleChange={props.inputChangeHandler}
        classes="mb-3"
      />
    )}
  </>
);

ToDoFormFields.propTypes = {
  task: PropTypes.string.isRequired,
  assigneeId: PropTypes.string.isRequired,
  dueBy: PropTypes.string.isRequired,
  completed: PropTypes.bool,
  listUsers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number,
      email: PropTypes.string,
    }),
  ).isRequired,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  inputChangeHandler: PropTypes.func.isRequired,
};

ToDoFormFields.defaultProps = {
  completed: false,
  editForm: false,
  category: '',
  categories: [],
};

export default ToDoFormFields;
