import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { toast } from 'react-toastify';

import ListContainer from './ListContainer';
import axios from '../../../utils/api';

jest.mock('react-toastify', () => ({
  toast: jest.fn(),
}));

describe('ListContainer', () => {
  let props;
  const history = {
    push: jest.fn(),
    listen: jest.fn(),
    location: {
      pathname: '/',
    },
    createHref: ({ pathname }) => pathname,
    replace: jest.fn(),
  };
  const renderListContainer = (newProps) => {
    return render(
      <Router history={history}>
        <ListContainer {...newProps} history={history} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
        replace: jest.fn(),
        location: {
          pathname: 'foo',
        },
      },
      userId: 1,
      list: {
        id: 1,
        name: 'foo',
        type: 'GroceryList',
        created_at: new Date('05/24/2020').toISOString(),
        completed: false,
        owner_id: 1,
      },
      purchasedItems: [
        {
          id: 1,
          product: 'foo purchased product',
          task: '',
          quantity: 'purchased quantity',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 0,
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
          id: 1,
          email: 'foo@example.com',
        },
      ],
      includedCategories: ['', 'foo', 'bar'],
      notPurchasedItems: {
        '': [
          {
            id: 2,
            product: 'no category not purchased product',
            task: '',
            quantity: 'not purchased quantity',
            author: '',
            title: '',
            artist: '',
            album: '',
            assignee_id: 0,
            due_by: '',
            read: false,
            number_in_series: 0,
            category: '',
            purchased: false,
            completed: false,
            grocery_list_id: 1,
          },
        ],
        foo: [
          {
            id: 3,
            product: 'foo not purchased product',
            task: '',
            quantity: 'not purchased quantity',
            author: '',
            title: '',
            artist: '',
            album: '',
            assignee_id: 0,
            due_by: '',
            read: false,
            number_in_series: 0,
            category: 'foo',
            purchased: false,
            completed: false,
            grocery_list_id: 1,
          },
          {
            id: 4,
            product: 'foo not purchased product 2',
            task: '',
            quantity: 'not purchased quantity',
            author: '',
            title: '',
            artist: '',
            album: '',
            assignee_id: 0,
            due_by: '',
            read: false,
            number_in_series: 0,
            category: 'foo',
            purchased: false,
            completed: false,
            grocery_list_id: 1,
          },
        ],
        bar: [
          {
            id: 5,
            product: 'bar not purchased product',
            task: '',
            quantity: 'not purchased quantity',
            author: '',
            title: '',
            artist: '',
            album: '',
            assignee_id: 0,
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
  });

  it('renders ListForm when user has write permissions', () => {
    props.permissions = 'write';
    const { container, getByTestId } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    expect(getByTestId('list-item-form')).toBeVisible();
  });

  it('does not render ListForm when user has read permissions', () => {
    props.permissions = 'read';
    const { container, queryByTestId } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    expect(queryByTestId('list-item-form')).toBeNull();
  });

  it('renders filtered items without category buckets when filter exists', async () => {
    const { container, getByTestId, getByText, queryByText } = renderListContainer(props);
    fireEvent.click(getByText('Filter by category'));

    await waitFor(() => getByTestId('filter-by-foo'));

    fireEvent.click(getByTestId('filter-by-foo'));

    expect(container).toMatchSnapshot();
    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(getByText('Foo')).toBeVisible();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();
  });

  it('renders items with category buckets when includedCategories is not empty and no filter is applied', () => {
    props.includedCategories = ['', 'foo', 'bar'];
    const { container, getByText } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    expect(getByText('not purchased quantity no category not purchased product')).toBeVisible();
    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(getByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(getByText('Foo')).toBeVisible();
    expect(getByText('Bar')).toBeVisible();
  });

  it('does not render incomplete items when none exist', () => {
    props.list.type = 'ToDoList';
    props.notPurchasedItems = {};
    props.includedCategories = ['']; // includedCategories come back from the server. this is the default
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
  });

  it('does not render complete items when none exist', () => {
    props.purchasedItems = [];
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
  });

  it('renders confirmation modal when delete is clicked', () => {
    const { container, getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-2'));

    expect(container).toMatchSnapshot();
    expect(getByTestId('confirm-delete')).toBeVisible();
  });

  it('handles 401 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on delete', async () => {
    axios.delete = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('deletes item when delete is confirmed, hides modal, removes category when item is last of category', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId, queryByText } = renderListContainer(props);

    expect(getByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(getByText('Bar')).toBeVisible();

    fireEvent.click(getByTestId('not-purchased-item-delete-5'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(queryByTestId('confirm-delete')).toBeNull();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();
    expect(queryByText('Bar')).toBeNull();
    expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
  });

  it('deletes item, hides modal, does not remove category when item is not last of category', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId, queryByText } = renderListContainer(props);

    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(getByText('Foo')).toBeVisible();

    fireEvent.click(getByTestId('not-purchased-item-delete-3'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(queryByTestId('confirm-delete')).toBeNull();
    expect(queryByText('not purchased quantity foo not purchased product')).toBeNull();
    expect(getByText('Foo')).toBeVisible();
    expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
  });

  it('deletes item, hides modal, when item is in purchased', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId, queryByText } = renderListContainer(props);

    expect(getByText('purchased quantity foo purchased product')).toBeVisible();

    fireEvent.click(getByTestId('purchased-item-delete-1'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(1));

    expect(queryByTestId('confirm-delete')).toBeNull();
    expect(queryByText('purchased quantity foo purchased product')).toBeNull();
    expect(toast).toHaveBeenCalledWith('Item successfully deleted.', { type: 'info' });
  });

  it('deletes all items when multiple are selected', async () => {
    axios.delete = jest.fn().mockResolvedValue({});
    const { getAllByRole, getByText, getByTestId, queryByText, getAllByText } = renderListContainer(props);

    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(getByText('Foo')).toBeVisible();
    expect(getByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(getByText('Bar')).toBeVisible();

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[1]);
    fireEvent.click(checkboxes[2]);
    fireEvent.click(getByTestId('not-purchased-item-delete-2'));

    expect(getByTestId('confirm-delete')).toBeVisible();

    fireEvent.click(getByTestId('confirm-delete'));

    await waitFor(() => expect(axios.delete).toHaveBeenCalledTimes(2));

    expect(queryByText('not purchased quantity foo not purchased product')).toBeNull();
    expect(getByText('Foo')).toBeVisible();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();
    expect(queryByText('Bar')).toBeNull();
  });

  it('does not delete item when delete is cleared, hides modal', async () => {
    const { getByTestId, getByText, queryByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-delete-2'));

    expect(getByTestId('clear-delete')).toBeVisible();

    fireEvent.click(getByTestId('clear-delete'));

    await waitFor(() => expect(queryByTestId('clear-delete')).toBeNull());

    expect(getByText('not purchased quantity no category not purchased product')).toBeVisible();
  });

  it('clears filter when filter is cleared', async () => {
    props.includedCategories = ['', 'foo', 'bar'];
    const { getByTestId, getByText, queryByText } = renderListContainer(props);
    fireEvent.click(getByText('Filter by category'));

    await waitFor(() => getByTestId('filter-by-foo'));

    fireEvent.click(getByTestId('filter-by-foo'));

    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(getByText('Foo')).toBeVisible();
    expect(queryByText('Bar')).toBeNull();
    expect(queryByText('not purchased quantity bar not purchased product')).toBeNull();

    fireEvent.click(getByTestId('clear-filter'));

    expect(getByText('not purchased quantity no category not purchased product')).toBeVisible();
    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(getByText('not purchased quantity bar not purchased product')).toBeVisible();
    expect(getByText('Foo')).toBeVisible();
    expect(getByText('Bar')).toBeVisible();
  });

  it('adds an item when category exists', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'foo',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 1,
        id: 6,
        product: 'new product',
        purchased: false,
        quantity: 'new quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 1,
      },
    });
    const { getByLabelText, getByText } = renderListContainer(props);

    fireEvent.change(getByLabelText('Product'), { target: { value: 'new product' } });
    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'new quantity' } });
    fireEvent.change(getByLabelText('Category'), { target: { value: 'foo' } });
    fireEvent.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(getByText('new quantity new product')).toBeVisible();
  });

  it('adds an item when category does not exist', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'new category',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 1,
        id: 6,
        product: 'new product',
        purchased: false,
        quantity: 'new quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 1,
      },
    });
    const { getByLabelText, getByText } = renderListContainer(props);

    fireEvent.change(getByLabelText('Product'), { target: { value: 'new product' } });
    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'new quantity' } });
    fireEvent.change(getByLabelText('Category'), { target: { value: 'new category' } });
    fireEvent.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(getByText('new quantity new product')).toBeVisible();
    expect(getByText('New category')).toBeVisible();
  });

  // TODO: why is this different?
  it('moves item to purchased when ToDo', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    props.list.type = 'ToDoList';
    props.notPurchasedItems[''][0].task = 'whatever';
    props.notPurchasedItems[''][0].assignee_id = 1;
    const { getByText, getByTestId } = renderListContainer(props);

    expect(getByText('whatever').parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'non-purchased-item',
    );

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(getByText('whatever').parentElement.parentElement.parentElement).toHaveAttribute(
      'data-test-class',
      'purchased-item',
    );
  });

  it('moves item to purchased when not ToDo', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getByText, getByTestId } = renderListContainer(props);

    expect(
      getByText('not purchased quantity no category not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(
      getByText('not purchased quantity no category not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
  });

  it('moves item to purchased and clears filter when item is last of category', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getByText, getByTestId, queryByTestId, queryByText } = renderListContainer(props);

    fireEvent.click(getByText('Filter by category'));

    await waitFor(() => getByTestId('filter-by-bar'));

    fireEvent.click(getByTestId('filter-by-bar'));

    await waitFor(() => expect(queryByText('not purchased quantity foo not purchased product')).toBeNull());

    expect(getByTestId('clear-filter')).toBeVisible();
    expect(
      getByText('not purchased quantity bar not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');

    fireEvent.click(getByTestId('not-purchased-item-complete-5'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(queryByTestId('clear-filter')).toBeNull();
    expect(getByText('not purchased quantity foo not purchased product')).toBeVisible();
    expect(
      getByText('not purchased quantity bar not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
  });

  it('moves items to purchased when multiple selected', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    const { getAllByRole, getByText, getByTestId, queryByText, getAllByText } = renderListContainer(props);

    expect(
      getByText('not purchased quantity no category not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
    expect(
      getByText('not purchased quantity bar not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

    expect(
      getByText('not purchased quantity no category not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
    expect(
      getByText('not purchased quantity bar not purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');
    expect(queryByText('Bar')).toBeNull();
  });

  it('handles 401 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on purchase', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-complete-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('moves item to not purchased when refreshed', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'foo',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 1,
        id: 6,
        product: 'foo purchased product',
        purchased: false,
        quantity: 'purchased quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 1,
      },
    });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId, getByText } = renderListContainer(props);

    expect(
      getByText('purchased quantity foo purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(
      getByText('purchased quantity foo purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
  });

  it('moves items to not purchased when refreshed with multiple selected', async () => {
    props.purchasedItems.push({
      id: 2,
      product: 'bar purchased product',
      task: '',
      quantity: 'purchased quantity',
      author: '',
      title: '',
      artist: '',
      album: '',
      assignee_id: 0,
      due_by: '',
      read: false,
      number_in_series: 0,
      category: 'bar',
      purchased: true,
      completed: false,
    });
    axios.post = jest
      .fn()
      .mockResolvedValueOnce({
        data: {
          archived_at: null,
          category: 'foo',
          created_at: '2020-05-24T11:07:48.751-05:00',
          grocery_list_id: 1,
          id: 6,
          product: 'foo purchased product',
          purchased: false,
          quantity: 'purchased quantity',
          refreshed: false,
          updated_at: '2020-05-24T11:07:48.751-05:00',
          user_id: 1,
        },
      })
      .mockResolvedValueOnce({
        data: {
          archived_at: null,
          category: 'bar',
          created_at: '2020-05-24T11:07:48.751-05:00',
          grocery_list_id: 1,
          id: 7,
          product: 'bar purchased product',
          purchased: false,
          quantity: 'purchased quantity',
          refreshed: false,
          updated_at: '2020-05-24T11:07:48.751-05:00',
          user_id: 1,
        },
      });
    const { getAllByRole, getByTestId, getByText, getAllByText } = renderListContainer(props);

    expect(
      getByText('purchased quantity foo purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'purchased-item');

    fireEvent.click(getAllByText('Select')[1]);

    await waitFor(() => getByText('Hide Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[0]);
    fireEvent.click(checkboxes[1]);
    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(2));

    expect(
      getByText('purchased quantity foo purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
    expect(
      getByText('purchased quantity bar purchased product').parentElement.parentElement.parentElement,
    ).toHaveAttribute('data-test-class', 'non-purchased-item');
  });

  it('handles 401 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 401 } });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 403 } });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 404 } });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on refresh', async () => {
    axios.post = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    axios.put = jest.fn().mockResolvedValue();
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-refresh-1'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('toggles read when item not purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId, queryByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(getByTestId('not-purchased-item-unread-2')).toBeVisible();
    expect(queryByTestId('not-purchased-item-read-2')).toBeNull();
  });

  it('toggles unread when item not purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = true;
    const { getByTestId, queryByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-unread-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(getByTestId('not-purchased-item-read-2')).toBeVisible();
    expect(queryByTestId('not-purchased-item-unread-2')).toBeNull();
  });

  it('toggles read when item purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    props.list.type = 'BookList';
    props.purchasedItems[0].title = 'whatever';
    props.purchasedItems[0].read = false;
    const { getByTestId, queryByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-read-1'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(getByTestId('purchased-item-unread-1')).toBeVisible();
    expect(queryByTestId('purchased-item-read-1')).toBeNull();
  });

  it('toggles unread when item purchased', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    props.list.type = 'BookList';
    props.purchasedItems[0].title = 'whatever';
    props.purchasedItems[0].read = true;
    const { getByTestId, queryByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('purchased-item-unread-1'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(getByTestId('purchased-item-read-1')).toBeVisible();
    expect(queryByTestId('purchased-item-unread-1')).toBeNull();
  });

  it('toggles read on multiple items when selected', async () => {
    axios.put = jest.fn().mockResolvedValue({});
    props.list.type = 'BookList';
    props.notPurchasedItems.foo[0].title = 'whatever';
    props.notPurchasedItems.foo[0].read = false;
    props.notPurchasedItems.foo[1].title = 'asdf';
    props.notPurchasedItems.foo[1].read = true;
    const { getAllByRole, getByTestId, queryByTestId, getAllByText, getByText } = renderListContainer(props);

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    const checkboxes = getAllByRole('checkbox');

    fireEvent.click(checkboxes[2]);
    fireEvent.click(checkboxes[3]);
    fireEvent.click(getByTestId('not-purchased-item-read-3'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(2));

    expect(getByTestId('not-purchased-item-unread-3')).toBeVisible();
    expect(queryByTestId('not-purchased-item-read-3')).toBeNull();
    expect(queryByTestId('not-purchased-item-unread-4')).toBeNull();
    expect(getByTestId('not-purchased-item-read-4')).toBeVisible();
  });

  it('handles 401 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 401 } });
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('You must sign in', { type: 'error' });
    expect(history.push).toHaveBeenCalledWith('/users/sign_in');
  });

  it('handles 403 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 403 } });
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles 404 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 404 } });
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Item not found', { type: 'error' });
  });

  it('handles not 401, 403, 404 on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ response: { status: 500, data: { foo: 'bar', foobar: 'foobaz' } } });
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('foo bar and foobar foobaz', { type: 'error' });
  });

  it('handles failed request on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ request: 'failed to send request' });
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('Something went wrong', { type: 'error' });
  });

  it('handles unknown failure on read', async () => {
    axios.put = jest.fn().mockRejectedValue({ message: 'failed to send request' });
    props.list.type = 'BookList';
    props.notPurchasedItems[''][0].title = 'whatever';
    props.notPurchasedItems[''][0].read = false;
    const { getByTestId } = renderListContainer(props);

    fireEvent.click(getByTestId('not-purchased-item-read-2'));

    await waitFor(() => expect(axios.put).toHaveBeenCalledTimes(1));

    expect(toast).toHaveBeenCalledWith('failed to send request', { type: 'error' });
  });

  it('cannot multi select if user does not have write access', () => {
    props.permissions = 'read';
    const { queryByText } = renderListContainer(props);

    expect(queryByText('Select')).toBeNull();
  });

  it('changes select to hide select when multi select is on', async () => {
    props.permissions = 'write';
    const { getAllByText, getByText } = renderListContainer(props);

    expect(getAllByText('Select')[0]).toHaveTextContent('Select');

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    expect(getByText('Hide Select')).toBeVisible();
  });

  it('handles item select for multi select when item has not been selected', async () => {
    props.permissions = 'write';
    const { getAllByRole, getAllByText, getByText } = renderListContainer(props);

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(getAllByRole('checkbox')[0]).toBeChecked();
  });

  it('handles item select for multi select when item has been selected', async () => {
    props.permissions = 'write';
    const { getAllByRole, getAllByText, getByText } = renderListContainer(props);

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('clears selected items for mutli select is hidden for not purchased items', async () => {
    props.permissions = 'write';
    const { getAllByRole, getAllByText, getByText } = renderListContainer(props);

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(getAllByRole('checkbox')[0]).toBeChecked();

    fireEvent.click(getByText('Hide Select'));
    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    expect(getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('clears selected items for mutli select is hidden for purchased items', async () => {
    props.permissions = 'write';
    const { getAllByRole, getAllByText, getByText } = renderListContainer(props);

    fireEvent.click(getAllByText('Select')[1]);

    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);

    expect(getAllByRole('checkbox')[0]).toBeChecked();

    fireEvent.click(getByText('Hide Select'));
    fireEvent.click(getAllByText('Select')[1]);

    await waitFor(() => getByText('Hide Select'));

    expect(getAllByRole('checkbox')[0]).not.toBeChecked();
  });

  it('navigates to single edit form when no multi select', async () => {
    props.permissions = 'write';
    const { getByTestId } = renderListContainer(props);
    fireEvent.click(getByTestId(`not-purchased-item-edit-${props.notPurchasedItems.foo[0].id}`));

    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(history.push).toHaveBeenCalledWith('/lists/1/grocery_list_items/3/edit');
  });

  it('navigates to bulk edit form when multi select', async () => {
    props.permissions = 'write';
    const { getAllByRole, getByTestId, getAllByText, getByText } = renderListContainer(props);

    expect(getAllByText('Select')[0]).toHaveTextContent('Select');

    fireEvent.click(getAllByText('Select')[0]);

    await waitFor(() => getByText('Hide Select'));

    fireEvent.click(getAllByRole('checkbox')[0]);
    fireEvent.click(getAllByRole('checkbox')[1]);
    fireEvent.click(getByTestId(`not-purchased-item-edit-${props.notPurchasedItems.foo[0].id}`));

    await waitFor(() => expect(history.push).toHaveBeenCalledTimes(1));

    expect(history.push).toHaveBeenCalledWith('/lists/1/grocery_list_items/bulk-edit?item_ids=2,5');
  });

  it('adds item while filter, stays filtered', async () => {
    axios.post = jest.fn().mockResolvedValue({
      data: {
        archived_at: null,
        category: 'bar',
        created_at: '2020-05-24T11:07:48.751-05:00',
        grocery_list_id: 1,
        id: 6,
        product: 'new product',
        purchased: false,
        quantity: 'new quantity',
        refreshed: false,
        updated_at: '2020-05-24T11:07:48.751-05:00',
        user_id: 1,
      },
    });
    const { getByLabelText, getByText, getByTestId, queryByText } = renderListContainer(props);

    fireEvent.click(getByText('Filter by category'));

    await waitFor(() => getByTestId('filter-by-foo'));

    fireEvent.click(getByTestId('filter-by-foo'));
    fireEvent.change(getByLabelText('Product'), { target: { value: 'new product' } });
    fireEvent.change(getByLabelText('Quantity'), { target: { value: 'new quantity' } });
    fireEvent.change(getByLabelText('Category'), { target: { value: 'bar' } });
    fireEvent.click(getByText('Add New Item'));

    await waitFor(() => expect(axios.post).toHaveBeenCalledTimes(1));

    expect(queryByText('new quantity new product')).toBeNull();
  });
});
