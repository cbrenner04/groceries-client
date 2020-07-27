import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import { createMemoryHistory } from 'history';

import ListItemForm from './ListItemForm';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('ListItemForm', () => {
  let history;
  let props;

  beforeEach(() => {
    history = createMemoryHistory();
    props = {
      history: {
        push: jest.fn(),
      },
      userId: 1,
      listId: 1,
      listType: 'GroceryList',
      listUsers: [
        {
          id: 1,
          email: 'foo@example.com',
        },
      ],
      handleItemAddition: jest.fn(),
      categories: ['foo'],
    };
  });

  it('renders', () => {
    const { container } = render(<ListItemForm {...props} />);

    expect(container).toMatchSnapshot();
  });

  it('expands form', async () => {
    const { baseElement, getByText } = render(<ListItemForm {...props} />);

    fireEvent.click(getByText('Add Item'));
    await waitFor(() => expect(baseElement.children[0].children[0]).toHaveClass('show'));

    expect(baseElement.children[0].children[0]).toHaveClass('show');
  });

  it('collapses form', async () => {
    const { baseElement, getByText } = render(<ListItemForm {...props} />);

    fireEvent.click(getByText('Add Item'));
    await waitFor(() => expect(baseElement.children[0].children[0]).toHaveClass('show'));

    fireEvent.click(getByText('Collapse Form'));
    await waitFor(() => expect(baseElement.children[0].children[0]).not.toHaveClass('show'));

    expect(baseElement.children[0].children[0]).not.toHaveClass('show');
  });

  it('calls handleItemAddition and fires toast on successful submission', async () => {
    const data = {
      foo: 'bar',
    };
    axios.post = jest.fn().mockResolvedValue({ data });
    const { getAllByRole } = render(<ListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(props.handleItemAddition).toHaveBeenCalledWith(data);
    expect(toast).toHaveBeenCalledWith('Item successfully added.', { type: 'info' });
  });

  it('disables submit button when form has been submitted', async () => {
    // post is not resolved so that the pending state will remain after calling post
    axios.post = jest.fn();
    const { getAllByRole } = render(<ListItemForm {...props} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(getAllByRole('button')[1]).toBeDisabled();
  });

  it('redirects to user login when 401', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(history.location.pathname).toBe('/users/sign_in');
  });

  it('redirects to lists page when 403', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(history.location.pathname).toBe('/lists');
  });

  it('redirects to lists page when 404', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(history.location.pathname).toBe('/lists');
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
    props.listType = 'BookList';
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
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
    props.listType = 'GroceryList';
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
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
    props.listType = 'MusicList';
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
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
    props.listType = 'ToDoList';
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.post = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    props.listType = 'ToDoList';
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.post = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    props.listType = 'ToDoList';
    const { getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('sets value for numberInSeries as a number when input', async () => {
    props.listType = 'BookList';
    const { getByLabelText, getAllByRole } = render(<ListItemForm {...props} history={history} />);

    fireEvent.change(getByLabelText('Number in series'), { target: { value: '2' } });
    fireEvent.click(getAllByRole('button')[1]);
    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(axios.post).toHaveBeenCalledWith('/lists/1/book_list_items', {
      book_list_item: expect.objectContaining({ number_in_series: 2 }),
    });
  });
});
