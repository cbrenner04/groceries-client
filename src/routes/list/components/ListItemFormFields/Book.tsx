import React, { type ChangeEventHandler } from 'react';
import { Row } from 'react-bootstrap';

import { CategoryField, TextField, NumberField, CheckboxField } from 'components/FormFields';

export interface IBookFormFieldsProps {
  author: string;
  title: string;
  purchased?: boolean;
  read?: boolean;
  editForm?: boolean;
  numberInSeries?: number;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}

const BookFormFields: React.FC<IBookFormFieldsProps> = ({
  author,
  title,
  purchased = false,
  read = false,
  editForm = false,
  numberInSeries = 0,
  categories = [],
  category = '',
  inputChangeHandler,
}) => (
  <React.Fragment>
    <TextField
      name="author"
      label="Author"
      value={author}
      handleChange={inputChangeHandler}
      placeholder="Kurt Vonnagut"
    />
    <TextField
      name="title"
      label="Title"
      value={title}
      handleChange={inputChangeHandler}
      placeholder="Slaughterhouse-Five"
    />
    <NumberField
      name="numberInSeries"
      label="Number in series"
      value={numberInSeries}
      handleChange={inputChangeHandler}
    />
    <CategoryField category={category} categories={categories} handleInput={inputChangeHandler} />
    {editForm && (
      <Row className="mb-3">
        <CheckboxField
          name="purchased"
          label="Purchased"
          value={purchased}
          handleChange={inputChangeHandler}
          classes="form-check-inline ms-1"
        />
        <CheckboxField
          name="read"
          label="Read"
          value={read}
          handleChange={inputChangeHandler}
          classes="form-check-inline"
        />
      </Row>
    )}
  </React.Fragment>
);

export default BookFormFields;
