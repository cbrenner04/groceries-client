import React, { type ChangeEventHandler } from 'react';
import { Row } from 'react-bootstrap';

import { CategoryField, TextField, NumberField, CheckboxField } from 'components/FormFields';

export interface IBookFormFieldsProps {
  author: string;
  title: string;
  purchased: boolean;
  read: boolean;
  editForm: boolean;
  numberInSeries?: number;
  category: string;
  categories: string[];
  inputChangeHandler: ChangeEventHandler;
}

const BookFormFields: React.FC<IBookFormFieldsProps> = (props): React.JSX.Element => (
  <React.Fragment>
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
      name="number_in_series"
      label="Number in series"
      value={props.numberInSeries ?? 0}
      handleChange={props.inputChangeHandler}
    />
    <CategoryField category={props.category} categories={props.categories} handleInput={props.inputChangeHandler} />
    {props.editForm && (
      <Row className="mb-3">
        <CheckboxField
          name="purchased"
          label="Purchased"
          value={props.purchased}
          handleChange={props.inputChangeHandler}
          classes="form-check-inline ms-1"
        />
        <CheckboxField
          name="read"
          label="Read"
          value={props.read}
          handleChange={props.inputChangeHandler}
          classes="form-check-inline"
        />
      </Row>
    )}
  </React.Fragment>
);

export default BookFormFields;
