import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import axios from 'utils/api';
import { EListType } from 'typings';

import BulkEditListItemsForm, { type IBulkEditListItemsFormProps } from './BulkEditListItemsForm';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IBulkEditListItemsFormProps;
}

function setup(listType = EListType.GROCERY_LIST, suppliedProps?: Partial<IBulkEditListItemsFormProps>): ISetupReturn {
  const user = userEvent.setup();
  const defaultProps = {
    navigate: jest.fn(),
    items: [
      {
        id: 'id1',
        product: '',
        task: '',
        purchased: false,
        quantity: 'foo',
        completed: false,
        author: '',
        title: '',
        read: false,
        artist: '',
        due_by: undefined,
        assignee_id: '',
        album: '',
        number_in_series: 1,
        category: '',
      },
      {
        id: 'id2',
        product: '',
        task: '',
        purchased: false,
        quantity: 'foo',
        completed: false,
        author: '',
        title: '',
        read: false,
        artist: '',
        due_by: undefined,
        assignee_id: '',
        album: '',
        number_in_series: 1,
        category: '',
      },
    ],
    list: {
      id: 'id1',
      type: listType,
      name: 'foo',
      created_at: 'some date',
      completed: false,
      refreshed: false,
      owner_id: 'id1',
    },
    lists: [
      {
        id: 'id1',
        type: EListType.GROCERY_LIST,
        name: 'foo',
        completed: false,
        refreshed: false,
        created_at: 'some date',
        owner_id: 'id1',
      },
    ],
    categories: ['foo'],
    listUsers: [
      {
        id: 'id1',
        email: 'foobar@example.com',
      },
    ],
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(<BulkEditListItemsForm {...props} />);

  return { ...component, props, user };
}

describe('BulkEditListItemsForm', () => {
  it('renders', () => {
    const { container } = setup();

    expect(container).toMatchSnapshot();
  });

  it('clears attribute when the clear checkbox is selected and attribute has value', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { findByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Quantity'));
    await user.type(await findByLabelText('Quantity'), '3');

    await waitFor(async () => expect(await findByLabelText('Quantity')).toHaveValue('3'));

    await user.click(await findByLabelText('Clear quantity'));

    await waitFor(async () => expect(await findByLabelText('Quantity')).toHaveValue(''));

    await user.click(await findByText('Update Items'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/v1/lists/id1/list_items/bulk_update?item_ids=id1,id2', {
      list_items: expect.objectContaining({ quantity: '', clear_quantity: true }),
    });
  });

  it('sets attribute to initial value when clear is selected a second time', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { findByText, findByLabelText, user } = setup();

    await user.clear(await findByLabelText('Quantity'));
    await user.type(await findByLabelText('Quantity'), 'bar');

    await waitFor(async () => expect(await findByLabelText('Quantity')).toHaveValue('bar'));

    await user.click(await findByLabelText('Clear quantity'));

    await waitFor(async () => expect(await findByLabelText('Quantity')).toHaveValue(''));

    await user.click(await findByLabelText('Clear quantity'));

    await waitFor(async () => expect(await findByLabelText('Quantity')).toHaveValue('foo'));

    await user.click(await findByText('Update Items'));

    await waitFor(async () => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/v1/lists/id1/list_items/bulk_update?item_ids=id1,id2', {
      list_items: expect.objectContaining({ quantity: 'foo', clear_quantity: false }),
    });
  });

  it('displays toast and redirects to list on successful submission', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Items successfully updated', { type: 'info' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to login on 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Some items not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Some items not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
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
    const { findAllByRole, user } = setup(EListType.BOOK_LIST);

    await user.click((await findAllByRole('button'))[0]);
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
    const { findAllByRole, user } = setup(EListType.GROCERY_LIST);

    await user.click((await findAllByRole('button'))[0]);
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
    const { findAllByRole, user } = setup(EListType.MUSIC_LIST);

    await user.click((await findAllByRole('button'))[0]);
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
    const { findAllByRole, user } = setup(EListType.TO_DO_LIST);

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    const { findAllByRole, user } = setup(EListType.TO_DO_LIST);

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    const { findAllByRole, user } = setup(EListType.TO_DO_LIST);

    await user.click((await findAllByRole('button'))[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('goes back to list on Cancel', async () => {
    const { findAllByRole, props, user } = setup();

    await user.click((await findAllByRole('button'))[1]);

    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });
});
