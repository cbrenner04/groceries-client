import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Grocery from './Grocery';

function setup(suppliedProps: { editForm: boolean }) {
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
  const { container, findByLabelText, queryByLabelText } = render(<Grocery {...props} />);

  return { container, findByLabelText, queryByLabelText, props, user };
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
