import React from 'react';
import PropTypes from 'prop-types';

import {
  CategoryField,
  TextField,
  NumberField,
  CheckboxField,
} from '../../../components/FormFields';

const BookListItemFormFields = props => (
  <div>
    <TextField
      name="author"
      label="Author"
      value={props.author}
      handleChange={props.authorChangeHandler}
      placeholder="Kurt Vonnagut"
    />
    <TextField
      name="title"
      label="Title"
      value={props.title}
      handleChange={props.titleChangeHandler}
      placeholder="Slaughterhouse-Five"
    />
    <NumberField
      name="number-in-series"
      label="Number in series"
      value={props.numberInSeries}
      handleChange={props.numberInSeriesChangeHandler}
    />
    <CategoryField category={props.category} categories={props.categories} handleInput={props.categoryChangeHandler} />
    {
      props.editForm && (
        <div className="form-row mb-3">
          <CheckboxField
            name="purchased"
            label="Purchased"
            value={props.purchased}
            handleChange={props.purchasedChangeHandler}
            classes="form-check-inline ml-1"
          />
          <CheckboxField
            name="read"
            label="Read"
            value={props.read}
            handleChange={props.readChangeHandler}
            classes="form-check-inline"
          />
        </div>
      )
    }
  </div>
);

BookListItemFormFields.propTypes = {
  author: PropTypes.string.isRequired,
  authorChangeHandler: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  titleChangeHandler: PropTypes.func.isRequired,
  purchased: PropTypes.bool,
  purchasedChangeHandler: PropTypes.func,
  read: PropTypes.bool,
  readChangeHandler: PropTypes.func,
  editForm: PropTypes.bool,
  numberInSeries: PropTypes.number,
  numberInSeriesChangeHandler: PropTypes.func.isRequired,
  category: PropTypes.string,
  categoryChangeHandler: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
};

BookListItemFormFields.defaultProps = {
  purchased: false,
  read: false,
  editForm: false,
  numberInSeries: 0,
  category: '',
  categories: [],
  purchasedChangeHandler: () => {},
  readChangeHandler: () => {},
};

export default BookListItemFormFields;
