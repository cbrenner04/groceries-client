import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Grocery, { type IGroceryFormFieldsProps } from './Grocery';

interface ISetupReturn extends RenderResult {
  props: IGroceryFormFieldsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IGroceryFormFieldsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    product: 'foo',
    quantity: '2 bar',
    purchased: false,
    editForm: false,
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Grocery {...props} />);

  return { ...component, props, user };
}

describe('Grocery', () => {
  it('renders base form when props.editForm is false', () => {
    const { container, queryByLabelText } = setup({ editForm: false });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeNull();
  });

  it('renders edit form when props.editForm is true', async () => {
    const { container, findByLabelText } = setup({ editForm: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Purchased')).toBeVisible();
  });

  it('calls appropriate change handlers when changes occur', async () => {
    const { findByLabelText, props, user } = setup({ editForm: true });

    await user.type(await findByLabelText('Product'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(1);

    await user.type(await findByLabelText('Quantity'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(2);

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(3);

    await user.click(await findByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(4);
  });
});
