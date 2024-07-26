import React from 'react';
import { render, type RenderResult, waitFor } from '@testing-library/react';
import { toast } from 'react-toastify';
import userEvent, { type UserEvent } from '@testing-library/user-event';

import EditListItemForm, { type IEditListItemFormProps } from './EditListItemForm';
import axios from '../../../utils/api';
import { EListType } from '../../../typings';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

interface ISetupReturn extends RenderResult {
  user: UserEvent;
  props: IEditListItemFormProps;
  buttons: HTMLElement[];
}

async function setup(listType = EListType.GROCERY_LIST): Promise<ISetupReturn> {
  const user = userEvent.setup();
  const props = {
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
      type: listType,
      categories: [''],
      name: 'foo',
      created_at: 'some date',
      completed: false,
      refreshed: false,
      owner_id: 'id1',
    },
    userId: 'id1',
  };
  const component = render(<EditListItemForm {...props} />);
  const buttons = await component.findAllByRole('button');

  return { buttons, ...component, props, user };
}

describe('EditListItemForm', () => {
  it('renders', async () => {
    const { container } = await setup();

    expect(container).toMatchSnapshot();
  });

  it('displays toast and redirects to list on successful submission', async () => {
    axios.put = jest.fn().mockResolvedValue({ data: {} });
    const { buttons, props, user } = await setup();

    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item successfully updated', { type: 'info' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to login on 401', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { buttons, props, user } = await setup();

    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { buttons, props, user } = await setup();

    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });

  it('displays toast and redirects to list on 403', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { buttons, props, user } = await setup();

    await user.click(buttons[0]);
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
    const { buttons, user } = await setup(EListType.BOOK_LIST);

    await user.click(buttons[0]);
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
    const { buttons, user } = await setup(EListType.GROCERY_LIST);

    await user.click(buttons[0]);
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
    const { buttons, user } = await setup(EListType.MUSIC_LIST);

    await user.click(buttons[0]);
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
    const { buttons, user } = await setup(EListType.TO_DO_LIST);

    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and baz foobar', { type: 'error' });
  });

  it('displays toast when error in sending request', async () => {
    axios.put = jest.fn().mockRejectedValue({
      request: 'request failed',
    });
    const { buttons, user } = await setup(EListType.TO_DO_LIST);

    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('displays toast when unknown error', async () => {
    axios.put = jest.fn().mockRejectedValue({
      message: 'request failed',
    });
    const { buttons, user } = await setup(EListType.TO_DO_LIST);

    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('request failed', { type: 'error' });
  });

  it('sets value for input', async () => {
    const { findByLabelText, buttons, user } = await setup();

    const productInput = await findByLabelText('Product');
    await user.clear(productInput);
    await user.type(productInput, 'foo');
    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/id1/list_items/id1', {
      list_item: expect.objectContaining({ product: 'foo' }),
    });
  });

  it('sets value for numberInSeries as a number when input', async () => {
    const { findByLabelText, buttons, user } = await setup(EListType.BOOK_LIST);

    await user.type(await findByLabelText('Number in series'), '2');
    await user.click(buttons[0]);
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(axios.put).toHaveBeenCalledWith('/lists/id1/list_items/id1', {
      list_item: expect.objectContaining({ number_in_series: 2 }),
    });
  });

  it('goes back to list on Cancel', async () => {
    const { buttons, props, user } = await setup();

    await user.click(buttons[1]);

    expect(props.navigate).toHaveBeenCalledWith(`/lists/${props.list.id}`);
  });
});
