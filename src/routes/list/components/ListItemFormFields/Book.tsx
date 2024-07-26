import type { ChangeEventHandler } from 'react';
import React from 'react';
import { Row } from 'react-bootstrap';

import { CategoryField, TextField, NumberField, CheckboxField } from '../../../../components/FormFields';

interface IBookFormFieldsProps {
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

const BookFormFields: React.FC<IBookFormFieldsProps> = (props) => (
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
      value={props.numberInSeries ?? 0}
      handleChange={props.inputChangeHandler}
    />
    <CategoryField
      category={props.category ?? ''}
      categories={props.categories ?? []}
      handleInput={props.inputChangeHandler}
    />
    {props.editForm && (
      <Row className="mb-3">
        <CheckboxField
          name="purchased"
          label="Purchased"
          value={props.purchased ?? false}
          handleChange={props.inputChangeHandler}
          classes="form-check-inline ms-1"
        />
        <CheckboxField
          name="read"
          label="Read"
          value={props.read ?? false}
          handleChange={props.inputChangeHandler}
          classes="form-check-inline"
        />
      </Row>
    )}
  </>
);

export default BookFormFields;
