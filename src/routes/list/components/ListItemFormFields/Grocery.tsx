import React, { type ChangeEventHandler } from 'react';

import { CategoryField, TextField, CheckboxField } from 'components/FormFields';

export interface IGroceryFormFieldsProps {
  product: string;
  quantity: string;
  purchased?: boolean;
  editForm?: boolean;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}
const GroceryFormFields: React.FC<IGroceryFormFieldsProps> = ({
  product,
  quantity,
  inputChangeHandler,
  purchased = false,
  editForm = false,
  category = '',
  categories = [],
}) => (
  <React.Fragment>
    <TextField name="product" label="Product" value={product} handleChange={inputChangeHandler} placeholder="apples" />
    <TextField
      name="quantity"
      label="Quantity"
      value={quantity}
      handleChange={inputChangeHandler}
      placeholder="3 bags"
    />
    <CategoryField category={category} categories={categories} handleInput={inputChangeHandler} />
    {editForm && (
      <CheckboxField
        name="purchased"
        label="Purchased"
        value={purchased}
        handleChange={inputChangeHandler}
        classes="mb-3"
      />
    )}
  </React.Fragment>
);

export default GroceryFormFields;
