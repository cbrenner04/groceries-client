import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Simple from './Simple';

function setup(suppliedProps: { editForm: boolean }) {
  const user = userEvent.setup();
  const defaultProps = {
    content: 'foo',
    completed: false,
    editForm: false,
    listUsers: [
      {
        id: 1,
        email: 'foo@example.com',
      },
    ],
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findByLabelText, queryByLabelText } = render(<Simple {...props} />);

  return { container, findByLabelText, queryByLabelText, props, user };
}

describe('Simple', () => {
  it('renders base form when props.editForm is false', () => {
    const { container, queryByLabelText } = setup({ editForm: false });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Completed')).toBeNull();
  });

  it('renders edit form when props.editForm is true', async () => {
    const { container, findByLabelText } = setup({ editForm: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Completed')).toBeVisible();
  });

  it('calls appropriate change handlers when changes occur', async () => {
    const { findByLabelText, props, user } = setup({ editForm: true });

    await user.type(await findByLabelText('Content'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(1);

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(2);

    await user.click(await findByLabelText('Completed'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(3);
  });
});
