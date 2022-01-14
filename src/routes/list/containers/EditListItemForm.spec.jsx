import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

import EditListItemForm from './EditListItemForm';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('EditListItemForm', () => {
  let props;

  beforeEach(() => {
    props = {
      navigate: jest.fn(),
      listUsers: [
        {
          id: 'id1',
          email: 'foo@example.com',
        },
      ],
      item: {
        id: 'id1',
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
        dueBy: '',
        assigneeId: '',
        album: '',
        numberInSeries: 0,
        category: '',
      },
      list: {
        id: 'id1',
        type: 'GroceryList',
        categories: [''],
        name: 'foo',
        created_at: 'some date',
        completed: false,
        refreshed: false,
        owner_id: 'id1',
      },
      userId: 'id1',
    };
  });

  it('renders', () => {
    const { container } = render(<EditListItemForm {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('displays toast and redirects to list on successful submission', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item successfully updated', { type: 'info' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to login on 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
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
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
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
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
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
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
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
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    props.list.type = 'ToDoList';
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    props.list.type = 'ToDoList';
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('sets value for input', async () => {
    const { getByLabelText, getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.change(getByLabelText('Product'), { target: { value: 'foo' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/id1/list_items/id1', {
      list_item: expect.objectContaining({ product: 'foo' }),
    });
  });

  it('sets value for numberInSeries as a number when input', async () => {
    props.list.type = 'BookList';
    const { getByLabelText, getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.change(getByLabelText('Number in series'), { target: { value: '2' } });
    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/id1/list_items/id1', {
      list_item: expect.objectContaining({ number_in_series: 2 }),
    });
  });

  it('goes back to list on Cancel', () => {
    const { getAllByRole } = render(<EditListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[1]);

    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });
});
