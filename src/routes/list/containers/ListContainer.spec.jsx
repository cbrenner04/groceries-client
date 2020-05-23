import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import ListContainer from './ListContainer';

describe('ListContainer', () => {
  const history = createMemoryHistory();
  const props = {
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
      created_at: new Date().toISOString(),
      completed: false,
      owner_id: 1,
    },
    purchasedItems: [
      {
        id: 1,
        product: 'foo',
        task: '',
        quantity: '2 foo',
        author: '',
        title: '',
        artist: '',
        album: '',
        assignee_id: 0,
        due_by: '',
        read: false,
        number_in_series: 0,
        category: 'foo',
      },
    ],
    categories: ['foo'],
    listUsers: [
      {
        id: 0,
        email: 'foo',
      },
    ],
    includedCategories: ['foo'],
    notPurchasedItems: {
      foo: [
        {
          id: 1,
          product: 'foo',
          task: '',
          quantity: '2 foo',
          author: '',
          title: '',
          artist: '',
          album: '',
          assignee_id: 0,
          due_by: '',
          read: false,
          number_in_series: 0,
          category: 'foo',
        },
      ],
    },
    permissions: 'write',
  };
  const renderListContainer = (props) => {
    return render(
      <Router history={history}>
        <ListContainer {...props} />
      </Router>,
    );
  };

  it('renders ListForm when user has write permissions', () => {
    props.permissions = 'write';
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('does not render ListForm when user has read permissions', () => {
    props.permissions = 'read';
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('renders filtered items without category buckets when filter exists', () => {
    props.filter = 'foo';
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('renders items without category buckets when includedCategories is empty', () => {
    props.filter = '';
    props.includedCategories = [];
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('renders items with category buckets when includedCategories is not empty and no filter is applied', () => {
    props.filter = '';
    props.includedCategories = ['foo'];
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('does not render incomplete items when none exist', () => {
    props.notPurchasedItems = {};
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('does not render complete items when none exist', () => {
    props.purchasedItems = [];
    const { container } = renderListContainer(props);

    expect(container).toMatchSnapshot();
    // TODO: add assertions
  });

  it('renders confirmation modal when delete is clicked', () => {});
});
