import React from 'react';
import PropTypes from 'prop-types';

import {
  TextField,
  CategoryField,
  DateField,
  CheckboxField,
  SelectField,
} from '../../../components/FormFields';

const EditToDoListItemFormFields = props => (
  <div>
    <TextField
      name="task"
      label="Task"
      value={props.task}
      handleChange={props.taskChangeHandler}
      placeholder="Clean the toilets"
    />
    <SelectField
      name="assignee"
      label="Assignee"
      value={props.assigneeId}
      handleChange={props.assigneeIdChangeHandler}
      options={props.listUsers.map(user => ({ value: String(user.id), label: user.email }))}
      blankOption
    />
    <DateField
      name="due-by"
      label="Due By"
      value={props.dueBy}
      handleChange={props.dueByChangeHandler}
      placeholder="mm/dd/yyyy"
    />
    <CategoryField category={props.category} categories={props.categories} handleInput={props.categoryChangeHandler} />
    {
      props.editForm && (
        <CheckboxField
          name="completed"
          label="Completed"
          value={props.completed}
          handleChange={props.completedChangeHandler}
          classes="mb-3"
        />
      )
    }
  </div>
);

EditToDoListItemFormFields.propTypes = {
  task: PropTypes.string.isRequired,
  taskChangeHandler: PropTypes.func.isRequired,
  assigneeId: PropTypes.string.isRequired,
  assigneeIdChangeHandler: PropTypes.func.isRequired,
  dueBy: PropTypes.string.isRequired,
  dueByChangeHandler: PropTypes.func.isRequired,
  completed: PropTypes.bool,
  completedChangeHandler: PropTypes.func,
  listUsers: PropTypes.arrayOf(PropTypes.shape({
    id: PropTypes.number,
    email: PropTypes.string,
  })).isRequired,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categoryChangeHandler: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
};

EditToDoListItemFormFields.defaultProps = {
  completed: false,
  editForm: false,
  category: '',
  categories: [],
  completedChangeHandler: () => {},
};

export default EditToDoListItemFormFields;
