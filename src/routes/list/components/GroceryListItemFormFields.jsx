import React from 'react';
import PropTypes from 'prop-types';

import {
  CategoryField,
  TextField,
  CheckboxField,
} from '../../../components/FormFields';

const GroceryListItemFormFields = props => (
  <div>
    <TextField
      name="product"
      label="Product"
      value={props.product}
      handleChange={props.productChangeHandler}
      placeholder="apples"
    />
    <TextField
      name="quantity"
      label="Quantity"
      value={props.quantity}
      handleChange={props.quantityChangeHandler}
      placeholder="3 bags"
    />
    <CategoryField category={props.category} categories={props.categories} handleInput={props.categoryChangeHandler} />
    {
      props.editForm && (
        <CheckboxField
          name="purchased"
          label="Purchased"
          value={props.purchased}
          handleChange={props.purchasedChangeHandler}
          classes="mb-3"
        />
      )
    }
  </div>
);

GroceryListItemFormFields.propTypes = {
  product: PropTypes.string.isRequired,
  productChangeHandler: PropTypes.func.isRequired,
  quantity: PropTypes.string.isRequired,
  quantityChangeHandler: PropTypes.func.isRequired,
  purchased: PropTypes.bool,
  purchasedChangeHandler: PropTypes.func,
  editForm: PropTypes.bool,
  category: PropTypes.string,
  categoryChangeHandler: PropTypes.func.isRequired,
  categories: PropTypes.arrayOf(PropTypes.string),
};

GroceryListItemFormFields.defaultProps = {
  purchased: false,
  editForm: false,
  category: '',
  categories: [],
  purchasedChangeHandler: () => {},
};

export default GroceryListItemFormFields;
