import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

import EditListItemForm from './EditListItemForm';
import { defaultDueBy } from '../../../utils/format';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('EditListItemForm', () => {
  let props;

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
      listUsers: [
        {
          id: 1,
          email: 'foo@example.com',
        },
      ],
      item: {
        id: 1,
        product: 'foo',
        task: '',
        content: '',
        purchased: false,
        quantity: 'foo',
        completed: false,
        author: '',
        title: '',
        read: false,
        artist: '',
        dueBy: defaultDueBy(),
        assigneeId: '',
        album: '',
        numberInSeries: 0,
        category: '',
      },
      list: {
        id: 1,
        type: 'GroceryList',
        categories: [''],
      },
      userId: 1,
    };
  });

  it('renders', () => {
    const { container } = render(<EditListItemForm {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('displays toast and redirects to list on successful submission', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item successfully updated', { type: 'info' });
    expect(props.history.push).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to login on 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
    expect(props.history.push).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays appropriate error message when  and listType is BookList', async () => {
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
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar or baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when  and listType is GroceryList', async () => {
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
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when  and listType is MusicList', async () => {
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
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar or baz foobar', { type: 'error' });
  });

  it('displays appropriate error message when  and listType is ToDoList', async () => {
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
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    props.list.type = 'ToDoList';
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    props.list.type = 'ToDoList';
    const { getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('sets value for input', async () => {
    const { getByLabelText, getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.change(getByLabelText('Product'), { target: { value: 'foo' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/grocery_list_items/1', {
      grocery_list_item: expect.objectContaining({ product: 'foo' }),
    });
  });

  it('sets value for numberInSeries as a number when input', async () => {
    props.list.type = 'BookList';
    const { getByLabelText, getByRole } = render(<EditListItemForm {...props} />);

    fireEvent.change(getByLabelText('Number in series'), { target: { value: '2' } });
    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/1/book_list_items/1', {
      book_list_item: expect.objectContaining({ number_in_series: 2 }),
    });
  });
});
