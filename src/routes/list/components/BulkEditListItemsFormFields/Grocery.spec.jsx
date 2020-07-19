import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Grocery from './Grocery';

describe('Grocery', () => {
  const props = { quantity: 'foo', clearQuantity: false, handleClearQuantity: jest.fn(), handleInput: jest.fn() };

  it('renders quantity input enabled when clearQuantity is false', () => {
    props.clearQuantity = false;
    const { container, getByLabelText } = render(<Grocery {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Quantity')).toBeEnabled();
  });

  it('renders quantity input disabled when clearQuantity is true', () => {
    props.clearQuantity = true;
    const { container, getByLabelText } = render(<Grocery {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Quantity')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    props.clearQuantity = false;
    const { getByLabelText, getByRole } = render(<Grocery {...props} />);

    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getByRole('checkbox'));

    expect(props.handleClearQuantity).toHaveBeenCalled();
  });
});
