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
      completedLists: [
        {
          id: 1,
          name: 'foo',
          type: 'GroceryList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 1,
          owner_id: 1,
          user_id: 1,
          refreshed: false,
        },
        {
          id: 2,
          name: 'bar',
          type: 'BookList',
          created_at: new Date('05/28/2020').toISOString(),
          completed: true,
          users_list_id: 2,
          owner_id: 1,
          user_id: 1,
          refreshed: false,
        },
      ],
      currentUserPermissions: {
        1: 'write',
        2: 'write',
      },
    };
  });

  it('renders', () => {
    const { container } = renderCompletedListsContainer(props);

    expect(container).toMatchSnapshot();
  });

  it('refreshes list on successful refresh', () => {});

  it('redirects to users/sign_in on 401 of refresh', () => {});

  it('fires toast and does not redirect on 403 of refresh', () => {});

  it('fires toast and does not redirect on 404 of refresh', () => {});

  it('displays errors on error other than 401, 403, 404 of refresh', () => {});

  it('displays error on request failure of refresh', () => {});

  it('displays error on unknown error of refresh', () => {});

  it('deletes list on successful delete', () => {});

  it('redirects to users/sign_in on 401 of delete', () => {});

  it('fires toast and does not redirect on 403 of delete', () => {});

  it('fires toast and does not redirect on 404 of delete', () => {});

  it('displays errors on error other than 401, 403, 404 of delete', () => {});

  it('displays error on request failure of delete', () => {});

  it('displays error on unknown error of delete', () => {});
});
