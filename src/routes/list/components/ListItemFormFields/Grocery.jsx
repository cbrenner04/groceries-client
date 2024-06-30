import React from 'react';
import PropTypes from 'prop-types';

import { CategoryField, TextField, CheckboxField } from '../../../../components/FormFields';

const GroceryFormFields = (props) => (
  <>
    <TextField
      name="product"
      label="Product"
      value={props.product}
      handleChange={props.inputChangeHandler}
      placeholder="apples"
      disabled={false}
      showClear={false}
      clear={false}
      handleClear={() => undefined}
    />
    <TextField
      name="quantity"
      label="Quantity"
      value={props.quantity}
      handleChange={props.inputChangeHandler}
      placeholder="3 bags"
      disabled={false}
      showClear={false}
      clear={false}
      handleClear={() => undefined}
    />
    <CategoryField
      category={props.category || ''}
      categories={props.categories || []}
      handleInput={props.inputChangeHandler}
      showClearCategory={false}
      clearCategory={false}
      handleClearCategory={() => undefined}
      disabled={false}
    />
    {props.editForm && (
      <CheckboxField
        name="purchased"
        label="Purchased"
        value={props.purchased || false}
        handleChange={props.inputChangeHandler}
        classes="mb-3"
      />
    )}
  </>
);

GroceryFormFields.propTypes = {
  product: PropTypes.string.isRequired,
  quantity: PropTypes.string.isRequired,
  purchased: PropTypes.bool,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categories: PropTypes.arrayOf(PropTypes.string),
  inputChangeHandler: PropTypes.func.isRequired,
};

export default GroceryFormFields;
