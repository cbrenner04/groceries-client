import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import userEvent, { type UserEvent } from '@testing-library/user-event';
import { showToast } from '../../../utils/toast';

import axios from 'utils/api';

import EditListForm, { type IEditListFormProps } from './EditListForm';

const mockShowToast = showToast as jest.Mocked<typeof showToast>;

const mockNavigate = jest.fn();
jest.mock('react-router', () => ({
  ...jest.requireActual('react-router'),
  useNavigate: (): jest.Mock => mockNavigate,
}));

interface ISetupReturn extends RenderResult {
  props: IEditListFormProps;
  user: UserEvent;
}

function setup(): ISetupReturn {
  const user = userEvent.setup();
  const props = {
    listId: 'id1',
    name: 'foo',
    type: 'GroceryList',
    completed: false,
  };
  const component = render(<EditListForm {...props} />);

  return { ...component, props, user };
}

describe('EditListForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('updates name when changed', async () => {
    const { findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Name'));
    await user.type(await findByLabelText('Name'), 'a');

    expect(await findByLabelText('Name')).toHaveValue('a');
  });

  it('updates type when changed', async () => {
    const { findByLabelText, user } = setup();

    expect(await findByLabelText('Type')).toHaveValue('GroceryList');

    await user.selectOptions(await findByLabelText('Type'), 'BookList');

    expect(await findByLabelText('Type')).toHaveValue('BookList');
  });

  it('updates completed when changed', async () => {
    const { findByLabelText, user } = setup();

    await user.click(await findByLabelText('Completed'));

    expect(await findByLabelText('Completed')).toBeChecked();
  });

  it('makes put, displays toast, and redirects to lists page on successful submission', async () => {
    const data = {
      foo: 'bar',
    };
    axios.put = jest.fn().mockResolvedValue({ data });
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.info).toHaveBeenCalledWith('List successfully updated');
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to user login when 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('You must sign in');
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('redirects to lists page when 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });

  it('redirects to lists page when 404', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('List not found');
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

    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('foo bar and baz foobar');
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });

    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('Something went wrong');
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });

    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[0]);

    expect(axios.put).toHaveBeenCalledTimes(1);
    expect(mockShowToast.error).toHaveBeenCalledWith('request failed');
  });

  it('goes back to lists on Cancel', async () => {
    const { findAllByRole, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(mockNavigate).toHaveBeenCalledWith('/lists');
  });
});
