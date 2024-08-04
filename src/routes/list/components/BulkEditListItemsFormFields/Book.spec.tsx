import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Book, { type IBookProps } from './Book';

interface ISetupReturn extends RenderResult {
  props: IBookProps;
  user: UserEvent;
}

function setup(suppliedProps: Partial<IBookProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = { author: 'foo', clearAuthor: false, handleClearAuthor: jest.fn(), handleInput: jest.fn() };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Book {...props} />);

  return { ...component, props, user };
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
