import React, { type ChangeEventHandler } from 'react';

import { CheckboxField, TextField } from 'components/FormFields';

export interface IGroceryProps {
  quantity: string;
  clearQuantity: boolean;
  handleClearQuantity: ChangeEventHandler;
  handleInput: ChangeEventHandler;
}

const Grocery: React.FC<IGroceryProps> = (props): React.JSX.Element => (
  <TextField
    name="quantity"
    label="Quantity"
    value={props.quantity}
    handleChange={props.handleInput}
    placeholder="3 bags"
    disabled={props.clearQuantity}
    child={
      <CheckboxField
        name="clearQuantity"
        label="Clear quantity"
        handleChange={props.handleClearQuantity}
        value={props.clearQuantity}
        classes="ms-1 mt-1"
      />
    }
  />
);

export default Grocery;
