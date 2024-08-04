import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Music, { type IMusicFormFieldsProps } from './Music';

interface ISetupReturn extends RenderResult {
  props: IMusicFormFieldsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IMusicFormFieldsProps>): ISetupReturn {
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
  const component = render(<Music {...props} />);

  return { ...component, props, user };
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

  it('renders with defaults', async () => {
    const { container, findByLabelText, findByTestId, queryByLabelText } = setup({
      title: 'foo',
      artist: 'bar',
      album: 'baz',
      purchased: undefined,
      editForm: undefined,
      category: undefined,
      categories: undefined,
      inputChangeHandler: jest.fn(),
    });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeNull();
    expect(await findByLabelText('Category')).toHaveValue('');
    expect((await findByTestId('categories')).firstChild).toBeNull();
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
