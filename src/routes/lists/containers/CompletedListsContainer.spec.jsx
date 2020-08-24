import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import CompletedListsContainer from './CompletedListsContainer';

describe('CompletedListsContainer', () => {
  let props;
  const renderCompletedListsContainer = (props) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <CompletedListsContainer {...props} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
      userId: 'id1',
      completedLists: [
        {
          id: 'id1',
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 'id1',
          owner_id: 'id1',
          user_id: 'id1',
          refreshed: false,
        },
        {
          id: 'id2',
          name: 'bar',
          type: 'BookList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 'id2',
          owner_id: 'id1',
          user_id: 'id1',
          refreshed: false,
        },
        {
          id: 'id3',
          name: 'baz',
          type: 'BookList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 'id3',
          owner_id: 'id2',
          user_id: 'id1',
          refreshed: false,
        },
      ],
      currentUserPermissions: {
        id1: 'write',
        id2: 'write',
        id3: 'read',
      },
    };
  });

  it('renders', () => {
    const { container } = renderCompletedListsContainer(props);

    expect(container).toMatchSnapshot();
  });
});
