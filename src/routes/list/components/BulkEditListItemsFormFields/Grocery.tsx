import React, { ChangeEventHandler } from 'react';

import { CheckboxField, TextField } from '../../../../components/FormFields';

interface IGroceryProps {
  quantity: string;
  clearQuantity: boolean;
  handleClearQuantity: ChangeEventHandler;
  handleInput: ChangeEventHandler;
}

const Grocery: React.FC<IGroceryProps> = ({ quantity, clearQuantity, handleClearQuantity, handleInput }) => (
  <TextField
    name="quantity"
    label="Quantity"
    value={quantity}
    handleChange={handleInput}
    placeholder="3 bags"
    disabled={clearQuantity}
    child={
      <CheckboxField
        name="clearQuantity"
        label="Clear quantity"
        handleChange={handleClearQuantity}
        value={clearQuantity}
        classes="ms-1 mt-1"
      />
    }
  />
);

export default Grocery;
