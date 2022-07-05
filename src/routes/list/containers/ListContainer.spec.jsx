import React from 'react';
import { act, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import userEvent from '@testing-library/user-event';

import ListContainer from './ListContainer';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

function setup(suppliedProps = {}, listType = 'GroceryList') {
  const user = userEvent.setup();
  const defaultProps = {
    userId: 'id1',
    list: {
      id: 'id1',
      name: 'foo',
      type: listType,
      created_at: new Date('05/24/2020').toISOString(),
      completed: false,
      owner_id: 'id1',
      refreshed: false,
    },
    purchasedItems: [
      {
        id: 'id1',
        product: 'foo purchased product',
        task: '',
        quantity: 'purchased quantity',
        author: '',
        title: 'whatever',
        artist: '',
        album: '',
        assignee_id: 'id1',
        due_by: '',
        read: false,
        number_in_series: 0,
        category: 'foo',
        purchased: true,
        completed: false,
      },
    ],
    categories: ['', 'foo', 'bar'],
    listUsers: [
      {
        id: 'id1',
        email: 'foo@example.com',
      },
    ],
    includedCategories: ['', 'foo', 'bar'],
    notPurchasedItems: {
      '': [
        {
          id: 'id2',
          product: 'no category not purchased product',
          task: 'whatever',
          quantity: 'not purchased quantity',
          author: '',
          title: 'whatever',
          artist: '',
          album: '',
          assignee_id: 'id1',
          due_by: '',
          read: false,
          number_in_series: 0,
          category: '',
          purchased: false,
          completed: false,
          grocery_list_id: 'id1',
        },
      ],
      foo: [
        {
          id: 'id3',
          product: 'foo not purchased product',
          task: '',
          quantity: 'not purchased quantity',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 'id1',
          due_by: '',
          read: false,
          number_in_series: 0,
          category: 'foo',
          purchased: false,
          completed: false,
          grocery_list_id: 'id1',
        },
        {
          id: 'id4',
          product: 'foo not purchased product 2',
          task: '',
          quantity: 'not purchased quantity',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 'id1',
          due_by: '',
          read: false,
          number_in_series: 0,
          category: 'foo',
          purchased: false,
          completed: false,
          grocery_list_id: 'id1',
        },
      ],
      bar: [
        {
          id: 'id5',
          product: 'bar not purchased product',
          task: '',
          quantity: 'not purchased quantity',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 'id1',
          due_by: '',
          read: false,
          number_in_series: 0,
          category: 'bar',
          purchased: false,
          completed: false,
        },
      ],
    },
    permissions: 'write',
  };
  const props = { ...defaultProps, ...suppliedProps };
  const component = render(
    <MemoryRouter>
      <ListContainer {...props} />
    </MemoryRouter>,
  );

  return { ...component, props, user };
}

describe('ListContainer', () => {
  it('does not update via polling when different data is not returned', async () => {
    // having these in before/after blocks messed up user actions in other tests
    jest.useFakeTimers();
    axios.get = jest.fn().mockResolvedValue({
      data: {
        current_user_id: 'id1',
        not_purchased_items: [{ id: 'id1', product: 'new', quantity: 'item', category: 'foo' }],
        purchased_items: [],
        list: {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/22/2020').toISOString(),
          completed: false,
          owner_id: 'id1',
          refreshed: false,
        },
        categories: ['foo'],
        list_users: [{ id: 'id1', email: 'foo@example.com' }],
        permissions: 'write',
      },
    });
    const { findByText } = setup({ permissions: 'write' });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect((await findByText('item new')).parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'non-purchased-item',
    );

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect((await findByText('item new')).parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'non-purchased-item',
    );
    jest.useRealTimers();
  });

  it('updates via polling when different data is returned', async () => {
    // having these in before/after blocks messed up user actions in other tests
    jest.useFakeTimers();
    axios.get = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          current_user_id: 'id1',
          not_purchased_items: [{ id: 'id1', product: 'new', quantity: 'item' }],
          purchased_items: [],
          list: {
            id: 'id1',
            name: 'foo',
            type: 'GroceryList',
            created_at: new Date('05/22/2020').toISOString(),
            completed: false,
            owner_id: 'id1',
            refreshed: false,
          },
          categories: [],
          list_users: [{ id: 'id1', email: 'foo@example.com' }],
          permissions: 'write',
        },
      })
      .mockResolvedValueOnce({
        data: {
          current_user_id: 'id1',
          not_purchased_items: [],
          purchased_items: [{ id: 'id1', product: 'new', quantity: 'item' }],
          list: {
            id: 'id1',
            name: 'foo',
            type: 'GroceryList',
            created_at: new Date('05/22/2020').toISOString(),
            completed: false,
            owner_id: 'id1',
            refreshed: false,
          },
          categories: [],
          list_users: [{ id: 'id1', email: 'foo@example.com' }],
          permissions: 'write',
        },
      });
    const { findByText } = setup({ permissions: 'write' });

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(1));

    expect((await findByText('item new')).parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'non-purchased-item',
    );

    await act(async () => {
      jest.advanceTimersByTime(3000);
    });

    await waitFor(() => expect(axios.get).toHaveBeenCalledTimes(2));

    expect((await findByText('item new')).parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'purchased-item',
    );
    jest.useRealTimers();
  });

  it('renders ListForm when user has write permissions', async () => {
    const { container, findByTestId } = setup({ permissions: 'write' });

    expect(container).toMatchSnapshot();
    expect(await findByTestId('list-item-form')).toBeVisible();
  });

  it('does not render ListForm when user has read permissions', () => {
    const { container, queryByTestId } = setup({ permissions: 'read' });

    expect(container).toMatchSnapshot();
    expect(queryByTestId('list-item-form')).toBeNull();
  });

  it('renders filtered items without category buckets when filter exists', async () => {
    const { container, findByTestId, findByText, queryByText, user } = setup();
    await user.click(await findByText('Filter by category'));

    await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());

    await user.click(await findByTestId('filter-by-foo'));

    expect(container).toMatchSnapshot();
    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(await findByText('Foo')).toBeVisible();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();
  });

  it('renders items with category buckets when includedCategories is not empty and no filter is applied', async () => {
    const { container, findByText } = setup({ includedCategories: ['', 'foo', 'bar'] });

    expect(container).toMatchSnapshot();
    expect(await findByText('not purchased quantity no category not purchased product')).toBeVisible();
    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(await findByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(await findByText('Foo')).toBeVisible();
    expect(await findByText('Bar')).toBeVisible();
  });

  it('does not render incomplete items when none exist', () => {
    // includedCategories come back from the server. this is the default
    const { container } = setup({ notPurchasedItems: {}, includedCategories: [''] }, 'ToDoList');

    expect(container).toMatchSnapshot();
  });

  it('does not render complete items when none exist', () => {
    const { container } = setup({ purchasedItems: [] });

    expect(container).toMatchSnapshot();
  });

  it('renders confirmation modal when delete is clicked', async () => {
    const { container, findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id2'));

    expect(container).toMatchSnapshot();
    expect(await findByTestId('confirm-delete')).toBeVisible();
  });

  it('handles 401 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('deletes item when delete is confirmed, hides modal, removes category when item is last of category', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

    expect(await findByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(await findByText('Bar')).toBeVisible();

    await user.click(await findByTestId('not-purchased-item-delete-id5'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();
    expect(queryByText('Bar')).toBeNull();
    expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
  });

  it('deletes item, hides modal, does not remove category when item is not last of category', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(await findByText('Foo')).toBeVisible();

    await user.click(await findByTestId('not-purchased-item-delete-id3'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(queryByText('not purchased quantity foo not purchased product')).toBeNull();
    expect(await findByText('Foo')).toBeVisible();
    expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
  });

  it('deletes item, hides modal, when item is in purchased', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

    expect(await findByText('purchased quantity foo purchased product')).toBeVisible();

    await user.click(await findByTestId('purchased-item-delete-id1'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(queryByText('purchased quantity foo purchased product')).toBeNull();
    expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
  });

  it('deletes all items when multiple are selected', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { findAllByRole, findByText, findByTestId, queryByTestId, queryByText, findAllByText, user } = setup();

    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(await findByText('Foo')).toBeVisible();
    expect(await findByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(await findByText('Bar')).toBeVisible();

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[1]);
    await user.click(checkboxes[2]);
    await user.click(await findByTestId('not-purchased-item-delete-id2'));

    expect(await findByTestId('confirm-delete')).toBeVisible();

    await user.click(await findByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(queryByTestId('confirm-delete')).toBeNull());

    expect(queryByText('not purchased quantity foo not purchased product')).toBeNull();
    expect(await findByText('Foo')).toBeVisible();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();
    expect(queryByText('Bar')).toBeNull();
  });

  it('does not delete item when delete is cleared, hides modal', async () => {
    const { findByTestId, findByText, queryByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-delete-id2'));

    expect(await findByTestId('clear-delete')).toBeVisible();

    await user.click(await findByTestId('clear-delete'));

    await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());

    expect(await findByText('not purchased quantity no category not purchased product')).toBeVisible();
  });

  it('clears filter when filter is cleared', async () => {
    const { findByTestId, findByText, queryByText, user } = setup({ includedCategories: ['', 'foo', 'bar'] });
    await user.click(await findByText('Filter by category'));

    await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());

    await user.click(await findByTestId('filter-by-foo'));

    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(await findByText('Foo')).toBeVisible();
    expect(queryByText('Bar')).toBeNull();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();

    await user.click(await findByTestId('clear-filter'));

    expect(await findByText('not purchased quantity no category not purchased product')).toBeVisible();
    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(await findByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(await findByText('Foo')).toBeVisible();
    expect(await findByText('Bar')).toBeVisible();
  });

  it('adds an item when category exists', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'foo',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 'id1',
        id: 'id6',
        product: 'new product',
        purchased: false,
        quantity: 'new quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 'id1',
      },
    });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Product'), 'new product');
    await user.type(await findByLabelText('Quantity'), 'new quantity');
    await user.type(await findByLabelText('Category'), 'foo');
    await user.click(await findByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(await findByText('new quantity new product')).toBeVisible();
  });

  it('adds an item when category does not exist', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'new category',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 'id1',
        id: 'id6',
        product: 'new product',
        purchased: false,
        quantity: 'new quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 'id1',
      },
    });
    const { findByLabelText, findByText, user } = setup();

    await user.type(await findByLabelText('Product'), 'new product');
    await user.type(await findByLabelText('Quantity'), 'new quantity');
    await user.type(await findByLabelText('Category'), 'new category');
    await user.click(await findByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(await findByText('new quantity new product')).toBeVisible();
    expect(await findByText('New category')).toBeVisible();
  });

  // TODO: why is this different?
  it('moves item to purchased when ToDo', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByText, findByTestId, user } = setup({}, 'ToDoList');

    expect((await findByText('whatever')).parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'non-purchased-item',
    );

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect((await findByText('whatever')).parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'purchased-item',
    );
  });

  it('moves item to purchased when not ToDo', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByText, findByTestId, user } = setup();

    expect(
      (await findByText('not purchased quantity no category not purchased product')).parentElement.parentElement
        .parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(
      (await findByText('not purchased quantity no category not purchased product')).parentElement.parentElement
        .parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
  });

  it('moves item to purchased and clears filter when item is last of category', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByText, findByTestId, queryByTestId, queryByText, user } = setup();

    await user.click(await findByText('Filter by category'));

    await waitFor(async () => expect(await findByTestId('filter-by-bar')).toBeVisible());

    await user.click(await findByTestId('filter-by-bar'));

    await waitFor(() => expect(queryByText('not purchased quantity foo not purchased product')).toBeNull());

    expect(await findByTestId('clear-filter')).toBeVisible();
    expect(
      (await findByText('not purchased quantity bar not purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');

    await user.click(await findByTestId('not-purchased-item-complete-id5'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(queryByTestId('clear-filter')).toBeNull();
    expect(await findByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(
      (await findByText('not purchased quantity bar not purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
  });

  it('moves items to purchased when multiple selected', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findAllByRole, findByText, findByTestId, queryByText, findAllByText, user } = setup();

    expect(
      (await findByText('not purchased quantity no category not purchased product')).parentElement.parentElement
        .parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
    expect(
      (await findByText('not purchased quantity bar not purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

    expect(
      (await findByText('not purchased quantity no category not purchased product')).parentElement.parentElement
        .parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
    expect(
      (await findByText('not purchased quantity bar not purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
    expect(queryByText('Bar')).toBeNull();
  });

  it('handles 401 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('not-purchased-item-complete-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('moves item to not purchased when refreshed', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'foo',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 'id1',
        id: 'id6',
        product: 'foo purchased product',
        purchased: false,
        quantity: 'purchased quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 'id1',
      },
    });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, findByText, user } = setup();

    expect(
      (await findByText('purchased quantity foo purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    // TODO: what am I not waiting for?
    await act(async () => undefined);

    await waitFor(async () =>
      expect(
        (
          await findByText('purchased quantity foo purchased product')
        ).parentElement.parentElement.parentElement,
      ).toHaveAttribute('data-test-class', 'non-purchased-item'),
    );

    expect(
      (await findByText('purchased quantity foo purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
  });

  it('moves items to not purchased when refreshed with multiple selected', async () => {
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          archived_at: null,
          category: 'foo',
          created_at: '2020-05-24T11:07:48.751-05:00',
          grocery_list_id: 'id1',
          id: 'id6',
          product: 'foo purchased product',
          purchased: false,
          quantity: 'purchased quantity',
          refreshed: false,
          updated_at: '2020-05-24T11:07:48.751-05:00',
          user_id: 'id1',
        },
      })
      .mockResolvedValueOnce({
        data: {
          archived_at: null,
          category: 'bar',
          created_at: '2020-05-24T11:07:48.751-05:00',
          grocery_list_id: 'id1',
          id: 'id7',
          product: 'bar purchased product',
          purchased: false,
          quantity: 'purchased quantity',
          refreshed: false,
          updated_at: '2020-05-24T11:07:48.751-05:00',
          user_id: 'id1',
        },
      });
    axios.put = jest.fn().mockResolvedValue();
    const { findAllByRole, findByTestId, findByText, findAllByText, user } = setup({
      purchasedItems: [
        {
          id: 'id1',
          product: 'foo purchased product',
          task: '',
          quantity: 'purchased quantity',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 'id1',
          due_by: '',
          read: false,
          number_in_series: 0,
          category: 'foo',
          purchased: true,
          completed: false,
        },
        {
          id: 'id2',
          product: 'bar purchased product',
          task: '',
          quantity: 'purchased quantity',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 'id1',
          due_by: '',
          read: false,
          number_in_series: 0,
          category: 'bar',
          purchased: true,
          completed: false,
        },
      ],
    });

    expect(
      (await findByText('purchased quantity foo purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');

    await user.click((await findAllByText('Select'))[1]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[0]);
    await user.click(checkboxes[1]);
    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

    // TODO: what am I not waiting for?
    await act(async () => undefined);

    await waitFor(async () =>
      expect(
        (
          await findByText('purchased quantity foo purchased product')
        ).parentElement.parentElement.parentElement,
      ).toHaveAttribute('data-test-class', 'non-purchased-item'),
    );

    expect(
      (await findByText('purchased quantity foo purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
    expect(
      (await findByText('purchased quantity bar purchased product')).parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
  });

  it('handles 401 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    axios.put = jest.fn().mockResolvedValue();
    const { findByTestId, user } = setup();

    await user.click(await findByTestId('purchased-item-refresh-id1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('toggles read when item not purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByTestId, queryByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(await findByTestId('not-purchased-item-unread-id2')).toBeVisible();
    expect(queryByTestId('not-purchased-item-read-id2')).toBeNull();
  });

  it('toggles unread when item not purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByTestId, queryByTestId, user } = setup(
      {
        notPurchasedItems: {
          '': [
            {
              id: 'id2',
              product: 'no category not purchased product',
              task: 'whatever',
              quantity: 'not purchased quantity',
              author: '',
              title: 'whatever',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: true,
              number_in_series: 0,
              category: '',
              purchased: false,
              completed: false,
              grocery_list_id: 'id1',
            },
          ],
          foo: [
            {
              id: 'id3',
              product: 'foo not purchased product',
              task: '',
              quantity: 'not purchased quantity',
              author: '',
              title: '',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: false,
              number_in_series: 0,
              category: 'foo',
              purchased: false,
              completed: false,
              grocery_list_id: 'id1',
            },
            {
              id: 'id4',
              product: 'foo not purchased product 2',
              task: '',
              quantity: 'not purchased quantity',
              author: '',
              title: '',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: false,
              number_in_series: 0,
              category: 'foo',
              purchased: false,
              completed: false,
              grocery_list_id: 'id1',
            },
          ],
          bar: [
            {
              id: 'id5',
              product: 'bar not purchased product',
              task: '',
              quantity: 'not purchased quantity',
              author: '',
              title: '',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: false,
              number_in_series: 0,
              category: 'bar',
              purchased: false,
              completed: false,
            },
          ],
        },
      },
      'BookList',
    );

    await user.click(await findByTestId('not-purchased-item-unread-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(await findByTestId('not-purchased-item-read-id2')).toBeVisible();
    expect(queryByTestId('not-purchased-item-unread-id2')).toBeNull();
  });

  it('toggles read when item purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByTestId, queryByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('purchased-item-read-id1'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(await findByTestId('purchased-item-unread-id1')).toBeVisible();
    expect(queryByTestId('purchased-item-read-id1')).toBeNull();
  });

  it('toggles unread when item purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findByTestId, queryByTestId, user } = setup(
      {
        purchasedItems: [
          {
            id: 'id1',
            product: 'foo purchased product',
            task: '',
            quantity: 'purchased quantity',
            author: '',
            title: 'whatever',
            artist: '',
            album: '',
            assignee_id: 'id1',
            due_by: '',
            read: true,
            number_in_series: 0,
            category: 'foo',
            purchased: true,
            completed: false,
          },
        ],
      },
      'BookList',
    );

    await user.click(await findByTestId('purchased-item-unread-id1'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(await findByTestId('purchased-item-read-id1')).toBeVisible();
    expect(queryByTestId('purchased-item-unread-id1')).toBeNull();
  });

  it('toggles read on multiple items when selected', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { findAllByRole, findByTestId, queryByTestId, findAllByText, findByText, user } = setup(
      {
        notPurchasedItems: {
          '': [
            {
              id: 'id2',
              product: 'no category not purchased product',
              task: 'whatever',
              quantity: 'not purchased quantity',
              author: '',
              title: 'whatever',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: false,
              number_in_series: 0,
              category: '',
              purchased: false,
              completed: false,
              grocery_list_id: 'id1',
            },
          ],
          foo: [
            {
              id: 'id3',
              product: 'foo not purchased product',
              task: '',
              quantity: 'not purchased quantity',
              author: '',
              title: 'whatever',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: false,
              number_in_series: 0,
              category: 'foo',
              purchased: false,
              completed: false,
              grocery_list_id: 'id1',
            },
            {
              id: 'id4',
              product: 'foo not purchased product 2',
              task: '',
              quantity: 'not purchased quantity',
              author: '',
              title: 'asdf',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: true,
              number_in_series: 0,
              category: 'foo',
              purchased: false,
              completed: false,
              grocery_list_id: 'id1',
            },
          ],
          bar: [
            {
              id: 'id5',
              product: 'bar not purchased product',
              task: '',
              quantity: 'not purchased quantity',
              author: '',
              title: '',
              artist: '',
              album: '',
              assignee_id: 'id1',
              due_by: '',
              read: false,
              number_in_series: 0,
              category: 'bar',
              purchased: false,
              completed: false,
            },
          ],
        },
      },
      'BookList',
    );

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    const checkboxes = await findAllByRole('checkbox');

    await user.click(checkboxes[2]);
    await user.click(checkboxes[3]);
    await user.click(await findByTestId('not-purchased-item-read-id3'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

    expect(await findByTestId('not-purchased-item-unread-id3')).toBeVisible();
    expect(queryByTestId('not-purchased-item-read-id3')).toBeNull();
    expect(queryByTestId('not-purchased-item-unread-id4')).toBeNull();
    expect(await findByTestId('not-purchased-item-read-id4')).toBeVisible();
  });

  it('handles 401 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { findByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(mockNavigate).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { findByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { findByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { findByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { findByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { findByTestId, user } = setup({}, 'BookList');

    await user.click(await findByTestId('not-purchased-item-read-id2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('cannot multi select if user does not have write access', () => {
    const { queryByText } = setup({ permissions: 'read' });

    expect(queryByText('Select')).toBeNull();
  });

  it('changes select to hide select when multi select is on', async () => {
    const { findAllByText, findByText, user } = setup({ permissions: 'write' });

    expect((await findAllByText('Select'))[0]).toHaveTextContent('Select');

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    expect(await findByText('Hide Select')).toBeVisible();
  });

  it('handles item select for multi select when item has not been selected', async () => {
    const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: 'write' });

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    await user.click((await findAllByRole('checkbox'))[0]);

    expect((await findAllByRole('checkbox'))[0]).toBeChecked();
  });

  it('handles item select for multi select when item has been selected', async () => {
    const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: 'write' });

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    await user.click((await findAllByRole('checkbox'))[0]);
    await user.click((await findAllByRole('checkbox'))[0]);

    expect((await findAllByRole('checkbox'))[0]).not.toBeChecked();
  });

  it('clears selected items for mutli select is hidden for not purchased items', async () => {
    const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: 'write' });

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    await user.click((await findAllByRole('checkbox'))[0]);

    expect((await findAllByRole('checkbox'))[0]).toBeChecked();

    await user.click(await findByText('Hide Select'));
    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    expect((await findAllByRole('checkbox'))[0]).not.toBeChecked();
  });

  it('clears selected items for mutli select is hidden for purchased items', async () => {
    const { findAllByRole, findAllByText, findByText, user } = setup({ permissions: 'write' });

    await user.click((await findAllByText('Select'))[1]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    await user.click((await findAllByRole('checkbox'))[0]);

    expect((await findAllByRole('checkbox'))[0]).toBeChecked();

    await user.click(await findByText('Hide Select'));
    await user.click((await findAllByText('Select'))[1]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    expect((await findAllByRole('checkbox'))[0]).not.toBeChecked();
  });

  it('navigates to single edit form when no multi select', async () => {
    const { findByTestId, props, user } = setup({ permissions: 'write' });
    await user.click(await findByTestId(`not-purchased-item-edit-${props.notPurchasedItems.foo[0].id}`));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledWith('/lists/id1/list_items/id3/edit');
  });

  it('navigates to bulk edit form when multi select', async () => {
    const { findAllByRole, findByTestId, findAllByText, findByText, props, user } = setup({ permissions: 'write' });

    expect((await findAllByText('Select'))[0]).toHaveTextContent('Select');

    await user.click((await findAllByText('Select'))[0]);

    await waitFor(async () => expect(await findByText('Hide Select')).toBeVisible());

    await user.click((await findAllByRole('checkbox'))[0]);
    await user.click((await findAllByRole('checkbox'))[1]);
    await user.click(await findByTestId(`not-purchased-item-edit-${props.notPurchasedItems.foo[0].id}`));

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledTimes(1));

    expect(mockNavigate).toHaveBeenCalledWith('/lists/id1/list_items/bulk-edit?item_ids=id2,id5');
  });

  it('adds item while filter, stays filtered', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'bar',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 'id1',
        id: 'id6',
        product: 'new product',
        purchased: false,
        quantity: 'new quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 'id1',
      },
    });
    const { findByLabelText, findByText, findByTestId, queryByText, user } = setup();

    await user.click(await findByText('Filter by category'));

    await waitFor(async () => expect(await findByTestId('filter-by-foo')).toBeVisible());

    await user.click(await findByTestId('filter-by-foo'));
    await user.type(await findByLabelText('Product'), 'new product');
    await user.type(await findByLabelText('Quantity'), 'new quantity');
    await user.type(await findByLabelText('Category'), 'bar');
    await user.click(await findByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(queryByText('new quantity new product')).toBeNull();
  });
});
