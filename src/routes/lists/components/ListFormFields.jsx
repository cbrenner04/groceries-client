import React from 'react';
import PropTypes from 'prop-types';

import { CheckboxField, SelectField, TextField } from '../../../components/FormFields';

function ListFormFields(props) {
  return (
    <>
      <TextField
        name="name"
        label="Name"
        value={props.name}
        handleChange={props.handleNameChange}
        placeholder="My super cool list"
      />
      <SelectField
        name="type"
        label="Type"
        value={props.type}
        handleChange={props.handleTypeChange}
        options={[
          { value: 'BookList', label: 'books' },
          { value: 'GroceryList', label: 'groceries' },
          { value: 'MusicList', label: 'music' },
          { value: 'SimpleList', label: 'simple' },
          { value: 'ToDoList', label: 'to-do' },
        ]}
        blankOption={false}
      />
      {props.editForm && (
        <CheckboxField
          name="completed"
          label="Completed"
          value={props.completed || false}
          handleChange={props.handleCompletedChange || (() => undefined)}
          blankOption={false}
          classes="mb-3"
        />
      )}
    </>
  );
}

ListFormFields.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.string.isRequired,
  completed: PropTypes.bool,
  handleNameChange: PropTypes.func.isRequired,
  handleTypeChange: PropTypes.func.isRequired,
  handleCompletedChange: PropTypes.func,
  editForm: PropTypes.bool,
};

export default ListFormFields;
