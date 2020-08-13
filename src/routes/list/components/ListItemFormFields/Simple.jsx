import React from 'react';
import PropTypes from 'prop-types';

import { TextField, CategoryField, CheckboxField } from '../../../../components/FormFields';

const SimpleFormFields = (props) => (
  <>
    <TextField
      name="content"
      label="Content"
      value={props.content}
      handleChange={props.inputChangeHandler}
      placeholder="Something cool"
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

SimpleFormFields.propTypes = {
  content: PropTypes.string.isRequired,
  completed: PropTypes.bool,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  inputChangeHandler: PropTypes.func.isRequired,
};

SimpleFormFields.defaultProps = {
  completed: false,
  editForm: false,
  category: '',
  categories: [],
};

export default SimpleFormFields;
