import React from 'react';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Music from './Music';

function setup(suppliedProps: { editForm: boolean }) {
  const user = userEvent.setup();
  const defaultProps = {
    title: 'foo',
    artist: 'bar',
    album: 'baz',
    purchased: false,
    editForm: false,
    category: 'foo',
    categories: ['foo', 'bar'],
    inputChangeHandler: jest.fn(),
  };
  const props = { ...defaultProps, ...suppliedProps };
  const { container, findByLabelText, queryByLabelText } = render(<Music {...props} />);

  return { container, findByLabelText, queryByLabelText, props, user };
}

describe('Music', () => {
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

    await user.type(await findByLabelText('Title'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(1);

    await user.type(await findByLabelText('Artist'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(2);

    await user.type(await findByLabelText('Album'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(3);

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(4);

    await user.click(await findByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(5);
  });
});
