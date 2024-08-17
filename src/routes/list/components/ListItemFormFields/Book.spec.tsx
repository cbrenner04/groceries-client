import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import Book, { type IBookFormFieldsProps } from './Book';

interface ISetupReturn extends RenderResult {
  props: IBookFormFieldsProps;
  user: UserEvent;
}

function setup(suppliedProps?: Partial<IBookFormFieldsProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    author: 'asdf',
    inputChangeHandler: jest.fn(),
    title: 'asdf',
    number_in_series: 1,
    category: 'asdf',
    categories: ['asdf'],
    purchased: false,
    read: false,
    editForm: false,
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<Book {...props} />);

  return { ...component, props, user };
}

describe('Book', () => {
  it('renders base form when props.editForm is false', () => {
    const { container, queryByLabelText } = setup({ editForm: false });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeNull();
    expect(queryByLabelText('Read')).toBeNull();
  });

  it('renders edit form when props.editForm is true', async () => {
    const { container, findByLabelText } = setup({ editForm: true });

    expect(container).toMatchSnapshot();
    expect(await findByLabelText('Purchased')).toBeVisible();
    expect(await findByLabelText('Read')).toBeVisible();
  });

  it('renders with defaults', async () => {
    const { container, findByLabelText, findByTestId, queryByLabelText } = setup({
      purchased: undefined,
      read: undefined,
      editForm: undefined,
      numberInSeries: undefined,
      categories: undefined,
      category: undefined,
    });

    expect(container).toMatchSnapshot();
    expect(queryByLabelText('Purchased')).toBeNull();
    expect(queryByLabelText('Read')).toBeNull();
    expect(await findByLabelText('Number in series')).toHaveValue(null);
    expect(await findByLabelText('Category')).toHaveValue('');
    expect((await findByTestId('categories')).firstChild).toBeNull();
  });

  it('calls appropriate change handlers when changes occur', async () => {
    const { findByLabelText, props, user } = setup({ editForm: true });

    await user.type(await findByLabelText('Author'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(1);

    await user.type(await findByLabelText('Title'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(2);

    await user.type(await findByLabelText('Number in series'), '1');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(3);

    await user.type(await findByLabelText('Category'), 'a');

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(4);

    await user.click(await findByLabelText('Purchased'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(5);

    await user.click(await findByLabelText('Read'));

    expect(props.inputChangeHandler).toHaveBeenCalledTimes(6);
  });
});
