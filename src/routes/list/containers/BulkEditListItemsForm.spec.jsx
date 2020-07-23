import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

import BulkEditListItemsForm from './BulkEditListItemsForm';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('BulkEditListItemsForm', () => {
  const props = {
    history: {
      push: jest.fn(),
    },
    items: [
      {
        id: 1,
        product: '',
        task: '',
        purchased: false,
        quantity: 'foo',
        completed: false,
        author: '',
        title: '',
        read: false,
        artist: '',
        dueBy: '',
        assigneeId: '',
        album: '',
        numberInSeries: 1,
        category: '',
      },
      {
        id: 2,
        product: '',
        task: '',
        purchased: false,
        quantity: 'foo',
        completed: false,
        author: '',
        title: '',
        read: false,
        artist: '',
        dueBy: '',
        assigneeId: '',
        album: '',
        numberInSeries: 1,
        category: '',
      },
    ],
    list: {
      id: 1,
      type: 'GroceryList',
    },
    lists: [
      {
        id: 1,
        type: 'GroceryList',
      },
    ],
    categories: ['foo'],
    listUsers: [
      {
        id: 1,
        email: 'foobar@example.com',
      },
    ],
  };

  it('renders', () => {
    const { container } = render(<BulkEditListItemsForm {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('clears new list form when switching from new to existing', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText, getAllByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Copy'));
    fireEvent.click(getAllByRole('button')[0]);

    await waitFor(() => expect(getByLabelText('New list name')).toBeVisible());

    fireEvent.change(getByLabelText('New list name'), { target: { value: 'foo' } });

    await waitFor(() => expect(getByLabelText('New list name')).toHaveValue('foo'));

    fireEvent.click(getAllByRole('button')[0]);

    await waitFor(() => expect(getByLabelText('Existing list')).toBeVisible());

    fireEvent.change(getByLabelText('Existing list'), { target: { value: '1' } });

    await waitFor(() => expect(getByLabelText('Existing list')).toHaveValue('1'));

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.not.objectContaining({ new_list_name: 'foo' }),
    });
  });

  it('clears new list form and hides existing and new list forms when copy is removed', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText, queryByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Copy'));

    await waitFor(() => expect(getByLabelText('Existing list')).toBeVisible());

    fireEvent.change(getByLabelText('Existing list'), { target: { value: '1' } });

    await waitFor(() => expect(getByLabelText('Existing list')).toHaveValue('1'));

    fireEvent.click(getByLabelText('Copy'));

    await waitFor(() => expect(queryByLabelText('Existing list')).toBeNull());

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.not.objectContaining({ existing_list_id: '1' }),
    });
    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.not.objectContaining({ copy: true }),
    });
  });

  it('switches move to false when copy is selected after move', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Move'));

    await waitFor(() => expect(getByLabelText('Existing list')).toBeVisible());

    fireEvent.change(getByLabelText('Existing list'), { target: { value: '1' } });

    await waitFor(() => expect(getByLabelText('Existing list')).toHaveValue('1'));

    fireEvent.click(getByLabelText('Copy'));

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.not.objectContaining({ move: expect.any(Boolean) }),
    });
    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.objectContaining({ copy: true, existing_list_id: '1' }),
    });
  });

  it('clears attribute when the clear checkbox is selected and attribute has value', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'bar' } });

    await waitFor(() => expect(getByLabelText('Quantity')).toHaveValue('bar'));

    fireEvent.click(getByLabelText('Clear quantity'));

    await waitFor(() => expect(getByLabelText('Quantity')).toHaveValue(''));

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.objectContaining({ quantity: null, clear_quantity: true }),
    });
  });

  it('sets attribute to initial value when clear is selected a second time', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'bar' } });

    await waitFor(() => expect(getByLabelText('Quantity')).toHaveValue('bar'));

    fireEvent.click(getByLabelText('Clear quantity'));

    await waitFor(() => expect(getByLabelText('Quantity')).toHaveValue(''));

    fireEvent.click(getByLabelText('Clear quantity'));

    await waitFor(() => expect(getByLabelText('Quantity')).toHaveValue('foo'));

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.objectContaining({ quantity: 'foo', clear_quantity: false }),
    });
  });

  it('displays toast and redirects to list on successful submission', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Items successfully updated', { type: 'info' });
    expect(props.history.push).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('sets appropriate data when copy', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Copy'));
    fireEvent.change(getByLabelText('Existing list'), { target: { value: '1' } });

    await waitFor(() => expect(getByLabelText('Existing list')).toHaveValue('1'));

    fireEvent.click(getByLabelText('Would you like to also update the current items?'));

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.objectContaining({ copy: true, existing_list_id: '1', update_current_items: true }),
    });
  });

  it('sets appropriate data when move', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    props.lists = [];
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Move'));
    fireEvent.change(getByLabelText('New list name'), { target: { value: 'foo' } });

    await waitFor(() => expect(getByLabelText('New list name')).toHaveValue('foo'));

    fireEvent.click(getByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk_update?item_ids=1,2', {
      grocery_list_items: expect.objectContaining({ move: true, new_list_name: 'foo' }),
    });
  });

  it('renders error when not existing list and not new list and copy', () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Copy'));
    fireEvent.click(getByText('Update Items'));

    expect(toast).toHaveBeenCalledWith('You must specify a list to copy items', { type: 'error' });
  });

  it('renders error when not existing list and not new list and move', () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByText, getByLabelText } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByLabelText('Move'));
    fireEvent.click(getByText('Update Items'));

    expect(toast).toHaveBeenCalledWith('You must specify a list to move items', { type: 'error' });
  });

  it('displays toast and redirects to login on 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Some items not found', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Some items not found', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays appropriate error message when listType is BookList', async () => {
    axios.put = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    props.list.type = 'BookList';
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar or baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when listType is GroceryList', async () => {
    axios.put = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    props.list.type = 'GroceryList';
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when listType is MusicList', async () => {
    axios.put = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    props.list.type = 'MusicList';
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar or baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when listType is ToDoList', async () => {
    axios.put = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });
    props.list.type = 'ToDoList';
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    props.list.type = 'ToDoList';
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    props.list.type = 'ToDoList';
    const { getByRole } = render(<BulkEditListItemsForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });
});
