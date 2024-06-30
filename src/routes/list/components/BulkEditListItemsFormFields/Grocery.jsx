import React from 'react';
import PropTypes from 'prop-types';

import { TextField } from '../../../../components/FormFields';

const Grocery = ({ quantity, clearQuantity, handleClearQuantity, handleInput }) => (
  <TextField
    name="quantity"
    label="Quantity"
    value={quantity}
    handleChange={handleInput}
    placeholder="3 bags"
    disabled={clearQuantity}
    showClear={true}
    handleClear={handleClearQuantity}
    clear={clearQuantity}
  />
);

Grocery.propTypes = {
  quantity: PropTypes.string.isRequired,
  clearQuantity: PropTypes.bool.isRequired,
  handleClearQuantity: PropTypes.func.isRequired,
  handleInput: PropTypes.func.isRequired,
};

export default Grocery;
