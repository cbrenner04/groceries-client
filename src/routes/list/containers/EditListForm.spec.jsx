import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { toast } from 'react-toastify';

import EditListForm from './EditListForm';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('EditListForm', () => {
  const history = createMemoryHistory();
  const props = {
    history,
    listId: 1,
    name: 'foo',
    type: 'GroceryList',
    completed: false,
  };
  const renderEditListForm = (props) => {
    return render(
      <Router history={history}>
        <EditListForm {...props} />)
      </Router>,
    );
  };

  it('renders', () => {
    const { container } = renderEditListForm(props);

    expect(container).toMatchSnapshot();
  });

  it('updates name when changed', async () => {
    const { getByLabelText } = renderEditListForm(props);

    fireEvent.change(getByLabelText('Name'), { target: { value: 'a' } });

    expect(getByLabelText('Name')).toHaveValue('a');
  });

  it('updates type when changed', async () => {
    const { getByLabelText } = renderEditListForm(props);

    expect(getByLabelText('Type')).toHaveValue('GroceryList');

    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });

    expect(getByLabelText('Type')).toHaveValue('BookList');
  });

  it('updates completed when changed', async () => {
    const { getByLabelText } = renderEditListForm(props);

    fireEvent.click(getByLabelText('Completed'));

    expect(getByLabelText('Completed')).toBeChecked();
  });

  it('makes post, displays toast, and redirects to lists page on successful submission', async () => {
    const data = {
      foo: 'bar',
    };
    axios.put = jest.fn().mockResolvedValue({ data });
    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully updated', { type: 'info' });
    expect(history.location.pathname).toBe('/lists');
  });

  it('redirects to user login when 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(history.location.pathname).toBe('/users/sign_in');
  });

  it('redirects to lists page when 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(history.location.pathname).toBe('/lists');
  });

  it('redirects to lists page when 404', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(history.location.pathname).toBe('/lists');
  });

  it('displays appropriate error message', async () => {
    axios.put = jest.fn().mockRejectedValue({
      response: {
        status: 500,
        data: {
          foo: 'bar',
          baz: 'foobar',
        },
      },
    });

    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });

    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });

    const { getByRole } = renderEditListForm(props);

    fireEvent.click(getByRole('button'));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });
});
