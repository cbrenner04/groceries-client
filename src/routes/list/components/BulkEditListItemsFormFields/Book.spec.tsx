import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Book from './Book';

function setup(suppliedProps) {
  const user = userEvent.setup();
  const defaultProps = { author: 'foo', clearAuthor: false, handleClearAuthor: jest.fn(), handleInput: jest.fn() };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findByLabelText, findByRole } = render(<Book {...props} />);

  return { container, findByLabelText, findByRole, props, user };
}

describe('Book', () => {
  it('renders author input enabled when clearAuthor is false', async () => {
    const { container, findByLabelText } = setup({ clearAuthor: false });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Author')).toBeEnabled();
  });

  it('renders author input disabled when clearAuthor is true', async () => {
    const { container, findByLabelText } = setup({ clearAuthor: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Author')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    const { findByLabelText, findByRole, props, user } = setup({ clearAuthor: false });

    await user.type(await findByLabelText('Author'), 'a');

    expect(props.handleInput).toHaveBeenCalled();

    await user.click(await findByRole('checkbox'));

    expect(props.handleClearAuthor).toHaveBeenCalled();
  });
});
