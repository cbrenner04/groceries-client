import React from 'react';
import PropTypes from 'prop-types';
import { Form } from 'react-bootstrap';

import { CategoryField, TextField, NumberField, CheckboxField } from '../../../../components/FormFields';

const BookListItemFormFields = (props) => (
  <>
    <TextField
      name="author"
      label="Author"
      value={props.author}
      handleChange={props.inputChangeHandler}
      placeholder="Kurt Vonnagut"
    />
    <TextField
      name="title"
      label="Title"
      value={props.title}
      handleChange={props.inputChangeHandler}
      placeholder="Slaughterhouse-Five"
    />
    <NumberField
      name="numberInSeries"
      label="Number in series"
      value={props.numberInSeries}
      handleChange={props.inputChangeHandler}
    />
    <CategoryField category={props.category} categories={props.categories} handleInput={props.inputChangeHandler} />
    {props.editForm && (
      <Form.Row className="mb-3">
        <CheckboxField
          name="purchased"
          label="Purchased"
          value={props.purchased}
          handleChange={props.inputChangeHandler}
          classes="form-check-inline ml-1"
        />
        <CheckboxField
          name="read"
          label="Read"
          value={props.read}
          handleChange={props.inputChangeHandler}
          classes="form-check-inline"
        />
      </Form.Row>
    )}
  </>
);

BookListItemFormFields.propTypes = {
  author: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  purchased: PropTypes.bool,
  read: PropTypes.bool,
  editForm: PropTypes.bool,
  numberInSeries: PropTypes.number,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  inputChangeHandler: PropTypes.func.isRequired,
};

BookListItemFormFields.defaultProps = {
  purchased: false,
  read: false,
  editForm: false,
  numberInSeries: 0,
  category: '',
  categories: [],
};

export default BookListItemFormFields;