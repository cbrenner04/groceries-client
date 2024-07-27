import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { EListType } from 'typings';

import ListItemForm, { type IListItemFormProps } from './ListItemForm';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IListItemFormProps;
}

function setup(suppliedProps?: Partial<IListItemFormProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    navigate: jest.fn(),
    userId: 'id1',
    listId: 'id1',
    listType: EListType.GROCERY_LIST,
    listUsers: [
      {
        id: 'id1',
        email: 'foo@example.com',
      },
    ],
    handleItemAddition: jest.fn(),
    categories: ['foo'],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<ListItemForm {...props} />);

  return { ...component, props, user };
}

describe('ListItemForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('rendes with default values for categories and list users', async () => {
    const { container, findByTestId } = setup({ listUsers: undefined, categories: undefined });

    expect(container).toMatchSnapshot();
    expect((await findByTestId('categories')).firstChild).toBeNull();
  });

  it('expands form', async () => {
    const { findByTestId, findByText, user } = setup();

    await user.click(await findByText('Add Item'));

    await waitFor(async () => expect(await findByTestId('list-item-form')).toHaveClass('show'));
  });

  it('collapses form', async () => {
    const { findByTestId, findByText, user } = setup();

    await user.click(await findByText('Add Item'));

    await waitFor(async () => expect(await findByTestId('list-item-form')).toHaveClass('show'));

    await user.click(await findByText('Collapse Form'));

    await waitFor(async () => expect(await findByTestId('list-item-form')).toHaveClass('collapse'));
  });

  it('calls handleItemAddition and fires toast on successful submission', async () => {
    const data = {
      foo: 'bar',
    };
    axios.post = jest.fn().mockResolvedValue({ data });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(props.handleItemAddition).toHaveBeenCalledWith(data);
    expect(toast).toHaveBeenCalledWith('Item successfully added.', { type: 'info' });
  });

  it('disables submit button when form has been submitted', async () => {
    // post is not resolved so that the pending state will remain after calling post
    axios.post = jest.fn();
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect((await findAllByRole('button'))[1]).toBeDisabled();
  });

  it('redirects to user login when 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists page when 403', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to lists page when 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/lists');
  });

  it('displays appropriate error message when listType is BookList', async () => {
    axios.post = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    const { findAllByRole, user } = setup({ listType: EListType.BOOK_LIST });

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('foo bar or baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when listType is GroceryList', async () => {
    axios.post = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    const { findAllByRole, user } = setup({ listType: EListType.GROCERY_LIST });

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when listType is MusicList', async () => {
    axios.post = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    const { findAllByRole, user } = setup({ listType: EListType.MUSIC_LIST });

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('foo bar or baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when listType is ToDoList', async () => {
    axios.post = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    const { findAllByRole, user } = setup({ listType: EListType.TO_DO_LIST });

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.post = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    const { findAllByRole, user } = setup({ listType: EListType.TO_DO_LIST });

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.post = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    const { findAllByRole, user } = setup({ listType: EListType.TO_DO_LIST });

    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('sets value for numberInSeries as a number when input', async () => {
    const { findByLabelText, findAllByRole, user } = setup({ listType: EListType.BOOK_LIST });

    await user.type(await findByLabelText('Number in series'), '2');
    await user.click((await findAllByRole('button'))[1]);

    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith('/lists/id1/list_items', {
      list_item: expect.objectContaining({ number_in_series: 2 }),
    });
  });
});
