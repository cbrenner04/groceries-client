import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Grocery, { type IGroceryProps } from './Grocery';

interface ISetupReturn extends RenderResult {
  props: IGroceryProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IGroceryProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    quantity: 'foo',
    clearQuantity: false,
    handleClearQuantity: jest.fn(),
    handleInput: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Grocery {...props} />);

  return { ...component, props, user };
}

describe('Grocery', () => {
  it('renders quantity input enabled when clearQuantity is false', async () => {
    const { container, findByLabelText } = setup({ clearQuantity: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Quantity')).toBeEnabled();
  });

  it('renders quantity input disabled when clearQuantity is true', async () => {
    const { container, findByLabelText } = setup({ clearQuantity: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Quantity')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    const { findByLabelText, findByRole, props, user } = setup({ clearQuantity: false });

    await user.type(await findByLabelText('Quantity'), '1');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click(await findByRole('checkbox'));

    expect(props.handleClearQuantity).toHaveBeenCalled();
  });
});
