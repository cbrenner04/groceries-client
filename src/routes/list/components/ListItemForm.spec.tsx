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
    const { container, findByTestId, findByText, user } = setup({ listUsers: undefined, categories: undefined });

    await user.click(await findByText('Add Item'));
    expect(container).toMatchSnapshot();
    expect((await findByTestId('categories')).firstChild).toBeNull();
  });

  it('expands form', async () => {
    const { findByTestId, findByText, user } = setup();

    await user.click(await findByText('Add Item'));

    expect(await findByTestId('list-item-form')).toBeInTheDocument();
  });

  it('collapses form', async () => {
    const { findByTestId, findByText, user } = setup();

    await user.click(await findByText('Add Item'));
    expect(await findByTestId('list-item-form')).toBeInTheDocument();

    await user.click(await findByText('Collapse Form'));

    expect(await findByText('Add Item')).toBeInTheDocument();
  });

  it('calls handleItemAddition, fires toast, and clears form data on successful submission', async () => {
    const data = {
      foo: 'bar',
    };
    axios.post = jest.fn().mockResolvedValue({ data });
    const { getByLabelText, props, user, findByText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(props.handleItemAddition).toHaveBeenCalledWith(data);
    expect(toast).toHaveBeenCalledWith('Item successfully added.', { type: 'info' });
    expect(getByLabelText('Product')).toHaveValue('');
    expect(getByLabelText('Quantity')).toHaveValue('');
    expect(getByLabelText('Category')).toHaveValue('');
  });

  it('disables submit button when form has been submitted', async () => {
    axios.post = jest.fn().mockImplementation(() => new Promise((resolve, reject) => undefined));
    const { user, findByText, getByLabelText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(getByText('Add New Item')).toBeDisabled();
  });

  it('redirects to user login when 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { props, user, findByText, getByLabelText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists page when 403', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { props, user, findByText, getByLabelText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to lists page when 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { props, user, findByText, getByLabelText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
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
    const { user, findByText, getByLabelText, getByText } = setup({ listType: EListType.BOOK_LIST });

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Author'), 'foo');
    await user.type(getByLabelText('Title'), 'foo');
    await user.type(getByLabelText('Number in series'), '2');
    await user.type(getByLabelText('Category'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
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
    const { user, findByText, getByLabelText, getByText } = setup({ listType: EListType.GROCERY_LIST });

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
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
    const { user, findByText, getByLabelText, getByText } = setup({ listType: EListType.MUSIC_LIST });

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Title'), 'foo');
    await user.type(getByLabelText('Artist'), 'foo');
    await user.type(getByLabelText('Album'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
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
    const { user, findByText, getByLabelText, getByText } = setup({ listType: EListType.TO_DO_LIST });

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Task'), 'foo');
    await user.type(getByLabelText('Assignee'), 'foo');
    await user.type(getByLabelText('Due By'), '2023-01-01');
    await user.type(getByLabelText('Category'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { user, findByText, getByLabelText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'request failed' });
    const { user, findByText, getByLabelText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    await user.type(getByLabelText('Category'), 'foo');
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('sets value for number_in_series as a number when input', async () => {
    const { findByLabelText, user, findByText, getByLabelText, getByText } = setup({
      listType: EListType.BOOK_LIST,
    });

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Author'), 'foo');
    await user.type(getByLabelText('Title'), 'foo');
    await user.type(await findByLabelText('Number in series'), '2');
    await user.type(getByLabelText('Category'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
  });

  it('handles submission with undefined category', async () => {
    const data = {
      foo: 'bar',
    };
    axios.post = jest.fn().mockResolvedValue({ data });
    const { getByLabelText, props, user, findByText, getByText } = setup();

    await user.click(await findByText('Add Item'));
    await user.type(getByLabelText('Product'), 'foo');
    // Don't fill in category field - leave it undefined
    await user.type(getByLabelText('Quantity'), 'foo');
    await user.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    expect(props.handleItemAddition).toHaveBeenCalledWith(data);
    expect(toast).toHaveBeenCalledWith('Item successfully added.', { type: 'info' });
  });
});
