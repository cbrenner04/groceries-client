import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';

import EditListForm from './EditListForm';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EditListForm', () => {
  const renderEditListForm = () => {
    const props = {
      listId: 'id1',
      name: 'foo',
      type: 'GroceryList',
      completed: false,
    };
    return render(<EditListForm {...props} />);
  };

  it('renders', () => {
    const { container } = renderEditListForm();

    expect(container).toMatchSnapshot();
  });

  it('updates name when changed', async () => {
    const { getByLabelText } = renderEditListForm();

    fireEvent.change(getByLabelText('Name'), { target: { value: 'a' } });

    expect(getByLabelText('Name')).toHaveValue('a');
  });

  it('updates type when changed', async () => {
    const { getByLabelText } = renderEditListForm();

    expect(getByLabelText('Type')).toHaveValue('GroceryList');

    fireEvent.change(getByLabelText('Type'), { target: { value: 'BookList' } });

    expect(getByLabelText('Type')).toHaveValue('BookList');
  });

  it('updates completed when changed', async () => {
    const { getByLabelText } = renderEditListForm();

    fireEvent.click(getByLabelText('Completed'));

    expect(getByLabelText('Completed')).toBeChecked();
  });

  it('makes post, displays toast, and redirects to lists page on successful submission', async () => {
    const data = {
      foo: 'bar',
    };
    axios.put = jest.fn().mockResolvedValue({ data });
    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List successfully updated', { type: 'info' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to user login when 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists page when 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to lists page when 404', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('List not found', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
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

    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });

    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });

    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('goes back to lists on Cancel', () => {
    const { getAllByRole } = renderEditListForm();

    fireEvent.click(getAllByRole('button')[1]);

    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });
});
