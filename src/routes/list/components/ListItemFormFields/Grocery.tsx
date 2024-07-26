import type { ChangeEventHandler } from 'react';
import React from 'react';

import { CategoryField, TextField, CheckboxField } from '../../../../components/FormFields';

interface IGroceryFormFieldsProps {
  product: string;
  quantity: string;
  purchased?: boolean;
  editForm?: boolean;
  category?: string;
  categories?: string[];
  inputChangeHandler: ChangeEventHandler;
}
const GroceryFormFields: React.FC<IGroceryFormFieldsProps> = (props) => (
  <>
    <TextField
      name="product"
      label="Product"
      value={props.product}
      handleChange={props.inputChangeHandler}
      placeholder="apples"
    />
    <TextField
      name="quantity"
      label="Quantity"
      value={props.quantity}
      handleChange={props.inputChangeHandler}
      placeholder="3 bags"
    />
    <CategoryField
      category={props.category ?? ''}
      categories={props.categories ?? []}
      handleInput={props.inputChangeHandler}
    />
    {props.editForm && (
      <CheckboxField
        name="purchased"
        label="Purchased"
        value={props.purchased ?? false}
        handleChange={props.inputChangeHandler}
        classes="mb-3"
      />
    )}
  </>
);

export default GroceryFormFields;
