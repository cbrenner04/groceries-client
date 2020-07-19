import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Book from './Book';

describe('Book', () => {
  const props = { author: 'foo', clearAuthor: false, handleClearAuthor: jest.fn(), handleInput: jest.fn() };

  it('renders author input enabled when clearAuthor is false', () => {
    props.clearAuthor = false;
    const { container, getByLabelText } = render(<Book {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Author')).toBeEnabled();
  });

  it('renders author input disabled when clearAuthor is true', () => {
    props.clearAuthor = true;
    const { container, getByLabelText } = render(<Book {...props} />);

    expect(container).toMatchSnapshot();
    expect(getByLabelText('Author')).toBeDisabled();
  });

  it('handles change in input and checkbox', async () => {
    props.clearAuthor = false;
    const { getByLabelText, getByRole } = render(<Book {...props} />);

    fireEvent.change(getByLabelText('Author'), { target: { value: 'a' } });

    expect(props.handleInput).toHaveBeenCalled();

    fireEvent.click(getByRole('checkbox'));

    expect(props.handleClearAuthor).toHaveBeenCalled();
  });
});
