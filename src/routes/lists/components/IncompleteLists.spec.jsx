import React from 'react';
import { render } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import IncompleteLists from './IncompleteLists';

describe('IncompleteLists', () => {
  let props;

  const renderIncompleteLists = (p) => {
    const history = createMemoryHistory();
    return render(
      <Router history={history}>
        <IncompleteLists {...p} />
      </Router>,
    );
  };

  beforeEach(() => {
    props = {
      history: {
        push: jest.fn(),
      },
      userId: 1,
      incompleteLists: [
        {
          id: 1,
          name: 'foo',
          type: 'GroceryList',
          owner_id: 1,
          created_at: new Date('05/27/2020').toISOString(),
          completed: false,
          users_list_id: 1,
          refreshed: false,
        },
      ],
      setIncompleteLists: jest.fn(),
      completedLists: [
        {
          id: 1,
          name: 'foo',
          type: 'GroceryList',
          owner_id: 1,
          created_at: new Date('05/27/2020').toISOString(),
          completed: true,
          users_list_id: 1,
          refreshed: false,
        },
      ],
      setCompletedLists: jest.fn(),
      currentUserPermissions: {
        1: 'write',
      },
      setCurrentUserPermissions: jest.fn(),
    };
  });

  it('renders', () => {
    const { container } = renderIncompleteLists(props);

    expect(container).toMatchSnapshot();
  });
});
